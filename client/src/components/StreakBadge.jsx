import React from 'react';
import { Flame } from 'lucide-react';

export default function StreakBadge({ count = 0 }) {
  // Determine state styles based on streak count
  let badgeClasses = '';
  let iconClasses = '';
  let labelText = '';

  if (count <= 2) {
    // Blue / Cold state
    badgeClasses = 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]';
    iconClasses = 'text-cyan-400';
    labelText = `${count} day streak`;
  } else if (count <= 13) {
    // Orange / Warm state (building momentum)
    badgeClasses = 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]';
    iconClasses = 'text-amber-400 animate-pulse';
    labelText = `${count} days on streak!`;
  } else {
    // Red / Hot state (on fire!)
    badgeClasses = 'bg-red-500/10 text-red-500 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.25)]';
    iconClasses = 'text-red-500 animate-bounce';
    labelText = `${count} DAYS ON FIRE! 🔥`;
  }

  return (
    <div 
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold transition-all transform hover:scale-105 select-none ${badgeClasses}`}
      title={labelText}
    >
      <Flame className={`w-3.5 h-3.5 ${iconClasses}`} fill="currentColor" fillOpacity={0.15} />
      <span>{count}</span>
    </div>
  );
}
