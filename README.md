# Base Predict

> When Base Token? Mint your prediction on-chain. ERC-1155 on Base. 10 NFTs per date.

A prediction market for the Base token TGE (Token Generation Event) date. Users mint a free ERC-1155 NFT corresponding to the date they think the Base token will launch. Each date has a max supply of 10. One mint per wallet.

## Tech

- **Frontend:** Next.js 16 + React 19 + Tailwind v4 + Framer Motion
- **Web3:** wagmi v2 + viem + RainbowKit
- **Chain:** Base Mainnet (8453)
- **Contract:** [`0x1683Cd5159a7007D8F79d95A523E3AdC28De599b`](https://basescan.org/address/0x1683Cd5159a7007D8F79d95A523E3AdC28De599b)
- **Standards:** ERC-1155 + ERC-2981 (5% royalty)

## How it works

1. User picks a date (Jun 1, 2026 – Dec 31, 2027) and an X handle
2. Wallet signs `mintPredictionTicket(timestamp, xHandle)`
3. Token ID = midnight UTC unix timestamp of that date
4. Max 10 mints per date, 1 mint per wallet enforced on-chain
5. NFTs trade on OpenSea — 5% royalty routes to the prize wallet

## Local dev

```bash
npm install
cp .env.local.example .env.local   # fill in values
npm run dev
```

Required env vars (see `.env.local`):
- `NEXT_PUBLIC_CONTRACT_ADDRESS` — deployed contract on Base
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — from cloud.reown.com
- `NEXT_PUBLIC_TREASURY_ADDRESS` — royalty receiver
- `NEXT_PUBLIC_SITE_URL` — for OG / Farcaster manifest

## Contract source

[`contracts/BaseLaunchNFTMarket.sol`](contracts/BaseLaunchNFTMarket.sol) — deployable via Remix with optimizer (runs=1) + viaIR.

## Farcaster Mini App

The app exposes a manifest at `/.well-known/farcaster.json`. To register on Warpcast:

1. Deploy with a real domain
2. Visit `https://farcaster.xyz/~/developers/mini-apps/manifest`
3. Sign the domain with your Farcaster account
4. Paste the resulting `header / payload / signature` into [`src/app/.well-known/farcaster.json/route.ts`](src/app/.well-known/farcaster.json/route.ts)
