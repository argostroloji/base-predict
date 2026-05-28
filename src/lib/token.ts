// $BASEPRE — Base Predict project token
// Set NEXT_PUBLIC_BASEPRE_ADDRESS once the token has launched on Base.
// While unset (or zero-address), all token UI is hidden across the app.

export const BASEPRE_SYMBOL = 'BASEPRE';
export const BASEPRE_NAME = 'Base Predict';

const ZERO = '0x0000000000000000000000000000000000000000';

export const BASEPRE_ADDRESS = (process.env.NEXT_PUBLIC_BASEPRE_ADDRESS ||
  ZERO) as `0x${string}`;

/**
 * True once the token contract address has been configured.
 * Use this to conditionally render any $BASEPRE UI — keeps the site
 * clean of dead links and "TBA" placeholders before launch.
 */
export function isBasepreLive(): boolean {
  return (
    !!BASEPRE_ADDRESS &&
    BASEPRE_ADDRESS.toLowerCase() !== ZERO &&
    /^0x[a-fA-F0-9]{40}$/.test(BASEPRE_ADDRESS)
  );
}

/**
 * Aerodrome (Base-native DEX) swap URL — buy $BASEPRE with ETH.
 */
export function getAerodromeSwapUrl(token: string = BASEPRE_ADDRESS): string {
  return `https://aerodrome.finance/swap?from=eth&to=${token}`;
}

/**
 * BaseScan token page (holders, transfers, contract source).
 */
export function getBaseScanTokenUrl(token: string = BASEPRE_ADDRESS): string {
  return `https://basescan.org/token/${token}`;
}

/**
 * Bankr launch / buy page — alternative on-chain DEX UX.
 */
export function getBankrUrl(token: string = BASEPRE_ADDRESS): string {
  return `https://bankr.bot/launches/${token}`;
}
