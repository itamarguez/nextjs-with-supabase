// NoMoreFOMO Chat API Endpoint
// Handles streaming chat completions with intelligent model selection

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { selectModelForPrompt } from '@/lib/llm/model-selector';
import { routeToLLMWithFailover } from '@/lib/llm/router';
import { calculateCost, MODEL_CONFIGS } from '@/lib/llm/models';
import { promptCache } from '@/lib/cache/prompt-cache';
import {
  checkRateLimit,
  recordRequest,
  updateTokenUsage,
  detectAbuse,
  canUsePremiumRequest,
  incrementPremiumRequest,
  getTierLimits,
  checkModelTokenCap,
  updateModelTokenUsage,
} from '@/lib/rate-limiter';
import { checkIPRateLimit, getClientIP, IP_RATE_LIMITS } from '@/lib/ip-rate-limiter';
import { addMessage, getRecentMessages } from '@/lib/supabase/messages';
import {
  updateConversationUsage,
  updateConversationTitle,
  generateConversationTitle,
  getConversation,
} from '@/lib/supabase/conversations';
import { parseUserAgent, getCountryFromIP } from '@/lib/analytics/device-detector';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // IP-based rate limiting (prevent DDoS)
    const clientIP = getClientIP(req);
    const ipRateLimit = checkIPRateLimit(clientIP, IP_RATE_LIMITS.chat);

    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests from this IP',
          retryAfter: ipRateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(ipRateLimit.retryAfter),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(ipRateLimit.resetTime / 1000)),
          },
        }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { conversationId, message } = body;

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get conversation history early (needed for cache key)
    const recentMessages = await getRecentMessages(conversationId, 10);
    const conversationHistory = recentMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Check if user has premium credits (for model selection)
    const hasPremiumCredits = await canUsePremiumRequest(user.id, profile.tier);

    // Select the best model for this prompt
    const modelSelection = selectModelForPrompt(
      message,
      profile.tier,
      conversationHistory,
      hasPremiumCredits
    );
    console.log(`Model selected: ${modelSelection.model}, isPremium: ${modelSelection.isPremium}, category: ${modelSelection.category}`);

    // ═══════════════════════════════════════════════
    // CHECK CACHE FIRST (before abuse detection)
    // ═══════════════════════════════════════════════
    const cacheKey = await promptCache.generateKey(
      message,
      conversationHistory,
      modelSelection.model
    );
    const cachedResponse = promptCache.get(cacheKey);

    if (cachedResponse) {
      // Cache HIT - return immediately without abuse checks or API calls
      console.log(`[Cache HIT] Model: ${modelSelection.model}, Tokens saved: ${cachedResponse.inputTokens + cachedResponse.outputTokens}`);

      // Still save user message to database
      const ipAddress = getClientIP(req);
      const userAgent = req.headers.get('user-agent');
      const referrer = req.headers.get('referer') || req.headers.get('referrer');
      const deviceInfo = parseUserAgent(userAgent);
      const countryCode = await getCountryFromIP(ipAddress);

      const startTime = Date.now();
      await addMessage(conversationId, 'user', message, {
        ip_address: ipAddress || undefined,
        user_agent: userAgent || undefined,
        device_type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        country_code: countryCode || undefined,
        referrer: referrer || undefined,
      });

      // Update conversation title if needed
      const conversation = await getConversation(conversationId, user.id);
      const shouldUpdateTitle = recentMessages.length === 0 || conversation?.title === 'New Conversation';
      if (shouldUpdateTitle) {
        const title = generateConversationTitle(message);
        await updateConversationTitle(conversationId, user.id, title);
      }

      // Return cached response via streaming
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Simulate streaming by chunking the cached response
            const chunkSize = 50;
            for (let i = 0; i < cachedResponse.response.length; i += chunkSize) {
              const chunk = cachedResponse.response.slice(i, i + chunkSize);
              const data = JSON.stringify({
                type: 'chunk',
                text: chunk,
                model: modelSelection.model,
                category: cachedResponse.category,
                reason: cachedResponse.reason,
                isPremium: modelSelection.isPremium,
                betterModelAvailable: modelSelection.betterModelAvailable,
                cached: true,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              await new Promise((resolve) => setTimeout(resolve, 10));
            }

            const latencyMs = Date.now() - startTime;

            // Save assistant message to database (with zero cost - cached response)
            await addMessage(conversationId, 'assistant', cachedResponse.response, {
              model_used: modelSelection.model,
              task_category: cachedResponse.category as any, // Cached category is stored as string
              selection_reason: cachedResponse.reason,
              tokens_used: cachedResponse.inputTokens + cachedResponse.outputTokens,
              cost_usd: 0, // No API cost for cached response
              latency_ms: latencyMs,
              ip_address: ipAddress || undefined,
              user_agent: userAgent || undefined,
              device_type: deviceInfo.deviceType,
              browser: deviceInfo.browser,
              os: deviceInfo.os,
              country_code: countryCode || undefined,
              referrer: referrer || undefined,
            });

            // Update conversation stats (with zero cost)
            await updateConversationUsage(conversationId, cachedResponse.inputTokens + cachedResponse.outputTokens, 0);
            await updateTokenUsage(user.id, cachedResponse.inputTokens + cachedResponse.outputTokens, 0);

            // Get premium credits info
            const tierLimits = getTierLimits(profile.tier);
            const premiumCreditsRemaining =
              profile.tier === 'free'
                ? tierLimits.premium_requests_per_month - (profile.premium_requests_this_month || 0)
                : tierLimits.premium_requests_per_month;

            // Send final metadata
            const finalData = JSON.stringify({
              type: 'done',
              model: modelSelection.model,
              category: cachedResponse.category,
              tokensUsed: cachedResponse.inputTokens + cachedResponse.outputTokens,
              latencyMs,
              isPremium: modelSelection.isPremium,
              betterModelAvailable: modelSelection.betterModelAvailable,
              premiumCreditsRemaining,
              premiumCreditsLimit: tierLimits.premium_requests_per_month,
              cached: true,
            });
            controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
            controller.close();
          } catch (error) {
            console.error('Cached streaming error:', error);
            const errorData = JSON.stringify({
              type: 'error',
              error: error instanceof Error ? error.message : 'Unknown error occurred',
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Cache MISS - continue with normal flow including abuse detection
    console.log(`[Cache MISS] Model: ${modelSelection.model}`);

    // Get IP and User-Agent for abuse detection AND analytics
    const ipAddress = getClientIP(req);
    const userAgent = req.headers.get('user-agent');
    const referrer = req.headers.get('referer') || req.headers.get('referrer');

    // Parse user agent for device/browser info
    const deviceInfo = parseUserAgent(userAgent);

    // Get country from IP (async, but we'll await it when saving messages)
    const countryCodePromise = getCountryFromIP(ipAddress);

    // Detect abuse (only for cache misses)
    const abuseCheck = await detectAbuse(
      user.id,
      message,
      ipAddress || undefined,
      userAgent || undefined
    );

    if (abuseCheck.isAbusive) {
      return NextResponse.json(
        { error: abuseCheck.reason || 'Suspicious activity detected' },
        { status: 429 }
      );
    }

    // Check rate limits
    const rateLimitCheck = await checkRateLimit(
      user.id,
      modelSelection.estimatedTokens
    );

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: rateLimitCheck.reason,
          limitType: rateLimitCheck.limitType,
          retryAfter: rateLimitCheck.retryAfter,
        },
        { status: 429 }
      );
    }

    // Record request for rate limiting
    await recordRequest(user.id);

    // Check model-specific token cap (for models like o1 with monthly_token_cap)
    const modelConfig = MODEL_CONFIGS[modelSelection.model];
    if (modelConfig?.monthly_token_cap) {
      const modelCapCheck = await checkModelTokenCap(
        user.id,
        modelSelection.model,
        modelSelection.estimatedTokens,
        modelConfig.monthly_token_cap
      );

      if (!modelCapCheck.allowed) {
        return NextResponse.json(
          {
            error: modelCapCheck.reason,
            limitType: modelCapCheck.limitType,
            retryAfter: modelCapCheck.retryAfter,
          },
          { status: 429 }
        );
      }
    }

    // Get country code from IP
    const countryCode = await countryCodePromise;

    // Save user message to database with full metadata
    const startTime = Date.now();
    await addMessage(conversationId, 'user', message, {
      ip_address: ipAddress || undefined,
      user_agent: userAgent || undefined,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      country_code: countryCode || undefined,
      referrer: referrer || undefined,
    });

    // Update conversation title if:
    // 1. This is the first message (recentMessages.length === 0), OR
    // 2. Title is still "New Conversation" (safety net for old conversations)
    const conversation = await getConversation(conversationId, user.id);
    const shouldUpdateTitle = recentMessages.length === 0 || conversation?.title === 'New Conversation';

    if (shouldUpdateTitle) {
      const title = generateConversationTitle(message);
      console.log(`Updating conversation title from "${conversation?.title}" to: "${title}"`);
      await updateConversationTitle(conversationId, user.id, title);
    }

    // Build messages array for LLM with system prompt for quality responses
    const systemPrompt = `You are a helpful AI personal assistant. Be concise and focused - provide the most accurate and relevant answer without unnecessary fluff. Match your response length to the complexity of the question. For simple questions, be brief. For complex questions, provide thorough but efficient explanations. Be friendly and conversational, like the best of ChatGPT, Claude, and Gemini combined.`;

    const messagesForLLM = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    // Cache key already generated above (line 111)
    // We'll use the same cacheKey to store the response after LLM call

    // Create streaming response (cache miss - call LLM)
    const encoder = new TextEncoder();
    let fullResponse = '';
    let inputTokens = 0;
    let outputTokens = 0;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream from selected LLM with auto-failover
          for await (const chunk of routeToLLMWithFailover(
            modelSelection.model,
            messagesForLLM,
            0.7, // temperature
            user.id,
            conversationId
          )) {
            if (chunk.text) {
              fullResponse += chunk.text;

              // Send chunk to client (include failover metadata)
              const data = JSON.stringify({
                type: 'chunk',
                text: chunk.text,
                model: modelSelection.model,
                category: modelSelection.category,
                reason: modelSelection.reason,
                isPremium: modelSelection.isPremium,
                betterModelAvailable: modelSelection.betterModelAvailable,
                failedOver: chunk.failedOver,
                originalModel: chunk.originalModel,
                failoverReason: chunk.failoverReason,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }

            if (chunk.done && chunk.tokensUsed) {
              inputTokens = chunk.tokensUsed.input;
              outputTokens = chunk.tokensUsed.output;

              // Calculate cost (admin only - not sent to client)
              const cost = calculateCost(
                modelSelection.model,
                inputTokens,
                outputTokens
              );

              const latencyMs = Date.now() - startTime;

              // Save assistant message to database with full metadata
              await addMessage(conversationId, 'assistant', fullResponse, {
                model_used: modelSelection.model,
                task_category: modelSelection.category,
                selection_reason: modelSelection.reason,
                tokens_used: inputTokens + outputTokens,
                cost_usd: cost,
                latency_ms: latencyMs,
                ip_address: ipAddress || undefined,
                user_agent: userAgent || undefined,
                device_type: deviceInfo.deviceType,
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                country_code: countryCode || undefined,
                referrer: referrer || undefined,
              });

              // Update conversation and user usage stats (admin only)
              await updateConversationUsage(
                conversationId,
                inputTokens + outputTokens,
                cost
              );
              await updateTokenUsage(user.id, inputTokens + outputTokens, cost);

              // Update model-specific token usage if model has a monthly cap
              const modelConfig = MODEL_CONFIGS[modelSelection.model];
              if (modelConfig?.monthly_token_cap) {
                await updateModelTokenUsage(
                  user.id,
                  modelSelection.model,
                  inputTokens + outputTokens
                );
              }

              // If user used a premium model, increment premium request counter
              if (modelSelection.isPremium && profile.tier === 'free') {
                await incrementPremiumRequest(user.id);
              }

              // Get updated premium credits info
              const tierLimits = getTierLimits(profile.tier);
              const premiumCreditsRemaining =
                profile.tier === 'free'
                  ? tierLimits.premium_requests_per_month - ((profile.premium_requests_this_month || 0) + (modelSelection.isPremium ? 1 : 0))
                  : tierLimits.premium_requests_per_month;

              // Cache the response for future use
              promptCache.set(cacheKey, {
                response: fullResponse,
                inputTokens,
                outputTokens,
                model: modelSelection.model,
                category: modelSelection.category,
                reason: modelSelection.reason,
              });

              // Send final metadata (without cost)
              const finalData = JSON.stringify({
                type: 'done',
                model: modelSelection.model,
                category: modelSelection.category,
                tokensUsed: inputTokens + outputTokens,
                latencyMs,
                isPremium: modelSelection.isPremium,
                betterModelAvailable: modelSelection.betterModelAvailable,
                premiumCreditsRemaining,
                premiumCreditsLimit: tierLimits.premium_requests_per_month,
                cached: false,
              });
              controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
            }
          }

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);

          const errorData = JSON.stringify({
            type: 'error',
            error:
              error instanceof Error ? error.message : 'Unknown error occurred',
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
