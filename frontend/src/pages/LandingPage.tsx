import React from 'react';
import {
  Shield,
  Compass,
  ArrowRight,
  Flame,
  Droplets,
  CloudRain,
  MapPin,
  Radar,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onGetStarted: () => void;
  onExplore: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExplore,
  onLogin
}) => {
  const { user } = useAuth();

  return (
    <div className="space-y-24 py-8">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 text-center max-w-5xl mx-auto px-4">
        {/* Ambient atmospheric backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-cyan-500/10 to-amber-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-emerald-400 mb-6 shadow-sm">
          <Radar className="w-3.5 h-3.5 animate-spin" />
          <span>Hyperlocal Environmental Early Warning Platform</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6">
          Understand climate risk <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            before it becomes a disaster.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
          Monitor your location, explore climate conditions anywhere, and receive explainable early warnings when environmental risks escalate.
        </p>

        {/* Call to action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95"
          >
            <span>{user ? 'Open Dashboard' : 'Get Started'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExplore}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white font-semibold text-sm transition-all hover:border-slate-600"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Explore Location</span>
          </button>

          {!user && (
            <button
              onClick={onLogin}
              className="px-6 py-3.5 rounded-xl text-slate-700 hover:text-blue-700 font-bold text-sm transition-colors"
            >
              Login
            </button>
          )}
        </div>

        {/* Interactive Geospatial Teaser Mockup */}
        <div className="mt-16 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase">🔥 Heat Stress</div>
                <div className="text-xl font-bold text-amber-400 font-mono">68 / 100</div>
                <div className="text-[10px] text-slate-500">Surface temp 41.5°C</div>
              </div>
              <div className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                HIGH RISK
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase">💧 Drought Anomaly</div>
                <div className="text-xl font-bold text-orange-400 font-mono">54 / 100</div>
                <div className="text-[10px] text-slate-500">Soil moisture 18%</div>
              </div>
              <div className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded">
                WATCH
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase">🌧️ Flood Runoff</div>
                <div className="text-xl font-bold text-emerald-400 font-mono">22 / 100</div>
                <div className="text-[10px] text-slate-500">Infiltration nominal</div>
              </div>
              <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                LOW RISK
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
            Automated Architecture
          </span>
          <h2 className="text-3xl font-black text-white mt-1">How ClimateShield Works</h2>
          <p className="text-sm text-slate-400 mt-2">
            A continuous loop from raw multi-satellite telemetry to explainable early warnings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            {
              step: '1',
              title: 'Register Location',
              desc: 'Select via coordinates, map pinpoint, or search geocoding.'
            },
            {
              step: '2',
              title: 'Monitor Environment',
              desc: 'Aggregates weather, rainfall, soil moisture, NDVI, and topography.'
            },
            {
              step: '3',
              title: 'Analyze Risk',
              desc: 'Evaluates physical hazard thresholds with transparent rule models.'
            },
            {
              step: '4',
              title: 'Detect Early Signals',
              desc: 'Flags early indicator drift across Normal, Watch, and High risk.'
            },
            {
              step: '5',
              title: 'Send Early Warning',
              desc: 'Dispatches 5-W bulletins with customized safety recommendations.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <span className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 font-mono font-bold text-sm flex items-center justify-center mb-4">
                  0{item.step}
                </span>
                <h3 className="text-sm font-bold text-white mb-1.5">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CLIMATE RISKS MONITORED */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-400">
            Initial Core Hazards
          </span>
          <h2 className="text-3xl font-black text-white mt-1">Targeted Climate Hazards</h2>
          <p className="text-sm text-slate-400 mt-2">
            High-resolution analysis specialized for localized environmental stress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Heat */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-500/10 to-slate-900 border border-amber-500/30">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mb-4">
              🔥
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Extreme Heat & Thermal Stress</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Combines wet-bulb heat index, infrared radiometric land surface temperature, and solar flux to warn of human exertion limits and crop burn.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 border-t border-slate-800 pt-3">
              <li>• Apparent temperature modeling</li>
              <li>• Daytime solar irradiance stress</li>
              <li>• High evaporative demand index</li>
            </ul>
          </div>

          {/* Drought */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-orange-500/10 to-slate-900 border border-orange-500/30">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-2xl mb-4">
              💧
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Drought & Soil Desiccation</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Tracks consecutive dry intervals, topsoil water depletion, and NDVI vegetation stress to deliver weeks-ahead agricultural warnings.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 border-t border-slate-800 pt-3">
              <li>• Precipitation anomaly detection</li>
              <li>• Volumetric root zone moisture</li>
              <li>• Satellite vegetation canopy index</li>
            </ul>
          </div>

          {/* Flood */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-cyan-500/10 to-slate-900 border border-cyan-500/30">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl mb-4">
              🌧️
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Flood & Flash Inundation</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Correlates 24-hour rainfall accumulation against terrain gradient slope and antecedent ground saturation to flag surface flooding.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 border-t border-slate-800 pt-3">
              <li>• 24h & 7d precipitation influx</li>
              <li>• Field capacity saturation %</li>
              <li>• Digital Elevation Model (DEM) basin</li>
            </ul>
          </div>
        </div>
      </section>

      {/* WHY CLIMATESHIELD */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="max-w-3xl mb-10">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
              The Climate Intelligence Advantage
            </span>
            <h2 className="text-3xl font-black text-white mt-1">Why ClimateShield?</h2>
            <p className="text-sm text-slate-400 mt-2">
              Unlike generic weather widgets, ClimateShield is purpose-built for actionability and proactive risk mitigation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Hyperlocal Precision</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Risk calibrated to exact geographic coordinates and elevation contours rather than generic broad district averages.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Transparent & Explainable</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every risk score is decomposed into measurable physical factors with explicit weights, eliminating opaque black-box confusion.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Early Signal Stepper</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Detects early anomaly trends (Watch & Signal states) allowing buffer time for irrigation shifts or asset fortification.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Role-Tailored Guidance</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Specific recommendations for Farmers (irrigation, harvest protection), Outdoor Workers (shift limits), and Residents.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>What-If Scenario Modeling</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interactive parameter simulation to test sensitivity against +3°C heatwaves or +30% torrential rainfall events.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Progressive Open Architecture</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Engineered to seamlessly ingest Sentinel, Copernicus, Open-Meteo, and local IoT sensor streams without redesign.
              </p>
            </div>
          </div>

          {/* Scientific Disclaimer (Prompt Requirement) */}
          <div className="mt-10 pt-6 border-t border-slate-800 text-xs text-slate-500 leading-relaxed flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <p>
              ClimateShield provides probabilistic risk assessments and diagnostic indicator trends derived from open meteorological and remote sensing models. It does not claim deterministic disaster prediction. Users should always consult official national meteorological agencies for binding emergency warnings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
