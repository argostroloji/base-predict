'use client';

import { useState } from 'react';
import {
  isBasepreLive,
  getAerodromeSwapUrl,
  getBankrUrl,
  BASEPRE_ADDRESS,
  BASEPRE_SYMBOL,
} from '@/lib/token';

export default function TokenBar() {
  const [copied, setCopied] = useState(false);

  if (!isBasepreLive()) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(BASEPRE_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore silently */
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-[#0052FF]/15 via-[#0052FF]/5 to-transparent border-b border-[#0052FF]/25 relative z-30">
      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 xl:px-8 py-2 sm:py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {/* Row 1 on mobile / left side on desktop: ticker + CA + copy */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#3B82FF] flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
            ${BASEPRE_SYMBOL}
          </span>

          <code className="font-mono text-[9px] sm:text-[11px] text-gray-200 bg-black/50 border border-white/10 rounded px-1.5 sm:px-2 py-1 break-all min-w-0 flex-1 sm:flex-none">
            {BASEPRE_ADDRESS}
          </code>

          <button
            onClick={handleCopy}
            className="flex-shrink-0 flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded px-1.5 sm:px-2 py-1 transition"
            title="Copy contract address"
            aria-label="Copy contract address"
          >
            {copied ? (
              <>
                <svg className="w-3 h-3 text-[#00FF88]" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="hidden sm:inline">Copied</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Row 2 on mobile / right side on desktop: buy CTAs */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <a
            href={getAerodromeSwapUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none text-center inline-flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold text-white bg-[#0052FF] hover:bg-[#3B82FF] rounded px-2.5 py-1.5 sm:py-1 shadow-[0_0_10px_rgba(0,82,255,0.4)] transition"
          >
            Buy on Aerodrome <span className="opacity-70">↗</span>
          </a>

          <a
            href={getBankrUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none text-center inline-flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold text-black bg-[#00FF88] hover:bg-[#33ffa3] rounded px-2.5 py-1.5 sm:py-1 shadow-[0_0_10px_rgba(0,255,136,0.3)] transition"
          >
            Buy on Bankr <span className="opacity-70">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
