import { getDefaultConfig, type Wallet } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { base } from 'wagmi/chains';
import { http, fallback } from 'wagmi';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

// CORS-friendly Base RPCs only. llamarpc.com blocks browser requests via
// CORS preflight, which silently breaks getLogs/getContractEvents from
// the frontend. publicnode + 1rpc + official gateway all allow browser
// origins.
const baseTransport = fallback([
  http('https://base-rpc.publicnode.com'),
  http('https://1rpc.io/base'),
  http('https://mainnet.base.org'),
  http('https://base.publicnode.com'),
]);

// Wrap the Farcaster Mini App wagmi connector as a RainbowKit wallet
// so it shows up in the connect modal AND is selectable programmatically
// (Web3Provider auto-connects to it when running inside Farcaster).
const farcasterMiniAppWallet = (): Wallet => ({
  id: 'farcasterMiniApp',
  name: 'Farcaster',
  shortName: 'Farcaster',
  iconUrl: 'https://basepre.xyz/icon.png',
  iconBackground: '#7C65C1',
  installed: true,
  downloadUrls: {},
  // RainbowKit's `createConnector` expects a wagmi createConnector fn.
  // The Farcaster package returns one directly.
  createConnector: () =>
    farcasterMiniApp() as unknown as ReturnType<Wallet['createConnector']>,
});

export const config = getDefaultConfig({
  appName: 'Base Predict',
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [base],
  transports: { [base.id]: baseTransport },
  ssr: true,
  wallets: [
    {
      groupName: 'Farcaster',
      wallets: [farcasterMiniAppWallet],
    },
    {
      groupName: 'Popular',
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        walletConnectWallet,
        rainbowWallet,
        injectedWallet,
      ],
    },
  ],
});

export const ACTIVE_CHAIN = base;
export const EXPLORER_URL = 'https://basescan.org';
export const OPENSEA_CHAIN = 'base';
