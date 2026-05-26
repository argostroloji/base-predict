'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import { BASE_LAUNCH_NFT_ABI, CONTRACT_ADDRESS, getTokenIdFromDate } from '@/lib/contract';

/**
 * Check which date (tokenId) a wallet has already minted.
 * Returns 0n if the wallet hasn't minted any ticket.
 */
export function useMintedDate(address?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: BASE_LAUNCH_NFT_ABI,
    functionName: 'userMintedDate',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    mintedTokenId: data as bigint | undefined,
    hasMinted: data ? (data as bigint) > 0n : false,
    isLoading,
    refetch,
  };
}

/**
 * Get the total number of mints for a specific date/tokenId.
 */
export function useDateMintCount(tokenId: bigint) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: BASE_LAUNCH_NFT_ABI,
    functionName: 'totalMintedPerDate',
    args: [tokenId],
  });

  return {
    count: data !== undefined ? Number(data as bigint) : 0,
    isLoading,
    refetch,
  };
}

/**
 * Batch-fetch mint counts for an array of dates.
 * Used by the calendar heatmap to show scarcity for all visible dates.
 */
export function useBatchDateCounts(dates: Date[]) {
  const contracts = dates.map((date) => ({
    address: CONTRACT_ADDRESS,
    abi: BASE_LAUNCH_NFT_ABI,
    functionName: 'totalMintedPerDate' as const,
    args: [getTokenIdFromDate(date)] as const,
  }));

  const { data, isLoading, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: dates.length > 0,
      // Refetch every 15 seconds for near-real-time updates
      refetchInterval: 15_000,
    },
  });

  // Build a Map<dateKey, count> for easy lookup
  const countMap = new Map<string, number>();
  if (data) {
    dates.forEach((date, i) => {
      const key = formatDateKeyLocal(date);
      const result = data[i];
      if (result && result.status === 'success') {
        countMap.set(key, Number(result.result as bigint));
      } else {
        countMap.set(key, 0);
      }
    });
  }

  return {
    countMap,
    isLoading,
    refetch,
  };
}

/**
 * Local date key helper (YYYY-MM-DD) to avoid circular dependency with utils
 */
function formatDateKeyLocal(date: Date): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
