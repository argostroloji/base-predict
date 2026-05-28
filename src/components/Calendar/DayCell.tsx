'use client';

import React from 'react';
import { getUrgencyLabel } from '@/lib/utils';

interface DayCellProps {
  date: Date;
  count: number;
  isSelected: boolean;
  isDisabled: boolean;
  colorClass: string;
  onClick: (date: Date) => void;
  onHover: (date: Date, rect: DOMRect) => void;
  onLeave: () => void;
}

export default function DayCell({
  date,
  count,
  isSelected,
  isDisabled,
  colorClass,
  onClick,
  onHover,
  onLeave,
}: DayCellProps) {
  const isSoldOut = count >= 10;
  
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onHover(date, rect);
  };

  const handleClick = () => {
    if (isDisabled) return;
    
    // For sold out dates, we might want to open OpenSea link instead
    // But we handle this via a different CTA in the modal or directly if preferred
    // For now, let's open the modal to show the sold out state consistently
    onClick(date);
  };

  const urgencyInfo = getUrgencyLabel(count);

  return (
    <div className="relative group w-12 h-12">
      <div
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onLeave}
        className={`
          w-full h-full rounded-md transition-all duration-300 flex flex-col items-center justify-center
          ${colorClass}
          ${isSoldOut ? 'sold-out-pattern opacity-60 hover:opacity-100' : ''}
          ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
          ${!isDisabled && !isSoldOut ? 'hover:brightness-125 hover:scale-110 z-10' : ''}
          ${isSelected && !isDisabled ? 'ring-2 ring-white z-20 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : ''}
        `}
      >
        <span className={`text-base font-bold select-none pointer-events-none drop-shadow-md z-10 ${isSoldOut ? 'text-white/40' : 'text-white/90'}`}>
          {date.getDate()}
        </span>
        
        {/* Scarcity Counter (e.g. 7/10) */}
        {!isDisabled && !isSoldOut && count > 0 && (
          <span className="text-[9px] font-mono font-medium text-white/70 select-none pointer-events-none tracking-tighter mt-[-2px]">
            {count}/10
          </span>
        )}
        
        {/* Sold Out Lock Icon */}
        {!isDisabled && isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <svg className="w-6 h-6 text-white/60 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
            </svg>
          </div>
        )}
      </div>
      
      {/* Always-visible 🔥 badge for hot dates (6–9 minted) */}
      {!isDisabled && count >= 6 && count < 10 && (
        <div className="absolute -top-1.5 -right-1.5 text-[11px] z-30 select-none pointer-events-none leading-none">
          🔥
        </div>
      )}

      {/* FOMO Indicator / Urgency Label on hover */}
      {!isDisabled && urgencyInfo.type === 'urgent' && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 animate-float-up">
          {urgencyInfo.text}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-amber-500/90"></div>
        </div>
      )}
      
      {/* Sold out hover label */}
      {!isDisabled && isSoldOut && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg border border-white/20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          SOLD OUT
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-black"></div>
        </div>
      )}
    </div>
  );
}
