'use client';

import { useState } from 'react';
import { getOpenSeaUrl } from '@/lib/utils';
import { CONTRACT_ADDRESS } from '@/lib/contract';
import { EXPLORER_URL } from '@/config/wagmi';

interface ShareCardProps {
  date: string;
  xHandle: string;
  txHash?: string;
  tokenId?: bigint;
}

// Prefer the deployed site URL over window.location.origin so dev/preview
// shares never leak `localhost:3000` or a *.vercel.app subdomain.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://basepre.xyz';

export default function ShareCard({ date, xHandle, txHash, tokenId }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const tweetText = `I just free-minted my Base Launch Ticket NFT for ${date}! 🎟️🔵\n\nFree mint, pay only gas. Lock yours in before the date sells out. $BASEPRE`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(SITE_URL)}`;

  // Warpcast uses a different intent format
  const castText = `${tweetText} ${SITE_URL}`;
  const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(castText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-[#0A0A0A] to-[#1A1A2E] border border-[#0052FF]/30 rounded-xl p-5 w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#0052FF] flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(0,82,255,0.5)]">
          {xHandle.charAt(0).toUpperCase()}
        </div>
        <div className="text-left">
          <div className="font-bold text-white">@{xHandle}</div>
          <div className="text-xs text-[#00FF88] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse"></span>
            Mint Confirmed
          </div>
        </div>
        
        {/* OpenSea Link */}
        {tokenId !== undefined && (
          <a 
            href={getOpenSeaUrl(CONTRACT_ADDRESS, tokenId)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-blue-400 hover:text-white transition flex flex-col items-center group"
            title="View on OpenSea"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/10 group-hover:bg-blue-500/30 flex items-center justify-center mb-0.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.08 12.01c0-4.99-4.05-9.03-9.04-9.03-4.99 0-9.04 4.04-9.04 9.03 0 4.98 4.05 9.03 9.04 9.03 4.99 0 9.04-4.05 9.04-9.03zm-8.86-5.71c1.39 0 2.52 1.13 2.52 2.52 0 1.39-1.13 2.52-2.52 2.52-1.39 0-2.52-1.13-2.52-2.52 0-1.39 1.13-2.52 2.52-2.52zm3.3 8.35c.44-.44.44-1.16 0-1.61-.44-.44-1.16-.44-1.61 0l-1.69 1.69-1.69-1.69c-.44-.44-1.16-.44-1.61 0-.44.44-.44 1.16 0 1.61l1.69 1.69-1.69 1.69c-.44.44-.44 1.16 0 1.61.44.44 1.16.44 1.61 0l1.69-1.69 1.69 1.69c.44.44 1.16.44 1.61 0 .44-.44.44-1.16 0-1.61l-1.69-1.69 1.69-1.69z" />
                </svg>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-wider">OpenSea</span>
          </a>
        )}
      </div>

      <p className="text-left text-gray-300 text-sm mb-4 leading-relaxed">
        I just <strong className="text-[#00FF88]">free-minted</strong> my <strong className="text-[#0052FF]">Base Launch Ticket NFT</strong> for <strong className="text-white bg-[#0052FF]/20 px-1 rounded border border-[#0052FF]/30">{date}</strong>! 🎟️🔵<br/><br/>
        Free mint, pay only gas. Lock yours in. <strong className="text-[#3B82FF]">$BASEPRE</strong>
      </p>

      {txHash && (
        <div className="bg-black/50 border border-white/5 rounded flex items-center justify-between p-2 mb-5">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Transaction</span>
          <a 
            href={`${EXPLORER_URL}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 font-mono hover:underline flex items-center gap-1"
          >
            {txHash.slice(0, 8)}...{txHash.slice(-6)}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
            <a 
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white text-black hover:bg-gray-200 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition text-sm shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Share
            </a>
            
            <a 
            href={warpcastUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#8A63D2] hover:bg-[#7b51c6] text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition text-sm shadow-[0_0_15px_rgba(138,99,210,0.3)]"
            >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm4.5-12.5H7.5v2h9v-2zm-1.5 4h-6v2h6v-2zm-2.5 4h-1v2h1v-2z" /></svg>
            Cast
            </a>
        </div>
        
        <button 
          onClick={handleCopy}
          className="w-full bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition border border-white/10 text-xs"
        >
          {copied ? 'Copied to Clipboard!' : 'Copy Text'}
        </button>
      </div>
    </div>
  );
}
