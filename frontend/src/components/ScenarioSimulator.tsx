import React, { useState } from 'react';
import { Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { ScenarioSimulationResult } from '../types';
import { RiskBadge } from './RiskBadge';

interface ScenarioSimulatorProps {
  latitude: number;
  longitude: number;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  latitude,
  longitude
}) => {
  const [tempChange, setTempChange] = useState<number>(5.0); // +5°C
  const [rainChange, setRainChange] = useState<number>(-30); // -30%
  const [humidityChange, setHumidityChange] = useState<number>(10); // +10%
  const [simResult, setSimResult] = useState<ScenarioSimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await api.simulateScenario({
        latitude,
        longitude,
        temperatureChange: tempChange,
        rainfallChange: rainChange,
        humidityChange
      });
      setSimResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTempChange(0);
    setRainChange(0);
    setHumidityChange(0);
    setSimResult(null);
  };

  return (
    <div className="rounded-3xl bg-white border border-[#c5e6db] p-6 sm:p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#156550]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive What-If Modeling</span>
          </div>
          <h3 className="text-xl font-black text-[#092c24] mt-1">Climate Scenario Simulation</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-[#d7f1e6] text-[#092c24] border border-[#a8dec9] px-3.5 py-1 rounded-full">
            Scenario simulation — not a forecast
          </span>
          {(tempChange !== 0 || rainChange !== 0 || humidityChange !== 0) && (
            <button
              onClick={handleReset}
              className="text-xs text-[#156550] hover:text-[#092c24] font-bold px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-[#375249] mb-6 leading-relaxed">
        Test how severe anomalies across temperature, precipitation, and humidity shift localized hazard profiles. Adjust the sliders below and recalculate against the risk engine.
      </p>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db]">
        {/* Temperature Delta Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#1e3a34]">Temperature</span>
            <span
              className={`font-mono font-bold ${
                tempChange > 0 ? 'text-red-600' : tempChange < 0 ? 'text-[#156550]' : 'text-[#375249]'
              }`}
            >
              {tempChange > 0 ? `+${tempChange}°C` : `${tempChange}°C`}
            </span>
          </div>
          <input
            type="range"
            min="-5"
            max="12"
            step="0.5"
            value={tempChange}
            onChange={(e) => setTempChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#c5e6db] rounded-lg appearance-none cursor-pointer accent-[#092c24]"
          />
          <div className="flex justify-between text-[11px] text-[#479b89] font-mono">
            <span>-5°C</span>
            <span>0°C</span>
            <span>+12°C</span>
          </div>
        </div>

        {/* Rainfall Delta Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#1e3a34]">Precipitation Variance</span>
            <span
              className={`font-mono font-bold ${
                rainChange > 0 ? 'text-[#156550]' : rainChange < 0 ? 'text-amber-700' : 'text-[#375249]'
              }`}
            >
              {rainChange > 0 ? `+${rainChange}%` : `${rainChange}%`}
            </span>
          </div>
          <input
            type="range"
            min="-80"
            max="150"
            step="5"
            value={rainChange}
            onChange={(e) => setRainChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-[#c5e6db] rounded-lg appearance-none cursor-pointer accent-[#092c24]"
          />
          <div className="flex justify-between text-[11px] text-[#479b89] font-mono">
            <span>-80%</span>
            <span>0%</span>
            <span>+150%</span>
          </div>
        </div>

        {/* Humidity Delta Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#1e3a34]">Atmospheric Humidity Shift</span>
            <span
              className={`font-mono font-bold ${
                humidityChange > 0 ? 'text-[#156550]' : humidityChange < 0 ? 'text-amber-700' : 'text-[#375249]'
              }`}
            >
              {humidityChange > 0 ? `+${humidityChange}%` : `${humidityChange}%`}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="5"
            value={humidityChange}
            onChange={(e) => setHumidityChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-[#c5e6db] rounded-lg appearance-none cursor-pointer accent-[#092c24]"
          />
          <div className="flex justify-between text-[11px] text-[#479b89] font-mono">
            <span>-50%</span>
            <span>0%</span>
            <span>+50%</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <button
          onClick={handleSimulate}
          disabled={loading}
          className="flex items-center gap-2 px-7 py-3 rounded-full bg-[#092c24] hover:bg-[#051c16] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#092c24]/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#a7f3d0]' : ''}`} />
          <span>{loading ? 'Evaluating Scenario...' : 'Run Scenario Simulation'}</span>
        </button>
      </div>

      {/* Simulation Result Comparison Card */}
      {simResult && (
        <div className="p-6 rounded-2xl bg-[#eef8f4] border border-[#c5e6db] space-y-4">
          <div className="flex items-center justify-between border-b border-[#c5e6db] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#092c24] uppercase tracking-wider">
                Scenario Impact Output
              </span>
              <RiskBadge level={simResult.simulated.overallLevel} size="sm" />
            </div>
            <div className="text-xs text-[#092c24] font-mono font-bold">
              Overall Score Delta:{' '}
              <span
                className={`font-black ${
                  simResult.delta.overallDelta > 0
                    ? 'text-red-600'
                    : simResult.delta.overallDelta < 0
                    ? 'text-[#156550]'
                    : 'text-[#375249]'
                }`}
              >
                {simResult.delta.overallDelta > 0
                  ? `+${simResult.delta.overallDelta}`
                  : simResult.delta.overallDelta}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Heat compare */}
            <div className="p-3.5 rounded-xl bg-white border border-[#c5e6db] shadow-2xs">
              <div className="text-[11px] text-[#479b89] uppercase font-bold">🔥 Heat Risk</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-slate-400 line-through text-xs font-mono">{simResult.baseline.heatScore}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#156550]" />
                <span className="text-xl font-bold text-[#092c24] font-mono">{simResult.simulated.heatScore}</span>
              </div>
            </div>

            {/* Drought compare */}
            <div className="p-3.5 rounded-xl bg-white border border-[#c5e6db] shadow-2xs">
              <div className="text-[11px] text-[#479b89] uppercase font-bold">💧 Drought Risk</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-slate-400 line-through text-xs font-mono">{simResult.baseline.droughtScore}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#156550]" />
                <span className="text-xl font-bold text-[#092c24] font-mono">{simResult.simulated.droughtScore}</span>
              </div>
            </div>

            {/* Flood compare */}
            <div className="p-3.5 rounded-xl bg-white border border-[#c5e6db] shadow-2xs">
              <div className="text-[11px] text-[#479b89] uppercase font-bold">🌧️ Flood Risk</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-slate-400 line-through text-xs font-mono">{simResult.baseline.floodScore}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#156550]" />
                <span className="text-xl font-bold text-[#092c24] font-mono">{simResult.simulated.floodScore}</span>
              </div>
            </div>

            {/* Overall compare */}
            <div className="p-3.5 rounded-xl bg-[#d7f1e6] border border-[#a8dec9] shadow-2xs">
              <div className="text-[11px] text-[#092c24] uppercase font-bold">Composite Index</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-slate-400 line-through text-xs font-mono">{simResult.baseline.overallScore}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#092c24]" />
                <span className="text-xl font-black text-[#092c24] font-mono">{simResult.simulated.overallScore}</span>
              </div>
            </div>
          </div>

          {/* Analysis bullet points */}
          <div className="pt-2 border-t border-[#c5e6db] space-y-1">
            {simResult.analysis.map((line, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#1e3a34]">
                <span className="text-[#156550] font-bold">•</span>
                <span className="font-medium">{line}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
