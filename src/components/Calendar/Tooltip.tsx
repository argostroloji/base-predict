'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MAX_MINTS_PER_DATE } from '@/lib/utils';

interface TooltipProps {
  date: string;
  count: number;
  handles: string[];
  position: { x: number; y: number };
  visible: boolean;
}

export default function Tooltip({ date, count, handles, position, visible }: TooltipProps) {
  // Portals need the DOM — wait until mounted on the client
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isSoldOut = count >= MAX_MINTS_PER_DATE;
  const progressPercent = Math.min((count / MAX_MINTS_PER_DATE) * 100, 100);
  const remaining = Math.max(MAX_MINTS_PER_DATE - count, 0);

  if (!mounted) return null;

  const tooltipNode = (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, calc(-100% - 12px))',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
          className={`
            backdrop-blur-xl rounded-xl p-4 w-72 shadow-2xl
            ${isSoldOut
              ? 'bg-[#0A0A0A] border border-white/20'
              : 'bg-black/90 border border-[#0052FF]/30'}
          `}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="font-bold text-white text-base">{date}</div>
            {isSoldOut ? (
              <div className="bg-white/10 text-white/80 text-[10px] font-bold px-2 py-0.5 rounded-sm">
                SOLD OUT
              </div>
            ) : (
              <div className="text-xs font-semibold text-[#0052FF]">
                {count} / {MAX_MINTS_PER_DATE} Tickets
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/10 h-1.5 rounded-full mb-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className={`h-full rounded-full ${
                isSoldOut
                  ? 'bg-white/40'
                  : progressPercent > 60
                  ? 'bg-amber-500'
                  : 'bg-[#0052FF]'
              }`}
            />
          </div>

          {/* Minters or empty CTA */}
          {count > 0 ? (
            <div className="text-xs">
              <div className="text-gray-400 mb-1.5 font-medium flex justify-between">
                <span>Minters</span>
                {!isSoldOut && (
                  <span className="text-blue-400">{remaining} slot{remaining !== 1 ? 's' : ''} left</span>
                )}
              </div>
              {handles.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {handles.slice(0, 10).map((handle, i) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                        isSoldOut
                          ? 'bg-white/5 border-white/10 text-gray-400'
                          : 'bg-[#0052FF]/10 border-[#0052FF]/20 text-[#3B82FF]'
                      }`}
                    >
                      @{handle}
                    </span>
                  ))}
                  {handles.length > 10 && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium border bg-white/5 border-white/10 text-gray-500">
                      +{handles.length - 10} more
                    </span>
                  )}
                </div>
              ) : (
                /* Count > 0 but handles not loaded from logs yet */
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: count }).map((_, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium border bg-white/5 border-white/10 text-gray-500 animate-pulse"
                    >
                      @···
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#1A1A2E] border border-[#0052FF]/20 rounded-lg p-2 text-center">
              <span className="text-xs text-blue-300 font-medium">
                Be the first to claim this date! 🚀
              </span>
            </div>
          )}

          {isSoldOut && (
            <div className="mt-3 pt-3 border-t border-white/10 text-center">
              <span className="text-xs font-bold text-gray-400 flex items-center justify-center gap-1">
                Trade on OpenSea
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </span>
            </div>
          )}

          {/* Arrow */}
          <div
            className={`absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full w-0 h-0
              border-l-[8px] border-r-[8px] border-t-[8px]
              border-l-transparent border-r-transparent
              ${isSoldOut ? 'border-t-white/20' : 'border-t-[#0052FF]/30'}`}
          />
          <div
            className={`absolute left-1/2 bottom-[1px] -translate-x-1/2 translate-y-full w-0 h-0
              border-l-[7px] border-r-[7px] border-t-[7px]
              border-l-transparent border-r-transparent
              ${isSoldOut ? 'border-t-[#0A0A0A]' : 'border-t-black/90'}`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render into document.body so framer-motion / backdrop-blur stacking
  // contexts on parent elements cannot clip or bury the tooltip.
  return createPortal(tooltipNode, document.body);
}
