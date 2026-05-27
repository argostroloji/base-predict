'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import { isBasepreLive, getAerodromeSwapUrl, BASEPRE_SYMBOL } from '@/lib/token';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tokenLive = isBasepreLive();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/60 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Base Predict Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(0,82,255,0.8)]" />
          <span className="font-bold text-white tracking-wider text-lg">BASE PREDICT</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {tokenLive && (
            <a
              href={getAerodromeSwapUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#0052FF]/15 hover:bg-[#0052FF]/25 border border-[#0052FF]/40 text-[#3B82FF] hover:text-white font-bold text-xs tracking-wider px-3 py-1.5 rounded-full transition shadow-[0_0_12px_rgba(0,82,255,0.2)]"
              aria-label={`Buy $${BASEPRE_SYMBOL} on Aerodrome`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse"></span>
              ${BASEPRE_SYMBOL} ↗
            </a>
          )}
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}
