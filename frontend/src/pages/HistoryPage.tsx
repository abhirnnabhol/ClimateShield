import React, { useState, useEffect } from 'react';
import { BarChart2, Calendar, TrendingUp, RefreshCw, AlertCircle, Layers } from 'lucide-react';
import { api } from '../services/api';
import { RiskHistoryPoint } from '../types';
import { useAuth } from '../context/AuthContext';
import { RiskBadge } from '../components/RiskBadge';

export const HistoryPage: React.FC = () => {
  const { primaryLocation } = useAuth();
  const [days, setDays] = useState<number>(30);
  const [history, setHistory] = useState<RiskHistoryPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSeries, setActiveSeries] = useState<'overall' | 'heat' | 'drought' | 'flood'>('overall');

  const fetchHistory = async (d: number) => {
    setLoading(true);
    try {
      const res = await api.getRiskHistory({ days: d });
      setHistory(res.history || []);
    } catch (err) {
      console.error('History fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(days);
  }, [days, primaryLocation]);

  // Compute summary stats
  const scores = history.map((h) => {
    if (activeSeries === 'heat') return h.heatScore;
    if (activeSeries === 'drought') return h.droughtScore;
    if (activeSeries === 'flood') return h.floodScore;
    return h.overallScore;
  });

  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const getSeriesColor = (series: string) => {
    switch (series) {
      case 'heat':
        return '#d97706'; // Warm Amber
      case 'drought':
        return '#ea580c'; // Deep Orange
      case 'flood':
        return '#0284c7'; // Deep Blue
      default:
        return '#092c24'; // Deep Forest Green from reference design
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#c5e6db] pb-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#156550]">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Temporal Risk Progression</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-[#092c24] mt-1">
            Historical Environmental Trends
          </h1>
          <p className="text-xs text-[#375249] mt-0.5">
            Longitudinal multi-satellite and environmental sensor score tracking for{' '}
            <strong className="text-[#092c24]">
              {primaryLocation?.city || primaryLocation?.name || 'Monitored Primary Location'}
            </strong>
          </p>
        </div>

        {/* Days filter */}
        <div className="flex items-center gap-1 bg-[#eef8f4] p-1 rounded-full border border-[#c5e6db] text-xs">
          {[
            { label: '7 Days', val: 7 },
            { label: '30 Days', val: 30 },
            { label: '3 Months', val: 90 }
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setDays(item.val)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
                days === item.val
                  ? 'bg-[#092c24] text-white shadow-xs'
                  : 'text-[#156550] hover:text-[#092c24]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#c5e6db] shadow-sm">
          <div className="text-[10px] text-[#479b89] uppercase font-bold">Average Index</div>
          <div className="text-2xl font-black text-[#092c24] font-mono mt-1">{avgScore}</div>
          <div className="text-[10px] text-[#375249]">Over past {days} days</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#c5e6db] shadow-sm">
          <div className="text-[10px] text-[#479b89] uppercase font-bold">Peak Anomaly</div>
          <div className="text-2xl font-black text-red-600 font-mono mt-1">{maxScore}</div>
          <div className="text-[10px] text-[#375249]">Maximum recorded</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#c5e6db] shadow-sm">
          <div className="text-[10px] text-[#479b89] uppercase font-bold">Minimum Index</div>
          <div className="text-2xl font-black text-[#156550] font-mono mt-1">{minScore}</div>
          <div className="text-[10px] text-[#375249]">Baseline trough</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#c5e6db] shadow-sm">
          <div className="text-[10px] text-[#479b89] uppercase font-bold">Data Records</div>
          <div className="text-2xl font-black text-[#156550] font-mono mt-1">{history.length}</div>
          <div className="text-[10px] text-[#375249]">Evaluated timepoints</div>
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="p-6 rounded-3xl bg-white border border-[#c5e6db] shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-[#1e3a34]">Hazard Vector:</span>
            <div className="flex items-center gap-1 bg-[#eef8f4] p-1 rounded-full border border-[#c5e6db] text-xs">
              {(
                [
                  { id: 'overall', label: 'Overall Composite' },
                  { id: 'heat', label: '🔥 Heat' },
                  { id: 'drought', label: '💧 Drought' },
                  { id: 'flood', label: '🌧️ Flood' }
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSeries(s.id)}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
                    activeSeries === s.id
                      ? 'bg-[#092c24] text-white shadow-xs'
                      : 'text-[#156550] hover:text-[#092c24]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-[#375249] flex items-center gap-2 font-mono">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: getSeriesColor(activeSeries) }}
            />
            <span className="font-bold">Active: {activeSeries.toUpperCase()}</span>
          </div>
        </div>

        {/* Visual Chart Area */}
        {loading ? (
          <div className="h-64 flex items-center justify-center text-xs text-[#479b89] gap-2 font-bold">
            <RefreshCw className="w-5 h-5 animate-spin text-[#156550]" />
            <span>Loading historical time series...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-xs text-[#479b89] space-y-2">
            <AlertCircle className="w-6 h-6 text-[#99d2c2]" />
            <span>No historical records stored for this period yet.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* SVG Trend Line / Area Visualization */}
            <div className="relative h-64 w-full bg-[#f7fcf9] rounded-2xl border border-[#c5e6db] p-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
                {/* Horizontal grid lines */}
                <line x1="0" y1="50" x2="800" y2="50" stroke="#c5e6db" strokeDasharray="3,3" />
                <line x1="0" y1="100" x2="800" y2="100" stroke="#c5e6db" strokeDasharray="3,3" />
                <line x1="0" y1="150" x2="800" y2="150" stroke="#c5e6db" strokeDasharray="3,3" />

                {/* Draw SVG Polyline */}
                {(() => {
                  const points = history.map((pt, i) => {
                    const score =
                      activeSeries === 'heat'
                        ? pt.heatScore
                        : activeSeries === 'drought'
                        ? pt.droughtScore
                        : activeSeries === 'flood'
                        ? pt.floodScore
                        : pt.overallScore;
                    const x = (i / Math.max(1, history.length - 1)) * 800;
                    const y = 200 - (score / 100) * 190;
                    return `${x},${y}`;
                  });

                  const color = getSeriesColor(activeSeries);
                  return (
                    <>
                      <polygon
                        points={`0,200 ${points.join(' ')} 800,200`}
                        fill={color}
                        fillOpacity="0.12"
                      />
                      <polyline
                        points={points.join(' ')}
                        fill="none"
                        stroke={color}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  );
                })()}
              </svg>

              {/* Y Axis Labels */}
              <div className="absolute top-2 left-2 text-[10px] font-mono text-[#479b89]">100 - Extreme</div>
              <div className="absolute top-1/2 -translate-y-1/2 left-2 text-[10px] font-mono text-[#479b89]">50 - High</div>
              <div className="absolute bottom-2 left-2 text-[10px] font-mono text-[#479b89]">0 - Low</div>
            </div>

            {/* Timeline X-Axis Dates */}
            <div className="flex justify-between text-[11px] text-[#479b89] font-mono px-2">
              <span>{new Date(history[0]?.timestamp || Date.now()).toLocaleDateString()}</span>
              <span>{new Date(history[Math.floor(history.length / 2)]?.timestamp || Date.now()).toLocaleDateString()}</span>
              <span>{new Date(history[history.length - 1]?.timestamp || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
