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

// ─── localStorage helpers ────────────────────────────────────────────────────
const LS_HANDLES  = 'bpre_handles_v2';
const LS_BLOCK    = 'bpre_handles_block_v2';
const CHUNK_SIZE  = 9000n;
// Scan back ~4 days on first load (Base ≈ 2 s/block → 172 800 blocks/day).
const INITIAL_DEPTH = 700_000n;

function loadHandleCache(): Map<string, string[]> {
  try {
    const raw = localStorage.getItem(LS_HANDLES);
    if (!raw) return new Map();
    return new Map(Object.entries(JSON.parse(raw) as Record<string, string[]>));
  } catch { return new Map(); }
}

function saveHandleCache(map: Map<string, string[]>, block: bigint) {
  try {
    const obj: Record<string, string[]> = {};
    map.forEach((v, k) => { obj[k] = v; });
    localStorage.setItem(LS_HANDLES, JSON.stringify(obj));
    localStorage.setItem(LS_BLOCK, block.toString());
  } catch {}
}

function mergeLog(
  map: Map<string, string[]>,
  tokenId: bigint,
  xHandle: string,
) {
  const date = getDateFromTokenId(tokenId);
  const key  = formatDateKey(date);
  const arr  = map.get(key) ?? [];
  if (!arr.includes(xHandle)) {
    map.set(key, [...arr, xHandle]);
  }
}
// ─────────────────────────────────────────────────────────────────────────────

