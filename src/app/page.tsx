'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import NetworkBanner from '@/components/Navbar/NetworkBanner';
import ActivityTicker from '@/components/LiveFeed/ActivityTicker';
import Hero from '@/components/Hero/Hero';
import CalendarHeatmap from '@/components/Calendar/CalendarHeatmap';
import PredictionModal from '@/components/Prediction/PredictionModal';
import { useAccount } from 'wagmi';
import { useMintedDate } from '@/hooks/useContractData';

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
      <NetworkBanner />
      {hasMinted && (
          <div className="fixed top-0 left-0 right-0 bg-[#0052FF] text-white text-xs font-bold text-center py-1 z-[60]">
              You have already minted a prediction ticket for this wallet.
          </div>
      )}
      
      <div className={hasMinted ? 'mt-6' : ''}>
        <Navbar />
        <ActivityTicker />
        
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
        <footer className="py-8 text-center border-t border-white/5 text-gray-500 text-sm mt-12 relative z-10">
            <p>Base Token Launch Prediction Market © 2026</p>
            <p className="mt-2 text-xs">Not affiliated with Coinbase or the official Base team. Smart contract interacts directly with Base network.</p>
        </footer>
      </div>
    </main>
  );
}
