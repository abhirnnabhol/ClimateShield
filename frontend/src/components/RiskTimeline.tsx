import React, { useState } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { TimelinePoint } from '../types';
import { RiskBadge } from './RiskBadge';

interface RiskTimelineProps {
  timeline: TimelinePoint[];
}

export const RiskTimeline: React.FC<RiskTimelineProps> = ({ timeline }) => {
  const [selectedHazard, setSelectedHazard] = useState<'overall' | 'heat' | 'drought' | 'flood'>('overall');

  if (!timeline || timeline.length === 0) {
    return null;
  }

  const getScoreForHazard = (pt: TimelinePoint) => {
    switch (selectedHazard) {
      case 'heat':
        return pt.heatScore;
      case 'drought':
        return pt.droughtScore;
      case 'flood':
        return pt.floodScore;
      case 'overall':
      default:
        return pt.overallScore;
    }
  };

  const getBarColor = (score: number) => {
    if (score >= 75) return 'bg-red-500';
    if (score >= 50) return 'bg-orange-500';
    if (score >= 25) return 'bg-amber-500';
    return 'bg-[#156550]';
  };

  return (
    <div className="rounded-3xl bg-white border border-[#c5e6db] p-6 sm:p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#156550]">
            <Calendar className="w-3.5 h-3.5" />
            <span>Forward Risk Timeline</span>
          </div>
          <h3 className="text-xl font-black text-[#092c24] mt-1">Projected Risk Evolution</h3>
        </div>

        {/* Hazard Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#eef8f4] p-1 rounded-full border border-[#c5e6db] text-xs">
          {(
            [
              { id: 'overall', label: 'Overall' },
              { id: 'heat', label: '🔥 Heat' },
              { id: 'drought', label: '💧 Drought' },
              { id: 'flood', label: '🌧️ Flood' }
            ] as const
          ).map((h) => (
            <button
              key={h.id}
              onClick={() => setSelectedHazard(h.id)}
              className={`px-3.5 py-1.5 rounded-full transition-all font-bold ${
                selectedHazard === h.id
                  ? 'bg-[#092c24] text-white shadow-xs'
                  : 'text-[#156550] hover:text-[#092c24]'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Step Timeline Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        {timeline.map((point, idx) => {
          const score = getScoreForHazard(point);
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] flex flex-col justify-between hover:border-[#156550] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-sm font-bold text-[#092c24]">{point.period}</span>
                  <span className="text-[11px] text-[#479b89] font-mono">{point.date}</span>
                </div>
                <div className="mt-2 mb-3">
                  <RiskBadge level={point.overallLevel} size="sm" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between text-xs mb-1.5">
                  <span className="text-[#375249] font-bold capitalize">{selectedHazard} Index</span>
                  <span className="text-lg font-black text-[#092c24] font-mono">{score}</span>
                </div>
                <div className="w-full bg-[#e1f2ec] rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getBarColor(score)}`}
                    style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Visualizer Underneath */}
      <div className="p-5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db]">
        <div className="flex items-center justify-between text-xs text-[#375249] mb-3">
          <div className="flex items-center gap-1.5 font-bold text-[#092c24]">
            <TrendingUp className="w-4 h-4 text-[#156550]" />
            <span>Hazard Index Trajectory (Today through 7 Days)</span>
          </div>
          <span className="font-mono text-[11px] text-[#479b89] font-bold">Max Index: 100</span>
        </div>

        {/* CSS Bar Chart representation */}
        <div className="h-36 flex items-end justify-between gap-6 pt-4 px-4">
          {timeline.map((point, idx) => {
            const score = getScoreForHazard(point);
            const heightPercent = Math.max(14, Math.min(100, score));
            const barStyle = getBarColor(score);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-xs font-mono font-bold text-[#092c24] opacity-90 group-hover:scale-110 transition-transform">
                  {score}
                </span>
                <div className="w-full max-w-[56px] bg-[#e1f2ec] rounded-t-xl h-full flex items-end overflow-hidden p-0.5">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-700 ${barStyle}`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-[#1e3a34] tracking-wider uppercase mt-1">
                  {point.period}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