interface CalendarHeatmapProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export default function CalendarHeatmap({ selectedDate, onSelectDate }: CalendarHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const publicClient = usePublicClient();

  const [hoveredCell, setHoveredCell] = useState<{
    date: Date; count: number; handles: string[]; rect: DOMRect;
  } | null>(null);
  const [tooltipPos, setTooltipPos]   = useState({ x: 0, y: 0 });
  const [handlesMap, setHandlesMap]   = useState<Map<string, string[]>>(new Map());

  // ── calendar grid ──────────────────────────────────────────────────────────
  const { weeks, monthLabels, allDates } = useMemo(() => {
    const weeksArr: (Date | null)[][] = [];
    let currentWeek: (Date | null)[]  = [];
    const labels: { month: string; year: number; weekIndex: number }[] = [];
    const dates: Date[] = [];

    const startDay = DATE_RANGE_START.getUTCDay();
    for (let i = 0; i < startDay; i++) currentWeek.push(null);

    const current = new Date(DATE_RANGE_START);
    let weekIdx = 0, lastMonth = -1;

    while (current <= DATE_RANGE_END) {
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
      while (currentWeek.length < 7) currentWeek.push(null);
      weeksArr.push(currentWeek);
    }
    return { weeks: weeksArr, monthLabels: labels, allDates: dates };
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }, []);

  const { countMap: contractCounts } = useBatchDateCounts(allDates);

  // ── handles: localStorage cache + chunked scan ─────────────────────────────
  useEffect(() => {
    if (!publicClient) return;

    // Show cached data immediately so there's no blank state
    const cached = loadHandleCache();
    if (cached.size > 0) setHandlesMap(new Map(cached));

    (async () => {
      try {
        const latest    = await publicClient.getBlockNumber();
        const lastBlock = BigInt(localStorage.getItem(LS_BLOCK) ?? '0');

        // First load: scan deep back. Subsequent loads: only new blocks.
        const newMap = new Map(cached);
        let changed  = false;

        // ── Strategy 1: single full-chain call ────────────────────────────
        // Public RPCs usually allow fromBlock:0 when the query is narrowed
        // by contract address + event topic (result set is tiny).
        let allLogs: Awaited<ReturnType<typeof publicClient.getContractEvents>> = [];
        let fullScanOk = false;
        try {
          allLogs = await publicClient.getContractEvents({
            address: CONTRACT_ADDRESS,
            abi: BASE_LAUNCH_NFT_ABI,
            eventName: 'PredictionMinted',
            fromBlock: 0n,
            toBlock: 'latest',
          });
          fullScanOk = true;
        } catch {
          // RPC rejected the wide range — fall back to chunks below
        }

        if (fullScanOk) {
          for (const log of allLogs) {
            const { tokenId, xHandle } = (log as any).args;
            mergeLog(newMap, tokenId as bigint, xHandle as string);
            changed = true;
          }
        } else {
          // ── Strategy 2: incremental chunks ─────────────────────────────
          // Start from cache checkpoint or go back INITIAL_DEPTH blocks.
          const scanFrom = lastBlock > 0n
            ? lastBlock + 1n
            : (latest > INITIAL_DEPTH ? latest - INITIAL_DEPTH : 0n);

          for (let from = scanFrom; from <= latest; from += CHUNK_SIZE) {
            const to = from + CHUNK_SIZE - 1n < latest ? from + CHUNK_SIZE - 1n : latest;
            try {
              const logs = await publicClient.getContractEvents({
                address: CONTRACT_ADDRESS,
                abi: BASE_LAUNCH_NFT_ABI,
                eventName: 'PredictionMinted',
                fromBlock: from,
                toBlock: to,
              });
              for (const log of logs) {
                const { tokenId, xHandle } = (log as any).args;
                mergeLog(newMap, tokenId as bigint, xHandle as string);
                changed = true;
              }
            } catch {
              // Chunk rejected — skip and continue
            }
          }
        }

        if (changed || cached.size === 0) {
          setHandlesMap(new Map(newMap));
          saveHandleCache(newMap, latest);
        } else {
          // Still update the "last scanned" block so next load is incremental
          saveHandleCache(newMap, latest);
        }
      } catch {
        // No-op — cached data already displayed
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicClient]);

  // ── live updates ───────────────────────────────────────────────────────────
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: BASE_LAUNCH_NFT_ABI,
    eventName: 'PredictionMinted',
    onLogs(logs) {
      setHandlesMap(prev => {
        const next = new Map(prev);
        for (const log of logs) {
          const { tokenId, xHandle } = (log as any).args;
          mergeLog(next, tokenId as bigint, xHandle as string);
        }
        saveHandleCache(next, 0n); // persist live updates (block 0 = re-scan next full load)
        return next;
      });
    },
  });

  // ── interactions ───────────────────────────────────────────────────────────
  const handleHover = (date: Date, rect: DOMRect) => {
    const key     = formatDateKey(date);
    const count   = contractCounts.get(key) ?? 0;
    const handles = handlesMap.get(key) ?? [];
    setHoveredCell({ date, count, handles, rect });
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
  };
  const handleLeave = () => setHoveredCell(null);

  // Scroll to today on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const diffDays = Math.ceil(
      (today.getTime() - DATE_RANGE_START.getTime()) / (1000 * 60 * 60 * 24),
    );
    containerRef.current.scrollLeft = Math.max(0, Math.floor(diffDays / 7) * 52 - 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 w-full shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-[#0052FF] rounded-full shadow-[0_0_8px_#0052FF]" />
          Select Your Prediction Date
        </h2>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[11px] text-green-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => containerRef.current && (containerRef.current.scrollLeft -= 200)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition text-xs"
            >‹</button>
            <button
              onClick={() => containerRef.current && (containerRef.current.scrollLeft += 200)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition text-xs"
            >›</button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex">
        {/* Day labels */}
        <div className="flex flex-col gap-0 mt-[32px] mr-2 text-[10px] text-white/25 font-semibold select-none sticky left-0 z-20 w-7 text-right pr-1">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="h-12 flex items-center justify-end">{d}</div>
          ))}
        </div>

        {/* Scrollable grid */}
        <div
          ref={containerRef}
          className="overflow-x-auto pb-2 scroll-smooth hide-scrollbar flex-1"
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

            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-0">
                {week.map((date, dIdx) => {
                  if (!date) return <div key={`e-${dIdx}`} className="w-12 h-12" />;
                  const key        = formatDateKey(date);
                  const count      = contractCounts.get(key) ?? 0;
                  const isSelected = selectedDate ? formatDateKey(selectedDate) === key : false;
                  const isDisabled = date < today;
                  const isTodayCell = formatDateKey(date) === formatDateKey(today);
                  return (
                    <DayCell
                      key={key}
                      date={date}
                      count={count}
                      isSelected={isSelected}
                      isDisabled={isDisabled}
                      isToday={isTodayCell}
                      colorClass={getHeatmapColor(count)}
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

      {/* Legend */}
      <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-white/[0.06] text-[10px] text-white/30 font-medium flex-wrap">
        {[
          { color: 'bg-white/10', label: 'Open' },
          { color: 'bg-[#0052FF]/55', label: 'Active' },
          { color: 'bg-amber-500/50', label: 'Hot 🔥' },
          { color: 'bg-white/10 opacity-40', label: 'Full' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>

      <Tooltip
        visible={!!hoveredCell}
        date={hoveredCell ? formatDate(hoveredCell.date) : ''}
        count={hoveredCell?.count ?? 0}
        handles={hoveredCell?.handles ?? []}
        position={tooltipPos}
      />
    </motion.div>
  );
}
