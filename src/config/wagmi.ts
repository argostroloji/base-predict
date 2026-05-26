import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';
import { http, fallback } from 'wagmi';

// Multiple public RPCs with fallback — public node is more permissive on
// multicall + log range than the default mainnet.base.org gateway.
const baseTransport = fallback([
  http('https://base.llamarpc.com'),
  http('https://base.publicnode.com'),
  http('https://mainnet.base.org'),
]);

export const config = getDefaultConfig({
  appName: 'Base Predict',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [base],
  transports: { [base.id]: baseTransport },
  ssr: true,
});

export const ACTIVE_CHAIN = base;
export const EXPLORER_URL = 'https://basescan.org';
export const OPENSEA_CHAIN = 'base';
