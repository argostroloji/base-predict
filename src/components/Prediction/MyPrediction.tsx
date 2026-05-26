'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useMintedDate, useMinterHandle } from '@/hooks/useContractData';
import { getDateFromTokenId, CONTRACT_ADDRESS } from '@/lib/contract';
import { formatDate, getOpenSeaUrl } from '@/lib/utils';
import TicketReveal from './TicketReveal';
import ShareCard from './ShareCard';

export default function MyPrediction() {
  const { address, isConnected } = useAccount();
  const { mintedTokenId, hasMinted } = useMintedDate(address);
  const { handle } = useMinterHandle(mintedTokenId, address);
  const [expanded, setExpanded] = useState(false);

  if (!isConnected || !hasMinted || !mintedTokenId) return null;

  const date = getDateFromTokenId(mintedTokenId);
  const dateStr = formatDate(date);

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative max-w-[1800px] mx-auto px-4 xl:px-8 mt-8"
    >
      <div className="bg-gradient-to-br from-[#0052FF]/10 via-white/[0.02] to-[#0052FF]/5 border border-[#0052FF]/30 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(0,82,255,0.15)]">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Header / Summary */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#00FF88]/10 border border-[#00FF88]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-[#00FF88] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse"></span>
              Your Prediction is Locked
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {dateStr}
            </h2>
            <p className="text-gray-400 text-sm md:text-base mb-4">
              You predicted the Base token will launch on this date as <span className="text-[#3B82FF] font-semibold">@{handle || '...'}</span>.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="bg-[#0052FF] hover:bg-[#3B82FF] text-white font-semibold py-2.5 px-5 rounded-xl transition-all text-sm shadow-[0_0_15px_rgba(0,82,255,0.4)]"
              >
                {expanded ? 'Hide share card' : 'Share my prediction'}
              </button>
              <a
                href={getOpenSeaUrl(CONTRACT_ADDRESS, mintedTokenId)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-5 rounded-xl transition text-sm border border-white/10"
              >
                View on OpenSea ↗
              </a>
            </div>
          </div>

          {/* Compact ticket preview */}
          <div className="hidden lg:block flex-shrink-0 scale-75 origin-right -my-12">
            <TicketReveal dateStr={dateStr} tokenId={mintedTokenId} />
          </div>
        </div>

        {/* Expanded share card */}
        {expanded && handle && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-6 max-w-md mx-auto"
          >
            <ShareCard date={dateStr} xHandle={handle} tokenId={mintedTokenId} />
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
