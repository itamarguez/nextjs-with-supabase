import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'NoMoreFOMO - Stop the LLM FOMO';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)',
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 20,
            }}
          >
            <span style={{ fontSize: 40, color: 'white' }}>AI</span>
          </div>
          <span
            style={{
              fontSize: 60,
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            NoMoreFOMO
          </span>
        </div>

        {/* Main Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: '#f1f5f9',
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            Stop the LLM FOMO
          </span>
          <span
            style={{
              fontSize: 28,
              color: '#94a3b8',
              textAlign: 'center',
              maxWidth: 800,
            }}
          >
            Get the Best AI Answer, Every Time
          </span>
        </div>

        {/* Model Logos */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 40,
            gap: 30,
          }}
        >
          {['GPT-4o', 'Claude', 'Gemini'].map((model) => (
            <div
              key={model}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                border: '2px solid rgba(59, 130, 246, 0.5)',
                color: '#60a5fa',
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              {model}
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            color: '#64748b',
            fontSize: 20,
          }}
        >
          Intelligent AI Router - We pick the best model for you
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
