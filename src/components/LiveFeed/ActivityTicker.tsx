'use client';

import { useEffect, useState, useRef } from 'react';
import { useWatchContractEvent, usePublicClient } from 'wagmi';
import { BASE_LAUNCH_NFT_ABI, CONTRACT_ADDRESS, getDateFromTokenId } from '@/lib/contract';
import { formatDate, truncateAddress } from '@/lib/utils';

interface Activity {
  id: string;
  address: string;
  date: string;
  handle: string;
}

const LS_KEY = 'bpre_activity_v3';

function loadCache(): Activity[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 20) : [];
  } catch { return []; }
}

function saveCache(list: Activity[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list.slice(0, 20))); } catch {}
}

function logToActivity(log: any, i: number): Activity | null {
  try {
    const args = log.args ?? {};
    if (!args.user || args.tokenId === undefined) return null;
    return {
      id: `${log.transactionHash}-${log.logIndex ?? i}`,
      address: truncateAddress(args.user as string),
      date: formatDate(getDateFromTokenId(args.tokenId as bigint)),
      handle: `@${(args.xHandle ?? '') as string}`,
    };
  } catch { return null; }
}

export default function ActivityTicker() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const publicClient = usePublicClient();
  const fetched = useRef(false);

  // Instant hydrate from cache
  useEffect(() => {
    const cached = loadCache();
    if (cached.length > 0) setActivities(cached);
  }, []);

  // Historical fetch
  useEffect(() => {
    if (!publicClient || fetched.current) return;
    fetched.current = true;

    (async () => {
      const fetchRange = (fromBlock: bigint, toBlock: bigint | 'latest' = 'latest') =>
        publicClient.getContractEvents({
          address: CONTRACT_ADDRESS,
          abi: BASE_LAUNCH_NFT_ABI,
          eventName: 'PredictionMinted',
          fromBlock,
          toBlock,
        });

      let logs: Awaited<ReturnType<typeof fetchRange>> = [];
      let strategyUsed = '';

      // ── Strategy 1: last 500k blocks (~11 days on Base) ─────────────
      try {
        const latest = await publicClient.getBlockNumber();
        console.log('[ActivityTicker] latest block:', latest.toString());
        const from = latest > 500_000n ? latest - 500_000n : 0n;
        // Most RPCs accept 500k blocks for address+topic filtered getLogs
        logs = await fetchRange(from);
        strategyUsed = `500k-range from ${from}`;
        console.log('[ActivityTicker] strategy 1 ok:', logs.length, 'events');
      } catch (e) {
        console.warn('[ActivityTicker] 500k-range failed:', e);
      }

      // ── Strategy 2: chunked 9000-block scan over last 1M blocks ──────
      if (logs.length === 0) {
        try {
          const latest = await publicClient.getBlockNumber();
          const CHUNK = 9000n;
          const DEPTH = 1_000_000n;
          const start = latest > DEPTH ? latest - DEPTH : 0n;
          const acc: typeof logs = [];

          for (let from = start; from <= latest; from += CHUNK) {
            const to = from + CHUNK - 1n < latest ? from + CHUNK - 1n : latest;
            try {
              const chunk = await fetchRange(from, to);
              if (chunk.length > 0) acc.push(...chunk);
            } catch {}
          }
          logs = acc;
          strategyUsed = `chunked 1M from ${start}`;
          console.log('[ActivityTicker] strategy 2 ok:', logs.length, 'events');
        } catch (e) {
          console.warn('[ActivityTicker] chunked scan failed:', e);
        }
      }

      // ── Strategy 3: full-chain (fromBlock: 0n) ───────────────────────
      if (logs.length === 0) {
        try {
          logs = await fetchRange(0n);
          strategyUsed = 'fromBlock:0';
          console.log('[ActivityTicker] strategy 3 ok:', logs.length, 'events');
        } catch (e) {
          console.warn('[ActivityTicker] fromBlock:0 failed:', e);
        }
      }

      console.log(`[ActivityTicker] final: ${logs.length} events via ${strategyUsed || 'NONE'}`);

      // Process
      const seen = new Set<string>();
      const recent: Activity[] = logs
        .map((log, i) => logToActivity(log, i))
        .filter((a): a is Activity => a !== null)
        .filter((a) => {
          if (seen.has(a.id)) return false;
          seen.add(a.id);
          return true;
        })
        .reverse()
        .slice(0, 20);

      if (recent.length > 0) {
        setActivities(recent);
        saveCache(recent);
      }
    })();
  }, [publicClient]);

  // Real-time
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: BASE_LAUNCH_NFT_ABI,
    eventName: 'PredictionMinted',
    onLogs(logs) {
      const fresh = logs
        .map((log, i) => logToActivity(log, i))
        .filter((a): a is Activity => a !== null);
      if (fresh.length === 0) return;
      setActivities((prev) => {
        const ids = new Set(prev.map((a) => a.id));
        const merged = [...fresh.filter((a) => !ids.has(a.id)), ...prev].slice(0, 20);
        saveCache(merged);
        return merged;
      });
    },
  });

  if (activities.length === 0) {
    return (
      <div className="w-full bg-white/[0.02] border-y border-white/5 py-2 overflow-hidden mt-16 z-40 relative">
        <div className="flex items-center justify-center text-sm text-gray-500 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] mr-3 animate-pulse" />
          Loading on-chain activity…
        </div>
      </div>
    );
  }

  const duplicated = [...activities, ...activities];

  return (
    <div className="w-full bg-white/[0.02] border-y border-white/5 py-2 overflow-hidden mt-16 z-40 relative">
      <div className="flex whitespace-nowrap animate-[ticker_30s_linear_infinite] hover:[animation-play-state:paused]">
        {duplicated.map((activity, index) => (
          <div key={`${activity.id}-${index}`} className="flex items-center mx-4 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF] mr-3 shadow-[0_0_5px_#0052FF]" />
            <span className="text-gray-400 font-mono text-xs mr-2">{activity.address}</span>
            <span className="text-gray-300">locked</span>
            <span className="text-white font-medium mx-2 bg-white/5 px-1.5 py-0.5 rounded">{activity.date}</span>
            <span className="text-gray-300">as</span>
            <span className="text-[#3B82FF] ml-2 font-medium">{activity.handle}</span>
            <span className="text-white/10 mx-6">|</span>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </div>
  );
}
