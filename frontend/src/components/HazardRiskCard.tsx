import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { RiskScore } from '../types';
import { RiskBadge } from './RiskBadge';

interface HazardRiskCardProps {
  hazard: 'heat' | 'drought' | 'flood';
  title: string;
  data: RiskScore & {
    temperature?: number;
    humidity?: number;
    heatIndex?: number;
    rainfallCondition?: string;
    soilMoisture?: number;
    vegetationNDVI?: number;
    rainfall24h?: number;
    groundSaturation?: number;
    elevation?: number;
  };
}

export const HazardRiskCard: React.FC<HazardRiskCardProps> = ({ hazard, title, data }) => {
  const [expanded, setExpanded] = useState(false);

  const getHazardConfig = () => {
    switch (hazard) {
      case 'heat':
        return {
          meterBg: 'bg-amber-500',
          emoji: '🔥',
          bannerBg: 'bg-amber-50 text-amber-900 border-amber-200'
        };
      case 'drought':
        return {
          meterBg: 'bg-orange-500',
          emoji: '💧',
          bannerBg: 'bg-orange-50 text-orange-900 border-orange-200'
        };
      case 'flood':
      default:
        return {
          meterBg: 'bg-[#156550]',
          emoji: '🌧️',
          bannerBg: 'bg-[#eef8f4] text-[#092c24] border-[#c5e6db]'
        };
    }
  };

  const config = getHazardConfig();

  return (
    <div className="rounded-3xl bg-white border border-[#c5e6db] p-6 flex flex-col justify-between transition-all hover:border-[#156550] hover:shadow-xl hover:shadow-[#092c24]/5 shadow-sm">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eef8f4] border border-[#c5e6db] flex items-center justify-center text-xl shadow-xs">
              {config.emoji}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#092c24] leading-tight">{title}</h3>
              <p className="text-[11px] text-[#479b89]">Environmental Hazard Vector</p>
            </div>
          </div>
          <RiskBadge level={data.level} size="md" />
        </div>

        {/* Score & Progress Bar */}
        <div className="space-y-1.5 my-4">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#092c24] font-mono">{data.score}</span>
            <span className="text-xs text-[#479b89] font-semibold">/ 100 max index</span>
          </div>
          <div className="w-full bg-[#e1f2ec] rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${config.meterBg}`}
              style={{ width: `${Math.min(100, Math.max(5, data.score))}%` }}
            />
          </div>
        </div>

        {/* Primary Metric Pill Grid */}
        <div className="grid grid-cols-2 gap-2 my-4 text-xs">
          {hazard === 'heat' && (
            <>
              <div className="p-2.5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db]">
                <div className="text-[#479b89] text-[10px] uppercase font-bold">Ambient Temp</div>
                <div className="text-sm font-bold text-[#092c24] mt-0.5">{data.temperature ?? '--'}°C</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db]">
                <div className="text-[#479b89] text-[10px] uppercase font-bold">Relative Humidity</div>
                <div className="text-sm font-bold text-[#092c24] mt-0.5">{data.humidity ?? '--'}%</div>
              </div>
            </>
          )}

          {hazard === 'drought' && (
            <>
              <div className="p-2.5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db]">
                <div className="text-[#479b89] text-[10px] uppercase font-bold">Rainfall Anomaly</div>
                <div className="text-sm font-bold text-[#092c24] mt-0.5">{data.rainfallCondition ?? 'Normal'}</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db]">
                <div className="text-[#479b89] text-[10px] uppercase font-bold">Topsoil Moisture</div>
                <div className="text-sm font-bold text-[#092c24] mt-0.5">{data.soilMoisture ?? '--'}% m³/m³</div>
              </div>
            </>
          )}

          {hazard === 'flood' && (
            <>
              <div className="p-2.5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db]">
                <div className="text-[#479b89] text-[10px] uppercase font-bold">24h Rainfall</div>
                <div className="text-sm font-bold text-[#092c24] mt-0.5">{data.rainfall24h ?? 0} mm</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db]">
                <div className="text-[#479b89] text-[10px] uppercase font-bold">Ground Saturation</div>
                <div className="text-sm font-bold text-[#092c24] mt-0.5">{data.groundSaturation ?? '--'}%</div>
              </div>
            </>
          )}
        </div>

        {/* Secondary Sub-indicator */}
        <div className="text-xs text-[#092c24] bg-[#eef8f4] rounded-2xl p-3 border border-[#c5e6db] mb-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-[#156550] mt-0.5 flex-shrink-0" />
          <p className="leading-snug">{data.forecastSummary || 'Conditions being continuously evaluated.'}</p>
        </div>

        {/* Contributing Factors Accordion */}
        {data.factors && data.factors.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#156550] hover:text-[#092c24] py-1 transition-colors"
            >
              <span>{expanded ? 'Hide contributing factors' : `View ${data.factors.length} contributing factors`}</span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expanded && (
              <div className="space-y-1.5 mt-2 pt-2 border-t border-[#e1f2ec] text-xs">
                {data.factors.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#f7fcf9] border border-[#c5e6db]"
                  >
                    <div>
                      <div className="text-[#092c24] font-semibold">{f.name}</div>
                      <div className="text-[10px] text-[#479b89]">{f.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-[#092c24]">{f.value}</div>
                      <span className="text-[10px] uppercase font-semibold text-[#479b89]">
                        weight: {f.weight}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
