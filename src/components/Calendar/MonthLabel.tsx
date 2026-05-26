import React from 'react';

interface MonthLabelProps {
  monthName: string;
  year: number;
}

export default function MonthLabel({ monthName, year }: MonthLabelProps) {
  return (
    <div className="text-sm text-white font-extrabold uppercase tracking-widest whitespace-nowrap mb-3 px-1 drop-shadow-md">
      {monthName} <span className="text-gray-400 font-medium ml-1">{year}</span>
    </div>
  );
}
