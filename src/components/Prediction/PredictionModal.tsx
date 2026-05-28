'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import ShareCard from './ShareCard';
import TicketReveal from './TicketReveal';
import Confetti from '@/components/Confetti';
import { formatDate, MAX_MINTS_PER_DATE } from '@/lib/utils';
import { useNFTMint } from '@/hooks/useNFTMint';
import { useDateMintCount, useMintedDate } from '@/hooks/useContractData';
import { getTokenIdFromDate, CONTRACT_ADDRESS } from '@/lib/contract';
import { getOpenSeaUrl } from '@/lib/utils';

interface PredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onSuccess: () => void;
}

export default function PredictionModal({ isOpen, onClose, selectedDate, onSuccess }: PredictionModalProps) {
  const { address, isConnected } = useAccount();
  const [handle, setHandle] = useState('');
  const [validationError, setValidationError] = useState('');
  
  // Contract Hooks
  const { mint, step, txHash, isError, error, reset } = useNFTMint();
  
  // Data Hooks
  const { hasMinted } = useMintedDate(address);
  const selectedTokenId = selectedDate ? getTokenIdFromDate(selectedDate) : 0n;
  const { count: currentMintCount, refetch: refetchCount } = useDateMintCount(selectedTokenId);

  // Status variables
  const isSoldOut = currentMintCount >= MAX_MINTS_PER_DATE;
  const showUrgency = currentMintCount >= 6 && currentMintCount < 10;
  
  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      refetchCount();
      setHandle('');
      setValidationError('');
      reset();
    }
  }, [isOpen, refetchCount, reset]);

  // Handle success callback
  useEffect(() => {
    if (step === 'success') {
      onSuccess();
    }
  }, [step, onSuccess]);

  const handleSubmit = () => {
    if (!isConnected) {
      setValidationError('Please connect your wallet first');
      return;
    }
    if (hasMinted) {
      setValidationError('Your wallet has already minted a ticket');
      return;
    }
    if (isSoldOut) {
      setValidationError('This date is completely sold out');
      return;
    }
    if (!handle || handle.length < 2) {
      setValidationError('Please enter a valid X handle (min 2 chars)');
      return;
    }
    
    setValidationError('');
    
    // Execute Wagmi transaction
    if (selectedDate) {
      mint(selectedDate, handle);
    }
  };

  const resetAndClose = () => {
    reset();
    setHandle('');
    setValidationError('');
    onClose();
  };

  if (!selectedDate) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={step === 'signing' || step === 'confirming' ? undefined : resetAndClose}
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`relative w-full max-w-md bg-[#0A0A0A]/95 border rounded-2xl shadow-2xl overflow-hidden
              ${step === 'error' ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 
                isSoldOut ? 'border-gray-600/50' : 
                showUrgency ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 
                'border-[#0052FF]/30 shadow-[0_0_30px_rgba(0,82,255,0.1)]'}
            `}
          >
            {/* Close button */}
            {step !== 'signing' && step !== 'confirming' && step !== 'success' && (
              <button 
                onClick={resetAndClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-black/50 rounded-full p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}

            {/* SYBIL PROTECTION BANNER */}
            {hasMinted && step === 'idle' && (
              <div className="bg-red-500/10 border-b border-red-500/20 p-3 text-center">
                <span className="text-red-400 text-sm font-bold flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  You have already minted a prediction ticket
                </span>
              </div>
            )}

            <div className={`p-6 md:p-8 ${step === 'success' ? 'pb-4' : ''}`}>
              {step === 'idle' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🎟️</span>
                    <h3 className="text-2xl font-bold text-white">Base Launch Ticket</h3>
                  </div>
                  
                  {/* Selected Date Card */}
                  <div className={`bg-gradient-to-br from-white/5 to-white/2 border rounded-xl p-4 text-center mb-6 relative overflow-hidden
                    ${isSoldOut ? 'border-gray-700 opacity-60' : showUrgency ? 'border-amber-500/30 shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]' : 'border-[#0052FF]/20'}
                  `}>
                    {showUrgency && !isSoldOut && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                    )}
                    <div className="text-sm text-gray-400 mb-1">Selected Date</div>
                    <div className="text-2xl font-extrabold text-white">{formatDate(selectedDate)}</div>
                    
                    {/* Scarcity Indicator */}
                    <div className="mt-3 flex items-center justify-center gap-2">
                        <div className="flex-1 max-w-[120px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${isSoldOut ? 'bg-gray-500' : showUrgency ? 'bg-amber-500' : 'bg-[#0052FF]'}`}
                                style={{ width: `${(currentMintCount / 10) * 100}%` }}
                            ></div>
                        </div>
                        <span className={`text-xs font-bold ${isSoldOut ? 'text-red-400' : showUrgency ? 'text-amber-400' : 'text-[#0052FF]'}`}>
                            {currentMintCount} / 10 Minted
                        </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Your X (Twitter) Handle</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500">@</span>
                      </div>
                      <input
                        type="text"
                        value={handle}
                        disabled={hasMinted || isSoldOut || !isConnected}
                        onChange={(e) => {
                          setHandle(e.target.value.replace(/^@/, ''));
                          setValidationError('');
                        }}
                        placeholder="crypto_whale"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all disabled:opacity-50"
                      />
                    </div>
                    {validationError && <p className="mt-2 text-sm text-red-400">{validationError}</p>}
                  </div>

                  <div className="bg-[#1A1A2E] rounded-lg p-3 flex items-start gap-3 mb-6 border border-[#0052FF]/20">
                    <svg className="w-5 h-5 text-[#0052FF] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      This mints a free ERC-1155 NFT on Base. You only pay network gas fees (~$0.01).
                    </p>
                  </div>

                  {!isConnected ? (
                      <div className="w-full bg-white/10 text-white text-center font-bold py-4 px-6 rounded-xl">
                          Please Connect Wallet
                      </div>
                  ) : isSoldOut ? (
                      <a
                        href={getOpenSeaUrl(CONTRACT_ADDRESS, selectedTokenId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block text-center bg-transparent border-2 border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-bold py-3.5 px-6 rounded-xl transition-all"
                      >
                          Trade on OpenSea
                      </a>
                  ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={hasMinted || isSoldOut}
                        className="w-full bg-[#0052FF] hover:bg-[#3B82FF] disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(0,82,255,0.4)]"
                    >
                        Mint Your Launch Ticket (Free + Gas)
                    </button>
                  )}
                </motion.div>
              )}

              {(step === 'signing' || step === 'confirming') && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[#0052FF] rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">
                      {step === 'signing' ? '✍️' : '⏳'}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    {step === 'signing' ? 'Confirm in Wallet' : 'Transaction Submitted!'}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    {step === 'signing' 
                      ? 'Please sign the transaction to mint your NFT.' 
                      : 'Waiting for confirmation on Base network...'}
                  </p>

                  <div className="w-full bg-black/50 border border-white/5 rounded-lg p-3 text-left">
                    <div className="text-[10px] uppercase text-gray-500 mb-1">Contract Action</div>
                    <div className="font-mono text-xs text-[#3B82FF]">
                      mintPredictionTicket({selectedTokenId.toString()}, "{handle}")
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'success' && <Confetti />}

              {step === 'success' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <div className="-mt-10">
                    <TicketReveal dateStr={formatDate(selectedDate)} tokenId={selectedTokenId} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">Ticket Minted! 🎉</h3>
                  <p className="text-gray-400 mb-6 text-sm">Your prediction is permanently locked on-chain.</p>
                  
                  <ShareCard date={formatDate(selectedDate)} xHandle={handle} txHash={txHash} tokenId={selectedTokenId} />
                  
                  <button
                    onClick={resetAndClose}
                    className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all"
                  >
                    Return to Calendar
                  </button>
                </motion.div>
              )}

              {step === 'error' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                  <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Transaction Failed</h3>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-8 text-left max-h-32 overflow-y-auto">
                      <p className="text-red-400 text-xs font-mono break-words">
                          {error?.message || 'User rejected the request or network error occurred.'}
                      </p>
                  </div>
                  
                  <button
                    onClick={reset}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
