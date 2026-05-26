import { getTokenIdFromDate } from './contract';

export { getTokenIdFromDate };

export const TREASURY_ADDRESS = '0x2a0a7a70844877362e5Ad1E33d5045A2FDD6678f';
// Must match contract's DATE_RANGE_START / END constants — UTC midnight
export const DATE_RANGE_START = new Date(Date.UTC(2026, 5, 1));  // Jun 1, 2026
export const DATE_RANGE_END   = new Date(Date.UTC(2027, 11, 31)); // Dec 31, 2027
export const MAX_MINTS_PER_DATE = 10;

export function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatDateKey(date: Date): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * NFT-aware heatmap color system based on 0–10 mint scarcity scale.
 *
 * 0/10:        Empty — subtle dark cell
 * 1–5/10:      Calm — clean blue glow (progressively brighter)
 * 6–9/10:      Urgent — pulsing amber/orange FOMO state
 * 10/10:       Sold Out — dark locked state
 */
export function getHeatmapColor(count: number): string {
  if (count === 0) {
    return 'bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] text-white/50';
  }
  if (count <= 3) {
    return 'bg-[#0052FF]/20 border border-[#0052FF]/30 text-white';
  }
  if (count <= 5) {
    return 'bg-[#0052FF]/40 border border-[#0052FF]/60 text-white shadow-[0_0_8px_rgba(0,82,255,0.25)]';
  }
  if (count <= 7) {
    // Urgency begins — amber glow
    return 'bg-amber-500/20 border-2 border-amber-500/60 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse-amber';
  }
  if (count <= 9) {
    // High urgency — intense orange
    return 'bg-orange-500/25 border-2 border-orange-400/80 text-white shadow-[0_0_18px_rgba(249,115,22,0.5)] animate-pulse-amber';
  }
  // 10/10 — Sold out
  return 'bg-white/[0.02] border border-white/5 text-white/20 cursor-not-allowed';
}

/**
 * Get urgency label for a given mint count.
 */
export function getUrgencyLabel(count: number): { text: string; type: 'calm' | 'urgent' | 'soldout' } {
  if (count >= MAX_MINTS_PER_DATE) return { text: 'SOLD OUT', type: 'soldout' };
  if (count >= 6) return { text: `🔥 Only ${MAX_MINTS_PER_DATE - count} Left!`, type: 'urgent' };
  return { text: `${count} / ${MAX_MINTS_PER_DATE}`, type: 'calm' };
}

export function encodePredictionData(date: string, handle: string): string {
  // Format to BaseLaunch-YYYY-MM-DD-@handle
  return `BaseLaunch-${date}-@${handle}`;
}

/**
 * Build an OpenSea URL for a specific token on Base.
 */
export function getOpenSeaUrl(contractAddress: string, tokenId: bigint): string {
  return `https://opensea.io/assets/base/${contractAddress}/${tokenId.toString()}`;
}
