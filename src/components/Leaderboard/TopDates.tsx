'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBatchDateCounts } from '@/hooks/useContractData';
import { DATE_RANGE_START, DATE_RANGE_END, formatDate, formatDateKey } from '@/lib/utils';

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_STYLES = [
  {
    border: 'border-yellow-400/30',
    bg: 'bg-yellow-400/[0.07]',
    bar: 'bg-gradient-to-r from-yellow-400 to-yellow-300',
    text: 'text-yellow-300',
    glow: 'shadow-[0_0_12px_rgba(250,204,21,0.15)]',
  },
  {
    border: 'border-slate-400/30',
    bg: 'bg-slate-400/[0.06]',
    bar: 'bg-gradient-to-r from-slate-300 to-slate-200',
    text: 'text-slate-300',
    glow: '',
  },
  {
    border: 'border-orange-700/30',
    bg: 'bg-orange-800/[0.06]',
    bar: 'bg-gradient-to-r from-orange-600 to-orange-500',
    text: 'text-orange-400',
    glow: '',
  },
];

export default function TopDates() {
  const allDates = useMemo(() => {
    const dates: Date[] = [];
    const cur = new Date(DATE_RANGE_START);
    while (cur <= DATE_RANGE_END) {
      dates.push(new Date(cur));
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return dates;
  }, []);

  const { countMap, isLoading } = useBatchDateCounts(allDates);

  const top3 = useMemo(() => {
    const entries: { date: Date; count: number; key: string }[] = [];
    allDates.forEach((date) => {
      const key = formatDateKey(date);
      const count = countMap.get(key) ?? 0;
      if (count > 0) entries.push({ date, count, key });
    });
    return entries.sort((a, b) => b.count - a.count).slice(0, 3);
  }, [allDates, countMap]);

  if (isLoading) {
    return (
      <div className="mt-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-xl shadow-2xl animate-pulse">
        <div className="h-4 w-40 bg-white/10 rounded mb-5" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 bg-white/5 rounded-xl mb-3" />
        ))}
      </div>
    );
  }

  if (top3.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25 }}
      className="mt-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-xl shadow-2xl"
    >
      <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
        <span className="w-1.5 h-5 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
        Most Predicted Dates
      </h2>

      <div className="flex flex-col gap-3">
        {top3.map(({ date, count, key }, i) => {
          const style = MEDAL_STYLES[i];
          const isSoldOut = count >= 10;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className={`flex items-center gap-3 border ${style.border} ${style.bg} ${style.glow} rounded-xl px-4 py-3`}
            >
              <span className="text-xl flex-shrink-0">{MEDALS[i]}</span>

              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm">{formatDate(date)}</div>
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${style.bar} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / 10) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + 0.1 * i, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className={`text-sm font-bold tabular-nums ${style.text}`}>
                  {count}/10
                </div>
                {isSoldOut && (
                  <div className="text-[10px] text-red-400 font-bold mt-0.5">SOLD OUT</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
