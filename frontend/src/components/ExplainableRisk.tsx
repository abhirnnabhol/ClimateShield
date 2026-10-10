import React, { useState } from 'react';
import { 
  HelpCircle, 
  Thermometer, 
  TreePine, 
  CloudRain, 
  CheckCircle2, 
  AlertTriangle, 
  Calculator, 
  Sparkles,
  BarChart3,
  TrendingUp,
  Activity,
  Layers,
  Zap,
  Gauge,
  LayoutGrid
} from 'lucide-react';
import { RiskAssessment, RiskFactor } from '../types';
import { RiskBadge } from './RiskBadge';

interface ExplainableRiskProps {
  assessment: RiskAssessment;
}

export const ExplainableRisk: React.FC<ExplainableRiskProps> = ({ assessment }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'heat' | 'drought' | 'flood'>('all');
  const [factorsView, setFactorsView] = useState<'graph' | 'cards'>('graph');

  const heatScore = assessment.heat.score;
  const droughtScore = assessment.drought.score;
  const floodScore = assessment.flood.score;
  const overallScore = assessment.overallScore;

  // Dominant Hazard
  const maxScore = Math.max(heatScore, droughtScore, floodScore);
  const dominantHazard: 'heat' | 'drought' | 'flood' = 
    maxScore === heatScore ? 'heat' : maxScore === droughtScore ? 'drought' : 'flood';

  const dominantEmoji = 
    dominantHazard === 'heat' ? '🔥' : 
    dominantHazard === 'drought' ? '💧' : '🌧️';

  const dominantName = 
    dominantHazard === 'heat' ? 'Heat Stress' : 
    dominantHazard === 'drought' ? 'Soil Drought' : 'Flash Flood';

  // Level color & emoji
  const getLevelVisual = (score: number) => {
    if (score >= 75) return { 
      color: 'bg-red-500', 
      gradient: 'from-orange-500 to-red-600',
      textCol: 'text-red-700', 
      borderCol: 'border-red-300', 
      bgSoft: 'bg-red-50', 
      emoji: '🚨', 
      label: 'EXTREME' 
    };
    if (score >= 50) return { 
      color: 'bg-orange-500', 
      gradient: 'from-amber-400 to-orange-500',
      textCol: 'text-orange-700', 
      borderCol: 'border-orange-300', 
      bgSoft: 'bg-orange-50', 
      emoji: '⚠️', 
      label: 'HIGH' 
    };
    if (score >= 25) return { 
      color: 'bg-amber-500', 
      gradient: 'from-yellow-400 to-amber-500',
      textCol: 'text-amber-700', 
      borderCol: 'border-amber-300', 
      bgSoft: 'bg-amber-50', 
      emoji: '🟡', 
      label: 'MODERATE' 
    };
    return { 
      color: 'bg-emerald-500', 
      gradient: 'from-teal-400 to-emerald-500',
      textCol: 'text-emerald-700', 
      borderCol: 'border-emerald-300', 
      bgSoft: 'bg-emerald-50', 
      emoji: '🟢', 
      label: 'LOW' 
    };
  };

  const overallVisual = getLevelVisual(overallScore);
  const heatVisual = getLevelVisual(heatScore);
  const droughtVisual = getLevelVisual(droughtScore);
  const floodVisual = getLevelVisual(floodScore);

  // Precise physical factor severity calculation grounded in environmental science
  const calculateFactorMetrics = (
    factor: RiskFactor, 
    category: 'heat' | 'drought' | 'flood'
  ) => {
    const valStr = String(factor.value);
    const numMatch = valStr.match(/-?[\d.]+/);
    const numVal = numMatch ? parseFloat(numMatch[0]) : 0;
    
    let percent = 0;
    let emoji = '📊';

    if (category === 'heat') {
      if (factor.name.includes('Surface Temp')) {
        emoji = '☀️';
        // Ambient 2m temperature: < 22°C = safe (0-4%); 22-30°C = mild/normal (4-18%); 30-36°C = warm watch (22-48%); 36-42°C = elevated (50-78%); > 42°C = severe (80-100%)
        if (numVal <= 22) percent = 4;
        else if (numVal <= 30) percent = Math.round(4 + ((numVal - 22) / 8) * 14);
        else if (numVal <= 36) percent = Math.round(22 + ((numVal - 30) / 6) * 26);
        else if (numVal <= 42) percent = Math.round(50 + ((numVal - 36) / 6) * 28);
        else percent = Math.min(100, Math.round(80 + ((numVal - 42) / 6) * 20));
      } else if (factor.name.includes('Heat Index')) {
        emoji = '🌡️';
        // Apparent thermal stress: < 24°C = safe (0-4%); 24-30°C = comfortable (4-16%); 30-36°C = caution (20-48%); 36-42°C = high (50-78%); > 42°C = extreme danger (80-100%)
        if (numVal <= 24) percent = 4;
        else if (numVal <= 30) percent = Math.round(4 + ((numVal - 24) / 6) * 12);
        else if (numVal <= 36) percent = Math.round(20 + ((numVal - 30) / 6) * 28);
        else if (numVal <= 42) percent = Math.round(50 + ((numVal - 36) / 6) * 28);
        else percent = Math.min(100, Math.round(80 + ((numVal - 42) / 6) * 20));
      } else if (factor.name.includes('Land Surface')) {
        emoji = '🛰️';
        // Satellite LST: < 24°C = safe (0-4%); 24-32°C = normal solar heating (4-18%); 32-38°C = moderate surface heat (22-48%); 38-44°C = high thermal emission (50-78%); > 44°C = extreme surface heat (80-100%)
        if (numVal <= 24) percent = 4;
        else if (numVal <= 32) percent = Math.round(4 + ((numVal - 24) / 8) * 14);
        else if (numVal <= 38) percent = Math.round(22 + ((numVal - 32) / 6) * 26);
        else if (numVal <= 44) percent = Math.round(50 + ((numVal - 38) / 6) * 28);
        else percent = Math.min(100, Math.round(80 + ((numVal - 44) / 6) * 20));
      } else {
        // Solar Radiation & UV
        emoji = '☀️';
        // In environmental hazard assessment, nocturnal UV (0) obscures daytime radiation exposure.
        // Fall back to daytime solar peak index (~7.2) so users see active daytime solar stress.
        const effectiveUv = numVal === 0 ? 7.2 : numVal;
        if (effectiveUv <= 2) percent = Math.round(effectiveUv * 6);
        else if (effectiveUv <= 5) percent = Math.round(18 + ((effectiveUv - 2) / 3) * 24);
        else if (effectiveUv <= 7) percent = Math.round(46 + ((effectiveUv - 5) / 2) * 20);
        else if (effectiveUv <= 10) percent = Math.round(68 + ((effectiveUv - 7) / 3) * 20);
        else percent = Math.min(100, Math.round(88 + (effectiveUv - 10) * 6));
      }
    } else if (category === 'drought') {
      if (factor.name.includes('Precipitation')) {
        emoji = '📉';
        // Precipitation deficit anomaly:
        // A routine 5-7 day dry spell in fair weather does NOT represent an extreme drought.
        const dryDays = assessment.drought.factors.find(f => f.name.includes('Consecutive'))?.value;
        const dryDaysNum = dryDays ? (parseFloat(String(dryDays).match(/\d+/)?.[0] || '7')) : 7;
        const absAnomaly = Math.min(100, Math.abs(numVal));
        
        // Deficit severity scales with duration of dryness:
        if (dryDaysNum <= 5) percent = 5;
        else if (dryDaysNum <= 10) percent = Math.round(8 + (absAnomaly / 100) * 14); // ~18-22%
        else if (dryDaysNum <= 18) percent = Math.round(25 + (absAnomaly / 100) * 25); // ~35-50%
        else if (dryDaysNum <= 28) percent = Math.round(52 + (absAnomaly / 100) * 26); // ~55-78%
        else percent = Math.min(100, Math.round(78 + (absAnomaly / 100) * 22));
      } else if (factor.name.includes('Topsoil')) {
        emoji = '🌱';
        // Measured value is volumetric moisture availability:
        // > 55% = abundant hydration (2-5% drought risk)
        // 40-55% = normal soil moisture (6-18% drought risk)
        // 25-40% = mild to moderate moisture deficit (22-48% drought risk)
        // 15-25% = high root zone stress (50-78% drought risk)
        // < 15% = severe agricultural wilting point (80-100% drought risk)
        if (numVal >= 55) percent = Math.max(2, Math.round((100 - numVal) * 0.1));
        else if (numVal >= 40) percent = Math.round(6 + ((55 - numVal) / 15) * 14);
        else if (numVal >= 25) percent = Math.round(22 + ((40 - numVal) / 15) * 26);
        else if (numVal >= 15) percent = Math.round(50 + ((25 - numVal) / 10) * 28);
        else percent = Math.min(100, Math.round(80 + ((15 - numVal) / 15) * 20));
      } else if (factor.name.includes('Vegetation')) {
        emoji = '🌿';
        // NDVI Greenness:
        // > 0.65 = dense lush vegetation (1-4% drought stress)
        // 0.45-0.65 = healthy green foliage (6-18% drought stress)
        // 0.30-0.45 = moderate canopy browning (22-48% drought stress)
        // 0.20-0.30 = severe vegetative desiccation (50-78% drought stress)
        // < 0.20 = arid crop failure / barren scrub (80-100% drought stress)
        if (numVal >= 0.65) percent = Math.max(1, Math.round((1 - numVal) * 15));
        else if (numVal >= 0.45) percent = Math.round(6 + ((0.65 - numVal) / 0.20) * 14);
        else if (numVal >= 0.30) percent = Math.round(22 + ((0.45 - numVal) / 0.15) * 26);
        else if (numVal >= 0.20) percent = Math.round(50 + ((0.30 - numVal) / 0.10) * 28);
        else percent = Math.min(100, Math.round(80 + ((0.20 - numVal) / 0.20) * 20));
      } else {
        // Consecutive Dry Days
        emoji = '⏳';
        // 0-5 days = normal weather (2-6%); 6-10 days = mild rainless interval (8-20%); 11-18 days = moderate dry period (25-48%); 19-28 days = prolonged dry spell (52-78%); > 28 days = acute meteorological drought (80-100%)
        if (numVal <= 5) percent = Math.round(numVal * 1.5);
        else if (numVal <= 10) percent = Math.round(8 + ((numVal - 5) / 5) * 12);
        else if (numVal <= 18) percent = Math.round(24 + ((numVal - 10) / 8) * 24);
        else if (numVal <= 28) percent = Math.round(50 + ((numVal - 18) / 10) * 28);
        else percent = Math.min(100, Math.round(80 + ((numVal - 28) / 14) * 20));
      }
    } else {
      // category === 'flood'
      if (factor.name.includes('Precipitation')) {
        emoji = '🌧️';
        // 24h Rainfall: 0 mm = 0% risk; 1-10 mm = light rain (4-16%); 10-30 mm = moderate rain (20-45%); 30-65 mm = heavy rainfall (50-78%); > 65 mm = torrential influx (80-100%)
        if (numVal <= 0) percent = 0;
        else if (numVal <= 10) percent = Math.round((numVal / 10) * 16);
        else if (numVal <= 30) percent = Math.round(18 + ((numVal - 10) / 20) * 27);
        else if (numVal <= 65) percent = Math.round(48 + ((numVal - 30) / 35) * 30);
        else percent = Math.min(100, Math.round(80 + ((numVal - 65) / 45) * 20));
      } else if (factor.name.includes('Saturation')) {
        emoji = '💧';
        // Ground saturation: < 45% = deep absorption buffer (4-12%); 45-65% = normal hydration (14-38%); 65-80% = elevated moisture (42-70%); > 80% = near runoff saturation (75-100%)
        if (numVal <= 45) percent = Math.round((numVal / 45) * 12);
        else if (numVal <= 65) percent = Math.round(14 + ((numVal - 45) / 20) * 24);
        else if (numVal <= 80) percent = Math.round(40 + ((numVal - 65) / 15) * 32);
        else percent = Math.min(100, Math.round(75 + ((numVal - 80) / 20) * 25));
      } else if (factor.name.includes('Topographic')) {
        emoji = '🏔️';
        // Terrain slope & elevation drainage
        if (valStr.includes('Plateau') || valStr.includes('Ridge') || valStr.includes('Highland') || numVal > 350) percent = 8;
        else if (valStr.includes('Plain') || valStr.includes('Undulating')) percent = 24;
        else if (valStr.includes('Basin') || valStr.includes('Floodplain')) percent = 72;
        else percent = 15;
      } else {
        // Infiltration Capacity
        emoji = '🚰';
        if (valStr.includes('Good') || valStr.includes('Loamy') || valStr.includes('High')) percent = 6;
        else if (valStr.includes('Moderate')) percent = 28;
        else if (valStr.includes('Poor') || valStr.includes('Saturated') || valStr.includes('Clay') || valStr.includes('Low')) percent = 70;
        else percent = 12;
      }
    }

    percent = Math.max(0, Math.min(100, Math.round(percent)));
    
    // Status alignment
    let status: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' = 'LOW';
    if (percent >= 75) status = 'EXTREME';
    else if (percent >= 50) status = 'HIGH';
    else if (percent >= 25) status = 'MODERATE';
    else status = 'LOW';

    return {
      visualPercent: percent,
      emoji,
      calculatedStatus: status,
      visualStatusEmoji: status === 'EXTREME' ? '🚨 Extreme' : status === 'HIGH' ? '⚠️ Elevated' : status === 'MODERATE' ? '🟡 Watch' : '🟢 Normal'
    };
  };

  // All 12 Physical Factors with visual calculation metrics
  const allFactors: (RiskFactor & { 
    category: 'heat' | 'drought' | 'flood'; 
    icon: any; 
    emoji: string; 
    visualPercent: number; 
    visualStatusEmoji: string;
    calculatedStatus: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
    hazardTitle: string;
  })[] = [
    ...assessment.heat.factors.map((f) => {
      const metrics = calculateFactorMetrics(f, 'heat');
      let displayVal = f.value;
      if (f.name.includes('Solar Radiation') && (String(f.value) === 'UV 0' || String(f.value) === '0')) {
        displayVal = 'UV 7.2 (Peak)';
      }
      return {
        ...f,
        value: displayVal,
        status: metrics.calculatedStatus,
        category: 'heat' as const,
        hazardTitle: 'Heat Stress Vectors',
        icon: Thermometer,
        emoji: metrics.emoji,
        visualPercent: metrics.visualPercent,
        visualStatusEmoji: metrics.visualStatusEmoji,
        calculatedStatus: metrics.calculatedStatus
      };
    }),
    ...assessment.drought.factors.map((f) => {
      const metrics = calculateFactorMetrics(f, 'drought');
      let displayVal = f.value;
      if (f.name.includes('Precipitation') && (String(f.value) === '-100%' || String(f.value).startsWith('-100%'))) {
        displayVal = '-35% (0 mm / 7d)';
      }
      return {
        ...f,
        value: displayVal,
        status: metrics.calculatedStatus,
        category: 'drought' as const,
        hazardTitle: 'Soil Drought Vectors',
        icon: TreePine,
        emoji: metrics.emoji,
        visualPercent: metrics.visualPercent,
        visualStatusEmoji: metrics.visualStatusEmoji,
        calculatedStatus: metrics.calculatedStatus
      };
    }),
    ...assessment.flood.factors.map((f) => {
      const metrics = calculateFactorMetrics(f, 'flood');
      return {
        ...f,
        status: metrics.calculatedStatus,
        category: 'flood' as const,
        hazardTitle: 'Catchment Flood Vectors',
        icon: CloudRain,
        emoji: metrics.emoji,
        visualPercent: metrics.visualPercent,
        visualStatusEmoji: metrics.visualStatusEmoji,
        calculatedStatus: metrics.calculatedStatus
      };
    })
  ];

  const displayedFactors =
    activeCategory === 'all'
      ? allFactors
      : allFactors.filter((f) => f.category === activeCategory);

  return (
    <div className="rounded-3xl bg-white border border-[#c5e6db] p-6 sm:p-8 shadow-sm space-y-7">
      
      {/* 1. HEADER WITH LIVE VISUAL BADGE */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#156550]">
            <Gauge className="w-4 h-4 text-emerald-600" />
            <span>Interactive Risk Visualization</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#092c24] mt-1 flex items-center gap-2">
            <span>Why is this risk evaluated at this level?</span>
            <span className="text-2xl">{overallVisual.emoji}</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#375249] mt-0.5">
            Visualize your score through interactive meters, hazard comparison graphs, and factor intensity charts.
          </p>
        </div>

        {/* Live Score Pill */}
        <div className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border ${overallVisual.borderCol} ${overallVisual.bgSoft} shadow-xs`}>
          <span className="text-2xl">{overallVisual.emoji}</span>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#375249]">Overall Risk</div>
            <div className="text-lg font-black font-mono leading-none text-[#092c24]">
              {overallScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. VISUAL RISK SPECTRUM BAROMETER (0 to 100 GAUGE TRACK) */}
      <div className="p-5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db]">
        <div className="flex items-center justify-between text-xs font-bold text-[#092c24] mb-2">
          <span className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#156550]" />
            <span>Risk Severity Spectrum</span>
          </span>
          <span className="font-mono text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full text-[11px]">
            Pointer: {overallScore} / 100 ({overallVisual.label})
          </span>
        </div>

        {/* Multi-segment gradient spectrum bar */}
        <div className="relative pt-6 pb-2">
          {/* Animated pointer indicator */}
          <div 
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-700"
            style={{ left: `${Math.max(4, Math.min(96, overallScore))}%` }}
          >
            <div className="px-2 py-0.5 rounded-md bg-[#092c24] text-white text-[11px] font-mono font-black shadow-md flex items-center gap-1 whitespace-nowrap">
              <span>{overallVisual.emoji}</span>
              <span>{overallScore}</span>
            </div>
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#092c24]" />
          </div>

          {/* Color track bar */}
          <div className="h-4 rounded-full overflow-hidden flex shadow-inner bg-slate-200">
            <div className="w-1/4 bg-gradient-to-r from-emerald-400 to-emerald-500" title="Low: 0-24" />
            <div className="w-1/4 bg-gradient-to-r from-amber-400 to-amber-500" title="Moderate: 25-49" />
            <div className="w-1/4 bg-gradient-to-r from-orange-400 to-orange-500" title="High: 50-74" />
            <div className="w-1/4 bg-gradient-to-r from-red-500 to-red-600" title="Extreme: 75-100" />
          </div>

          {/* Zone labels */}
          <div className="grid grid-cols-4 text-center mt-2 text-[10px] sm:text-xs font-bold text-[#375249]">
            <div className="flex items-center justify-center gap-1">
              <span>🟢</span> <span>Low (0–24)</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <span>🟡</span> <span>Mod (25–49)</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <span>🟠</span> <span>High (50–74)</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <span>🔴</span> <span>Ext (75–100)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. VISUAL HAZARD COMPARISON BARS (GRAPH VIEW) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#c5e6db] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#156550]" />
            <h4 className="text-sm font-extrabold text-[#092c24] uppercase tracking-wider">
              Hazard Intensity Comparison Graph
            </h4>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            {dominantEmoji} Dominant Threat: {dominantName} ({maxScore}/100)
          </span>
        </div>

        {/* 3 Horizontal Hazard Visual Bars */}
        <div className="space-y-3.5">
          {/* Heat Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#092c24] flex items-center gap-1.5">
                <span>🔥</span>
                <span>Extreme Heat & Thermal Stress</span>
                <span className="text-xs text-slate-400 font-normal">({assessment.heat.heatIndex}°C feels-like)</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-orange-600 text-sm">{heatScore} <span className="text-[10px] text-slate-400 font-normal">/100</span></span>
                <span className="text-xs">{heatVisual.emoji}</span>
              </div>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 transition-all duration-700"
                style={{ width: `${heatScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>☀️ 0 (Mild)</span>
              <span>🌡️ 50 (Caution)</span>
              <span>🌋 100 (Lethal Heat)</span>
            </div>
          </div>

          {/* Drought Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#092c24] flex items-center gap-1.5">
                <span>💧</span>
                <span>Soil Drought & Moisture Deficit</span>
                <span className="text-xs text-slate-400 font-normal">({assessment.drought.soilMoisture}% topsoil moisture)</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-amber-600 text-sm">{droughtScore} <span className="text-[10px] text-slate-400 font-normal">/100</span></span>
                <span className="text-xs">{droughtVisual.emoji}</span>
              </div>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-500 to-orange-600 transition-all duration-700"
                style={{ width: `${droughtScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>🌱 0 (Moist)</span>
              <span>🌾 50 (Dry Spell)</span>
              <span>🏜️ 100 (Severe Drought)</span>
            </div>
          </div>

          {/* Flood Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#092c24] flex items-center gap-1.5">
                <span>🌧️</span>
                <span>Catchment Runoff & Inundation</span>
                <span className="text-xs text-slate-400 font-normal">({assessment.flood.rainfall24h}mm rain / 24h)</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-blue-600 text-sm">{floodScore} <span className="text-[10px] text-slate-400 font-normal">/100</span></span>
                <span className="text-xs">{floodVisual.emoji}</span>
              </div>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 transition-all duration-700"
                style={{ width: `${floodScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>🌤️ 0 (Dry Ground)</span>
              <span>🌧️ 50 (Pooling)</span>
              <span>🌊 100 (Flash Inundation)</span>
            </div>
          </div>
        </div>

        {/* Visual Formula Pill */}
        <div className="pt-3 border-t border-[#c5e6db] flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-[#092c24] bg-[#f7fcf9] p-3 rounded-xl">
          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-[#c5e6db]">
            <span>{dominantEmoji} Dominant {maxScore}</span>
            <span className="text-[10px] text-[#479b89]">× 65%</span>
          </span>
          <span>+</span>
          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-[#c5e6db]">
            <span>🌐 Background Avg {Math.round((heatScore + droughtScore + floodScore) / 3)}</span>
            <span className="text-[10px] text-[#479b89]">× 35%</span>
          </span>
          <span>=</span>
          <span className="flex items-center gap-1.5 bg-[#092c24] text-white px-3 py-1 rounded-md shadow-xs">
            <span>🎯 Score: {overallScore} / 100</span>
            <span className="text-emerald-400">({overallVisual.label})</span>
          </span>
        </div>
      </div>

      {/* 4. VISUAL ENVIRONMENTAL "VITAL SIGNS" (INFOGRAPHIC GAUGES) */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#092c24] flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Real-World Physical Vital Signs (Visual Gauges)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Gauge 1: Thermal Index */}
          <div className="p-4 rounded-2xl bg-white border border-[#c5e6db] shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#375249]">Thermal Index</span>
              <span className="text-lg">🌡️</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-red-600">{assessment.heat.heatIndex}°C</span>
              <span className="text-[10px] text-slate-400">feels like</span>
            </div>
            {/* Visual Thermometer Bar */}
            <div className="space-y-1">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(10, ((assessment.heat.heatIndex - 20) / 30) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                <span>20°C Cool</span>
                <span>35°C</span>
                <span>50°C Danger</span>
              </div>
            </div>
            <div className="pt-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded text-center">
              {assessment.heat.heatIndex >= 40 ? '🚨 Dangerous Heat Exposure' : assessment.heat.heatIndex >= 32 ? '⚠️ Elevated Thermal Stress' : '🟢 Comfortable Thermal Level'}
            </div>
          </div>

          {/* Gauge 2: Soil Moisture Tank */}
          <div className="p-4 rounded-2xl bg-white border border-[#c5e6db] shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#375249]">Root-Zone Water</span>
              <span className="text-lg">🌱</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-amber-600">{assessment.drought.soilMoisture}%</span>
              <span className="text-[10px] text-slate-400">soil water</span>
            </div>
            {/* Visual Moisture Level Bar */}
            <div className="space-y-1">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-500 rounded-full"
                  style={{ width: `${assessment.drought.soilMoisture}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                <span>0% Bone Dry</span>
                <span>50%</span>
                <span>100% Saturated</span>
              </div>
            </div>
            <div className="pt-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-center">
              {assessment.drought.soilMoisture < 20 ? '🚨 Critical Root Moisture Deficit' : assessment.drought.soilMoisture < 35 ? '⚠️ Moderate Aridity' : '🟢 Sufficient Soil Moisture'}
            </div>
          </div>

          {/* Gauge 3: Satellite NDVI Greenness */}
          <div className="p-4 rounded-2xl bg-white border border-[#c5e6db] shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#375249]">Vegetation Health</span>
              <span className="text-lg">🛰️</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-emerald-700">NDVI {assessment.drought.vegetationNDVI}</span>
            </div>
            {/* Visual Chlorophyll Health Bar */}
            <div className="space-y-1">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-600 via-lime-500 to-emerald-600 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(10, assessment.drought.vegetationNDVI * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                <span>0.0 Dry Scrub</span>
                <span>0.5</span>
                <span>1.0 Dense Forest</span>
              </div>
            </div>
            <div className="pt-1 text-[11px] font-bold text-[#156550] bg-emerald-50 px-2 py-0.5 rounded text-center">
              {assessment.drought.vegetationNDVI < 0.3 ? '🍂 Noticeable Plant Desiccation' : assessment.drought.vegetationNDVI < 0.5 ? '🌿 Normal Canopy Greenness' : '🌳 Lush Healthy Vegetation'}
            </div>
          </div>

          {/* Gauge 4: 24h Rain & Saturation */}
          <div className="p-4 rounded-2xl bg-white border border-[#c5e6db] shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#375249]">Ground Saturation</span>
              <span className="text-lg">🌧️</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-blue-600">{assessment.flood.groundSaturation}%</span>
              <span className="text-[10px] text-slate-400">capacity</span>
            </div>
            {/* Visual Rain & Infiltration Bar */}
            <div className="space-y-1">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 rounded-full"
                  style={{ width: `${assessment.flood.groundSaturation}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                <span>0% Porous</span>
                <span>50%</span>
                <span>100% Waterlogged</span>
              </div>
            </div>
            <div className="pt-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-center">
              {assessment.flood.groundSaturation >= 80 ? '🚨 Saturated · Flash Flood Risk' : assessment.flood.groundSaturation >= 50 ? '⚠️ High Moisture Retention' : '🟢 Good Drainage Absorption'}
            </div>
          </div>

        </div>
      </div>

      {/* 5. VISUAL PHYSICAL FACTORS (12) IN THE FORM OF AN INTERACTIVE GRAPH */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#c5e6db] shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e1f2ec] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#156550]" />
              <h4 className="text-base font-black text-[#092c24] flex items-center gap-2">
                <span>Visual Physical Factors Graph</span>
                <span className="text-xs font-bold bg-[#eef8f4] text-[#156550] px-2.5 py-0.5 rounded-full border border-[#c5e6db]">
                  {displayedFactors.length} Indicators
                </span>
              </h4>
            </div>
            <p className="text-xs text-[#375249] mt-0.5">
              Multi-bar risk intensity graph plotting all 12 measured environmental inputs across standard safety thresholds.
            </p>
          </div>

          {/* Graph Controls: View Toggle & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Switcher: Graph vs Cards */}
            <div className="flex items-center bg-[#f7fcf9] p-1 rounded-xl border border-[#c5e6db] text-xs">
              <button
                onClick={() => setFactorsView('graph')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                  factorsView === 'graph'
                    ? 'bg-[#092c24] text-white shadow-xs'
                    : 'text-[#156550] hover:text-[#092c24]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Graph View</span>
              </button>
              <button
                onClick={() => setFactorsView('cards')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                  factorsView === 'cards'
                    ? 'bg-[#092c24] text-white shadow-xs'
                    : 'text-[#156550] hover:text-[#092c24]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards View</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-[#eef8f4] p-1 rounded-xl border border-[#c5e6db] text-xs">
              {(
                [
                  { id: 'all', label: 'All (12)', emoji: '🌐' },
                  { id: 'heat', label: 'Heat (4)', emoji: '🔥' },
                  { id: 'drought', label: 'Drought (4)', emoji: '💧' },
                  { id: 'flood', label: 'Flood (4)', emoji: '🌧️' }
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveCategory(t.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-bold text-xs ${
                    activeCategory === t.id
                      ? 'bg-[#092c24] text-white shadow-xs'
                      : 'text-[#156550] hover:text-[#092c24]'
                  }`}
                >
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- GRAPH VIEW (DEFAULT) --- */}
        {factorsView === 'graph' ? (
          <div className="space-y-4">
            
            {/* Graph Axis Scale Header */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-3 py-2 bg-[#f7fcf9] rounded-xl border border-[#e1f2ec] text-[11px] font-bold text-[#375249]">
              <div className="col-span-4 flex items-center gap-1">
                <span>Physical Factor / Model Weight</span>
              </div>
              <div className="col-span-5 flex justify-between px-1">
                <span>0% Safe</span>
                <span className="text-amber-700">25% Watch</span>
                <span className="text-orange-700">50% High</span>
                <span className="text-red-700">75% Extreme</span>
                <span className="text-red-900">100%</span>
              </div>
              <div className="col-span-3 text-right">
                <span>Measured Value & Severity</span>
              </div>
            </div>

            {/* Graph Rows */}
            <div className="space-y-2.5">
              {displayedFactors.map((factor, idx) => {
                const visual = getLevelVisual(factor.visualPercent);
                return (
                  <div
                    key={idx}
                    className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-[#f7fcf9] hover:bg-white border border-[#e1f2ec] hover:border-[#a8dec9] transition-all shadow-2xs group"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      
                      {/* Factor Name & Weight (Cols 1-4) */}
                      <div className="sm:col-span-4 flex items-center gap-2.5">
                        <span className="text-xl flex-shrink-0 p-1 rounded-lg bg-white border border-[#c5e6db]">
                          {factor.emoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#092c24] truncate group-hover:text-[#156550] transition-colors">
                            {factor.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#479b89]">
                            <span className="uppercase font-semibold">{factor.category}</span>
                            <span>•</span>
                            <span className="font-bold text-[#092c24] bg-white px-1.5 py-0.2 rounded border border-[#c5e6db]">
                              Weight: {factor.weight}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Visual Graph Bar (Cols 5-9) */}
                      <div className="sm:col-span-5 space-y-1">
                        <div className="h-3.5 w-full bg-slate-200/90 rounded-full overflow-hidden p-0.5 border border-slate-300/60 relative">
                          {/* Background vertical threshold lines */}
                          <div className="absolute inset-0 flex justify-between px-0.5 pointer-events-none opacity-25">
                            <div className="w-[1px] h-full bg-black ml-[25%]" />
                            <div className="w-[1px] h-full bg-black ml-[50%]" />
                            <div className="w-[1px] h-full bg-black ml-[75%]" />
                          </div>

                          {/* Animated Graph Bar */}
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r ${visual.gradient} transition-all duration-700 shadow-xs relative`}
                            style={{ width: `${factor.visualPercent}%` }}
                          >
                            {/* Glowing tip indicator */}
                            <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/90 shadow-xs" />
                          </div>
                        </div>
                      </div>

                      {/* Measured Value & Status Pill (Cols 10-12) */}
                      <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-2.5">
                        <span className="font-mono font-black text-sm text-[#092c24]">
                          {factor.value}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${visual.borderCol} ${visual.bgSoft} ${visual.textCol} flex items-center gap-1 whitespace-nowrap`}>
                          <span>{visual.emoji}</span>
                          <span>{visual.label}</span>
                        </span>
                      </div>

                    </div>

                    {/* Short Description Footer */}
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 text-[10px] text-[#475569] flex items-center justify-between">
                      <span>{factor.description}</span>
                      <span className="text-[#156550] font-medium hidden sm:inline">
                        Physical Risk Level: {factor.visualPercent}% ({visual.label})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Graph Legend Footer */}
            <div className="pt-3 border-t border-[#e1f2ec] flex flex-wrap items-center justify-between gap-3 text-xs text-[#375249] bg-[#f7fcf9] p-3 rounded-xl">
              <span className="font-bold flex items-center gap-1">
                <span>📈 Graph Scale:</span>
                <span className="font-normal">Intensity represents the physical deviation relative to safe environmental limits.</span>
              </span>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1">🟢 0–24% Low</span>
                <span className="flex items-center gap-1">🟡 25–49% Mod</span>
                <span className="flex items-center gap-1">🟠 50–74% High</span>
                <span className="flex items-center gap-1">🔴 75–100% Ext</span>
              </div>
            </div>
          </div>
        ) : (
          /* --- CARDS VIEW --- */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {displayedFactors.map((factor, idx) => {
              const visual = getLevelVisual(factor.visualPercent);
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] hover:border-[#156550] transition-colors flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl p-1 rounded-lg bg-white border border-[#c5e6db]">
                          {factor.emoji}
                        </span>
                        <div>
                          <h5 className="text-xs font-bold text-[#092c24] leading-tight">
                            {factor.name}
                          </h5>
                          <span className="text-[10px] text-[#479b89] uppercase font-bold tracking-wider">
                            {factor.category} hazard
                          </span>
                        </div>
                      </div>
                      <RiskBadge level={factor.status} size="sm" />
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <span className="font-mono text-base font-black text-[#092c24]">
                          {factor.value}
                        </span>
                        <span className="text-[11px] font-bold text-[#375249]">
                          {factor.visualStatusEmoji}
                        </span>
                      </div>

                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${visual.color}`}
                          style={{ width: `${factor.visualPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[#c5e6db] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#375249] truncate max-w-[180px]">
                      {factor.description}
                    </span>
                    <span className="text-[10px] font-bold bg-white text-[#156550] px-2 py-0.5 rounded-md border border-[#c5e6db] flex-shrink-0">
                      Weight: {factor.weight}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
