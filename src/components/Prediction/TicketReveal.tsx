'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CONTRACT_ADDRESS } from '@/lib/contract';

interface TicketRevealProps {
  dateStr: string;
  tokenId: bigint;
}

export default function TicketReveal({ dateStr, tokenId }: TicketRevealProps) {
  const [svgData, setSvgData] = useState<string | null>(null);

  // Instead of complex on-chain simulation logic for SVG rendering inside React,
  // we can emulate the core visual of the contract's on-chain SVG here for a smooth 3D reveal.
  
  return (
    <div className="relative w-full max-w-sm mx-auto perspective-1000 mb-8 mt-4">
      {/* Confetti particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-confetti-burst"
            style={{
              backgroundColor: ['#0052FF', '#00FF88', '#FFFFFF', '#3B82FF'][Math.floor(Math.random() * 4)],
              left: `${50 + (Math.random() * 100 - 50)}%`,
              top: `${50 + (Math.random() * 100 - 50)}%`,
              animationDelay: `${Math.random() * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* 3D Ticket Container */}
      <div className="relative w-[280px] h-[400px] mx-auto animate-card-reveal">
        {/* Glow behind card */}
        <div className="absolute -inset-4 bg-[#0052FF] opacity-30 blur-2xl rounded-3xl animate-glow-breathe z-0"></div>

        {/* Card Body */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A1A] via-[#0D1B3E] to-[#0A0A1A] rounded-[20px] shadow-2xl border border-[#0052FF]/50 z-10 overflow-hidden flex flex-col justify-between p-6">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-[#1A2A4A] pb-3">
            <span className="text-white font-bold tracking-[0.2em] text-xs">BASE PREDICT</span>
            <span className="text-[#00FF88] font-bold tracking-[0.1em] text-[10px]">ACTIVE</span>
          </div>

          {/* Center */}
          <div className="flex flex-col items-center justify-center space-y-4 my-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#0052FF]/20 blur-xl rounded-full"></div>
            <span className="text-[#4A5A8A] font-bold text-[10px] tracking-[0.4em] z-10">LAUNCH PREDICTION TICKET</span>
            <div className="text-white font-bold text-3xl tracking-tight text-center z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
              {dateStr}
            </div>
            <div className="w-32 h-1 bg-[#0052FF]/60 rounded-full z-10 shadow-[0_0_10px_#0052FF]"></div>
          </div>

          {/* Footer Info */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-[#4A5A8A] text-[9px] tracking-widest font-bold mb-1">NETWORK</div>
                    <div className="text-white font-bold text-sm">Base (L2)</div>
                </div>
                <div className="text-right">
                    <div className="text-[#4A5A8A] text-[9px] tracking-widest font-bold mb-1">CONTRACT</div>
                    <div className="text-blue-400 font-mono text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded">
                        {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
                    </div>
                </div>
            </div>

            <div className="w-full border-t border-dashed border-[#1A2A4A] my-2"></div>

            <div className="flex justify-between items-center pb-2">
                <div>
                    <div className="text-[#4A5A8A] text-[9px] tracking-widest font-bold mb-1">TOKEN TYPE</div>
                    <div className="text-white font-bold text-xs">ERC-1155 NFT</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#0052FF]/20 border border-[#0052FF]/50 flex items-center justify-center shadow-[0_0_10px_rgba(0,82,255,0.3)]">
                    <span className="text-white font-bold text-lg">B</span>
                </div>
            </div>
          </div>
        </div>

        {/* Reflection Highlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent z-20 pointer-events-none rounded-[20px]"></div>
      </div>
    </div>
  );
}
