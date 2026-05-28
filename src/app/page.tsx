'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import NetworkBanner from '@/components/Navbar/NetworkBanner';
import ActivityTicker from '@/components/LiveFeed/ActivityTicker';
import Hero from '@/components/Hero/Hero';
import CalendarHeatmap from '@/components/Calendar/CalendarHeatmap';
import PredictionModal from '@/components/Prediction/PredictionModal';
import MyPrediction from '@/components/Prediction/MyPrediction';
import TopDates from '@/components/Leaderboard/TopDates';
import TokenBar from '@/components/TokenBar';
import MiniAppReady from '@/components/MiniAppReady';
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
      <MiniAppReady />
      <NetworkBanner />

      <div>
        <Navbar />
        <TokenBar />
        <ActivityTicker />

        {hasMinted && <MyPrediction />}

        <div className="flex flex-col xl:flex-row relative z-10 max-w-[1800px] mx-auto px-4 xl:px-8 items-center xl:items-start min-h-[90vh] pt-8 xl:pt-20 gap-12 xl:gap-8">
            {/* On mobile: calendar first (order-1), hero second (order-2).
                On xl+: hero is left column, calendar is right — order-none restores flow. */}
            <div className="w-full xl:w-[400px] 2xl:w-[500px] flex-shrink-0 flex flex-col justify-center xl:sticky xl:top-24 order-2 xl:order-none">
            <Hero />
            </div>

            <div className="w-full flex-grow overflow-hidden xl:pb-24 flex flex-col order-1 xl:order-none">
            <CalendarHeatmap
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
            />
            <TopDates />
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
            <div className="max-w-[1800px] mx-auto px-4 xl:px-8 flex flex-col items-center gap-2 text-center">
              <p>Base Token Launch Prediction Market © 2026</p>
              <p className="text-xs">Not affiliated with Coinbase or the official Base team. Smart contract interacts directly with Base network.</p>
            </div>
        </footer>
      </div>
    </main>
  );
}
