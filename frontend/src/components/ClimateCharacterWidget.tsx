import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  Droplets, 
  Sprout, 
  Sun, 
  CloudRain, 
  ChevronRight,
  Heart,
  Volume2
} from 'lucide-react';
import ecoCharacterImg from '../assets/eco_character.png';
import pyroCharacterImg from '../assets/pyro_character.jpg';
import droppyCharacterImg from '../assets/droppy_character.jpg';
import soliCharacterImg from '../assets/soli_character.jpg';

export interface ClimateGuardian {
  id: 'eco' | 'pyro' | 'droppy' | 'soli';
  name: string;
  title: string;
  hazard: string;
  themeColor: string;
  bgLight: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  image: string;
  score: number;
  emoji: string;
  greeting: string;
  tips: string[];
}

interface ClimateCharacterWidgetProps {
  overallScore?: number;
  overallLevel?: string;
  locationName?: string;
  heatScore?: number;
  droughtScore?: number;
  floodScore?: number;
  floating?: boolean; // If true, acts as bottom-right floating companion; if false, acts as in-page interactive squad hub
}

export const ClimateCharacterWidget: React.FC<ClimateCharacterWidgetProps> = ({
  overallScore = 32,
  overallLevel = 'MODERATE',
  locationName = 'Monitored Region',
  heatScore = 34,
  droughtScore = 35,
  floodScore = 15,
  floating = true
}) => {
  const [activeGuardianId, setActiveGuardianId] = useState<'eco' | 'pyro' | 'droppy' | 'soli'>('eco');
  const [isOpen, setIsOpen] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);

  // Define the 4 Climate Guardians with their personalized character logic
  const guardians: Record<'eco' | 'pyro' | 'droppy' | 'soli', ClimateGuardian> = {
    eco: {
      id: 'eco',
      name: 'Eco Terra',
      title: 'Chief Climate Guardian',
      hazard: 'Holistic Ecosystem Health',
      themeColor: '#156550',
      bgLight: 'from-[#f7fcf9] via-[#eef8f4] to-[#e1f2ec]',
      borderColor: '#a8dec9',
      badgeBg: 'bg-[#d7f1e6]',
      badgeText: 'text-[#092c24]',
      image: ecoCharacterImg,
      score: overallScore,
      emoji: '🌿',
      greeting: overallScore >= 60
        ? `⚠️ Eco Alert! Environmental stress in ${locationName} is elevated (${overallScore}/100). Our squad is tracking all 3 hazard vectors closely!`
        : `🌱 Hello friend! I'm Eco Terra. Ecosystem buffers in ${locationName} are in safe equilibrium (${overallScore}/100). All systems green!`,
      tips: [
        `🌱 Nature-based buffers: Preserving green tree cover lowers localized urban micro-temperatures by 2–4°C!`,
        `💡 Early Warning Philosophy: Recognizing 5–14 day telemetry anomalies prevents crisis emergencies before they strike.`,
        `🌍 Soil + Canopy = Resilience: Intercropping and soil mulching keeps ecological balance steady against heat spikes.`
      ]
    },
    pyro: {
      id: 'pyro',
      name: 'Pyro',
      title: 'Heat & Thermal Sentinel',
      hazard: 'Extreme Heat & Solar Index',
      themeColor: '#ea580c',
      bgLight: 'from-[#fff7ed] via-[#ffedd5] to-[#fed7aa]',
      borderColor: '#fdba74',
      badgeBg: 'bg-[#ffedd5]',
      badgeText: 'text-[#9a3412]',
      image: pyroCharacterImg,
      score: heatScore,
      emoji: '🔥',
      greeting: heatScore >= 50
        ? `🔥 Whew, it's scorching! Thermal stress in ${locationName} reached ${heatScore}/100. Wear your sun visor, stay hydrated, and protect livestock!`
        : `☀️ Sun's shining nicely! Current heat stress in ${locationName} is safe and nominal at ${heatScore}/100. Perfect time for outdoor tasks!`,
      tips: [
        `🔥 Afternoon Vigilance: Peak thermal load happens between 1:00 PM and 4:30 PM. Reschedule strenuous field work to early morning.`,
        `💧 Hydration Defense: Crops transpire up to 40% faster in high heat index. Check drip lines for continuous flow.`,
        `☀️ Livestock Care: Ensure shaded ventilation and cool drinking water to avoid severe animal thermal stress.`
      ]
    },
    droppy: {
      id: 'droppy',
      name: 'Droppy',
      title: 'Water & Flood Guardian',
      hazard: 'Rainfall & Surface Inundation',
      themeColor: '#0284c7',
      bgLight: 'from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd]',
      borderColor: '#7dd3fc',
      badgeBg: 'bg-[#e0f2fe]',
      badgeText: 'text-[#0369a1]',
      image: droppyCharacterImg,
      score: floodScore,
      emoji: '💧',
      greeting: floodScore >= 50
        ? `🌧️ Splash alert! Heavy precipitation or runoff detected near ${locationName} (${floodScore}/100). Avoid low crossings and secure drainage canals!`
        : `💧 Splash splash! Water runoff and precipitation in ${locationName} are comfortable at ${floodScore}/100. Reservoirs are stable!`,
      tips: [
        `🌧️ Flood Safety Rule: Never cross water-covered roadways. Even 6 inches of rapid water can stall vehicles or cause erosion.`,
        `🚜 Farm Trenching: Clean drainage furrows prevent crop root rot when sudden monsoon cloudbursts occur.`,
        `🌊 Rainfall Harvesting: Storing excess surface runoff during rain events buffers your farm against the dry season!`
      ]
    },
    soli: {
      id: 'soli',
      name: 'Soli',
      title: 'Soil & Drought Guardian',
      hazard: 'Soil Moisture & Aridity',
      themeColor: '#b45309',
      bgLight: 'from-[#fefce8] via-[#fef9c3] to-[#fef08a]',
      borderColor: '#fde047',
      badgeBg: 'bg-[#fef9c3]',
      badgeText: 'text-[#854d0e]',
      image: soliCharacterImg,
      score: droughtScore,
      emoji: '🌱',
      greeting: droughtScore >= 45
        ? `🌾 Soil thirst warning! Subsurface moisture in ${locationName} is dropping (${droughtScore}/100). Apply mulch and switch to evening drip irrigation!`
        : `🌰 Rich moist earth! Soil root-zone moisture in ${locationName} is well-hydrated at ${droughtScore}/100. Seedlings are thriving!`,
      tips: [
        `🌾 Mulch Magic: Spreading straw or crop residue around roots cuts daytime evaporation loss by up to 35%!`,
        `💧 Evening Irrigation: Watering in the cool late evening allows soil roots to soak up 90% of moisture before sun heat returns.`,
        `🌱 Crop Rotation: Deep-taproot crops bring minerals and moisture upward to support shallower surrounding crops during dry spells.`
      ]
    }
  };

  const active = guardians[activeGuardianId];

  const handleSwitchGuardian = (id: 'eco' | 'pyro' | 'droppy' | 'soli') => {
    setIsWiggling(true);
    setActiveGuardianId(id);
    setTipIndex(0);
    setTimeout(() => setIsWiggling(false), 600);
  };

  const handleNextTip = () => {
    setIsWiggling(true);
    setTipIndex((prev) => (prev + 1) % active.tips.length);
    setTimeout(() => setIsWiggling(false), 500);
  };

  // IN-PAGE INTERACTIVE SQUAD HUB (Displayed directly on Dashboard)
  if (!floating) {
    return (
      <div className="rounded-3xl bg-white border-2 border-[#a8dec9] shadow-lg overflow-hidden space-y-0 animate-in fade-in duration-300">
        {/* Top Squad Selector Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#092c24] via-[#156550] to-[#092c24] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                <span>🛡️</span>
                <span>The Climate Guardians Squad</span>
              </span>
              <span className="text-[10px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full text-emerald-200">
                4 Active Sentinels
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              Meet your 2D mascot team monitoring Heat, Flood, Drought &amp; Ecosystem health in {locationName}.
            </p>
          </div>

          {/* Interactive Character Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-black/25 p-1.5 rounded-2xl border border-white/15 overflow-x-auto">
            {Object.values(guardians).map((g) => {
              const isSelected = g.id === activeGuardianId;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleSwitchGuardian(g.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-white text-[#092c24] shadow-md scale-105'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <img src={g.image} alt={g.name} className="w-5 h-5 rounded-full object-contain" />
                  <span>{g.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Character Stage */}
        <div className={`p-6 sm:p-7 bg-gradient-to-br ${active.bgLight} border-t border-[#c5e6db] flex flex-col md:flex-row items-center gap-6 sm:gap-8`}>
          {/* Character Avatar Showcase */}
          <div className="relative shrink-0">
            <div 
              className={`w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-white border-3 shadow-xl overflow-hidden p-2 flex items-center justify-center transition-all cursor-pointer group hover:scale-105 ${
                isWiggling ? 'scale-110 rotate-2' : ''
              }`}
              style={{ borderColor: active.borderColor }}
              onClick={handleNextTip}
              title={`Click to hear more tips from ${active.name}!`}
            >
              <img
                src={active.image}
                alt={active.name}
                className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
              />
            </div>
            <span 
              className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-xs whitespace-nowrap`}
              style={{ backgroundColor: active.themeColor }}
            >
              {active.emoji} {active.hazard.split('&')[0]}
            </span>
          </div>

          {/* Character Speech Bubble & Analysis */}
          <div className="space-y-3 flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h4 className="text-lg font-black text-[#092c24] flex items-center gap-1.5">
                <span>{active.name}</span>
                <span className="text-xs font-semibold text-[#479b89]">· {active.title}</span>
              </h4>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-black/10 ${active.badgeBg} ${active.badgeText}`}>
                Hazard Score: {active.score}/100
              </span>
            </div>

            {/* Live Message Bubble */}
            <div className="p-4 rounded-2xl bg-white/95 border-2 shadow-xs text-left relative" style={{ borderColor: active.borderColor }}>
              <p className="text-xs sm:text-sm font-semibold text-[#092c24] leading-relaxed">
                "{active.greeting}"
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium italic">
                  💡 {active.tips[tipIndex]}
                </span>
              </div>
            </div>

            {/* Actions & Squad Quick Selector */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleNextTip}
                className="px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-[#092c24] hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Ask {active.name} another tip →</span>
              </button>

              <span className="text-[11px] text-[#375249] font-medium hidden sm:inline">
                Tap any guardian above to switch advisors!
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Squad Strip: mini cards for all 4 mascots */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-white border-t border-slate-100 text-xs">
          {Object.values(guardians).map((g) => {
            const isCurrent = g.id === activeGuardianId;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => handleSwitchGuardian(g.id)}
                className={`p-3 text-left transition-colors flex items-center gap-2.5 cursor-pointer ${
                  isCurrent ? 'bg-slate-50/90 font-bold' : 'hover:bg-slate-50/50'
                }`}
              >
                <img src={g.image} alt={g.name} className="w-10 h-10 rounded-xl object-contain bg-slate-50 border border-slate-200 p-0.5 shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-xs font-black text-[#092c24] truncate flex items-center gap-1">
                    <span>{g.name}</span>
                    <span>{g.emoji}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{g.hazard.split('&')[0]}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // FLOATING COMPANION MODE (bottom-right floating bubble + mascot trigger)
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end select-none">
      {/* Speech Bubble */}
      {isOpen && (
        <div className="mb-3 max-w-xs sm:max-w-sm bg-white rounded-3xl border-2 shadow-2xl p-4 relative animate-in fade-in slide-in-from-bottom-3 duration-200" style={{ borderColor: active.borderColor }}>
          {/* Header with Guardian Selector Pills */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{active.emoji}</span>
              <span className="text-xs font-black text-[#092c24]">{active.name}</span>
              <span className="text-[9px] uppercase font-bold text-slate-400">· Guardian</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              title="Minimize mascot"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mini Character Switcher in floating popover */}
          <div className="flex items-center justify-between gap-1 mb-2.5 bg-slate-100/70 p-1 rounded-xl">
            {Object.values(guardians).map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => handleSwitchGuardian(g.id)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                  g.id === activeGuardianId 
                    ? 'bg-white shadow-xs text-[#092c24]' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{g.emoji}</span>
                <span className="hidden xs:inline">{g.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Active Guardian Dialogue */}
          <p className="text-xs text-[#1e3a34] font-medium leading-relaxed mb-2.5">
            "{active.greeting}"
          </p>

          {/* Extra tip */}
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-slate-600 mb-2">
            💡 {active.tips[tipIndex]}
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
            <span className="text-[#479b89] font-mono text-[10px]">
              {locationName} ({active.score}/100)
            </span>
            <button
              onClick={handleNextTip}
              className="font-bold text-[#156550] hover:text-[#092c24] flex items-center gap-1 text-[11px]"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Next tip</span>
            </button>
          </div>

          {/* Pointer tail */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r-2 border-b-2 rotate-45" style={{ borderColor: active.borderColor }} />
        </div>
      )}

      {/* Mascot Trigger Button with Squad Avatar */}
      <div className="relative group cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-3 shadow-2xl overflow-hidden flex items-center justify-center p-1 transition-all transform hover:scale-110 active:scale-95 ${
            isOpen ? 'ring-4 ring-[#092c24]/20' : 'animate-bounce'
          }`}
          style={{ borderColor: active.borderColor }}
        >
          <img
            src={active.image}
            alt={active.name}
            className="w-full h-full object-contain filter drop-shadow-xs"
          />
        </div>

        {/* Hazard Badge on Avatar */}
        <span
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-black shadow-xs"
          style={{ backgroundColor: active.themeColor, color: '#ffffff' }}
          title={`${active.name} (${active.hazard})`}
        >
          {active.emoji}
        </span>
      </div>
    </div>
  );
};
