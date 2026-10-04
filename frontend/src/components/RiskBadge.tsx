import React from 'react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  className = '',
  size = 'md',
  showDot = true
}) => {
  const getStyles = () => {
    switch (level) {
      case 'EXTREME':
        return {
          bg: 'bg-red-50 border-red-200 text-red-700 font-bold',
          dot: 'bg-red-500 ring-red-300'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-50 border-orange-200 text-orange-700 font-bold',
          dot: 'bg-orange-500 ring-orange-300'
        };
      case 'MODERATE':
        return {
          bg: 'bg-yellow-50 border-yellow-300 text-yellow-800 font-bold',
          dot: 'bg-yellow-500 ring-yellow-300'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold',
          dot: 'bg-emerald-500 ring-emerald-300'
        };
    }
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 tracking-wider'
  };

  const style = getStyles();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${style.bg} ${sizeClasses[size]} ${className}`}
    >
      {showDot && (
        <span className={`w-2 h-2 rounded-full ring-2 ${style.dot} animate-pulse`} />
      )}
      {level}
    </span>
  );
};
