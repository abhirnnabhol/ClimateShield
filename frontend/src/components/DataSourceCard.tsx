import React from 'react';
import { Database, CheckCircle2, AlertCircle, Info, ExternalLink } from 'lucide-react';

interface DataSourceCardProps {
  isDemo?: boolean;
  lastUpdated?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  onOpenMethodology?: () => void;
}

export const DataSourceCard: React.FC<DataSourceCardProps> = ({
  isDemo = false,
  lastUpdated,
  onRefresh,
  isLoading = false,
  onOpenMethodology
}) => {
  const sources = [
    {
      icon: '🌦️',
      name: 'Ambient Weather',
      provider: 'Open-Meteo Weather API',
      status: isDemo ? 'Demo Model' : 'Live Sensor Feed',
      statusType: isDemo ? 'demo' : 'live',
      metric: 'Temp, Apparent Temp, RH, Wind Speed, UV'
    },
    {
      icon: '🌧️',
      name: 'Precipitation & 7d Anomaly',
      provider: 'Open-Meteo Reanalysis',
      status: isDemo ? 'Demo Model' : 'Live Precipitation Sum',
      statusType: isDemo ? 'demo' : 'live',
      metric: 'Past 7 days accum, 24h influx, dry days'
    },
    {
      icon: '💧',
      name: 'Volumetric Soil Moisture',
      provider: 'Open-Meteo Soil Physics Model',
      status: isDemo ? 'Demo Model' : 'Live In-Situ Model',
      statusType: isDemo ? 'demo' : 'live',
      metric: '0-1cm topsoil & 1-3cm root zone water (m³/m³)'
    },
    {
      icon: '⛰️',
      name: 'Topography & Elevation',
      provider: 'Open-Meteo Digital Elevation Model (DEM)',
      status: isDemo ? 'Demo Model' : 'Live Shuttle Radar Topography',
      statusType: isDemo ? 'demo' : 'live',
      metric: 'Ground altitude (meters MSL) & slope runoff'
    },
    {
      icon: '🛰️',
      name: 'Land Surface Temp (LST)',
      provider: 'Open-Meteo 0cm Thermal + Daytime Offset',
      status: 'Model-Derived Hybrid',
      statusType: 'hybrid',
      metric: 'Skin surface radiative thermal flux (°C)'
    },
    {
      icon: '🌱',
      name: 'Vegetation Greenness (NDVI)',
      provider: 'Ecological Canopy Simulation Model',
      status: 'Simulated Proxy · Demo',
      statusType: 'simulated',
      metric: 'Latitude, moisture & canopy stress index'
    },
    {
      icon: '🗺️',
      name: 'Cartography Imagery',
      provider: 'CARTO Voyager / OpenStreetMap',
      status: 'Live Vector Tiles',
      statusType: 'live',
      metric: 'Slippy map tiles at global zoom tiers'
    }
  ];

  return (
    <div className="rounded-3xl bg-white border border-[#c5e6db] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e1f2ec] pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#156550]">
            <Database className="w-3.5 h-3.5" />
            <span>Data Transparency & Sensor Confidence</span>
          </div>
          <h3 className="text-xl font-black text-[#092c24] mt-1">Grounding & Source Verification</h3>
          <p className="text-xs text-[#375249] mt-0.5">
            Transparently identifying live public environmental APIs versus derived models and simulated proxies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenMethodology && (
            <button
              onClick={onOpenMethodology}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#eef8f4] hover:bg-[#d7f1e6] border border-[#c5e6db] text-xs font-bold text-[#092c24] transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-[#156550]" />
              <span>Data & Methodology</span>
            </button>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-full bg-white border border-[#c5e6db] text-xs font-bold text-[#156550] hover:text-[#092c24] transition-colors"
            >
              {isLoading ? 'Refreshing...' : 'Refresh Sensors'}
            </button>
          )}
        </div>
      </div>

      {/* Grid of Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {sources.map((src, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] hover:border-[#156550] transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{src.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#092c24]">{src.name}</h4>
                    <span className="text-[10px] text-[#479b89] font-medium">{src.provider}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    src.statusType === 'live'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : src.statusType === 'hybrid'
                      ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  {src.status}
                </span>
              </div>
              <p className="text-[11px] text-[#375249] mt-1 leading-snug">
                {src.metric}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer strip */}
      <div className="p-3.5 rounded-2xl bg-[#eef8f4] border border-[#c5e6db] flex flex-wrap items-center justify-between gap-2 text-xs text-[#1e3a34]">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#156550] flex-shrink-0" />
          <span>
            <strong>Honest Engineering Notice:</strong> Live environmental inputs are powered by open scientific APIs. Satellite NDVI canopy health is modeled as an empirical proxy.
          </span>
        </div>
        {lastUpdated && (
          <span className="text-[#479b89] font-mono text-[11px]">
            Telemetry synchronized: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};
