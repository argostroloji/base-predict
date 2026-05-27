'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import RewardPool from './RewardPool';
import { useBatchDateCounts } from '@/hooks/useContractData';
import { DATE_RANGE_START, DATE_RANGE_END, formatDate } from '@/lib/utils';
import { isBasepreLive, BASEPRE_SYMBOL } from '@/lib/token';

export default function Hero() {
  // Generate all valid dates for stats aggregation
  const allDates = useMemo(() => {
    const dates: Date[] = [];
    const cur = new Date(DATE_RANGE_START);
    while (cur <= DATE_RANGE_END) {
      dates.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  }, []);

  const { countMap } = useBatchDateCounts(allDates);

  const stats = useMemo(() => {
    let total = 0;
    let soldOut = 0;
    let maxCount = 0;
    let maxDate: Date | null = null;

    countMap.forEach((count, key) => {
      total += count;
      if (count >= 10) soldOut++;
      if (count > maxCount) {
        maxCount = count;
        maxDate = new Date(key);
      }
    });

    return {
      totalPredictions: total,
      soldOutDates: soldOut,
      hottestDate: maxCount > 0 && maxDate ? formatDate(maxDate) : 'None yet',
    };
  }, [countMap]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' as const } },
  };

  return (
    <section className="relative flex flex-col items-center xl:items-start justify-center overflow-hidden">
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
        <motion.div variants={itemVariants} className="mb-4 inline-flex items-center gap-2 bg-[#0052FF]/10 border border-[#0052FF]/30 text-[#3B82FF] px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,82,255,0.2)]">
          <span className="w-2 h-2 rounded-full bg-[#0052FF] animate-pulse"></span>
          ERC-1155 on Base
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-[#0052FF]">
            When Base Token?
          </span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl font-light">
          Mint your prediction. Hold the winning date.{' '}
          {isBasepreLive() ? (
            <>
              Earn 70% in <span className="text-[#3B82FF] font-semibold">${BASEPRE_SYMBOL}</span>.
            </>
          ) : (
            <>Earn 70% of token fees.</>
          )}
        </motion.p>

        <motion.div variants={itemVariants} className="mb-16">
          <RewardPool />
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-4 w-full">
          {[
            { label: 'Total Mints', value: stats.totalPredictions.toLocaleString() },
            { label: 'Sold Out Dates', value: stats.soldOutDates.toString() },
            { label: 'Hottest Date', value: stats.hottestDate },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0052FF]/0 to-[#0052FF]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-white relative z-10">{stat.value}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
