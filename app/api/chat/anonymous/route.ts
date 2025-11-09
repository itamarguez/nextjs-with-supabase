// Anonymous Chat API - 3 Free Messages (No Auth Required)
// Allows visitors to try the chat before signing up

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { selectModelForPrompt } from '@/lib/llm/model-selector';
import { routeToLLM } from '@/lib/llm/router';
import { checkIPRateLimit, getClientIP, IP_RATE_LIMITS } from '@/lib/ip-rate-limiter';
import { createClient } from '@/lib/supabase/server';
import { parseUserAgent, getCountryFromIP } from '@/lib/analytics/device-detector';

export const runtime = 'edge';

const MAX_FREE_MESSAGES = 3;
const COOKIE_NAME = 'nomorefomo_trial_count';
const SESSION_COOKIE_NAME = 'nomorefomo_session_id';

export async function POST(req: NextRequest) {
  try {
    // IP-based rate limiting (prevent abuse)
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
          },
        }
      );
    }

    // Parse request body
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get trial message count from cookie
    const cookieStore = await cookies();
    const trialCountCookie = cookieStore.get(COOKIE_NAME);
    const currentCount = trialCountCookie ? parseInt(trialCountCookie.value, 10) : 0;

    // Get or create session ID for tracking anonymous conversations
    let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionId) {
      // Generate new session ID
      sessionId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    // Get user agent and referrer for analytics
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const referrer = req.headers.get('referer') || req.headers.get('referrer');

    // Parse user agent for device/browser info
    const deviceInfo = parseUserAgent(userAgent);

    // Get country from IP (async)
    const countryCodePromise = getCountryFromIP(clientIP);

    // Check if user has exceeded free message limit
    if (currentCount >= MAX_FREE_MESSAGES) {
      return NextResponse.json(
        {
          error: 'Free trial limit reached',
          limitReached: true,
          message: 'You\'ve used all 3 free messages! Sign up to continue chatting.',
        },
        { status: 403 }
      );
    }

    // Select model for anonymous users (always use cheapest model)
    const modelSelection = selectModelForPrompt(
      message,
      'free', // Always free tier for anonymous
      [], // No conversation history
      false // Can't use premium models
    );

    // Route to LLM
    const encoder = new TextEncoder();
    const startTime = Date.now();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial metadata
          const metadata = {
            type: 'metadata',
            model: modelSelection.model,
            category: modelSelection.category,
            reason: modelSelection.reason,
            messagesRemaining: MAX_FREE_MESSAGES - currentCount - 1,
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`)
          );

          // Stream from LLM
          const llmStream = routeToLLM(
            modelSelection.model,
            [{ role: 'user', content: message }],
            0.7
          );

          let fullResponse = '';
          for await (const chunk of llmStream) {
            fullResponse += chunk.text;
            const streamData = {
              type: 'chunk',
              text: chunk.text,
              model: modelSelection.model,
              category: modelSelection.category,
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(streamData)}\n\n`)
            );
          }

          const latencyMs = Date.now() - startTime;

          // Get country code from IP
          const countryCode = await countryCodePromise;

          // Store conversation in database for analytics with full metadata
          try {
            const supabase = await createClient();
            await supabase.from('anonymous_conversations').insert({
              session_id: sessionId,
              user_prompt: message,
              assistant_response: fullResponse,
              model_used: modelSelection.model,
              task_category: modelSelection.category,
              selection_reason: modelSelection.reason,
              latency_ms: latencyMs,
              ip_address: clientIP,
              user_agent: userAgent,
              device_type: deviceInfo.deviceType,
              browser: deviceInfo.browser,
              os: deviceInfo.os,
              country_code: countryCode || undefined,
              referrer: referrer || undefined,
              // tokens_used and cost_usd can be calculated later if needed
            });
          } catch (dbError) {
            // Don't fail the request if DB write fails - log it
            console.error('Failed to store anonymous conversation:', dbError);
          }

          // Send completion
          const doneData = {
            type: 'done',
            messagesRemaining: MAX_FREE_MESSAGES - currentCount - 1,
            limitReached: currentCount + 1 >= MAX_FREE_MESSAGES,
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(doneData)}\n\n`)
          );

          controller.close();
        } catch (error) {
          console.error('Anonymous chat error:', error);
          const errorData = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Failed to generate response',
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
          );
          controller.close();
        }
      },
    });

    // Increment trial counter cookie
    const newCount = currentCount + 1;
    const response = new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

    // Set updated cookies (expires in 24 hours)
    const countCookieHeader = `${COOKIE_NAME}=${newCount}; Path=/; Max-Age=86400; SameSite=Lax`;
    response.headers.append('Set-Cookie', countCookieHeader);

    // Set session ID cookie (expires in 30 days) - persists longer to track user across visits
    const sessionCookieHeader = `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; Max-Age=2592000; SameSite=Lax`;
    response.headers.append('Set-Cookie', sessionCookieHeader);

    return response;
  } catch (error) {
    console.error('Anonymous chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
