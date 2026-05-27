import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 — Base Predict',
  description: 'This prediction does not exist.',
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#0052FF]/30 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0052FF] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF] animate-pulse"></span>
          Off-chain
        </div>

        <h1 className="text-7xl md:text-8xl font-black tracking-tight bg-gradient-to-br from-white via-white to-[#3B82FF] bg-clip-text text-transparent mb-4">
          404
        </h1>

        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
          This prediction does not exist
        </h2>

        <p className="text-gray-400 text-sm md:text-base mb-8 max-w-md mx-auto">
          The page you&apos;re looking for has not been minted — or you took a wrong turn somewhere on Base.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="bg-[#0052FF] hover:bg-[#3B82FF] text-white font-semibold py-2.5 px-5 rounded-lg transition text-sm shadow-[0_0_20px_rgba(0,82,255,0.35)]"
          >
            Back to Calendar
          </Link>
          <a
            href="https://github.com/argostroloji/base-predict"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/5 hover:bg-white/10 text-gray-200 py-2.5 px-5 rounded-lg transition text-sm border border-white/10"
          >
            View on GitHub ↗
          </a>
        </div>
      </div>
    </main>
  );
}
