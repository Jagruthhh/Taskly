import React from 'react';

export default function ProgressRing({ percentage = 0, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Glow effect behind the circle */}
      <div 
        className="absolute rounded-full filter blur-md opacity-25 bg-brand-indigo transition-all duration-500"
        style={{ width: size - 10, height: size - 10 }}
      />
      
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          className="text-slate-800"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className="text-brand-indigo transition-all duration-500 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            filter: 'drop-shadow(0px 0px 4px rgba(99, 102, 241, 0.6))'
          }}
        />
      </svg>
      
      {/* Text inside the ring */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-bold font-heading text-white">{Math.round(percentage)}%</span>
        <span className="text-[10px] uppercase tracking-wider text-brand-grayText font-medium">Done</span>
      </div>
    </div>
  );
}
