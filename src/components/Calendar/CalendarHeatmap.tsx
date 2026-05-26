'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePublicClient, useWatchContractEvent } from 'wagmi';
import DayCell from './DayCell';
import MonthLabel from './MonthLabel';
import Tooltip from './Tooltip';
import { getHeatmapColor, formatDateKey, formatDate, DATE_RANGE_START, DATE_RANGE_END } from '@/lib/utils';
import { useBatchDateCounts } from '@/hooks/useContractData';
import { BASE_LAUNCH_NFT_ABI, CONTRACT_ADDRESS, getDateFromTokenId } from '@/lib/contract';

interface CalendarHeatmapProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export default function CalendarHeatmap({ selectedDate, onSelectDate }: CalendarHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const publicClient = usePublicClient();
  const [hoveredCell, setHoveredCell] = useState<{
    date: Date;
    count: number;
    handles: string[];
    rect: DOMRect;
  } | null>(null);

  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [handlesMap, setHandlesMap] = useState<Map<string, string[]>>(new Map());

  // Generate calendar grid (UTC-safe)
  const { weeks, monthLabels, allDates } = useMemo(() => {
    const startDate = DATE_RANGE_START;
    const endDate = DATE_RANGE_END;

    const weeksArr: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];
    const labels: { month: string; year: number; weekIndex: number }[] = [];
    const dates: Date[] = [];

    const startDay = startDate.getUTCDay();
    for (let i = 0; i < startDay; i++) {
      currentWeek.push(null);
    }

    const current = new Date(startDate);
    let weekIdx = 0;
    let lastMonth = -1;

    while (current <= endDate) {
      if (current.getUTCMonth() !== lastMonth && current.getUTCDate() <= 7) {
        labels.push({
          month: current.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
          year: current.getUTCFullYear(),
          weekIndex: weekIdx,
        });
        lastMonth = current.getUTCMonth();
      }

      const d = new Date(current);
      currentWeek.push(d);
      dates.push(d);

      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
        weekIdx++;
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeksArr.push(currentWeek);
    }

    return { weeks: weeksArr, monthLabels: labels, allDates: dates };
  }, []);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // On-chain counts (wagmi multicall)
  const { countMap: contractCounts } = useBatchDateCounts(allDates);

  // Pull historical handles from PredictionMinted events
  useEffect(() => {
    if (!publicClient) return;
    (async () => {
      try {
        const latest = await publicClient.getBlockNumber();
        // Public RPCs typically cap getLogs around 9999 blocks per call
        const fromBlock = latest > 9000n ? latest - 9000n : 0n;
        const logs = await publicClient.getContractEvents({
          address: CONTRACT_ADDRESS,
          abi: BASE_LAUNCH_NFT_ABI,
          eventName: 'PredictionMinted',
          fromBlock,
          toBlock: 'latest',
        });

        const map = new Map<string, string[]>();
        for (const log of logs) {
          const args = (log as any).args;
          const date = getDateFromTokenId(args.tokenId as bigint);
          const key = formatDateKey(date);
          const handle = args.xHandle as string;
          const arr = map.get(key) || [];
          if (!arr.includes(handle)) arr.push(handle);
          map.set(key, arr);
        }
        setHandlesMap(map);
      } catch (e) {
        // RPC may not support old logs — silent fail
      }
    })();
  }, [publicClient]);

  // Live updates
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: BASE_LAUNCH_NFT_ABI,
    eventName: 'PredictionMinted',
    onLogs(logs) {
      setHandlesMap((prev) => {
        const next = new Map(prev);
        for (const log of logs) {
          const args = (log as any).args;
          const date = getDateFromTokenId(args.tokenId as bigint);
          const key = formatDateKey(date);
          const handle = args.xHandle as string;
          const arr = next.get(key) || [];
          if (!arr.includes(handle)) arr.push(handle);
          next.set(key, arr);
        }
        return next;
      });
    },
  });

  const handleHover = (date: Date, rect: DOMRect) => {
    const key = formatDateKey(date);
    const count = contractCounts.get(key) ?? 0;
    const handles = handlesMap.get(key) || [];
    setHoveredCell({ date, count, handles, rect });
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
  };

  const handleLeave = () => setHoveredCell(null);

  // Scroll to current month on mount
  useEffect(() => {
    if (containerRef.current) {
      const diffTime = Math.abs(today.getTime() - DATE_RANGE_START.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const targetWeek = Math.floor(diffDays / 7);
      containerRef.current.scrollLeft = Math.max(0, targetWeek * 52 - 100);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-xl w-full shadow-2xl relative"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-1.5 h-6 bg-[#0052FF] rounded-full shadow-[0_0_10px_#0052FF] animate-pulse"></span>
          Select Your Prediction Date
        </h2>

        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="bg-[#1A1A2E]/50 border border-[#0052FF]/20 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse"></span>
            <span className="text-xs text-blue-200 font-medium">Live from Base Network</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <button
              onClick={() => { if (containerRef.current) containerRef.current.scrollLeft -= 200; }}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >←</button>
            <button
              onClick={() => { if (containerRef.current) containerRef.current.scrollLeft += 200; }}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >→</button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="flex">
          <div className="flex flex-col gap-1 mt-[32px] mr-3 text-xs text-gray-400 font-semibold select-none sticky left-0 bg-[#0A0A0A]/90 backdrop-blur-sm py-1 z-30 w-8 text-right pr-2">
            <div className="h-12 leading-[48px]">Sun</div>
            <div className="h-12 leading-[48px]">Mon</div>
            <div className="h-12 leading-[48px]">Tue</div>
            <div className="h-12 leading-[48px]">Wed</div>
            <div className="h-12 leading-[48px]">Thu</div>
            <div className="h-12 leading-[48px]">Fri</div>
            <div className="h-12 leading-[48px]">Sat</div>
          </div>

          <div
            ref={containerRef}
            className="overflow-x-auto pb-4 scroll-smooth hide-scrollbar flex-1 relative"
            style={{ scrollSnapType: 'x proximity' }}
            onScroll={handleLeave}
          >
            <div className="flex gap-1 min-w-max relative pt-[32px]">
              {monthLabels.map((label, i) => (
                <div
                  key={i}
                  className="absolute top-0 z-10"
                  style={{ left: `${label.weekIndex * 52}px` }}
                >
                  <MonthLabel monthName={label.month} year={label.year} />
                </div>
              ))}

              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1 scroll-snap-align-start relative z-0">
                  {week.map((date, dayIndex) => {
                    if (!date) {
                      return <div key={`empty-${dayIndex}`} className="w-12 h-12"></div>;
                    }
                    const key = formatDateKey(date);
                    const count = contractCounts.get(key) ?? 0;
                    const isSelected = selectedDate ? formatDateKey(selectedDate) === key : false;
                    const isDisabled = date < today;
                    const colorClass = getHeatmapColor(count);

                    return (
                      <DayCell
                        key={key}
                        date={date}
                        count={count}
                        isSelected={isSelected}
                        isDisabled={isDisabled}
                        colorClass={colorClass}
                        onClick={onSelectDate}
                        onHover={handleHover}
                        onLeave={handleLeave}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 mt-6 pt-4 border-t border-white/5 text-xs text-gray-400 font-medium">
        <div className="flex items-center gap-2">
          <span>Availability:</span>
        </div>
        <div className="flex gap-1 items-center px-2 py-1 rounded bg-white/5 border border-white/10">
          <div className="w-3 h-3 rounded-sm bg-[#0052FF]/20 border border-[#0052FF]/30"></div>
          <span>Calm</span>
        </div>
        <div className="flex gap-1 items-center px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30">
          <div className="w-3 h-3 rounded-sm bg-amber-500/40 border border-amber-500"></div>
          <span className="text-amber-400">Urgent</span>
        </div>
        <div className="flex gap-1 items-center px-2 py-1 rounded bg-orange-500/10 border border-orange-500/30">
          <div className="w-3 h-3 rounded-sm bg-orange-500/50 border border-orange-500"></div>
          <span className="text-orange-400 flex items-center gap-1">Hot <span className="text-[10px]">🔥</span></span>
        </div>
        <div className="flex gap-1 items-center px-2 py-1 rounded bg-white/[0.03] border border-white/10">
          <div className="w-3 h-3 rounded-sm sold-out-pattern opacity-60"></div>
          <span>Sold Out</span>
        </div>
      </div>

      <Tooltip
        visible={!!hoveredCell}
        date={hoveredCell ? formatDate(hoveredCell.date) : ''}
        count={hoveredCell?.count || 0}
        handles={hoveredCell?.handles || []}
        position={tooltipPos}
      />
    </motion.div>
  );
}
