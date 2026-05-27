'use client';

import { useEffect } from 'react';

/**
 * Fallback boundary for errors thrown in the root layout itself.
 * Because it replaces the root layout, it must render its own <html>/<body>.
 * Keep it dependency-free — no Tailwind layer, no providers.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('[Base Predict] root error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          background: '#0A0A0A',
          color: '#ffffff',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
        }}
      >
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: '#FF5C5C',
              marginBottom: 24,
            }}
          >
            Critical failure
          </div>

          <h1
            style={{
              fontSize: 56,
              fontWeight: 900,
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
            }}
          >
            App crashed
          </h1>

          <p
            style={{
              color: '#9ca3af',
              fontSize: 14,
              lineHeight: 1.6,
              margin: '0 auto 32px',
              maxWidth: 380,
            }}
          >
            Base Predict failed to start. This is almost always a temporary
            issue — try reloading.
          </p>

          <button
            onClick={() => unstable_retry()}
            style={{
              background: '#0052FF',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              padding: '10px 20px',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(0,82,255,0.35)',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
