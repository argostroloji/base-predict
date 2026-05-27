'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useAccount, useConnect } from 'wagmi';
import { useEffect, useRef } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { config } from '@/config/wagmi';

const queryClient = new QueryClient();

/**
 * When the app runs inside the Farcaster mini-app iframe, opening the
 * RainbowKit modal (which expects window.open / new tabs for WalletConnect)
 * crashes the embed. Auto-connect to the Farcaster wallet instead so the
 * user is signed in before they ever see the connect button.
 */
function FarcasterAutoConnect() {
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  const attempted = useRef(false);

  useEffect(() => {
    if (isConnected || attempted.current) return;

    (async () => {
      try {
        const ctx = await sdk.context;
        // `ctx.client` is only populated inside an actual mini-app host.
        // In a regular browser tab, ctx will be undefined or empty.
        if (!ctx?.client) return;

        const farcasterConnector = connectors.find(
          (c) => c.id === 'farcasterMiniApp' || c.id === 'farcaster',
        );
        if (!farcasterConnector) return;

        attempted.current = true;
        connect({ connector: farcasterConnector });
      } catch {
        // Not running inside a mini-app host — ignore silently.
      }
    })();
  }, [isConnected, connect, connectors]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#0052FF',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
        >
          <FarcasterAutoConnect />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
