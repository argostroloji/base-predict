'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useMintedDate, useMinterHandle } from '@/hooks/useContractData';
import { getDateFromTokenId, CONTRACT_ADDRESS } from '@/lib/contract';
import { formatDate, getOpenSeaUrl } from '@/lib/utils';
import ShareCard from './ShareCard';

export default function MyPrediction() {
  const { address, isConnected } = useAccount();
  const { mintedTokenId, hasMinted } = useMintedDate(address);
  const { handle } = useMinterHandle(mintedTokenId, address);
  const [expanded, setExpanded] = useState(false);

  if (!isConnected || !hasMinted || !mintedTokenId) return null;

  const dateStr = formatDate(getDateFromTokenId(mintedTokenId));

  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative max-w-[1800px] mx-auto px-4 xl:px-8 mt-2"
    >
      <div className="bg-gradient-to-r from-[#0052FF]/15 via-white/[0.02] to-[#0052FF]/10 border border-[#0052FF]/30 rounded-lg px-3 py-2 backdrop-blur-xl flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#00FF88]">
          <span className="w-1 h-1 rounded-full bg-[#00FF88] animate-pulse"></span>
          Locked
        </span>

        <div className="flex items-baseline gap-1.5 min-w-0">
          <span className="text-white font-bold text-sm md:text-base whitespace-nowrap">{dateStr}</span>
          {handle && (
            <span className="text-gray-400 text-xs truncate">
              as <span className="text-[#3B82FF] font-semibold">@{handle}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="bg-[#0052FF] hover:bg-[#3B82FF] text-white font-semibold py-1 px-2.5 rounded text-xs transition shadow-[0_0_10px_rgba(0,82,255,0.35)]"
          >
            {expanded ? 'Hide' : 'Share'}
          </button>
          <a
            href={getOpenSeaUrl(CONTRACT_ADDRESS, mintedTokenId)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/5 hover:bg-white/10 text-gray-200 py-1 px-2.5 rounded text-xs transition border border-white/10"
          >
            OpenSea ↗
          </a>
        </div>
      </div>

      <AnimatePresence>
        {expanded && handle && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 max-w-md mx-auto">
              <ShareCard date={dateStr} xHandle={handle} tokenId={mintedTokenId} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
