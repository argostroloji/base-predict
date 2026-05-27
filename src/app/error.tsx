'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Surface the error in the browser console for now.
    // Wire up Sentry / Vercel Analytics here later.
    console.error('[Base Predict] route error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#0052FF]/30 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FF5C5C] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C5C] animate-pulse"></span>
          Transaction reverted
        </div>

        <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-br from-white via-white to-[#FF5C5C] bg-clip-text text-transparent mb-4">
          Something broke
        </h1>

        <p className="text-gray-400 text-sm md:text-base mb-2 max-w-md mx-auto">
          We hit an unexpected error while loading this page. The RPC node may be slow, or your wallet rejected a request.
        </p>

        {error?.digest && (
          <p className="text-gray-600 text-xs font-mono mb-8">
            ref: {error.digest}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            onClick={() => unstable_retry()}
            className="bg-[#0052FF] hover:bg-[#3B82FF] text-white font-semibold py-2.5 px-5 rounded-lg transition text-sm shadow-[0_0_20px_rgba(0,82,255,0.35)]"
          >
            Try again
          </button>
          <a
            href="/"
            className="bg-white/5 hover:bg-white/10 text-gray-200 py-2.5 px-5 rounded-lg transition text-sm border border-white/10"
          >
            Back to Calendar
          </a>
        </div>
      </div>
    </main>
  );
}
