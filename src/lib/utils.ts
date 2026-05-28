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
 * Apple-inspired heatmap fill system — no borders, solid translucent fills.
 *
 * 0/10:   Empty  — very subtle surface
 * 1–3:    Low    — soft blue tint
 * 4–6:    Mid    — medium blue
 * 7–9:    Hot    — warm amber
 * 10/10:  Sold   — dark locked surface
 */
export function getHeatmapColor(count: number): string {
  if (count === 0)  return 'bg-white/[0.06] text-white/50';
  if (count <= 3)   return 'bg-[#0052FF]/25 text-white';
  if (count <= 6)   return 'bg-[#0052FF]/55 text-white';
  if (count <= 9)   return 'bg-amber-500/50 text-white';
  // 10/10 — Sold out
  return 'bg-white/[0.04] text-white/20 cursor-not-allowed';
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
