import React from 'react';
import { Radar, ArrowUpRight, Minus } from 'lucide-react';
import { EarlySignal, EarlySignalLevel } from '../types';

interface EarlySignalsWidgetProps {
  signals: EarlySignal[];
  overallEarlySignalState: EarlySignalLevel;
}

export const EarlySignalsWidget: React.FC<EarlySignalsWidgetProps> = ({
  signals,
  overallEarlySignalState
}) => {
  const stages: EarlySignalLevel[] = ['NORMAL', 'EARLY_SIGNAL', 'WATCH', 'HIGH_RISK', 'EXTREME'];

  const getStageIndex = (level: EarlySignalLevel) => stages.indexOf(level);
  const currentIndex = getStageIndex(overallEarlySignalState);

  const getStageColor = (lvl: EarlySignalLevel) => {
    switch (lvl) {
      case 'EXTREME':
        return 'bg-red-500 text-white shadow-md';
      case 'HIGH_RISK':
        return 'bg-orange-500 text-white shadow-md';
      case 'WATCH':
        return 'bg-amber-400 text-amber-950 font-bold shadow-md';
      case 'EARLY_SIGNAL':
        return 'bg-[#092c24] text-[#a7f3d0] font-bold shadow-md';
      case 'NORMAL':
      default:
        return 'bg-[#156550] text-white font-bold shadow-md';
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-[#c5e6db] p-6 sm:p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#156550]">
            <Radar className="w-3.5 h-3.5" />
            <span>Early Signal Detection System</span>
          </div>
          <h3 className="text-xl font-black text-[#092c24] mt-1">Pre-Disaster Indicator Tracking</h3>
          <p className="text-xs text-[#375249] mt-0.5">
            Identifies gradual environmental anomaly trends prior to critical risk thresholds.
          </p>
        </div>

        <div className="text-xs text-[#092c24] bg-[#eef8f4] px-4 py-1.5 rounded-full border border-[#c5e6db] font-bold">
          Current State: <span className="text-[#156550]">{overallEarlySignalState.replace('_', ' ')}</span>
        </div>
      </div>

      {/* 5-Stage Stepper Flow */}
      <div className="grid grid-cols-5 gap-2 p-2.5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] mb-6 text-center">
        {stages.map((st, idx) => {
          const isActive = idx === currentIndex;
          const isPassed = idx < currentIndex;
          return (
            <div
              key={st}
              className={`py-2.5 px-1 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
                isActive
                  ? `${getStageColor(st)} ring-2 ring-[#092c24]/30 scale-102`
                  : isPassed
                  ? 'bg-[#e1f2ec] text-[#156550]'
                  : 'bg-white text-[#99d2c2] border border-[#c5e6db]'
              }`}
            >
              {st.replace('_', ' ')}
            </div>
          );
        })}
      </div>

      {/* Hazard-Specific Signal Trend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {signals.map((sig) => {
          const hazardLabel = sig.hazard === 'heat' ? '🔥 Heat' : sig.hazard === 'drought' ? '💧 Drought' : '🌧️ Flood';
          return (
            <div
              key={sig.hazard}
              className="p-5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] hover:border-[#156550] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2.5">
                  <span className="text-xs font-bold text-[#092c24]">{hazardLabel} Signal</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      sig.status === 'NORMAL'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : sig.status === 'EARLY_SIGNAL'
                        ? 'bg-[#d7f1e6] text-[#092c24] border-[#a8dec9]'
                        : sig.status === 'WATCH'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}
                  >
                    {sig.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-[#375249] leading-relaxed mb-4">
                  {sig.explanation}
                </p>
              </div>

              <div className="pt-3 border-t border-[#c5e6db] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[#479b89]">
                  <span>Trend:</span>
                  <span
                    className={`font-bold capitalize flex items-center gap-0.5 ${
                      sig.trend === 'increasing' ? 'text-amber-700' : 'text-[#092c24]'
                    }`}
                  >
                    {sig.trend === 'increasing' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                    {sig.trend}
                  </span>
                </div>
                <span className="text-[11px] text-[#479b89] font-medium">Confidence: {sig.confidence}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-3 border-t border-[#e1f2ec] text-xs text-[#479b89] italic">
        * Note: Early signals represent pattern anomaly detections across environmental variables and are not deterministic disaster predictions.
      </div>
    </div>
  );
};
