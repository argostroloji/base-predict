'use client';

import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import RewardPool from './RewardPool';
import { useBatchDateCounts } from '@/hooks/useContractData';
import { DATE_RANGE_START, DATE_RANGE_END, formatDate, formatDateKey } from '@/lib/utils';
import { isBasepreLive, BASEPRE_SYMBOL } from '@/lib/token';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function getCountdownText(target: Date): string {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return 'Today!';

  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  if (days > 60) return `${days} days away`;
  if (days > 0) return `${days}d ${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;
  return `${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;
}

export default function Hero() {
  const allDates = useMemo(() => {
    const dates: Date[] = [];
    const cur = new Date(DATE_RANGE_START);
    while (cur <= DATE_RANGE_END) {
      dates.push(new Date(cur));
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return dates;
  }, []);

  const { countMap } = useBatchDateCounts(allDates);

  const { totalPredictions, soldOutDates, uniqueDates, leadingDate, leadingDateObj } =
    useMemo(() => {
      let total = 0;
      let soldOut = 0;
      let unique = 0;
      let maxCount = 0;
      let maxDateObj: Date | null = null;

      countMap.forEach((count, key) => {
        total += count;
        if (count >= 10) soldOut++;
        if (count > 0) unique++;
        if (count > maxCount) {
          maxCount = count;
          // key is "YYYY-MM-DD" — parse as UTC
          maxDateObj = new Date(key + 'T00:00:00Z');
        }
      });

      return {
        totalPredictions: total,
        soldOutDates: soldOut,
        uniqueDates: unique,
        leadingDate: maxCount > 0 && maxDateObj ? formatDate(maxDateObj) : null,
        leadingDateObj: maxDateObj as Date | null,
      };
    }, [countMap]);

  // Live countdown ticker
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    if (!leadingDateObj) return;

    const tick = () => setCountdown(getCountdownText(leadingDateObj));
    tick();

    // Tick every second when close, every minute when far
    const diff = leadingDateObj.getTime() - Date.now();
    const interval = setInterval(tick, diff > 60 * 24 * 60 * 60 * 1000 ? 60_000 : 1_000);
    return () => clearInterval(interval);
  }, [leadingDateObj]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' as const } },
  };

  return (
    <section className="relative flex flex-col items-center xl:items-start justify-center overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#0052FF]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#3B82FF]/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full bg-white/5 blur-[100px]" />
      </div>

      <motion.div
        className="relative z-10 w-full flex flex-col items-center xl:items-start text-center xl:text-left"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badges */}
        <motion.div variants={itemVariants} className="mb-4 inline-flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-2 bg-[#00FF88]/10 border border-[#00FF88]/40 text-[#00FF88] px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,136,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
            Free Mint
          </span>
          <span className="inline-flex items-center gap-2 bg-[#0052FF]/10 border border-[#0052FF]/30 text-[#3B82FF] px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,82,255,0.2)]">
            ERC-1155 on Base
          </span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-[#0052FF]">
            When Base Token?
          </span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl font-light">
          <span className="text-[#00FF88] font-semibold">Free mint</span> your prediction — pay only gas. Hold the winning date.{' '}
          {isBasepreLive() ? (
            <>Earn 70% in <span className="text-[#3B82FF] font-semibold">${BASEPRE_SYMBOL}</span>.</>
          ) : (
            <>Earn 70% of token fees.</>
          )}
        </motion.p>

        <motion.div variants={itemVariants} className="mb-10">
          <RewardPool />
        </motion.div>

        {/* Stats grid — 2x2 */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 w-full">
          {[
            { label: 'Total Mints', value: totalPredictions.toLocaleString(), icon: '🎟️' },
            { label: 'Unique Dates', value: uniqueDates.toString(), icon: '📅' },
            { label: 'Sold Out', value: soldOutDates.toString(), icon: '🔒' },
            { label: 'Leading Date', value: leadingDate ?? '—', icon: '🏆' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#0052FF]/0 to-[#0052FF]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                <span>{stat.icon}</span>
                {stat.label}
              </div>
              <div className="text-xl font-bold text-white leading-tight relative z-10">
                {stat.value}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Community Prediction Countdown */}
        {leadingDate && countdown && (
          <motion.div
            variants={itemVariants}
            className="mt-4 w-full bg-gradient-to-br from-[#0052FF]/10 to-[#3B82FF]/5 border border-[#0052FF]/30 rounded-xl p-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#0052FF]/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF] animate-pulse" />
                Community Predicts Base TGE
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-white font-bold text-sm">{leadingDate}</span>
                <span className="font-mono text-[#0052FF] font-bold text-base tabular-nums">
                  {countdown}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
