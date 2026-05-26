'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BASE_LAUNCH_NFT_ABI, CONTRACT_ADDRESS, getTokenIdFromDate } from '@/lib/contract';

export type MintStep = 'idle' | 'signing' | 'confirming' | 'success' | 'error';

export function useNFTMint() {
  const {
    data: txHash,
    writeContract,
    isPending: isSigning,
    isError: isWriteError,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Derive the current step from hook states
  const getStep = (): MintStep => {
    if (isSuccess) return 'success';
    if (isWriteError || isReceiptError) return 'error';
    if (isConfirming) return 'confirming';
    if (isSigning) return 'signing';
    return 'idle';
  };

  const mint = (date: Date, xHandle: string) => {
    const tokenId = getTokenIdFromDate(date);

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: BASE_LAUNCH_NFT_ABI,
      functionName: 'mintPredictionTicket',
      args: [tokenId, xHandle],
    });
  };

  return {
    mint,
    reset,
    step: getStep(),
    txHash,
    isSigning,
    isConfirming,
    isSuccess,
    isError: isWriteError || isReceiptError,
    error: writeError || receiptError,
  };
}
