'use client';

import { useEffect, useState } from 'react';
import { useWatchContractEvent, usePublicClient } from 'wagmi';
import { BASE_LAUNCH_NFT_ABI, CONTRACT_ADDRESS, getDateFromTokenId } from '@/lib/contract';
import { formatDate, truncateAddress } from '@/lib/utils';

interface Activity {
  id: string;
  address: string;
  date: string;
  handle: string;
}

export default function ActivityTicker() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const publicClient = usePublicClient();

  // Fetch historical events on mount
  useEffect(() => {
    if (!publicClient) return;
    (async () => {
      try {
        // Try full-chain scan first; RPCs allow fromBlock:0 for narrow
        // address+topic queries regardless of chain length.
        let logs = await (async () => {
          try {
            return await publicClient.getContractEvents({
              address: CONTRACT_ADDRESS,
              abi: BASE_LAUNCH_NFT_ABI,
              eventName: 'PredictionMinted',
              fromBlock: 0n,
              toBlock: 'latest',
            });
          } catch {
            // Fallback: last ~24 h of blocks
            const latest = await publicClient.getBlockNumber();
            const fromBlock = latest > 43_200n ? latest - 43_200n : 0n;
            return publicClient.getContractEvents({
              address: CONTRACT_ADDRESS,
              abi: BASE_LAUNCH_NFT_ABI,
              eventName: 'PredictionMinted',
              fromBlock,
              toBlock: 'latest',
            });
          }
        })();

        const recent: Activity[] = logs
          .slice(-20)
          .reverse()
          .map((log, i) => {
            const args = (log as any).args;
            return {
              id: `${log.transactionHash}-${i}`,
              address: truncateAddress(args.user as string),
              date: formatDate(getDateFromTokenId(args.tokenId as bigint)),
              handle: `@${args.xHandle as string}`,
            };
          });

        setActivities(recent);
      } catch (e) {
        // RPC errors — silent fail, ticker stays empty
      }
    })();
  }, [publicClient]);

  // Listen for new mints in real time
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: BASE_LAUNCH_NFT_ABI,
    eventName: 'PredictionMinted',
    onLogs(logs) {
      const fresh: Activity[] = logs.map((log, i) => {
        const args = (log as any).args;
        return {
          id: `${log.transactionHash}-${i}`,
          address: truncateAddress(args.user as string),
          date: formatDate(getDateFromTokenId(args.tokenId as bigint)),
          handle: `@${args.xHandle as string}`,
        };
      });
      setActivities((prev) => [...fresh, ...prev].slice(0, 20));
    },
  });

  if (activities.length === 0) {
    return (
      <div className="w-full bg-white/[0.02] border-y border-white/5 py-2 overflow-hidden mt-16 z-40 relative">
        <div className="flex items-center justify-center text-sm text-gray-500 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] mr-3 animate-pulse"></span>
          Waiting for first prediction on-chain…
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
            <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF] mr-3 shadow-[0_0_5px_#0052FF]"></span>
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
