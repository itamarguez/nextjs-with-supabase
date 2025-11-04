// NoMoreFOMO LLM Router
// Routes requests to the appropriate LLM provider with streaming support

import { Message } from '../types';
import { MODEL_CONFIGS } from './models';

export interface StreamChunk {
  text: string;
  done: boolean;
  tokensUsed?: {
    input: number;
    output: number;
    total: number;
  };
}

/**
 * Route a chat completion request to the appropriate LLM provider
 */
export async function* routeToLLM(
  modelName: string,
  messages: Array<{ role: string; content: string }>,
  temperature: number = 0.7
): AsyncGenerator<StreamChunk> {
  const model = MODEL_CONFIGS[modelName];

  if (!model) {
    throw new Error(`Unknown model: ${modelName}`);
  }

  switch (model.provider) {
    case 'openai':
      yield* streamOpenAI(modelName, messages, temperature);
      break;
    case 'anthropic':
      yield* streamAnthropic(modelName, messages, temperature);
      break;
    case 'google':
      yield* streamGoogle(modelName, messages, temperature);
      break;
    default:
      throw new Error(`Unsupported provider: ${model.provider}`);
  }
}

/**
 * Stream from OpenAI API
 */
async function* streamOpenAI(
  model: string,
  messages: Array<{ role: string; content: string }>,
  temperature: number
): AsyncGenerator<StreamChunk> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      stream: true,
      stream_options: { include_usage: true },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            yield {
              text: '',
              done: true,
              tokensUsed: {
                input: totalInputTokens,
                output: totalOutputTokens,
                total: totalInputTokens + totalOutputTokens,
              },
            };
            return;
          }

          try {
            const parsed = JSON.parse(data);

            // Extract usage if present
            if (parsed.usage) {
              totalInputTokens = parsed.usage.prompt_tokens || 0;
              totalOutputTokens = parsed.usage.completion_tokens || 0;
            }

            // Extract content
            const delta = parsed.choices?.[0]?.delta;
            if (delta?.content) {
              yield {
                text: delta.content,
                done: false,
              };
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Stream from Anthropic API
 */
async function* streamAnthropic(
  model: string,
  messages: Array<{ role: string; content: string }>,
  temperature: number
): AsyncGenerator<StreamChunk> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  // Anthropic requires system message separate
  const systemMessage = messages.find((m) => m.role === 'system');
  const userMessages = messages.filter((m) => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      messages: userMessages,
      system: systemMessage?.content,
      temperature,
      max_tokens: 4096,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'message_start') {
              totalInputTokens = parsed.message?.usage?.input_tokens || 0;
            }

            if (parsed.type === 'content_block_delta') {
              const text = parsed.delta?.text;
              if (text) {
                yield {
                  text,
                  done: false,
                };
              }
            }

            if (parsed.type === 'message_delta') {
              totalOutputTokens = parsed.usage?.output_tokens || 0;
            }

            if (parsed.type === 'message_stop') {
              yield {
                text: '',
                done: true,
                tokensUsed: {
                  input: totalInputTokens,
                  output: totalOutputTokens,
                  total: totalInputTokens + totalOutputTokens,
                },
              };
              return;
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Stream from Google Gemini API
 */
async function* streamGoogle(
  model: string,
  messages: Array<{ role: string; content: string }>,
  temperature: number
): AsyncGenerator<StreamChunk> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY not configured');
  }

  // Convert messages to Gemini format
  const geminiMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google API error: ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Try to parse complete JSON objects
      let jsonStart = buffer.indexOf('{');
      while (jsonStart !== -1) {
        let braceCount = 0;
        let jsonEnd = -1;

        for (let i = jsonStart; i < buffer.length; i++) {
          if (buffer[i] === '{') braceCount++;
          if (buffer[i] === '}') braceCount--;

          if (braceCount === 0) {
            jsonEnd = i + 1;
            break;
          }
        }

        if (jsonEnd === -1) break;

        const jsonStr = buffer.slice(jsonStart, jsonEnd);
        buffer = buffer.slice(jsonEnd);

        try {
          const parsed = JSON.parse(jsonStr);

          const candidate = parsed.candidates?.[0];
          if (candidate) {
            const text = candidate.content?.parts?.[0]?.text;
            if (text) {
              yield {
                text,
                done: false,
              };
            }
          }

          // Extract usage metadata
          if (parsed.usageMetadata) {
            totalInputTokens = parsed.usageMetadata.promptTokenCount || 0;
            totalOutputTokens = parsed.usageMetadata.candidatesTokenCount || 0;
          }
        } catch (e) {
          // Skip malformed JSON
        }

        jsonStart = buffer.indexOf('{');
      }
    }

    // Final yield with token usage
    yield {
      text: '',
      done: true,
      tokensUsed: {
        input: totalInputTokens,
        output: totalOutputTokens,
        total: totalInputTokens + totalOutputTokens,
      },
    };
  } finally {
    reader.releaseLock();
  }
}
