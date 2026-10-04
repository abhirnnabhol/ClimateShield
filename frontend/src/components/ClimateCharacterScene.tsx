import React, { useState, useId } from 'react';
import { 
  Sun, 
  Droplets, 
  CloudRain, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Eye, 
  Flame,
  Info,
  Maximize2
} from 'lucide-react';
import ecoCharacterImg from '../assets/eco_character.png';
import pyroCharacterImg from '../assets/pyro_character.jpg';
import droppyCharacterImg from '../assets/droppy_character.jpg';
import soliCharacterImg from '../assets/soli_character.jpg';

export interface ClimateCharacterSceneProps {
  score: number;
  level?: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  dominantHazard?: 'heat' | 'drought' | 'flood';
  heatScore?: number;
  droughtScore?: number;
  floodScore?: number;
  locationName?: string;
  onExploreHazard?: (hazard: string) => void;
}

export const ClimateCharacterScene: React.FC<ClimateCharacterSceneProps> = ({
  score: liveScore,
  level: liveLevel,
  dominantHazard: liveDominantHazard,
  heatScore = 20,
  droughtScore = 20,
  floodScore = 20,
  locationName = 'Monitored Region',
  onExploreHazard
}) => {
  // Allow manual preview mode for judges to inspect all 4 states and hazard variants
  const [overrideState, setOverrideState] = useState<'LIVE' | 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'>('LIVE');
  const [overrideHazard, setOverrideHazard] = useState<'heat' | 'drought' | 'flood' | null>(null);

  // Compute live dominant hazard if not provided
  const computedLiveHazard: 'heat' | 'drought' | 'flood' = (() => {
    if (liveDominantHazard) return liveDominantHazard;
    const maxVal = Math.max(heatScore, droughtScore, floodScore);
    if (maxVal === floodScore && floodScore > 0) return 'flood';
    if (maxVal === droughtScore && droughtScore > 0) return 'drought';
    return 'heat';
  })();

  // Resolve active score & level
  const effectiveLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' = (() => {
    if (overrideState !== 'LIVE') return overrideState;
    if (liveLevel) return liveLevel;
    if (liveScore >= 75) return 'EXTREME';
    if (liveScore >= 50) return 'HIGH';
    if (liveScore >= 25) return 'MODERATE';
    return 'LOW';
  })();

  const effectiveHazard = overrideHazard || computedLiveHazard;

  const effectiveScore = (() => {
    if (overrideState === 'LOW') return 18;
    if (overrideState === 'MODERATE') return 38;
    if (overrideState === 'HIGH') return 64;
    if (overrideState === 'EXTREME') return 88;
    return liveScore;
  })();

  // UI Strings specified in requirements
  const getSceneContent = () => {
    switch (effectiveLevel) {
      case 'LOW':
        return {
          title: "The environment looks healthy 🌱",
          subtitle: "Conditions are currently stable and buffered.",
          badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
          skyGradient: "from-sky-300 via-sky-200 to-emerald-100",
          cardBorder: "border-emerald-300/80 shadow-emerald-900/5",
          activityTag: "Relaxing under a healthy shade tree · Clean air",
          accentColor: "#10b981",
          riskRange: "0 – 24 Risk Score"
        };
      case 'MODERATE':
        return {
          title: "Conditions are changing 👀",
          subtitle: "Keep monitoring the local environment.",
          badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
          skyGradient: "from-sky-200 via-amber-100 to-emerald-50",
          cardBorder: "border-amber-300/80 shadow-amber-900/5",
          activityTag: "Scanning sky with telemetry sensors · Monitoring winds",
          accentColor: "#f59e0b",
          riskRange: "25 – 49 Risk Score"
        };
      case 'HIGH':
        return {
          title: "Environmental risk is increasing ⚠️",
          subtitle: "Several environmental indicators show elevated stress.",
          badgeBg: "bg-orange-100 text-orange-800 border-orange-300",
          skyGradient: effectiveHazard === 'flood'
            ? "from-slate-500 via-slate-400 to-slate-200"
            : effectiveHazard === 'drought'
            ? "from-amber-200 via-amber-100 to-stone-200"
            : "from-amber-300 via-orange-200 to-yellow-100",
          cardBorder: "border-orange-300/80 shadow-orange-900/5",
          activityTag: effectiveHazard === 'flood'
            ? "Holding rain protection · Tracking rising waters"
            : effectiveHazard === 'drought'
            ? "Inspecting dry soil moisture · Monitoring wilting foliage"
            : "Shielding forehead from high solar radiation · Hydrating",
          accentColor: "#f97316",
          riskRange: "50 – 74 Risk Score"
        };
      case 'EXTREME':
      default:
        return {
          title: "Extreme environmental risk 🚨",
          subtitle: "Check local official advisories and take safety precautions.",
          badgeBg: "bg-red-100 text-red-800 border-red-300 animate-pulse",
          skyGradient: effectiveHazard === 'flood'
            ? "from-slate-700 via-slate-600 to-slate-400"
            : effectiveHazard === 'drought'
            ? "from-amber-400 via-red-300 to-amber-200"
            : "from-rose-400 via-amber-300 to-orange-200",
          cardBorder: "border-red-400/90 shadow-red-900/10",
          activityTag: effectiveHazard === 'flood'
            ? "Life vest equipped · Guiding to elevated emergency ground"
            : effectiveHazard === 'drought'
            ? "Emergency water reserves deployed · Arid crack mitigation"
            : "Thermal shielding active · Full UV/Heat protection protocol",
          accentColor: "#ef4444",
          riskRange: "75 – 100 Risk Score"
        };
    }
  };

  const sceneInfo = getSceneContent();

  // Active Sentinel Character (Eco Terra for Low/Moderate/Nominal, Pyro for Heat, Soli for Drought, Droppy for Flood)
  const activeGuardian = (() => {
    if (effectiveLevel === 'LOW' || effectiveLevel === 'MODERATE') {
      return {
        name: 'Eco Terra',
        title: 'Chief Climate Guardian',
        role: effectiveLevel === 'LOW' ? 'Nominal Equilibrium' : 'Vigilance Observer',
        image: ecoCharacterImg,
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        color: '#10b981',
        emoji: '🌱'
      };
    }
    if (effectiveHazard === 'heat') {
      return {
        name: 'Pyro',
        title: 'Thermal Stress Sentinel',
        role: 'Heat Wave Sentinel',
        image: pyroCharacterImg,
        badgeBg: 'bg-orange-100 text-orange-800 border-orange-300',
        color: '#f97316',
        emoji: '🔥'
      };
    }
    if (effectiveHazard === 'drought') {
      return {
        name: 'Soli',
        title: 'Soil Deficit Sentinel',
        role: 'Soil Drought Sentinel',
        image: soliCharacterImg,
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
        color: '#b45309',
        emoji: '💧'
      };
    }
    return {
      name: 'Droppy',
      title: 'Precipitation & Inundation Sentinel',
      role: 'Flood & Rain Sentinel',
      image: droppyCharacterImg,
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
      color: '#2563eb',
      emoji: '🌧️'
    };
  })();

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-white border-2 ${sceneInfo.cardBorder} p-6 sm:p-7 shadow-xl transition-all duration-500`}>
      {/* Top Header & Simulation Controls */}
      <div className="space-y-3.5 border-b border-[#e1f2ec] pb-4 mb-5">
        {/* Main Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden border border-[#c5e6db] shadow-xs shrink-0 bg-[#092c24]">
              <img
                src={activeGuardian.image}
                alt={activeGuardian.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#092c24] tracking-tight">
                  Environmental Visualizer
                </h2>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${sceneInfo.badgeBg}`}>
                  {effectiveLevel}
                </span>
              </div>
              <p className="text-xs text-[#375249] font-medium">
                Real-time landscape response for <strong className="text-[#092c24]">{locationName}</strong>
              </p>
            </div>
          </div>

          {/* Condition Level Switcher */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:inline">
              Condition:
            </span>
            <div className="inline-flex rounded-2xl bg-[#eef8f4] p-1 border border-[#c5e6db] text-xs font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => { setOverrideState('LIVE'); setOverrideHazard(null); }}
                className={`px-3 py-1.5 rounded-xl transition-all text-xs font-bold cursor-pointer flex items-center gap-1.5 ${
                  overrideState === 'LIVE' 
                    ? 'bg-[#092c24] text-white shadow-xs' 
                    : 'text-[#1e3a34] hover:text-[#092c24] hover:bg-white/60'
                }`}
                title="Return to real-time live telemetry state"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live</span>
              </button>
              <button
                type="button"
                onClick={() => setOverrideState('LOW')}
                className={`px-3 py-1.5 rounded-xl transition-all text-xs font-bold cursor-pointer ${
                  overrideState === 'LOW' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-emerald-800 hover:bg-emerald-100/60'
                }`}
              >
                Low (Good)
              </button>
              <button
                type="button"
                onClick={() => setOverrideState('MODERATE')}
                className={`px-3 py-1.5 rounded-xl transition-all text-xs font-bold cursor-pointer ${
                  overrideState === 'MODERATE' 
                    ? 'bg-amber-500 text-white shadow-xs' 
                    : 'text-amber-800 hover:bg-amber-100/60'
                }`}
              >
                Moderate
              </button>
              <button
                type="button"
                onClick={() => setOverrideState('HIGH')}
                className={`px-3 py-1.5 rounded-xl transition-all text-xs font-bold cursor-pointer ${
                  overrideState === 'HIGH' 
                    ? 'bg-orange-500 text-white shadow-xs' 
                    : 'text-orange-800 hover:bg-orange-100/60'
                }`}
              >
                High
              </button>
              <button
                type="button"
                onClick={() => setOverrideState('EXTREME')}
                className={`px-3 py-1.5 rounded-xl transition-all text-xs font-bold cursor-pointer ${
                  overrideState === 'EXTREME' 
                    ? 'bg-red-600 text-white shadow-xs' 
                    : 'text-red-800 hover:bg-red-100/60'
                }`}
              >
                Extreme
              </button>
            </div>
          </div>
        </div>

        {/* Hazard Simulation Focus Row — only shown for High and Extreme conditions where specific hazard vectors exist */}
        {(effectiveLevel === 'HIGH' || effectiveLevel === 'EXTREME') ? (
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#eef8f4] text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#156550] flex items-center gap-1.5">
                <span>🎯</span>
                <span>Hazard Focus:</span>
              </span>
              <span className="text-[11px] text-[#479b89] font-medium hidden sm:inline">
                Select active environmental stress vector to preview
              </span>
            </div>

            <div className="inline-flex rounded-xl bg-slate-100/90 p-1 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setOverrideHazard('heat')}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  effectiveHazard === 'heat' 
                    ? 'bg-amber-500 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Heat Waves</span>
              </button>
              <button
                type="button"
                onClick={() => setOverrideHazard('drought')}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  effectiveHazard === 'drought' 
                    ? 'bg-amber-700 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Soil Drought</span>
              </button>
              <button
                type="button"
                onClick={() => setOverrideHazard('flood')}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  effectiveHazard === 'flood' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5" />
                <span>Flood &amp; Rain</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#eef8f4] text-xs">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#156550]">
              <ShieldCheck className="w-4 h-4 text-[#10b981]" />
              <span>
                {effectiveLevel === 'LOW' 
                  ? 'All environmental vectors (thermal, soil moisture, precipitation) are in healthy equilibrium.' 
                  : 'Conditions are stable with mild seasonal variation · Continuous sensor telemetry active.'}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#479b89] bg-[#eef8f4] px-2.5 py-1 rounded-full border border-[#c5e6db]">
              No Active Hazards
            </span>
          </div>
        )}
      </div>

      {/* Main 2D Illustrated Scene Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: 2D Cartoon Illustration Stage */}
        <div className="lg:col-span-7">
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden shadow-inner border border-black/10 select-none">
            {/* Render State-Specific Vector Scenery & Character */}
            <EcoTerraVectorScene level={effectiveLevel} hazard={effectiveHazard} />

            {/* In-Scene Ambient Activity Pill */}
            <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: sceneInfo.accentColor }} />
              <span className="truncate max-w-[280px] sm:max-w-none">{sceneInfo.activityTag}</span>
            </div>

            {/* Score Watermark in corner */}
            <div className="absolute bottom-3 right-3 bg-white/85 backdrop-blur-md px-3 py-1 rounded-xl border border-white/40 text-right shadow-xs">
              <div className="text-[10px] uppercase font-bold text-[#375249]">Simulated Index</div>
              <div className="text-sm font-black font-mono text-[#092c24]">{effectiveScore} / 100</div>
            </div>
          </div>
        </div>

        {/* Right Side: Dialogue, Expressive Callouts & Precautionary Guidance */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#479b89] tracking-wider uppercase">
                {sceneInfo.riskRange}
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-bold text-[#156550]">
                {effectiveLevel === 'LOW' 
                  ? 'Environmental status: NOMINAL EQUILIBRIUM 🌱' 
                  : effectiveLevel === 'MODERATE' 
                  ? 'Environmental status: VIGILANCE OBSERVATION 👀' 
                  : <>Active vector: <strong className="uppercase">{effectiveHazard}</strong> ⚠️</>}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#092c24] tracking-tight leading-snug">
              {sceneInfo.title}
            </h3>

            <p className="text-sm font-medium text-[#2d4940] leading-relaxed">
              {sceneInfo.subtitle}
            </p>
          </div>

          {/* Environmental Character Explanation Bubble with Active Sentinel Avatar */}
          <div className="p-4 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] space-y-3 text-xs shadow-2xs">
            <div className="flex items-center gap-3">
              <img
                src={activeGuardian.image}
                alt={activeGuardian.name}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-sm ring-2 ring-emerald-500/20 shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5 font-bold text-[#092c24] text-xs">
                  <span>{activeGuardian.name}</span>
                  <span className="text-[10px] font-semibold text-[#156550] bg-[#eef8f4] px-2 py-0.5 rounded-full border border-[#c5e6db]">
                    {activeGuardian.role}
                  </span>
                </div>
                <div className="text-[11px] text-[#479b89] font-medium">
                  Field Observations &amp; Advisory
                </div>
              </div>
            </div>
            <p className="text-[#375249] leading-relaxed font-medium pl-1">
              {getGuardianGuidance(effectiveLevel, effectiveHazard, locationName)}
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-[#092c24] font-bold bg-[#eef8f4] border border-[#c5e6db] px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-[#156550]" />
              <span>
                {effectiveLevel === 'LOW' && 'Nominal Seasonal Buffering'}
                {effectiveLevel === 'MODERATE' && 'Vigilance Monitoring Active'}
                {effectiveLevel === 'HIGH' && 'Mitigation Protocol Advised'}
                {effectiveLevel === 'EXTREME' && 'Safety Precaution Essential'}
              </span>
            </div>

            {onExploreHazard && (effectiveLevel === 'HIGH' || effectiveLevel === 'EXTREME') && (
              <button
                type="button"
                onClick={() => onExploreHazard(effectiveHazard)}
                className="text-xs font-bold text-[#156550] hover:text-[#092c24] flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-[#eef8f4] transition-colors cursor-pointer"
              >
                <span>Inspect {effectiveHazard} vectors →</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Contextual advice text generator
function getGuardianGuidance(
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME',
  hazard: 'heat' | 'drought' | 'flood',
  location: string
): string {
  if (level === 'LOW') {
    return `In ${location}, multi-satellite readings confirm soil moisture, thermal readings, and precipitation are completely harmonious. No adverse stress observed!`;
  }
  if (level === 'MODERATE') {
    return `My sensor indicates early divergence in ${location}. Slight atmospheric drying or wind shifts detected. A good time to verify irrigation timers and check drainage.`;
  }
  if (level === 'HIGH') {
    if (hazard === 'heat') {
      return `Heat anomaly! Surface temps in ${location} have surpassed threshold limits. Evaporative demand is elevated; hydrate and limit midday exposure.`;
    }
    if (hazard === 'drought') {
      return `Drought pressure! Root-zone moisture has depleted by >30%. Consider mulch protection and nighttime drip irrigation to conserve reservoir reserves.`;
    }
    return `Precipitation alert! Sustained rainfall is saturating local catchment basins in ${location}. Keep storm drains clear and inspect low-elevation runoffs.`;
  }
  // EXTREME
  if (hazard === 'heat') {
    return `Severe thermal emergency! Dangerous heat index detected. Keep livestock sheltered, halt strenuous outdoor labor, and activate cooling shelters.`;
  }
  if (hazard === 'drought') {
    return `Critical agricultural drought! Arid soil fissuring detected. Restrict non-essential water usage immediately and consult regional crop insurance guides.`;
  }
  return `Flood hazard critical! Rapid catchment inundation risk. Move high-value equipment to elevated ground and monitor local emergency flood broadcast alerts.`;
}

// =======================================================================
// 2D SVG VECTOR SCENE & CHARACTER RIG
// =======================================================================

interface EcoTerraVectorSceneProps {
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  hazard: 'heat' | 'drought' | 'flood';
}

const EcoTerraVectorScene: React.FC<EcoTerraVectorSceneProps> = ({ level, hazard }) => {
  return (
    <svg
      viewBox="0 0 800 500"
      className="w-full h-full object-cover transition-all duration-700"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Low Sky Gradient */}
        <linearGradient id="skyLow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="60%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#d1fae5" />
        </linearGradient>

        {/* Moderate Sky Gradient */}
        <linearGradient id="skyMod" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="50%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>

        {/* High Sky Gradients */}
        <linearGradient id="skyHighHeat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#ffedd5" />
        </linearGradient>
        <linearGradient id="skyHighDrought" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="50%" stopColor="#e5e5e5" />
          <stop offset="100%" stopColor="#e7e5e4" />
        </linearGradient>
        <linearGradient id="skyHighFlood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="60%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        {/* Extreme Sky Gradients */}
        <linearGradient id="skyExtHeat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="45%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
        <linearGradient id="skyExtDrought" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#d6d3d1" />
        </linearGradient>
        <linearGradient id="skyExtFlood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="55%" stopColor="#334155" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Ground Gradients */}
        <linearGradient id="groundLush" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="groundDull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="groundDry" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4d4d8" />
          <stop offset="100%" stopColor="#a8a29e" />
        </linearGradient>
        <linearGradient id="groundParched" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d7b899" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="floodWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.95" />
        </linearGradient>

        {/* Character Skin Gradient (Eco Terra) */}
        <linearGradient id="ecoSkin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="70%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>

        {/* Yellow Neckerchief / Bandana */}
        <linearGradient id="bandanaGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>

        <style>{`
          @keyframes gentleSway {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(3deg); }
          }
          @keyframes sproutBob {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-2px) rotate(4deg); }
          }
          @keyframes cloudDriftSlow {
            0% { transform: translateX(0px); }
            50% { transform: translateX(18px); }
            100% { transform: translateX(0px); }
          }
          @keyframes rainDrop {
            0% { transform: translateY(-50px); opacity: 0; }
            50% { opacity: 0.8; }
            100% { transform: translateY(120px); opacity: 0; }
          }
          @keyframes heatWaves {
            0% { transform: translateY(0px) scaleX(1); opacity: 0.3; }
            50% { transform: translateY(-12px) scaleX(1.1); opacity: 0.7; }
            100% { transform: translateY(-24px) scaleX(1); opacity: 0; }
          }
          @keyframes blinkLight {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; filter: drop-shadow(0 0 4px #eab308); }
          }
          .anim-sway { transform-origin: bottom center; animation: gentleSway 5s ease-in-out infinite; }
          .anim-sprout { transform-origin: 400px 185px; animation: sproutBob 3s ease-in-out infinite; }
          .anim-cloud { animation: cloudDriftSlow 8s ease-in-out infinite; }
          .anim-rain-1 { animation: rainDrop 1.1s linear infinite; }
          .anim-rain-2 { animation: rainDrop 0.9s linear 0.3s infinite; }
          .anim-rain-3 { animation: rainDrop 1.2s linear 0.6s infinite; }
          .anim-heat { animation: heatWaves 2.5s ease-in-out infinite; }
          .anim-blink { animation: blinkLight 1.2s ease-in-out infinite; }
        `}</style>
      </defs>

      {/* 1. SKY BACKGROUND */}
      <rect
        x="0"
        y="0"
        width="800"
        height="500"
        fill={
          level === 'LOW'
            ? 'url(#skyLow)'
            : level === 'MODERATE'
            ? 'url(#skyMod)'
            : level === 'HIGH'
            ? hazard === 'flood'
              ? 'url(#skyHighFlood)'
              : hazard === 'drought'
              ? 'url(#skyHighDrought)'
              : 'url(#skyHighHeat)'
            : hazard === 'flood'
            ? 'url(#skyExtFlood)'
            : hazard === 'drought'
            ? 'url(#skyExtDrought)'
            : 'url(#skyExtHeat)'
        }
      />

      {/* 2. CELESTIAL & WEATHER ELEMENTS */}
      {level === 'LOW' && (
        <g>
          {/* Gentle warm sun */}
          <circle cx="680" cy="110" r="48" fill="#fef08a" opacity="0.9" />
          <circle cx="680" cy="110" r="64" fill="#fde047" opacity="0.25" />
          {/* Drifting fluffy clouds */}
          <g className="anim-cloud" opacity="0.85">
            <path
              d="M120 120 Q140 90 180 100 Q220 80 250 110 Q280 120 270 145 Q260 160 210 160 L140 160 Q110 150 120 120 Z"
              fill="#ffffff"
            />
            <path
              d="M480 80 Q500 55 530 65 Q560 50 585 75 Q610 85 600 105 L490 105 Q470 95 480 80 Z"
              fill="#ffffff"
              opacity="0.7"
            />
          </g>
          {/* Flying little birds */}
          <path d="M290 85 Q300 75 310 85 Q320 75 330 85" stroke="#065f46" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M325 105 Q332 97 340 105 Q348 97 355 105" stroke="#065f46" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      )}

      {level === 'MODERATE' && (
        <g>
          {/* Dimmer sun with slight cloud cover */}
          <circle cx="660" cy="120" r="42" fill="#fef08a" opacity="0.7" />
          {/* Grayish-white clouds gathering */}
          <g className="anim-cloud">
            <path
              d="M160 130 Q190 95 240 105 Q285 85 320 120 Q350 135 340 165 L180 165 Z"
              fill="#ffffff"
              opacity="0.9"
            />
            <path
              d="M600 110 Q630 80 670 90 Q710 75 740 105 Q765 120 750 150 L620 150 Z"
              fill="#e2e8f0"
              opacity="0.75"
            />
          </g>
          {/* Wind streak lines */}
          <path d="M80 190 Q150 180 230 190" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="12,8" fill="none" />
          <path d="M260 210 Q340 200 420 210" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="16,6" fill="none" />
        </g>
      )}

      {level === 'HIGH' && (
        <g>
          {hazard === 'heat' && (
            <g>
              {/* Blazing High Sun with heat aura */}
              <circle cx="650" cy="100" r="58" fill="#fbbf24" opacity="0.95" />
              <circle cx="650" cy="100" r="82" fill="#f59e0b" opacity="0.3" />
              <circle cx="650" cy="100" r="110" fill="#f97316" opacity="0.15" />
              {/* Shimmering wavy heat lines */}
              <g className="anim-heat">
                <path d="M200 320 Q215 300 230 320 Q245 340 260 320" stroke="#f97316" strokeWidth="3" fill="none" opacity="0.6" />
                <path d="M340 310 Q355 290 370 310 Q385 330 400 310" stroke="#f97316" strokeWidth="3" fill="none" opacity="0.6" />
                <path d="M520 330 Q535 310 550 330 Q565 350 580 330" stroke="#f97316" strokeWidth="3" fill="none" opacity="0.6" />
              </g>
            </g>
          )}

          {hazard === 'drought' && (
            <g>
              {/* Harsh dry pale sky with hazy dust */}
              <circle cx="670" cy="90" r="50" fill="#fef08a" opacity="0.8" />
              <path d="M100 250 Q280 230 480 250" stroke="#d6d3d1" strokeWidth="3" strokeDasharray="15,10" fill="none" opacity="0.7" />
            </g>
          )}

          {hazard === 'flood' && (
            <g>
              {/* Dark rainy clouds */}
              <path
                d="M80 100 Q130 50 200 65 Q270 40 330 90 Q390 100 370 150 L100 150 Z"
                fill="#475569"
                opacity="0.9"
              />
              <path
                d="M320 80 Q370 40 440 50 Q510 30 570 75 Q620 90 600 140 L340 140 Z"
                fill="#334155"
                opacity="0.95"
              />
              {/* Animated falling raindrops */}
              <g className="anim-rain-1" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round">
                <line x1="160" y1="180" x2="150" y2="210" />
                <line x1="280" y1="190" x2="270" y2="220" />
                <line x1="420" y1="170" x2="410" y2="200" />
                <line x1="560" y1="190" x2="550" y2="220" />
              </g>
              <g className="anim-rain-2" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round">
                <line x1="210" y1="210" x2="200" y2="240" />
                <line x1="350" y1="220" x2="340" y2="250" />
                <line x1="490" y1="200" x2="480" y2="230" />
                <line x1="620" y1="210" x2="610" y2="240" />
              </g>
            </g>
          )}
        </g>
      )}

      {level === 'EXTREME' && (
        <g>
          {hazard === 'heat' && (
            <g>
              {/* Severe blazing solar flare */}
              <circle cx="640" cy="110" r="70" fill="#ef4444" opacity="0.9" />
              <circle cx="640" cy="110" r="110" fill="#f97316" opacity="0.4" />
              <circle cx="640" cy="110" r="160" fill="#fbbf24" opacity="0.2" />
              {/* Intense radiant rays */}
              <line x1="640" y1="10" x2="640" y2="40" stroke="#fef08a" strokeWidth="5" strokeLinecap="round" />
              <line x1="540" y1="110" x2="510" y2="110" stroke="#fef08a" strokeWidth="5" strokeLinecap="round" />
              <line x1="560" y1="40" x2="540" y2="60" stroke="#fef08a" strokeWidth="5" strokeLinecap="round" />
            </g>
          )}

          {hazard === 'drought' && (
            <g>
              {/* Extreme parched amber/copper sky with arid dust storm */}
              <circle cx="680" cy="80" r="54" fill="#fbbf24" opacity="0.85" />
              <path d="M50 220 Q200 180 400 230 Q600 190 750 240" stroke="#b45309" strokeWidth="4" strokeDasharray="18,12" fill="none" opacity="0.8" />
              <path d="M120 260 Q320 220 520 270 Q700 230 780 280" stroke="#92400e" strokeWidth="3" strokeDasharray="24,10" fill="none" opacity="0.7" />
            </g>
          )}

          {hazard === 'flood' && (
            <g>
              {/* Storm clouds and lightning bolt */}
              <path
                d="M40 70 Q110 20 200 35 Q280 10 360 65 Q450 40 540 70 Q640 45 740 90 L760 170 L20 170 Z"
                fill="#1e293b"
              />
              {/* Lightning strike */}
              <polygon points="610,130 585,190 605,190 575,260 625,180 600,180" fill="#fef08a" opacity="0.9" />
              {/* Torrential downpour */}
              <g className="anim-rain-1" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round">
                <line x1="120" y1="160" x2="100" y2="220" />
                <line x1="220" y1="170" x2="200" y2="230" />
                <line x1="340" y1="150" x2="320" y2="210" />
                <line x1="480" y1="170" x2="460" y2="230" />
                <line x1="680" y1="160" x2="660" y2="220" />
              </g>
              <g className="anim-rain-3" stroke="#60a5fa" strokeWidth="3.5" strokeLinecap="round">
                <line x1="170" y1="190" x2="150" y2="250" />
                <line x1="290" y1="200" x2="270" y2="260" />
                <line x1="410" y1="180" x2="390" y2="240" />
                <line x1="550" y1="190" x2="530" y2="250" />
              </g>
            </g>
          )}
        </g>
      )}

      {/* 3. ROLLING GROUND / TERRAIN */}
      {level === 'LOW' && (
        <g>
          {/* Lush Green Hills */}
          <path d="M0 340 Q250 280 500 330 Q680 360 800 320 L800 500 L0 500 Z" fill="url(#groundLush)" />
          <path d="M0 380 Q320 330 600 370 Q720 390 800 360 L800 500 L0 500 Z" fill="#059669" opacity="0.6" />

          {/* Majestic Healthy Shade Tree on Left */}
          <g className="anim-sway">
            {/* Trunk */}
            <path d="M130 460 Q145 350 150 260 L185 260 Q180 350 205 460 Z" fill="#78350f" />
            <path d="M150 290 Q120 250 100 240" stroke="#78350f" strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M175 280 Q210 240 230 230" stroke="#78350f" strokeWidth="10" strokeLinecap="round" fill="none" />
            {/* Tree Canopy Clusters */}
            <circle cx="160" cy="200" r="75" fill="#10b981" />
            <circle cx="115" cy="210" r="55" fill="#34d399" />
            <circle cx="210" cy="195" r="60" fill="#059669" />
            <circle cx="160" cy="150" r="55" fill="#34d399" />
          </g>

          {/* Wildflowers & grass tufts */}
          <g>
            {/* Grass tufts */}
            <path d="M280 430 L275 410 M280 430 L285 412 M280 430 L282 408" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M520 440 L515 422 M520 440 L525 424" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M680 410 L675 395 M680 410 L685 397" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
            {/* Blossomed flowers */}
            <circle cx="310" cy="425" r="5" fill="#f43f5e" />
            <circle cx="310" cy="425" r="2" fill="#fef08a" />
            <circle cx="330" cy="435" r="4.5" fill="#38bdf8" />
            <circle cx="330" cy="435" r="1.8" fill="#fef08a" />
            <circle cx="560" cy="430" r="5.5" fill="#fbbf24" />
            <circle cx="560" cy="430" r="2" fill="#ffffff" />
            <circle cx="640" cy="415" r="5" fill="#ec4899" />
            <circle cx="640" cy="415" r="2" fill="#fef08a" />
          </g>
        </g>
      )}

      {level === 'MODERATE' && (
        <g>
          {/* Slightly Duller Green Hills */}
          <path d="M0 350 Q260 300 520 340 Q690 370 800 330 L800 500 L0 500 Z" fill="url(#groundDull)" />
          <path d="M0 390 Q340 345 620 380 Q740 400 800 375 L800 500 L0 500 Z" fill="#15803d" opacity="0.6" />

          {/* Slightly thinning tree on left */}
          <g className="anim-sway">
            <path d="M125 460 Q140 350 145 270 L175 270 Q170 350 190 460 Z" fill="#78350f" />
            <circle cx="155" cy="210" r="60" fill="#16a34a" />
            <circle cx="115" cy="220" r="45" fill="#4ade80" />
            <circle cx="195" cy="205" r="50" fill="#15803d" />
          </g>

          {/* Falling / drifting leaves */}
          <path d="M220 280 Q235 295 240 310" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M290 320 Q305 330 310 345" stroke="#84cc16" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      )}

      {level === 'HIGH' && (
        <g>
          {hazard === 'heat' && (
            <g>
              {/* Dry yellowed grass lawn */}
              <path d="M0 350 Q300 310 550 350 Q700 370 800 340 L800 500 L0 500 Z" fill="#ca8a04" opacity="0.8" />
              <path d="M0 390 Q350 350 630 385 L800 500 L0 500 Z" fill="#a16207" />
              {/* Heat baked terrain with minimal foliage */}
              <line x1="220" y1="410" x2="230" y2="400" stroke="#713f12" strokeWidth="2" />
              <line x1="580" y1="420" x2="590" y2="410" stroke="#713f12" strokeWidth="2" />
            </g>
          )}

          {hazard === 'drought' && (
            <g>
              {/* Cracked dry earth */}
              <path d="M0 350 Q280 320 540 350 Q710 370 800 340 L800 500 L0 500 Z" fill="url(#groundParched)" />
              {/* Dry soil fissures / cracks */}
              <path d="M140 420 L160 435 L155 455 M160 435 L180 440" stroke="#5c2c06" strokeWidth="2.5" fill="none" />
              <path d="M520 410 L540 425 L555 445 M540 425 L560 420" stroke="#5c2c06" strokeWidth="2.5" fill="none" />
              <path d="M640 430 L660 445 L675 460" stroke="#5c2c06" strokeWidth="2" fill="none" />
              {/* Drooping wilting sunflower / plant */}
              <path d="M260 440 Q270 410 260 380 Q250 365 240 370" stroke="#854d0e" strokeWidth="4" fill="none" strokeLinecap="round" />
              <circle cx="238" cy="372" r="8" fill="#a16207" />
              <path d="M255 410 Q240 415 235 425" stroke="#a16207" strokeWidth="3" fill="none" />
            </g>
          )}

          {hazard === 'flood' && (
            <g>
              {/* Saturated soil and growing water puddles */}
              <path d="M0 360 Q270 325 540 360 Q700 380 800 355 L800 500 L0 500 Z" fill="#334155" />
              {/* Large blue water puddles */}
              <ellipse cx="260" cy="430" rx="90" ry="24" fill="url(#floodWater)" />
              <ellipse cx="580" cy="420" rx="120" ry="28" fill="url(#floodWater)" />
              {/* Water ripple circles */}
              <ellipse cx="260" cy="430" rx="55" ry="14" stroke="#93c5fd" strokeWidth="1.5" fill="none" opacity="0.7" />
              <ellipse cx="580" cy="420" rx="70" ry="16" stroke="#93c5fd" strokeWidth="1.5" fill="none" opacity="0.7" />
            </g>
          )}
        </g>
      )}

      {level === 'EXTREME' && (
        <g>
          {hazard === 'heat' && (
            <g>
              {/* Scorched arid earth with intense heat glow */}
              <path d="M0 350 Q280 320 540 350 Q710 370 800 340 L800 500 L0 500 Z" fill="#7c2d12" />
              <path d="M0 390 Q350 355 650 390 L800 500 L0 500 Z" fill="#451a03" />
              {/* Emergency shade canopy structure */}
              <polygon points="340,240 500,240 530,265 310,265" fill="#fef08a" opacity="0.9" />
              <line x1="330" y1="265" x2="330" y2="400" stroke="#78350f" strokeWidth="5" />
              <line x1="510" y1="265" x2="510" y2="400" stroke="#78350f" strokeWidth="5" />
            </g>
          )}

          {hazard === 'drought' && (
            <g>
              {/* Severely parched cracked barren landscape */}
              <path d="M0 340 Q280 310 540 340 Q710 360 800 330 L800 500 L0 500 Z" fill="#78350f" />
              <path d="M0 380 Q320 340 600 375 L800 500 L0 500 Z" fill="#451a03" />
              {/* Deep earthquake/drought cracks */}
              <path d="M100 400 L140 430 L130 465 L170 480" stroke="#1c1917" strokeWidth="4" fill="none" />
              <path d="M140 430 L180 435 L210 460" stroke="#1c1917" strokeWidth="3" fill="none" />
              <path d="M480 395 L520 430 L505 470 L550 490" stroke="#1c1917" strokeWidth="4" fill="none" />
              <path d="M520 430 L560 435 L585 455" stroke="#1c1917" strokeWidth="3" fill="none" />
              <path d="M650 415 L685 445 L720 465" stroke="#1c1917" strokeWidth="3.5" fill="none" />
            </g>
          )}

          {hazard === 'flood' && (
            <g>
              {/* Submerged ground with raging water */}
              <path d="M0 360 Q280 340 540 360 Q710 370 800 350 L800 500 L0 500 Z" fill="#1e293b" />
              {/* Elevated safety sandbag embankment where Eco Terra stands */}
              <path d="M330 410 Q420 375 510 410 L510 480 L330 480 Z" fill="#b45309" stroke="#78350f" strokeWidth="3" />
              {/* Deep floodwater currents */}
              <rect x="0" y="415" width="800" height="90" fill="url(#floodWater)" />
              {/* Surging wave crests */}
              <path d="M20 430 Q80 415 140 430 Q200 445 260 430" stroke="#bfdbfe" strokeWidth="3" fill="none" />
              <path d="M540 435 Q600 420 660 435 Q720 450 780 435" stroke="#bfdbfe" strokeWidth="3" fill="none" />
            </g>
          )}
        </g>
      )}

      {/* 4. THE HERO CHARACTER: ECO TERRA */}
      {/* Dynamic Positioning, Facial Rigging, Props & Expressions */}
      {level === 'LOW' && (
        // ðŸŸ¢ LOW: Sitting/Relaxing happily under the tree
        <g transform="translate(190, 240)">
          {/* Relaxed leaning body */}
          <ellipse cx="200" cy="150" rx="46" ry="42" fill="url(#ecoSkin)" />
          {/* Ranger utility vest / straps */}
          <path d="M170 140 Q200 170 230 140" stroke="#065f46" strokeWidth="6" fill="none" />
          {/* Golden neckerchief / bandana */}
          <polygon points="182,128 218,128 200,146" fill="url(#bandanaGrad)" />
          <circle cx="200" cy="130" r="5" fill="#ca8a04" />

          {/* Eco Terra Sprout on head (swaying gently) */}
          <g className="anim-sprout">
            <path d="M200 108 Q200 85 195 72" stroke="#15803d" strokeWidth="4" fill="none" strokeLinecap="round" />
            {/* Sprout Leaf 1 */}
            <path d="M195 72 Q180 62 170 70 Q180 82 195 74 Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5" />
            {/* Sprout Leaf 2 */}
            <path d="M195 72 Q210 60 220 68 Q210 80 195 74 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
          </g>

          {/* Happy closed arched eyes (^ ^) */}
          <path d="M180 120 Q188 110 196 120" stroke="#092c24" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M204 120 Q212 110 220 120" stroke="#092c24" strokeWidth="3.5" fill="none" strokeLinecap="round" />

          {/* Rosy blush cheeks */}
          <circle cx="174" cy="126" r="6" fill="#f87171" opacity="0.65" />
          <circle cx="226" cy="126" r="6" fill="#f87171" opacity="0.65" />

          {/* Big happy relaxed smile */}
          <path d="M188 128 Q200 142 212 128" stroke="#092c24" strokeWidth="3" fill="#ffffff" strokeLinecap="round" />

          {/* Relaxed hands resting on lap */}
          <circle cx="165" cy="160" r="11" fill="#22c55e" />
          <circle cx="235" cy="160" r="11" fill="#22c55e" />
          {/* Sitting feet tucked */}
          <ellipse cx="180" cy="188" rx="16" ry="10" fill="#15803d" />
          <ellipse cx="220" cy="188" rx="16" ry="10" fill="#15803d" />
        </g>
      )}

      {level === 'MODERATE' && (
        // ðŸŸ¡ MODERATE: Standing alert, looking at sky, holding handheld environmental scanner
        <g transform="translate(200, 215)">
          {/* Standing rounded body */}
          <ellipse cx="200" cy="140" rx="44" ry="46" fill="url(#ecoSkin)" />
          {/* Utility vest straps */}
          <path d="M172 130 L185 170 M228 130 L215 170" stroke="#065f46" strokeWidth="5" strokeLinecap="round" />
          {/* Golden Bandana */}
          <polygon points="182,120 218,120 200,138" fill="url(#bandanaGrad)" />
          <circle cx="200" cy="122" r="5" fill="#ca8a04" />

          {/* Head sprout */}
          <g className="anim-sprout">
            <path d="M200 95 Q200 75 196 62" stroke="#15803d" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M196 62 Q180 52 170 60 Q180 72 196 64 Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5" />
            <path d="M196 62 Q212 50 222 58 Q212 70 196 64 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
          </g>

          {/* Curious eyes looking upwards at the sky */}
          <ellipse cx="186" cy="112" rx="6" ry="7" fill="#092c24" />
          <circle cx="188" cy="109" r="2.2" fill="#ffffff" />
          <ellipse cx="214" cy="112" rx="6" ry="7" fill="#092c24" />
          <circle cx="216" cy="109" r="2.2" fill="#ffffff" />

          {/* Inquisitive raised eyebrow */}
          <path d="M180 102 Q186 98 192 102" stroke="#092c24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M208 100 Q216 94 222 100" stroke="#092c24" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Subtle cautious small mouth (O) */}
          <ellipse cx="200" cy="126" rx="4" ry="3" fill="#092c24" />

          {/* Left hand holding high-tech handheld weather monitor gadget */}
          <g transform="translate(136, 115)">
            {/* Arm */}
            <path d="M42 25 Q25 20 18 15" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" fill="none" />
            {/* Handheld sensor body */}
            <rect x="0" y="0" width="22" height="32" rx="4" fill="#092c24" stroke="#a7f3d0" strokeWidth="1.5" />
            {/* Small glowing screen */}
            <rect x="3" y="4" width="16" height="14" rx="2" fill="#047857" />
            {/* Mini chart line on screen */}
            <path d="M5 14 L9 10 L13 13 L17 7" stroke="#34d399" strokeWidth="1.5" fill="none" />
            {/* Antenna with blinking warning LED */}
            <line x1="11" y1="0" x2="11" y2="-8" stroke="#092c24" strokeWidth="2" />
            <circle cx="11" cy="-9" r="3.5" fill="#eab308" className="anim-blink" />
            {/* Hand gripping gadget */}
            <circle cx="16" cy="18" r="6" fill="#16a34a" />
          </g>

          {/* Right arm slightly raised */}
          <path d="M228 140 Q245 135 252 120" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" fill="none" />
          <circle cx="254" cy="118" r="7" fill="#16a34a" />

          {/* Standing legs */}
          <ellipse cx="185" cy="186" rx="12" ry="12" fill="#15803d" />
          <ellipse cx="215" cy="186" rx="12" ry="12" fill="#15803d" />
        </g>
      )}

      {level === 'HIGH' && (
        // ðŸŸ  HIGH: Worried expression, sweating, specific hazard gear/activity
        <g transform="translate(200, 215)">
          {/* Main Body */}
          <ellipse cx="200" cy="140" rx="44" ry="46" fill="url(#ecoSkin)" />
          {/* Golden Bandana */}
          <polygon points="182,120 218,120 200,138" fill="url(#bandanaGrad)" />
          <circle cx="200" cy="122" r="5" fill="#ca8a04" />

          {/* Head sprout */}
          <g className="anim-sprout">
            <path d="M200 95 Q200 75 196 62" stroke="#15803d" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M196 62 Q180 52 170 60 Q180 72 196 64 Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5" />
            <path d="M196 62 Q212 50 222 58 Q212 70 196 64 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
          </g>

          {/* Worried Wide Eyes */}
          <ellipse cx="184" cy="114" rx="7" ry="8" fill="#ffffff" stroke="#092c24" strokeWidth="2" />
          <circle cx="184" cy="115" r="4" fill="#092c24" />
          <ellipse cx="216" cy="114" rx="7" ry="8" fill="#ffffff" stroke="#092c24" strokeWidth="2" />
          <circle cx="216" cy="115" r="4" fill="#092c24" />

          {/* Worried Angled Eyebrows */}
          <path d="M178 100 L192 106" stroke="#092c24" strokeWidth="3" strokeLinecap="round" />
          <path d="M222 100 L208 106" stroke="#092c24" strokeWidth="3" strokeLinecap="round" />

          {/* Wavy nervous mouth */}
          <path d="M188 130 Q194 135 200 130 Q206 125 212 130" stroke="#092c24" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Sweat drop on forehead */}
          <path d="M225 106 Q232 114 225 120 Q218 114 225 106 Z" fill="#38bdf8" />

          {/* Hazard-Specific Activity Props */}
          {hazard === 'heat' && (
            <g>
              {/* Hand shielding forehead */}
              <path d="M228 140 Q240 120 220 100" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" fill="none" />
              {/* Other hand holding fan or visor */}
              <path d="M172 140 Q150 145 140 135" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" fill="none" />
              {/* Handheld cooling fan */}
              <circle cx="130" cy="130" r="16" fill="#fde047" stroke="#eab308" strokeWidth="2" />
              <line x1="130" y1="130" x2="138" y2="148" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
            </g>
          )}

          {hazard === 'drought' && (
            <g>
              {/* Holding emergency canteen / water bottle */}
              <path d="M228 140 Q250 145 245 130" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" fill="none" />
              {/* Water canteen */}
              <rect x="238" y="115" width="14" height="22" rx="4" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
              <rect x="242" y="110" width="6" height="5" fill="#e2e8f0" />
              {/* Left hand gesturing down at parched soil */}
              <path d="M172 140 Q150 155 145 175" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" fill="none" />
            </g>
          )}

          {hazard === 'flood' && (
            <g>
              {/* Holding Umbrella */}
              <path d="M172 140 Q155 130 150 110" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" fill="none" />
              {/* Umbrella shaft & canopy */}
              <line x1="150" y1="120" x2="150" y2="40" stroke="#334155" strokeWidth="4" />
              <path d="M90 50 Q150 10 210 50 Z" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
              {/* Right arm bracing */}
              <path d="M228 140 Q245 150 250 165" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* Standing legs with slight nervous stance */}
          <ellipse cx="182" cy="186" rx="12" ry="12" fill="#15803d" />
          <ellipse cx="218" cy="186" rx="12" ry="12" fill="#15803d" />
        </g>
      )}

      {level === 'EXTREME' && (
        // ðŸ”´ EXTREME: Serious, determined, precautionary action, hazard protective gear
        <g transform="translate(200, 205)">
          {/* Main Body */}
          <ellipse cx="200" cy="140" rx="45" ry="46" fill="url(#ecoSkin)" />

          {/* Hazard-Specific Body Gear */}
          {hazard === 'flood' ? (
            // High-visibility life vest
            <path d="M165 125 Q200 115 235 125 L235 175 Q200 185 165 175 Z" fill="#ea580c" stroke="#c2410c" strokeWidth="2" />
          ) : hazard === 'heat' ? (
            // Thermal cooling harness & hydration straw
            <g>
              <path d="M170 130 L185 175 M230 130 L215 175" stroke="#0284c7" strokeWidth="6" />
              <circle cx="200" cy="155" r="8" fill="#38bdf8" />
            </g>
          ) : (
            // Drought emergency ration pack harness
            <g>
              <rect x="180" y="130" width="40" height="45" rx="5" fill="#78350f" stroke="#451a03" strokeWidth="2" />
              <line x1="200" y1="130" x2="200" y2="175" stroke="#fde047" strokeWidth="2" />
            </g>
          )}

          {/* Golden Bandana */}
          <polygon points="182,118 218,118 200,136" fill="url(#bandanaGrad)" />
          <circle cx="200" cy="120" r="5" fill="#ca8a04" />

          {/* Head sprout */}
          <g className="anim-sprout">
            <path d="M200 95 Q200 75 196 62" stroke="#15803d" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M196 62 Q180 52 170 60 Q180 72 196 64 Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5" />
            <path d="M196 62 Q212 50 222 58 Q212 70 196 64 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
          </g>

          {/* Serious, highly focused determined eyes */}
          <ellipse cx="184" cy="112" rx="7" ry="6" fill="#ffffff" stroke="#092c24" strokeWidth="2.5" />
          <circle cx="184" cy="112" r="3.5" fill="#092c24" />
          <ellipse cx="216" cy="112" rx="7" ry="6" fill="#ffffff" stroke="#092c24" strokeWidth="2.5" />
          <circle cx="216" cy="112" r="3.5" fill="#092c24" />

          {/* Strong focused brow line */}
          <path d="M174 104 L192 108" stroke="#092c24" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M226 104 L208 108" stroke="#092c24" strokeWidth="3.5" strokeLinecap="round" />

          {/* Firm resolute mouth */}
          <line x1="190" y1="128" x2="210" y2="128" stroke="#092c24" strokeWidth="3.5" strokeLinecap="round" />

          {/* Extreme Active Gear & Pose */}
          {hazard === 'flood' && (
            <g>
              {/* Holding emergency safety beacon with flashing red alert */}
              <path d="M228 135 Q255 125 260 110" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" fill="none" />
              {/* Flashing Beacon */}
              <rect x="252" y="85" width="16" height="28" rx="4" fill="#092c24" />
              <circle cx="260" cy="80" r="7" fill="#ef4444" className="anim-blink" />
              {/* Guiding arm pointing toward elevated high ground */}
              <path d="M172 135 Q140 120 120 110" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" fill="none" />
              <circle cx="118" cy="108" r="7" fill="#16a34a" />
            </g>
          )}

          {hazard === 'heat' && (
            <g>
              {/* Wearing UV solar protective shades */}
              <rect x="174" y="106" width="22" height="12" rx="3" fill="#0f172a" />
              <rect x="204" y="106" width="22" height="12" rx="3" fill="#0f172a" />
              <line x1="196" y1="112" x2="204" y2="112" stroke="#0f172a" strokeWidth="2.5" />
              {/* Drinking from hydration pack */}
              <path d="M228 140 Q235 155 215 140" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" fill="none" />
              <line x1="205" y1="130" x2="215" y2="140" stroke="#38bdf8" strokeWidth="3" />
            </g>
          )}

          {hazard === 'drought' && (
            <g>
              {/* Distributing emergency hydration canisters */}
              <path d="M228 140 Q255 145 250 160" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" fill="none" />
              <ellipse cx="255" cy="168" rx="14" ry="18" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
              <rect x="250" y="146" width="10" height="6" fill="#94a3b8" />
              {/* Left hand checking moisture telemetry tablet */}
              <path d="M172 140 Q150 135 145 125" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" fill="none" />
              <rect x="130" y="110" width="24" height="20" rx="3" fill="#092c24" stroke="#ef4444" strokeWidth="1.5" />
            </g>
          )}

          {/* Stepping forward firmly */}
          <ellipse cx="180" cy="186" rx="14" ry="12" fill="#15803d" />
          <ellipse cx="220" cy="186" rx="14" ry="12" fill="#15803d" />
        </g>
      )}
    </svg>
  );
};

