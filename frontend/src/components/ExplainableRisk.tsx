import React, { useState } from 'react';
import { HelpCircle, Thermometer, TreePine, CloudRain, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { RiskAssessment, RiskFactor } from '../types';
import { RiskBadge } from './RiskBadge';

interface ExplainableRiskProps {
  assessment: RiskAssessment;
}

export const ExplainableRisk: React.FC<ExplainableRiskProps> = ({ assessment }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'heat' | 'drought' | 'flood'>('all');

  const allFactors: (RiskFactor & { category: 'heat' | 'drought' | 'flood'; icon: any })[] = [
    ...assessment.heat.factors.map((f) => ({ ...f, category: 'heat' as const, icon: Thermometer })),
    ...assessment.drought.factors.map((f) => ({ ...f, category: 'drought' as const, icon: TreePine })),
    ...assessment.flood.factors.map((f) => ({ ...f, category: 'flood' as const, icon: CloudRain }))
  ];

  const displayedFactors =
    activeCategory === 'all'
      ? allFactors
      : allFactors.filter((f) => f.category === activeCategory);

  const getDirection = (name: string, status: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('deficit') || lower.includes('depletion') || lower.includes('reduction')) {
      return { symbol: '↓', label: 'Deficit', isDown: true, color: 'text-amber-800 bg-amber-100 border-amber-300' };
    }
    if (lower.includes('surge') || lower.includes('irradiance') || lower.includes('temperature') || lower.includes('stress') || lower.includes('saturation') || lower.includes('dry days')) {
      return { symbol: '↑', label: 'Elevated', isUp: true, color: 'text-red-800 bg-red-100 border-red-300' };
    }
    return { symbol: '•', label: 'Nominal', isNeutral: true, color: 'text-[#156550] bg-[#d7f1e6] border-[#a8dec9]' };
  };

  return (
    <div className="rounded-3xl bg-white border border-[#c5e6db] p-6 sm:p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#156550]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Explainable Intelligence</span>
          </div>
          <h3 className="text-xl font-black text-[#092c24] mt-1">Why is this risk evaluated at this level?</h3>
          <p className="text-xs text-[#375249] mt-0.5">
            Transparent factor attribution and directional deviations calculated by the ClimateShield environmental engine.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#eef8f4] p-1 rounded-full border border-[#c5e6db] text-xs">
          {(
            [
              { id: 'all', label: 'All Factors' },
              { id: 'heat', label: '🔥 Heat' },
              { id: 'drought', label: '💧 Drought' },
              { id: 'flood', label: '🌧️ Flood' }
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveCategory(t.id)}
              className={`px-3.5 py-1.5 rounded-full transition-all font-bold ${
                activeCategory === t.id
                  ? 'bg-[#092c24] text-white shadow-xs'
                  : 'text-[#156550] hover:text-[#092c24]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick "Why?" Highlights Box (Requirement 4) */}
      <div className="mb-6 p-4 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db]">
        <div className="text-xs font-bold uppercase tracking-wider text-[#092c24] mb-2 flex items-center gap-1.5">
          <span>Key Contributing Directional Drivers:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-[#c5e6db] flex items-center justify-between">
            <span className="text-[#375249] font-medium">Rainfall 7d Deficit:</span>
            <span className="font-mono font-bold text-amber-800">
              {assessment.drought.factors.find(f => f.name.includes('Rainfall'))?.value || '0 mm'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-[#c5e6db] flex items-center justify-between">
            <span className="text-[#375249] font-medium">Topsoil Moisture:</span>
            <span className="font-mono font-bold text-[#092c24]">
              {assessment.drought.soilMoisture}%
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-[#c5e6db] flex items-center justify-between">
            <span className="text-[#375249] font-medium">Vegetation Greenness:</span>
            <span className="font-mono font-bold text-[#156550]">
              NDVI {assessment.drought.vegetationNDVI}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-[#c5e6db] flex items-center justify-between">
            <span className="text-[#375249] font-medium">Thermal Index:</span>
            <span className="font-mono font-bold text-red-700">
              {assessment.heat.heatIndex}°C
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Factors with Directional Arrows & Weights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {displayedFactors.map((factor, idx) => {
          const Icon = factor.icon;
          const dir = getDirection(factor.name, factor.status);
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] hover:border-[#156550] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white border border-[#c5e6db] text-[#156550] shadow-2xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#092c24] leading-tight">{factor.name}</h4>
                      <span className="text-[10px] text-[#479b89] uppercase font-bold tracking-wider">
                        {factor.category} hazard
                      </span>
                    </div>
                  </div>
                  <RiskBadge level={factor.status} size="sm" />
                </div>

                <p className="text-xs text-[#375249] leading-relaxed mb-3">
                  {factor.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#c5e6db] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${dir.color}`}>
                    {dir.symbol} {dir.label}
                  </span>
                  <span className="font-mono text-[#092c24] font-black text-sm">{factor.value}</span>
                </div>
                <span className="text-[11px] text-[#479b89] font-bold">Weight: {factor.weight}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
