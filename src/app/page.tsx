'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import NetworkBanner from '@/components/Navbar/NetworkBanner';
import ActivityTicker from '@/components/LiveFeed/ActivityTicker';
import Hero from '@/components/Hero/Hero';
import CalendarHeatmap from '@/components/Calendar/CalendarHeatmap';
import PredictionModal from '@/components/Prediction/PredictionModal';
import MyPrediction from '@/components/Prediction/MyPrediction';
import MiniAppReady from '@/components/MiniAppReady';
import { useAccount } from 'wagmi';
import { useMintedDate } from '@/hooks/useContractData';
import {
  isBasepreLive,
  getAerodromeSwapUrl,
  getBaseScanTokenUrl,
  BASEPRE_ADDRESS,
  BASEPRE_SYMBOL,
} from '@/lib/token';
import { truncateAddress } from '@/lib/utils';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address } = useAccount();
  const { hasMinted } = useMintedDate(address);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    // Modal handles its own success state now
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#0052FF]/30">
      <MiniAppReady />
      <NetworkBanner />

      <div>
        <Navbar />
        <ActivityTicker />

        {hasMinted && <MyPrediction />}

        <div className="flex flex-col xl:flex-row relative z-10 max-w-[1800px] mx-auto px-4 xl:px-8 items-center xl:items-start min-h-[90vh] pt-8 xl:pt-20 gap-12 xl:gap-8">
            <div className="w-full xl:w-[400px] 2xl:w-[500px] flex-shrink-0 flex flex-col justify-center xl:sticky xl:top-24">
            <Hero />
            </div>
            
            <div className="w-full flex-grow overflow-hidden xl:pb-24">
            <CalendarHeatmap 
                selectedDate={selectedDate} 
                onSelectDate={handleSelectDate} 
            />
            </div>
        </div>

        <PredictionModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            selectedDate={selectedDate}
            onSuccess={handleSuccess}
        />
        
        {/* Footer */}
        <footer className="py-8 border-t border-white/5 text-gray-500 text-sm mt-12 relative z-10">
            <div className="max-w-[1800px] mx-auto px-4 xl:px-8 flex flex-col items-center gap-4">
              {isBasepreLive() && (
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
                  <span className="text-gray-400">
                    <span className="text-[#3B82FF] font-bold">${BASEPRE_SYMBOL}</span>
                    <span className="font-mono ml-2">{truncateAddress(BASEPRE_ADDRESS)}</span>
                  </span>
                  <a
                    href={getAerodromeSwapUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition underline decoration-dotted underline-offset-4"
                  >
                    Buy on Aerodrome ↗
                  </a>
                  <a
                    href={getBaseScanTokenUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition underline decoration-dotted underline-offset-4"
                  >
                    BaseScan ↗
                  </a>
                </div>
              )}
              <div className="text-center">
                <p>Base Token Launch Prediction Market © 2026</p>
                <p className="mt-2 text-xs">Not affiliated with Coinbase or the official Base team. Smart contract interacts directly with Base network.</p>
              </div>
            </div>
        </footer>
      </div>
    </main>
  );
}
