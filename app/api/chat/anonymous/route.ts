// Anonymous Chat API - 3 Free Messages (No Auth Required)
// Allows visitors to try the chat before signing up

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { selectModelForPrompt } from '@/lib/llm/model-selector';
import { routeToLLM } from '@/lib/llm/router';
import { checkIPRateLimit, getClientIP, IP_RATE_LIMITS } from '@/lib/ip-rate-limiter';

export const runtime = 'edge';

const MAX_FREE_MESSAGES = 3;
const COOKIE_NAME = 'nomorefomo_trial_count';

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

    // Set updated cookie (expires in 24 hours)
    const cookieHeader = `${COOKIE_NAME}=${newCount}; Path=/; Max-Age=86400; SameSite=Lax`;
    response.headers.append('Set-Cookie', cookieHeader);

    return response;
  } catch (error) {
    console.error('Anonymous chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
