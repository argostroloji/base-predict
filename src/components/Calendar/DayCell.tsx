'use client';

import React from 'react';

interface DayCellProps {
  date: Date;
  count: number;
  isSelected: boolean;
  isDisabled: boolean;
  colorClass: string;
  isToday: boolean;
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
  isToday,
  onClick,
  onHover,
  onLeave,
}: DayCellProps) {
  const isSoldOut = count >= 10;

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    onHover(date, e.currentTarget.getBoundingClientRect());
  };

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      {/* Main circle */}
      <div
        onClick={isDisabled ? undefined : () => onClick(date)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onLeave}
        className={[
          'w-11 h-11 rounded-full flex flex-col items-center justify-center',
          'transition-all duration-200 select-none',
          isDisabled
            ? 'opacity-20 cursor-not-allowed bg-white/[0.04]'
            : isSelected
            ? 'bg-white shadow-[0_0_16px_rgba(255,255,255,0.25)] scale-110 cursor-pointer'
            : isSoldOut
            ? `${colorClass} cursor-pointer`
            : `${colorClass} cursor-pointer hover:scale-110 hover:brightness-125 active:scale-95`,
        ].join(' ')}
      >
        {/* Date number */}
        <span
          className={[
            'text-sm font-bold leading-none select-none pointer-events-none',
            isSelected ? 'text-[#0A0A0A]' : isSoldOut ? 'text-white/30' : 'text-white',
          ].join(' ')}
        >
          {date.getUTCDate()}
        </span>

        {/* Scarcity micro-bar (only on future, non-sold-out cells with mints) */}
        {!isDisabled && !isSoldOut && count > 0 && (
          <div className="mt-0.5 w-5 h-[3px] rounded-full overflow-hidden bg-white/20">
            <div
              className="h-full rounded-full bg-white/70"
              style={{ width: `${(count / 10) * 100}%` }}
            />
          </div>
        )}

        {/* Sold-out lock */}
        {!isDisabled && isSoldOut && (
          <svg
            className="w-3.5 h-3.5 text-white/30 mt-0.5 pointer-events-none"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
          </svg>
        )}
      </div>

      {/* Today dot */}
      {isToday && !isSelected && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0052FF]" />
      )}

      {/* 🔥 hot badge */}
      {!isDisabled && count >= 6 && count < 10 && (
        <div className="absolute -top-1 -right-1 text-[10px] z-30 select-none pointer-events-none leading-none">
          🔥
        </div>
      )}
    </div>
  );
}
