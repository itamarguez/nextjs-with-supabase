// NoMoreFOMO Chat API Endpoint
// Handles streaming chat completions with intelligent model selection

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { selectModelForPrompt } from '@/lib/llm/model-selector';
import { routeToLLM } from '@/lib/llm/router';
import { calculateCost } from '@/lib/llm/models';
import {
  checkRateLimit,
  recordRequest,
  updateTokenUsage,
  detectAbuse,
  canUsePremiumRequest,
  incrementPremiumRequest,
  getTierLimits,
} from '@/lib/rate-limiter';
import { addMessage, getRecentMessages } from '@/lib/supabase/messages';
import {
  updateConversationUsage,
  updateConversationTitle,
  generateConversationTitle,
} from '@/lib/supabase/conversations';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
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

    // Get IP and User-Agent for abuse detection
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    const userAgent = req.headers.get('user-agent');

    // Detect abuse
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

    // Check if user has premium credits (for hybrid model)
    const hasPremiumCredits = await canUsePremiumRequest(user.id, profile.tier);

    // Select the best model for this prompt
    const recentMessages = await getRecentMessages(conversationId, 10);
    const conversationHistory = recentMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const modelSelection = selectModelForPrompt(
      message,
      profile.tier,
      conversationHistory,
      hasPremiumCredits // Pass premium credits availability
    );
    console.log(`Model selected: ${modelSelection.model}, isPremium: ${modelSelection.isPremium}, category: ${modelSelection.category}`);

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

    // Save user message to database
    const startTime = Date.now();
    await addMessage(conversationId, 'user', message);

    // Update conversation title if this is the first message
    if (recentMessages.length === 0) {
      const title = generateConversationTitle(message);
      console.log(`Updating conversation title to: "${title}"`);
      await updateConversationTitle(conversationId, user.id, title);
    }

    // Build messages array for LLM
    const messagesForLLM = [
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    // Create streaming response
    const encoder = new TextEncoder();
    let fullResponse = '';
    let inputTokens = 0;
    let outputTokens = 0;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream from selected LLM
          for await (const chunk of routeToLLM(
            modelSelection.model,
            messagesForLLM
          )) {
            if (chunk.text) {
              fullResponse += chunk.text;

              // Send chunk to client
              const data = JSON.stringify({
                type: 'chunk',
                text: chunk.text,
                model: modelSelection.model,
                category: modelSelection.category,
                reason: modelSelection.reason,
                isPremium: modelSelection.isPremium,
                betterModelAvailable: modelSelection.betterModelAvailable,
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

              // Save assistant message to database
              await addMessage(conversationId, 'assistant', fullResponse, {
                model_used: modelSelection.model,
                task_category: modelSelection.category,
                selection_reason: modelSelection.reason,
                tokens_used: inputTokens + outputTokens,
                cost_usd: cost,
                latency_ms: latencyMs,
              });

              // Update conversation and user usage stats (admin only)
              await updateConversationUsage(
                conversationId,
                inputTokens + outputTokens,
                cost
              );
              await updateTokenUsage(user.id, inputTokens + outputTokens, cost);

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
