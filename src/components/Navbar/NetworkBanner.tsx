'use client';

import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';

export default function NetworkBanner() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected || chainId === base.id) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-black text-xs sm:text-sm font-bold text-center py-2 px-4 z-[70] flex items-center justify-center gap-3 shadow-lg">
      <span>Wrong network — please switch to Base to mint.</span>
      <button
        onClick={() => switchChain({ chainId: base.id })}
        disabled={isPending}
        className="bg-black text-amber-300 px-3 py-1 rounded-md hover:bg-black/80 disabled:opacity-50 transition"
      >
        {isPending ? 'Switching…' : 'Switch to Base'}
      </button>
    </div>
  );
}
