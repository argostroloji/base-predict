'use client';

import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

/**
 * Signals to the Farcaster / Base mini-app host that the app is ready,
 * dismissing the splash screen. No-op in regular browser contexts.
 */
export default function MiniAppReady() {
  useEffect(() => {
    (async () => {
      try {
        await sdk.actions.ready();
      } catch {
        // Not running inside a mini-app host — ignore
      }
    })();
  }, []);

  return null;
}
