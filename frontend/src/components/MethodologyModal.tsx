import React from 'react';
import { X, Layers, Cpu, Database, Bell, Shield, ArrowDown, Activity, CheckCircle2 } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#092c24]/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#c5e6db] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e1f2ec] bg-[#f4fbf7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#092c24] text-[#a7f3d0] flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#156550]">
                System Architecture & Modeling Manifesto
              </span>
              <h2 className="text-lg font-black text-[#092c24]">Data, Methodology & Architecture</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#479b89] hover:text-[#092c24] hover:bg-[#eef8f4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 text-slate-800">
          {/* Section 1: Product Definition */}
          <div className="p-5 rounded-2xl bg-[#eef8f4] border border-[#c5e6db] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#156550]">
              <Shield className="w-4 h-4" />
              <span>Project Classification</span>
            </div>
            <h3 className="text-base font-black text-[#092c24]">
              Hyperlocal Climate Risk Assessment & Early Warning Prototype
            </h3>
            <p className="text-xs text-[#2d4940] leading-relaxed">
              ClimateShield aggregates open scientific atmospheric data, land surface hydrology, and terrain topography to evaluate localized vulnerability against <strong>Heat</strong>, <strong>Drought</strong>, and <strong>Flood</strong> hazards.
            </p>
            <div className="text-[11px] text-[#156550] font-semibold italic pt-1">
              * Notice: Built as an explainable risk prototype for environmental resilience. Not a certified emergency prediction system.
            </div>
          </div>

          {/* Section 2: End-to-End Technical Architecture Flow */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#156550]">
              <Cpu className="w-4 h-4" />
              <span>Technical Architecture Flow</span>
            </div>
            <h3 className="text-sm font-black text-[#092c24]">How Data Moves Across the Stack</h3>

            <div className="p-4 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] space-y-3">
              {[
                { stage: '1. USER / CLIENT', desc: 'React 18 + Vite SPA, Tailwind CSS, Leaflet Maps, Responsive UI' },
                { stage: '2. EXPRESS API GATEWAY', desc: 'Node.js/Express, JWT Authentication, CORS, Rate Protection, Caching' },
                { stage: '3. DATA INGESTION SERVICES', desc: 'Concurrently pulls Open-Meteo, DEM elevations, OSM geocoding with 5-min cache' },
                { stage: '4. CLIMATE RISK ENGINE', desc: 'Computes Rothfusz heat index, 7-day rainfall deficit, terrain drainage & saturation' },
                { stage: '5. PERSISTENCE DATABASE', desc: 'JSON/Local storage storing users, coordinates, 14-day history, and alerts' },
                { stage: '6. ALERT & NOTIFICATION ENGINE', desc: 'Evaluates severity thresholds and triggers multi-channel advisories (In-App, Email, SMS)' }
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#092c24] text-[#a7f3d0] flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[#092c24]">{step.stage}</div>
                    <div className="text-[11px] text-[#375249]">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Data Pipeline: Ingestion -> Normalization -> Risk Models -> Scores -> Signals -> Alerts */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#156550]">
              <Activity className="w-4 h-4" />
              <span>Pipeline & Methodology</span>
            </div>
            <h3 className="text-sm font-black text-[#092c24]">Mathematical Risk Pipeline</h3>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs">
              {[
                { name: '1. Ingestion', sub: 'Weather & Soil' },
                { name: '2. Normalization', sub: 'Regional Baseline' },
                { name: '3. Risk Models', sub: 'Physical Formulae' },
                { name: '4. Hazard Scores', sub: '0-100 Scale' },
                { name: '5. Early Signals', sub: '5-Stage Progression' },
                { name: '6. Alerts', sub: 'Threshold Trigger' }
              ].map((p, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-[#c5e6db] shadow-2xs">
                  <div className="font-bold text-[#092c24] text-[11px]">{p.name}</div>
                  <div className="text-[10px] text-[#479b89] mt-0.5">{p.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Honest Source Verification */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#156550]">
              <Database className="w-4 h-4" />
              <span>Honest Grounding: Real vs Simulated</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-800">Real Public APIs</span>
                <ul className="text-xs text-emerald-900 space-y-1 list-disc list-inside">
                  <li>Open-Meteo Weather</li>
                  <li>Open-Meteo Precipitation</li>
                  <li>Open-Meteo Soil Moisture</li>
                  <li>Open-Meteo Elevation DEM</li>
                  <li>OpenStreetMap Geocoding</li>
                  <li>CARTO Voyager Map Tiles</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-cyan-800">Model-Derived</span>
                <ul className="text-xs text-cyan-900 space-y-1 list-disc list-inside">
                  <li>Land Surface Temp (LST)</li>
                  <li>Rothfusz Heat Index</li>
                  <li>Soil Infiltration Saturation</li>
                  <li>Basin Drainage Gradient</li>
                  <li>7-Day Rainfall Deficit %</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-800">Simulated / Proxy</span>
                <ul className="text-xs text-amber-900 space-y-1 list-disc list-inside">
                  <li>NDVI Vegetation Proxy</li>
                  <li>Canopy Moisture Stress</li>
                  <li>What-If Climate Scenarios</li>
                  <li>Simulated Demo Alerts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e1f2ec] bg-[#f4fbf7] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#092c24] hover:bg-[#051c16] text-white text-xs font-bold transition-colors shadow-xs"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
