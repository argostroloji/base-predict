// BaseLaunchNFTMarket — Contract Constants & ABI
// ABI extracted from the Solidity contract for direct Wagmi/Viem usage

export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

export const MAX_MINTS_PER_DATE = 10;

/**
 * Convert a JS Date to the on-chain tokenId (normalized to midnight UTC).
 * Mirrors the Solidity `normalizeDate` function exactly.
 */
export function getTokenIdFromDate(date: Date): bigint {
  const timestamp = Math.floor(date.getTime() / 1000);
  const dayInSeconds = 86400;
  return BigInt(Math.floor(timestamp / dayInSeconds) * dayInSeconds);
}

/**
 * Convert a tokenId back to a JS Date (midnight UTC of that day).
 */
export function getDateFromTokenId(tokenId: bigint): Date {
  return new Date(Number(tokenId) * 1000);
}

export const BASE_LAUNCH_NFT_ABI = [
  // ─── Constants ──────────────────────────────────────────────
  {
    name: 'MAX_MINTS_PER_DATE',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'DATE_RANGE_START',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'DATE_RANGE_END',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },

  // ─── Read Functions ─────────────────────────────────────────
  {
    name: 'prizePoolWallet',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'paused',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'totalMintedPerDate',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'userMintedDate',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenMinterInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    outputs: [{ name: 'xHandle', type: 'string' }],
  },
  {
    name: 'normalizeDate',
    type: 'function',
    stateMutability: 'pure',
    inputs: [{ name: '_timestamp', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'uri',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'supportsInterface',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'interfaceId', type: 'bytes4' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },

  // ─── Write Functions ────────────────────────────────────────
  {
    name: 'mintPredictionTicket',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_timestamp', type: 'uint256' },
      { name: '_xHandle', type: 'string' },
    ],
    outputs: [],
  },
  {
    name: 'updatePrizePoolWallet',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_newWallet', type: 'address' }],
    outputs: [],
  },
  {
    name: 'updateRoyalty',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_receiver', type: 'address' },
      { name: '_feeNumerator', type: 'uint96' },
    ],
    outputs: [],
  },
  {
    name: 'pause',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'unpause',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },

  // ─── Events ─────────────────────────────────────────────────
  {
    name: 'PredictionMinted',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'xHandle', type: 'string', indexed: false },
    ],
  },
  {
    name: 'PrizePoolWalletUpdated',
    type: 'event',
    inputs: [
      { name: 'oldWallet', type: 'address', indexed: true },
      { name: 'newWallet', type: 'address', indexed: true },
    ],
  },
  {
    name: 'RoyaltyUpdated',
    type: 'event',
    inputs: [
      { name: 'receiver', type: 'address', indexed: true },
      { name: 'feeNumerator', type: 'uint96', indexed: false },
    ],
  },
] as const;
