import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wind, 
  MapPin, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Info, 
  Calendar, 
  Clock, 
  HeartHandshake, 
  Users, 
  Sparkles, 
  ExternalLink, 
  HelpCircle,
  Eye,
  Sun,
  Flame,
  CloudFog,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AirQualityData } from '../types';

interface AirQualityPageProps {
  onOpenLocationModal?: () => void;
}

export const AirQualityPage: React.FC<AirQualityPageProps> = ({ onOpenLocationModal }) => {
  const { primaryLocation } = useAuth();
  
  // Active coordinates
  const [coords, setCoords] = useState<{ lat: number; lon: number; name: string }>({
    lat: primaryLocation?.latitude || 19.076,
    lon: primaryLocation?.longitude || 72.877,
    name: primaryLocation?.name || 'Mumbai, Maharashtra'
  });

  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Forecast chart controls
  const [timeHorizon, setTimeHorizon] = useState<'24h' | '48h' | '5d'>('24h');
  const [selectedPollutant, setSelectedPollutant] = useState<string>('indiaAqi');
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; time: string; value: number | null } | null>(null);

  // Sync coords when primaryLocation changes
  useEffect(() => {
    if (primaryLocation) {
      setCoords({
        lat: primaryLocation.latitude,
        lon: primaryLocation.longitude,
        name: primaryLocation.name
      });
    }
  }, [primaryLocation]);

  // Fetch air quality on coordinate changes
  useEffect(() => {
    fetchAirQuality(coords.lat, coords.lon);
  }, [coords.lat, coords.lon]);

  const fetchAirQuality = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAirQuality(lat, lon);
      if (res && res.airQuality) {
        setData(res.airQuality);
      } else {
        throw new Error('No air quality payload received');
      }
    } catch (err) {
      console.error('Failed to load air quality:', err);
      setError((err as Error).message || 'Unable to retrieve air quality data from atmospheric models.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAirQuality(coords.lat, coords.lon);
  };

  // Pollutant catalog metadata
  const pollutantCatalog = [
    {
      key: 'pm2_5',
      name: 'PM2.5',
      fullName: 'Fine Particulate Matter',
      formula: 'PM₂.₅',
      unit: data?.currentUnits.pm2_5 || 'μg/m³',
      desc: 'Microscopic aerosol particles ≤2.5 microns that penetrate deeply into pulmonary alveoli and the bloodstream.',
      standard: 'WHO 24h Guideline: 15 μg/m³ · EPA: 35 μg/m³',
      getTier: (v: number | null) => {
        if (v === null) return { label: 'Unavailable', color: 'text-slate-500', bg: 'bg-slate-100', dot: '⚪' };
        if (v <= 12) return { label: 'Good', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: '🟢' };
        if (v <= 35.4) return { label: 'Moderate', color: 'text-amber-700', bg: 'bg-amber-50', dot: '🟡' };
        if (v <= 55.4) return { label: 'Sensitive Watch', color: 'text-orange-700', bg: 'bg-orange-50', dot: '🟠' };
        if (v <= 150.4) return { label: 'Unhealthy', color: 'text-red-700', bg: 'bg-red-50', dot: '🔴' };
        return { label: 'Hazardous', color: 'text-purple-700', bg: 'bg-purple-50', dot: '🟣' };
      }
    },
    {
      key: 'pm10',
      name: 'PM10',
      fullName: 'Coarse Particulate Matter',
      formula: 'PM₁₀',
      unit: data?.currentUnits.pm10 || 'μg/m³',
      desc: 'Inhalable particulate matter ≤10 microns, composed of road dust, mechanical debris, and pollen.',
      standard: 'WHO 24h Guideline: 45 μg/m³ · EPA: 150 μg/m³',
      getTier: (v: number | null) => {
        if (v === null) return { label: 'Unavailable', color: 'text-slate-500', bg: 'bg-slate-100', dot: '⚪' };
        if (v <= 54) return { label: 'Good', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: '🟢' };
        if (v <= 154) return { label: 'Moderate', color: 'text-amber-700', bg: 'bg-amber-50', dot: '🟡' };
        if (v <= 254) return { label: 'Unhealthy', color: 'text-orange-700', bg: 'bg-orange-50', dot: '🟠' };
        return { label: 'Hazardous', color: 'text-purple-700', bg: 'bg-purple-50', dot: '🟣' };
      }
    },
    {
      key: 'nitrogenDioxide',
      name: 'NO₂',
      fullName: 'Nitrogen Dioxide',
      formula: 'NO₂',
      unit: data?.currentUnits.nitrogenDioxide || 'μg/m³',
      desc: 'Reactive reddish-brown gas emitted primarily from motor vehicles, power stations, and fossil combustion.',
      standard: 'WHO 24h Guideline: 25 μg/m³ · 1h: 200 μg/m³',
      getTier: (v: number | null) => {
        if (v === null) return { label: 'Unavailable', color: 'text-slate-500', bg: 'bg-slate-100', dot: '⚪' };
        if (v <= 40) return { label: 'Low', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: '🟢' };
        if (v <= 90) return { label: 'Moderate', color: 'text-amber-700', bg: 'bg-amber-50', dot: '🟡' };
        if (v <= 180) return { label: 'High', color: 'text-orange-700', bg: 'bg-orange-50', dot: '🟠' };
        return { label: 'Very High', color: 'text-red-700', bg: 'bg-red-50', dot: '🔴' };
      }
    },
    {
      key: 'sulphurDioxide',
      name: 'SO₂',
      fullName: 'Sulfur Dioxide',
      formula: 'SO₂',
      unit: data?.currentUnits.sulphurDioxide || 'μg/m³',
      desc: 'Pungent toxic gas generated by burning coal/heavy fuel oil and smelting of sulfur-bearing mineral ores.',
      standard: 'WHO 24h Guideline: 40 μg/m³',
      getTier: (v: number | null) => {
        if (v === null) return { label: 'Unavailable', color: 'text-slate-500', bg: 'bg-slate-100', dot: '⚪' };
        if (v <= 20) return { label: 'Good', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: '🟢' };
        if (v <= 50) return { label: 'Moderate', color: 'text-amber-700', bg: 'bg-amber-50', dot: '🟡' };
        if (v <= 150) return { label: 'Elevated', color: 'text-orange-700', bg: 'bg-orange-50', dot: '🟠' };
        return { label: 'Hazardous', color: 'text-red-700', bg: 'bg-red-50', dot: '🔴' };
      }
    },
    {
      key: 'nitrogenMonoxide',
      name: 'NO',
      fullName: 'Nitrogen Monoxide',
      formula: 'NO',
      unit: data?.currentUnits.nitrogenMonoxide || 'μg/m³',
      desc: 'Direct primary combustion byproduct. Highly reactive precursor that oxidizes rapidly into NO₂ in ambient air.',
      standard: 'No standalone ambient health threshold; acts as key chemical precursor to NO₂ and Ozone.',
      getTier: (_v: number | null) => ({ label: 'Precursor Gas', color: 'text-blue-700', bg: 'bg-blue-50', dot: '🔵' })
    },
    {
      key: 'ozone',
      name: 'Ozone',
      fullName: 'Ground-Level Ozone',
      formula: 'O₃',
      unit: data?.currentUnits.ozone || 'μg/m³',
      desc: 'Secondary photochemical oxidant produced on hot sunny afternoons via sunlight interactions with NOx and VOCs.',
      standard: 'WHO 8h Guideline: 100 μg/m³ · Peaks during sunny daytime',
      getTier: (v: number | null) => {
        if (v === null) return { label: 'Unavailable', color: 'text-slate-500', bg: 'bg-slate-100', dot: '⚪' };
        if (v <= 60) return { label: 'Good', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: '🟢' };
        if (v <= 120) return { label: 'Moderate', color: 'text-amber-700', bg: 'bg-amber-50', dot: '🟡' };
        if (v <= 180) return { label: 'Elevated', color: 'text-orange-700', bg: 'bg-orange-50', dot: '🟠' };
        return { label: 'High', color: 'text-red-700', bg: 'bg-red-50', dot: '🔴' };
      }
    },
    {
      key: 'carbonMonoxide',
      name: 'CO',
      fullName: 'Carbon Monoxide',
      formula: 'CO',
      unit: data?.currentUnits.carbonMonoxide || 'μg/m³',
      desc: 'Odorless, toxic gas produced by incomplete combustion of organic fuels, vehicular exhaust, and biomass burning.',
      standard: 'WHO 24h Guideline: 4,000 μg/m³ (4 mg/m³)',
      getTier: (v: number | null) => {
        if (v === null) return { label: 'Unavailable', color: 'text-slate-500', bg: 'bg-slate-100', dot: '⚪' };
        if (v <= 2000) return { label: 'Safe', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: '🟢' };
        if (v <= 5000) return { label: 'Moderate', color: 'text-amber-700', bg: 'bg-amber-50', dot: '🟡' };
        return { label: 'Elevated', color: 'text-orange-700', bg: 'bg-orange-50', dot: '🟠' };
      }
    },
    {
      key: 'carbonDioxide',
      name: 'CO₂',
      fullName: 'Carbon Dioxide (Outdoor)',
      formula: 'CO₂',
      unit: data?.currentUnits.carbonDioxide || 'ppm',
      desc: 'Global background greenhouse gas. Outdoor ambient concentrations reflect planetary mixing and regional industrial fluxes.',
      standard: 'Outdoor planetary background ~420 ppm. Note: this outdoor estimate is not an indoor air monitor.',
      getTier: (_v: number | null) => ({ label: 'Greenhouse Flux', color: 'text-slate-700', bg: 'bg-slate-100', dot: '🌐' })
    },
    {
      key: 'dust',
      name: 'Dust',
      fullName: 'Atmospheric Mineral Dust',
      formula: 'Dust',
      unit: data?.currentUnits.dust || 'μg/m³',
      desc: 'Modeled mass concentration of mineral crustal dust and arid soil particulates transported across regional air currents.',
      standard: 'Aerosol optical density indicator; elevated during arid winds and sandstorms.',
      getTier: (v: number | null) => {
        if (v === null) return { label: 'Unavailable', color: 'text-slate-500', bg: 'bg-slate-100', dot: '⚪' };
        if (v <= 20) return { label: 'Clear', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: '🟢' };
        if (v <= 50) return { label: 'Moderate', color: 'text-amber-700', bg: 'bg-amber-50', dot: '🟡' };
        if (v <= 100) return { label: 'Dusty', color: 'text-orange-700', bg: 'bg-orange-50', dot: '🟠' };
        return { label: 'Severe Dust', color: 'text-red-700', bg: 'bg-red-50', dot: '🔴' };
      }
    },
    {
      key: 'uvIndex',
      name: 'UV Index',
      fullName: 'Solar UV Radiation Index',
      formula: 'UV',
      unit: 'Index',
      desc: 'Measure of erythemal solar ultraviolet irradiance on the horizontal surface during daylight hours.',
      standard: 'WHO Scale: 0–2 Low · 3–5 Moderate · 6–7 High · 8–10 Very High · 11+ Extreme',
      getTier: (v: number | null) => {
        if (v === null) return { label: 'Unavailable', color: 'text-slate-500', bg: 'bg-slate-100', dot: '⚪' };
        if (v <= 2) return { label: 'Low (0–2)', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: '🟢' };
        if (v <= 5) return { label: 'Moderate (3–5)', color: 'text-amber-700', bg: 'bg-amber-50', dot: '🟡' };
        if (v <= 7) return { label: 'High (6–7)', color: 'text-orange-700', bg: 'bg-orange-50', dot: '🟠' };
        if (v <= 10) return { label: 'Very High (8–10)', color: 'text-red-700', bg: 'bg-red-50', dot: '🔴' };
        return { label: 'Extreme (11+)', color: 'text-purple-700', bg: 'bg-purple-50', dot: '🟣' };
      }
    }
  ];

  // Helper for trend icon
  const getTrendIcon = (trend: 'increasing' | 'stable' | 'decreasing') => {
    if (trend === 'increasing') return <TrendingUp className="w-3.5 h-3.5 text-red-500" />;
    if (trend === 'decreasing') return <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  // Slice hourly forecast data according to time horizon
  const slicedHourly = useMemo(() => {
    if (!data || !data.hourly.time) return { times: [], values: [] };
    const limit = timeHorizon === '24h' ? 24 : timeHorizon === '48h' ? 48 : 120;
    const times = data.hourly.time.slice(0, limit);
    const rawValues = (data.hourly as any)[selectedPollutant] as (number | null)[] | undefined;
    const values = (rawValues || []).slice(0, limit);
    return { times, values };
  }, [data, timeHorizon, selectedPollutant]);

  // Compute stats for the chart
  const chartMetrics = useMemo(() => {
    const validVals = slicedHourly.values.filter((v): v is number => v !== null && !isNaN(v));
    if (validVals.length === 0) return { min: 0, max: 100, avg: 0, peakIndex: -1 };
    const min = Math.min(...validVals);
    const max = Math.max(...validVals);
    const avg = Math.round(validVals.reduce((a, b) => a + b, 0) / validVals.length);
    const peakIndex = slicedHourly.values.indexOf(max);
    return { min, max: Math.max(max, min + 10), avg, peakIndex };
  }, [slicedHourly]);

  // X-axis time intervals for the chart
  const xTicks = useMemo(() => {
    const n = slicedHourly.times.length;
    if (n < 2) return [];
    const ticks: { index: number; label: string; subLabel: string }[] = [];
    
    if (timeHorizon === '24h') {
      const step = 4;
      for (let i = 0; i < n; i += step) {
        const d = new Date(slicedHourly.times[i]);
        ticks.push({
          index: i,
          label: d.toLocaleTimeString([], { hour: 'numeric' }),
          subLabel: i === 0 ? 'Now' : `+${i}h`
        });
      }
      if (ticks[ticks.length - 1].index !== n - 1) {
        const d = new Date(slicedHourly.times[n - 1]);
        ticks.push({
          index: n - 1,
          label: d.toLocaleTimeString([], { hour: 'numeric' }),
          subLabel: `+${n - 1}h`
        });
      }
    } else if (timeHorizon === '48h') {
      const step = 12;
      for (let i = 0; i < n; i += step) {
        const d = new Date(slicedHourly.times[i]);
        ticks.push({
          index: i,
          label: d.toLocaleDateString([], { weekday: 'short', hour: 'numeric' }),
          subLabel: i === 0 ? 'Now' : `+${i}h`
        });
      }
      if (ticks[ticks.length - 1].index !== n - 1) {
        const d = new Date(slicedHourly.times[n - 1]);
        ticks.push({
          index: n - 1,
          label: d.toLocaleDateString([], { weekday: 'short', hour: 'numeric' }),
          subLabel: `+${n - 1}h`
        });
      }
    } else {
      const step = 24;
      for (let i = 0; i < n; i += step) {
        const d = new Date(slicedHourly.times[i]);
        ticks.push({
          index: i,
          label: d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
          subLabel: i === 0 ? 'Today' : `Day ${Math.floor(i / 24) + 1}`
        });
      }
      if (ticks[ticks.length - 1].index !== n - 1 && n - 1 - ticks[ticks.length - 1].index >= 12) {
        const d = new Date(slicedHourly.times[n - 1]);
        ticks.push({
          index: n - 1,
          label: d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
          subLabel: 'Day 5'
        });
      }
    }
    return ticks;
  }, [slicedHourly.times, timeHorizon]);

  // Health status categorization for inspected values
  const getPointCategory = (val: number | null) => {
    if (val === null) return { label: 'No Data', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' };
    if (selectedPollutant === 'indiaAqi') {
      if (val <= 50) return { label: 'Good (0–50)', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' };
      if (val <= 100) return { label: 'Satisfactory (51–100)', bg: 'bg-lime-50', text: 'text-lime-800', border: 'border-lime-300' };
      if (val <= 200) return { label: 'Moderate (101–200)', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' };
      if (val <= 300) return { label: 'Poor (201–300)', bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-300' };
      if (val <= 400) return { label: 'Very Poor (301–400)', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300' };
      if (val <= 500) return { label: 'Severe (401–500)', bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-400' };
      return { label: 'Severe+ Emergency (500–1000)', bg: 'bg-purple-100', text: 'text-purple-950', border: 'border-purple-500' };
    }
    if (selectedPollutant === 'usAqi') {
      if (val <= 50) return { label: 'Good', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' };
      if (val <= 100) return { label: 'Moderate', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' };
      if (val <= 150) return { label: 'Unhealthy for Sensitive', bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-300' };
      if (val <= 200) return { label: 'Unhealthy', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300' };
      if (val <= 300) return { label: 'Very Unhealthy', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300' };
      return { label: 'Hazardous', bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-300' };
    }
    if (selectedPollutant === 'europeanAqi') {
      if (val <= 20) return { label: 'Good', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' };
      if (val <= 40) return { label: 'Fair', bg: 'bg-lime-50', text: 'text-lime-800', border: 'border-lime-300' };
      if (val <= 60) return { label: 'Moderate', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' };
      if (val <= 80) return { label: 'Poor', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300' };
      if (val <= 100) return { label: 'Very Poor', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300' };
      return { label: 'Extremely Poor', bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-300' };
    }
    if (selectedPollutant === 'pm2_5') {
      if (val <= 12) return { label: 'Good (≤12)', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' };
      if (val <= 35) return { label: 'Moderate (13–35)', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' };
      if (val <= 55) return { label: 'Unhealthy for Sensitive', bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-300' };
      return { label: 'Unhealthy (55+)', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300' };
    }
    if (selectedPollutant === 'pm10') {
      if (val <= 54) return { label: 'Good (≤54)', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' };
      if (val <= 154) return { label: 'Moderate (55–154)', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' };
      return { label: 'Unhealthy (155+)', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300' };
    }
    if (val <= chartMetrics.avg) return { label: 'Nominal Baseline', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' };
    return { label: 'Elevated Above Mean', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' };
  };

  // Quick preset test hotspots
  const presetAirLocations = [
    { name: 'New Delhi (NCR)', lat: 28.6139, lon: 77.2090, desc: 'Northern Plain Winter Inversion Basin' },
    { name: 'Mumbai (Coastal)', lat: 19.0760, lon: 72.8777, desc: 'Maritime Marine Boundary Layer' },
    { name: 'Kolkata (Delta)', lat: 22.5726, lon: 88.3639, desc: 'Lower Gangetic Plain Particulate Belt' },
    { name: 'Bengaluru (Plateau)', lat: 12.9716, lon: 77.5946, desc: 'Deccan Plateau Elevated Airshed' },
    { name: 'London (UK / Europe)', lat: 51.5074, lon: -0.1278, desc: 'European Regional Model Testing' },
    { name: 'Los Angeles (US)', lat: 34.0522, lon: -118.2437, desc: 'US EPA Photochemical Basin' }
  ];

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      
      {/* 1. TOP HEADER & TELEMETRY CONTROLS */}
      <div className="rounded-3xl bg-white border border-[#c5e6db] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eef8f4] border border-[#a8dec9] text-[#156550] text-xs font-bold uppercase tracking-wider">
              <Wind className="w-3.5 h-3.5 animate-pulse" />
              <span>Hyperlocal Atmospheric Intelligence</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#092c24] tracking-tight">
              Air Quality & Pollution Risk Assessment
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#375249]">
              <span className="flex items-center gap-1 font-bold text-[#092c24]">
                <MapPin className="w-3.5 h-3.5 text-[#156550]" />
                <span>{coords.name}</span>
              </span>
              <span>•</span>
              <span className="font-mono text-slate-500">
                {coords.lat.toFixed(4)}°N, {coords.lon.toFixed(4)}°E
              </span>
              {data && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>Updated: {new Date(data.current.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Location Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {primaryLocation && (
              <button
                onClick={() => setCoords({ lat: primaryLocation.latitude, lon: primaryLocation.longitude, name: primaryLocation.name })}
                className="px-3.5 py-2 rounded-xl bg-[#f7fcf9] hover:bg-[#eef8f4] border border-[#c5e6db] text-[#156550] text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>My Home Location</span>
              </button>
            )}

            {onOpenLocationModal && (
              <button
                onClick={onOpenLocationModal}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#c5e6db] text-[#092c24] text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5 text-[#156550]" />
                <span>Search / Map Pin</span>
              </button>
            )}

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-[#092c24] hover:bg-[#156550] text-white text-xs font-black transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>

        </div>

        {/* Preset Geographic Airshed Teleporters */}
        <div className="pt-4 border-t border-[#e1f2ec] flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-[#375249] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#156550]" />
            <span>Test Regional Airsheds:</span>
          </span>
          {presetAirLocations.map((p) => (
            <button
              key={p.name}
              onClick={() => setCoords({ lat: p.lat, lon: p.lon, name: p.name })}
              title={p.desc}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all font-medium ${
                Math.abs(coords.lat - p.lat) < 0.01 && Math.abs(coords.lon - p.lon) < 0.01
                  ? 'bg-[#092c24] text-white border-[#092c24] shadow-2xs'
                  : 'bg-white hover:bg-[#f7fcf9] text-[#156550] border-[#c5e6db]'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Model Transparency & Source Grounding Disclaimer Banner */}
        <div className="p-3.5 rounded-2xl bg-[#f7fcf9] border border-[#a8dec9] text-xs text-[#234237] flex items-start gap-3">
          <Info className="w-4 h-4 text-[#156550] flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold flex items-center gap-1.5">
              <span>Model-Based Atmospheric Transport Estimate (Open-Meteo & CAMS)</span>
              <span className="bg-[#d7f1e6] text-[#092c24] text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                {data?.metadata.modelResolution || '0.4° Global / 0.1° Regional'}
              </span>
            </div>
            <p className="text-[11px] text-[#375249] leading-relaxed">
              Air quality concentrations and AQI values are calculated using multi-model atmospheric reanalysis and chemical transport forecasts (Copernicus Atmosphere Monitoring Service / CAMS). This provides high-resolution contiguous coverage, but is not an in-situ regulatory monitoring station.
            </p>
          </div>
        </div>

      </div>

      {/* Loading & Error States */}
      {loading && !data && (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#c5e6db] shadow-sm">
          <RefreshCw className="w-8 h-8 text-[#156550] animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-[#092c24]">Querying Open-Meteo Air Quality & CAMS Atmospheric Models...</p>
          <p className="text-xs text-slate-500 mt-1">Retrieving PM2.5, PM10, NO₂, SO₂, Ozone, CO, CO₂, Dust, and 5-day hourly trajectory.</p>
        </div>
      )}

      {error && !data && (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-bold">Air Quality Telemetry Unreachable</p>
            <p className="text-[11px] mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* 2. THREE COMPREHENSIVE AQI GAUGES: INDIA CPCB (0-1000), US EPA (0-500), EUROPEAN EAQI (0-100+) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. India CPCB NAQI Card (0-1000 Standard) */}
            <div className="rounded-3xl bg-white border border-[#c5e6db] p-6 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#e1f2ec] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-orange-50 text-orange-700 font-black text-xs font-mono">
                      🇮🇳 CPCB
                    </span>
                    <div>
                      <h2 className="text-base font-black text-[#092c24]">
                        India National AQI (NAQI)
                      </h2>
                      <span className="text-[11px] text-[#375249]">
                        CPCB Standard Scale (0 to 1000)
                      </span>
                    </div>
                  </div>
                  {data.assessment.indiaCategory && (
                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${data.assessment.indiaCategory.border} ${data.assessment.indiaCategory.bg} ${data.assessment.indiaCategory.text}`}>
                      {data.assessment.indiaCategory.label}
                    </div>
                  )}
                </div>

                {/* AQI Main Numeric Display */}
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl sm:text-6xl font-black font-mono text-[#092c24]">
                    {data.current.indiaAqi !== null ? data.current.indiaAqi : 'N/A'}
                  </span>
                  <div className="space-y-0.5">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
                      AQI (0–1000)
                    </span>
                    <p className="text-xs text-[#375249]">
                      {data.assessment.indiaCategory?.description || 'India Central Pollution Control Board standard.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Segmented Color Spectrum Track for India NAQI (0 to 1000) */}
              <div className="space-y-2 pt-2">
                <div className="relative pt-6 pb-1">
                  {/* Pin Pointer */}
                  {data.current.indiaAqi !== null && (
                    <div 
                      className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-700"
                      style={{ left: `${Math.max(4, Math.min(96, (data.current.indiaAqi / 1000) * 100))}%` }}
                    >
                      <div className="px-2 py-0.5 rounded-md bg-[#092c24] text-white text-[10px] font-mono font-black shadow-md whitespace-nowrap">
                        {data.current.indiaAqi}
                      </div>
                      <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#092c24]" />
                    </div>
                  )}

                  {/* 7 CPCB Bands */}
                  <div className="h-3 rounded-full overflow-hidden flex shadow-inner bg-slate-200">
                    <div className="w-[5%] bg-emerald-500" title="Good (0–50)" />
                    <div className="w-[5%] bg-lime-400" title="Satisfactory (51–100)" />
                    <div className="w-[10%] bg-yellow-400" title="Moderate (101–200)" />
                    <div className="w-[10%] bg-orange-500" title="Poor (201–300)" />
                    <div className="w-[10%] bg-red-500" title="Very Poor (301–400)" />
                    <div className="w-[10%] bg-rose-900" title="Severe (401–500)" />
                    <div className="w-[50%] bg-[#3b0764]" title="Severe+ Emergency (501–1000)" />
                  </div>
                </div>

                {/* Range Labels */}
                <div className="flex justify-between text-[9px] font-bold text-slate-500">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                  <span>200</span>
                  <span>300</span>
                  <span>400</span>
                  <span>500</span>
                  <span>1000</span>
                </div>
                <div className="text-[10px] text-slate-400 italic">
                  * Official CPCB 7-category standard with emergency 500–1000 hazard tier.
                </div>
              </div>
            </div>

            {/* 2. US EPA AQI Card (0-500 Standard) */}
            <div className="rounded-3xl bg-white border border-[#c5e6db] p-6 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#e1f2ec] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-blue-50 text-blue-700 font-black text-xs font-mono">
                      US EPA
                    </span>
                    <div>
                      <h2 className="text-base font-black text-[#092c24]">
                        United States AQI (US AQI)
                      </h2>
                      <span className="text-[11px] text-[#375249]">
                        EPA Standard Scale (0 to 500)
                      </span>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${data.assessment.usCategory.border} ${data.assessment.usCategory.bg} ${data.assessment.usCategory.text}`}>
                    {data.assessment.usCategory.label}
                  </div>
                </div>

                {/* AQI Main Numeric Display */}
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl sm:text-6xl font-black font-mono text-[#092c24]">
                    {data.current.usAqi !== null ? data.current.usAqi : 'N/A'}
                  </span>
                  <div className="space-y-0.5">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
                      EPA Score (0–500)
                    </span>
                    <p className="text-xs text-[#375249]">
                      {data.assessment.usCategory.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Segmented Color Spectrum Track for US AQI */}
              <div className="space-y-2 pt-2">
                <div className="relative pt-6 pb-1">
                  {/* Pin Pointer */}
                  {data.current.usAqi !== null && (
                    <div 
                      className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-700"
                      style={{ left: `${Math.max(4, Math.min(96, (data.current.usAqi / 500) * 100))}%` }}
                    >
                      <div className="px-2 py-0.5 rounded-md bg-[#092c24] text-white text-[10px] font-mono font-black shadow-md whitespace-nowrap">
                        {data.current.usAqi}
                      </div>
                      <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#092c24]" />
                    </div>
                  )}

                  {/* 6 EPA Bands */}
                  <div className="h-3 rounded-full overflow-hidden flex shadow-inner bg-slate-200">
                    <div className="w-[10%] bg-emerald-500" title="Good (0–50)" />
                    <div className="w-[10%] bg-amber-400" title="Moderate (51–100)" />
                    <div className="w-[10%] bg-orange-500" title="Unhealthy for Sensitive (101–150)" />
                    <div className="w-[10%] bg-red-500" title="Unhealthy (151–200)" />
                    <div className="w-[20%] bg-purple-600" title="Very Unhealthy (201–300)" />
                    <div className="w-[40%] bg-rose-950" title="Hazardous (301–500)" />
                  </div>
                </div>

                {/* Range Labels */}
                <div className="flex justify-between text-[9px] font-bold text-slate-500">
                  <span>0 Good</span>
                  <span>50</span>
                  <span>100</span>
                  <span>150</span>
                  <span>200</span>
                  <span>300</span>
                  <span>500 Haz</span>
                </div>
                <div className="text-[10px] text-slate-400 italic">
                  * US Clean Air Act ambient air quality index standard.
                </div>
              </div>
            </div>

            {/* 3. European AQI Card (Col 3) */}
            <div className="rounded-3xl bg-white border border-[#c5e6db] p-6 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#e1f2ec] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-black text-xs font-mono">
                      EEA EU
                    </span>
                    <div>
                      <h2 className="text-base font-black text-[#092c24]">
                        European Air Quality Index
                      </h2>
                      <span className="text-[11px] text-[#375249]">
                        European Environment Agency (EAQI)
                      </span>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${data.assessment.europeanCategory.border} ${data.assessment.europeanCategory.bg} ${data.assessment.europeanCategory.text}`}>
                    {data.assessment.europeanCategory.code}
                  </div>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-5xl sm:text-6xl font-black font-mono text-[#092c24]">
                    {data.current.europeanAqi !== null ? data.current.europeanAqi : 'N/A'}
                  </span>
                  <div className="space-y-0.5">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
                      EAQI Level (0–100+)
                    </span>
                    <p className="text-xs text-[#375249]">
                      {data.assessment.europeanCategory.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Distinct European Scale Indicator */}
              <div className="space-y-2 pt-2">
                <div className="relative pt-6 pb-1">
                  {/* Pin Pointer */}
                  {data.current.europeanAqi !== null && (
                    <div 
                      className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-700"
                      style={{ left: `${Math.max(4, Math.min(96, (data.current.europeanAqi / 120) * 100))}%` }}
                    >
                      <div className="px-2 py-0.5 rounded-md bg-[#092c24] text-white text-[10px] font-mono font-black shadow-md whitespace-nowrap">
                        {data.current.europeanAqi}
                      </div>
                      <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#092c24]" />
                    </div>
                  )}

                  <div className="h-3 rounded-full overflow-hidden flex shadow-inner bg-slate-200">
                    <div className="w-1/6 bg-emerald-500" title="Good (0–20)" />
                    <div className="w-1/6 bg-lime-400" title="Fair (20–40)" />
                    <div className="w-1/6 bg-amber-400" title="Moderate (40–60)" />
                    <div className="w-1/6 bg-red-500" title="Poor (60–80)" />
                    <div className="w-1/6 bg-purple-600" title="Very Poor (80–100)" />
                    <div className="w-1/6 bg-rose-900" title="Extremely Poor (>100)" />
                  </div>
                </div>

                <div className="flex justify-between text-[9px] text-slate-500 font-semibold">
                  <span>0 Good</span>
                  <span>20 Fair</span>
                  <span>40 Mod</span>
                  <span>60 Poor</span>
                  <span>80 V.Poor</span>
                  <span>100+ Extr</span>
                </div>
                <div className="text-[10px] text-slate-400 italic">
                  * European AQI uses independent concentration limits.
                </div>
              </div>
            </div>

          </div>

          {/* 3. "WHAT IS AFFECTING THE AIR?" EXPLANATION SECTION */}
          <div className="rounded-3xl bg-white border border-[#c5e6db] p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e1f2ec] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#156550]" />
                <h3 className="text-lg font-black text-[#092c24]">
                  What is affecting the air?
                </h3>
              </div>
              <span className="text-xs font-bold text-[#156550] bg-[#eef8f4] px-3 py-1 rounded-full border border-[#c5e6db]">
                Dominant Atmospheric Pollutant Analysis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Pollutant Badge & Concentration (Cols 1-4) */}
              <div className="md:col-span-4 p-5 rounded-2xl bg-[#f7fcf9] border border-[#a8dec9] space-y-2">
                <div className="text-[11px] uppercase font-bold text-[#375249] tracking-wider">
                  Primary Contributing Pollutant
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#092c24]">
                    {data.assessment.dominantPollutant.name}
                  </span>
                  <span className="font-mono text-sm font-bold text-[#156550]">
                    ({data.assessment.dominantPollutant.chemical})
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="text-3xl font-black font-mono text-[#092c24]">
                    {data.assessment.dominantPollutant.value !== null ? data.assessment.dominantPollutant.value : 'N/A'}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {data.assessment.dominantPollutant.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-[#375249] flex items-center gap-1">
                    <span>12h Trend:</span>
                    {getTrendIcon(data.assessment.dominantPollutant.trend)}
                    <span className="capitalize">{data.assessment.dominantPollutant.trend}</span>
                  </span>
                </div>
              </div>

              {/* Plain-English Explanation & Reasonable Actions (Cols 5-12) */}
              <div className="md:col-span-8 space-y-3">
                <p className="text-sm text-[#092c24] leading-relaxed font-medium">
                  <strong>{data.assessment.dominantPollutant.chemical}</strong> appears to be the leading concern in current atmospheric model estimates for this airshed. {data.assessment.dominantPollutant.explanation}
                </p>
                
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Recommended Exposure Reduction:</span>
                  </div>
                  <p className="leading-relaxed">
                    {data.assessment.dominantPollutant.precautions}
                  </p>
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  * Note: Grounding is based on model concentrations relative to ambient benchmarks. Localized emission sources (e.g. specific industrial stacks, agricultural fires) require in-situ verification.
                </p>
              </div>

            </div>
          </div>

          {/* 4. POLLUTANT CARDS (ALL 10 MEASURED & MODELED PARAMETERS) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#092c24] flex items-center gap-2">
                  <span>Chemical & Particulate Pollutants (10)</span>
                </h3>
                <p className="text-xs text-[#375249] mt-0.5">
                  Latest modeled concentrations across standard atmospheric criteria pollutants and solar irradiance.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {pollutantCatalog.map((item) => {
                const rawVal = (data.current as any)[item.key] as number | null;
                const tier = item.getTier(rawVal);

                return (
                  <div
                    key={item.key}
                    className="p-4 rounded-2xl bg-white border border-[#c5e6db] hover:border-[#156550] transition-all shadow-xs flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      {/* Top Bar: Name & Status Pill */}
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="text-xs font-bold text-[#092c24] group-hover:text-[#156550] transition-colors">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.formula}
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tier.bg} ${tier.color} flex items-center gap-1`}>
                          <span>{tier.dot}</span>
                          <span>{tier.label}</span>
                        </span>
                      </div>

                      {/* Value Display */}
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-2xl font-black font-mono text-[#092c24]">
                          {rawVal !== null && rawVal !== undefined ? rawVal : 'N/A'}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {item.unit}
                        </span>
                      </div>

                      {/* Plain-English Explanation */}
                      <p className="mt-2 text-[11px] text-[#375249] leading-snug line-clamp-2">
                        {item.desc}
                      </p>
                    </div>

                    {/* Standard Reference Footer */}
                    <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                      {item.standard}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. FIVE-DAY AIR-QUALITY FORECAST & INTERACTIVE CHARTS */}
          <div className="rounded-3xl bg-white border border-[#c5e6db] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e1f2ec] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#156550]" />
                  <h3 className="text-lg font-black text-[#092c24]">
                    Five-Day Atmospheric Trajectory & Forecast
                  </h3>
                </div>
                <p className="text-xs text-[#375249] mt-0.5">
                  Hourly predicted pollutant trends and projected clearance windows over the next 120 hours.
                </p>
              </div>

              {/* Time Horizon Selector */}
              <div className="flex items-center bg-[#f7fcf9] p-1 rounded-xl border border-[#c5e6db] text-xs font-bold">
                {(
                  [
                    { id: '24h', label: 'Next 24h' },
                    { id: '48h', label: 'Next 48h' },
                    { id: '5d', label: '5-Day Forecast' }
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTimeHorizon(t.id)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      timeHorizon === t.id
                        ? 'bg-[#092c24] text-white shadow-xs'
                        : 'text-[#156550] hover:text-[#092c24]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pollutant Tabs for Chart */}
            <div className="flex flex-wrap items-center gap-1.5 pb-2">
              {[
                { id: 'indiaAqi', label: '🇮🇳 India NAQI (0–1000)', unit: 'AQI' },
                { id: 'usAqi', label: '🇺🇸 US EPA AQI (0–500)', unit: 'USAQI' },
                { id: 'pm2_5', label: 'PM2.5', unit: 'μg/m³' },
                { id: 'pm10', label: 'PM10', unit: 'μg/m³' },
                { id: 'ozone', label: 'Ozone (O₃)', unit: 'μg/m³' },
                { id: 'nitrogenDioxide', label: 'NO₂', unit: 'μg/m³' },
                { id: 'dust', label: 'Dust', unit: 'μg/m³' },
                { id: 'europeanAqi', label: '🇪🇺 European AQI', unit: 'EAQI' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPollutant(p.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedPollutant === p.id
                      ? 'bg-[#156550] text-white shadow-xs'
                      : 'bg-[#f7fcf9] hover:bg-[#eef8f4] text-[#156550] border border-[#c5e6db]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Peak Forecast Callout Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0" />
                <div>
                  <span className="font-bold text-amber-900">Highest Forecast AQI Period:</span>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    {data.assessment.peakForecast
                      ? `Peak US AQI of ${data.assessment.peakForecast.usAqi} projected around ${data.assessment.peakForecast.formattedTime}.`
                      : 'No pronounced hazardous spike identified.'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                <div>
                  <span className="font-bold text-emerald-900">Projected Clearance Window:</span>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    {data.assessment.improvingWindow || 'Stable dispersion throughout the monitoring window.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive SVG Trend Chart Within a Strict Box Container */}
            {slicedHourly.values.length > 0 && chartMetrics.max > 0 ? (
              <div className="space-y-4">
                {/* Dedicated Contained Chart Box */}
                <div className="border border-[#c5e6db] rounded-2xl bg-[#fbfdfc] overflow-hidden shadow-xs flex flex-col">
                  
                  {/* In-Box Active Inspector & Readout Header */}
                  <div className="bg-white border-b border-[#e1f2ec] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {(() => {
                        const activeIndex = hoveredPoint ? hoveredPoint.index : 0;
                        const activeVal = hoveredPoint ? hoveredPoint.value : slicedHourly.values[0];
                        const activeTime = hoveredPoint ? hoveredPoint.time : slicedHourly.times[0];
                        const cat = getPointCategory(activeVal);
                        const activeUnit = data.currentUnits[selectedPollutant] || (selectedPollutant === 'usAqi' ? 'USAQI' : selectedPollutant === 'europeanAqi' ? 'EAQI' : 'μg/m³');

                        return (
                          <>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#eef8f4] border border-[#c5e6db] text-xs font-bold text-[#156550]">
                              <Clock className="w-3.5 h-3.5" />
                              <span>
                                {activeTime ? new Date(activeTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit' }) : 'Current Hour'}
                                {activeIndex > 0 && <span className="ml-1 text-[11px] font-mono text-[#375249]">(+{activeIndex}h)</span>}
                              </span>
                            </div>

                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
                                Reading:
                              </span>
                              <span className="text-2xl font-black font-mono text-[#092c24]">
                                {activeVal !== null && activeVal !== undefined ? activeVal : 'N/A'}
                              </span>
                              <span className="text-xs font-bold text-slate-600 font-mono">
                                {activeUnit}
                              </span>
                            </div>

                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cat.border} ${cat.bg} ${cat.text}`}>
                              {cat.label}
                            </span>
                          </>
                        );
                      })()}
                    </div>

                    {/* Trajectory Range & Peak Pills */}
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="px-2.5 py-1 rounded-lg bg-[#f7fcf9] border border-[#e1f2ec] text-slate-600">
                        Min: <strong className="text-[#092c24]">{chartMetrics.min}</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#f7fcf9] border border-[#e1f2ec] text-slate-600">
                        Avg: <strong className="text-[#092c24]">{chartMetrics.avg}</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-800 font-bold">
                        Peak: {chartMetrics.max}
                      </span>
                    </div>
                  </div>

                  {/* SVG Chart Canvas with Inset Margins */}
                  <div className="p-4 sm:p-5 relative select-none">
                    {(() => {
                      const svgW = 840;
                      const svgH = 260;
                      const padLeft = 60;
                      const padRight = 30;
                      const padTop = 25;
                      const padBottom = 45;
                      const chartW = svgW - padLeft - padRight;
                      const chartH = svgH - padTop - padBottom;
                      const n = slicedHourly.values.length;
                      const minVal = chartMetrics.min;
                      const maxVal = chartMetrics.max;
                      const range = maxVal - minVal || 1;

                      // Calculate coordinates strictly bounded inside chart box
                      const pts = slicedHourly.values.map((v, i) => {
                        const x = padLeft + (n > 1 ? (i / (n - 1)) * chartW : chartW / 2);
                        const val = v !== null ? v : minVal;
                        const ratio = Math.max(0, Math.min(1, (val - minVal) / range));
                        const y = padTop + (1 - ratio) * chartH;
                        return { x, y, val: v };
                      });

                      const areaD = pts.length > 0
                        ? `M ${pts[0].x},${padTop + chartH} L ${pts.map(p => `${p.x},${p.y}`).join(' L ')} L ${pts[pts.length - 1].x},${padTop + chartH} Z`
                        : '';
                      const lineD = pts.length > 0 ? `M ${pts.map(p => `${p.x},${p.y}`).join(' L ')}` : '';

                      // Y-Grid levels
                      const yTicks = [
                        { val: maxVal, y: padTop },
                        { val: Math.round(minVal + range * 0.67), y: padTop + chartH * 0.33 },
                        { val: Math.round(minVal + range * 0.33), y: padTop + chartH * 0.67 },
                        { val: minVal, y: padTop + chartH }
                      ];

                      // Peak coordinate
                      const peakPt = chartMetrics.peakIndex >= 0 && chartMetrics.peakIndex < pts.length
                        ? pts[chartMetrics.peakIndex]
                        : null;

                      // Hovered coordinate
                      const hoveredPt = hoveredPoint && hoveredPoint.index >= 0 && hoveredPoint.index < pts.length
                        ? pts[hoveredPoint.index]
                        : null;

                      const activeUnit = data.currentUnits[selectedPollutant] || (selectedPollutant === 'usAqi' ? 'USAQI' : selectedPollutant === 'europeanAqi' ? 'EAQI' : 'μg/m³');

                      const handlePointerEvent = (e: React.PointerEvent<SVGSVGElement>) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const relX = (e.clientX - rect.left) / rect.width;
                        const startRatio = padLeft / svgW;
                        const endRatio = (padLeft + chartW) / svgW;
                        const boundedRatio = Math.max(0, Math.min(1, (relX - startRatio) / (endRatio - startRatio)));
                        const idx = Math.min(n - 1, Math.max(0, Math.round(boundedRatio * (n - 1))));
                        setHoveredPoint({
                          index: idx,
                          time: slicedHourly.times[idx],
                          value: slicedHourly.values[idx]
                        });
                      };

                      return (
                        <div className="w-full relative">
                          <svg
                            viewBox={`0 0 ${svgW} ${svgH}`}
                            className="w-full h-64 sm:h-72 block cursor-crosshair overflow-hidden"
                            onPointerMove={handlePointerEvent}
                            onPointerDown={handlePointerEvent}
                            onPointerLeave={() => setHoveredPoint(null)}
                          >
                            <defs>
                              <linearGradient id="boundedAqiGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#156550" stopOpacity="0.32" />
                                <stop offset="100%" stopColor="#156550" stopOpacity="0.02" />
                              </linearGradient>
                              <clipPath id="chartPlotClip">
                                <rect x={padLeft} y={padTop} width={chartW} height={chartH} />
                              </clipPath>
                            </defs>

                            {/* Chart Outer Frame Box */}
                            <rect
                              x={padLeft}
                              y={padTop}
                              width={chartW}
                              height={chartH}
                              fill="#ffffff"
                              stroke="#e2e8f0"
                              strokeWidth="1"
                              rx="6"
                            />

                            {/* Y-Axis Grid Lines & Value Labels */}
                            {yTicks.map((t, idx) => (
                              <g key={idx}>
                                <line
                                  x1={padLeft}
                                  y1={t.y}
                                  x2={padLeft + chartW}
                                  y2={t.y}
                                  stroke={idx === yTicks.length - 1 ? '#cbd5e1' : '#f1f5f9'}
                                  strokeWidth={idx === yTicks.length - 1 ? '1.2' : '1'}
                                  strokeDasharray={idx === yTicks.length - 1 ? undefined : '3 3'}
                                />
                                <text
                                  x={padLeft - 10}
                                  y={t.y + 3.5}
                                  textAnchor="end"
                                  fill="#64748b"
                                  fontSize="10"
                                  fontFamily="ui-monospace, monospace"
                                  fontWeight="600"
                                >
                                  {t.val}
                                </text>
                              </g>
                            ))}

                            {/* X-Axis Ticks, Grid Lines & Time Labels */}
                            {xTicks.map((xt, idx) => {
                              const x = padLeft + (n > 1 ? (xt.index / (n - 1)) * chartW : chartW / 2);
                              return (
                                <g key={idx}>
                                  <line
                                    x1={x}
                                    y1={padTop}
                                    x2={x}
                                    y2={padTop + chartH}
                                    stroke="#f8fafc"
                                    strokeWidth="1"
                                    strokeDasharray="2 2"
                                  />
                                  <line
                                    x1={x}
                                    y1={padTop + chartH}
                                    x2={x}
                                    y2={padTop + chartH + 5}
                                    stroke="#94a3b8"
                                    strokeWidth="1"
                                  />
                                  <text
                                    x={x}
                                    y={padTop + chartH + 18}
                                    textAnchor="middle"
                                    fill="#475569"
                                    fontSize="10"
                                    fontFamily="ui-monospace, monospace"
                                    fontWeight="600"
                                  >
                                    {xt.label}
                                  </text>
                                  <text
                                    x={x}
                                    y={padTop + chartH + 30}
                                    textAnchor="middle"
                                    fill="#94a3b8"
                                    fontSize="9"
                                    fontFamily="sans-serif"
                                  >
                                    {xt.subLabel}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Area and Stroke (Clipped to Box) */}
                            <g clipPath="url(#chartPlotClip)">
                              <path d={areaD} fill="url(#boundedAqiGrad)" />
                              <path
                                d={lineD}
                                fill="none"
                                stroke="#156550"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </g>

                            {/* Peak Period Indicator */}
                            {peakPt && (
                              <g>
                                <circle
                                  cx={peakPt.x}
                                  cy={peakPt.y}
                                  r="5"
                                  fill="#dc2626"
                                  stroke="#ffffff"
                                  strokeWidth="2"
                                />
                                <g transform={`translate(${Math.max(padLeft + 35, Math.min(padLeft + chartW - 35, peakPt.x))}, ${Math.max(padTop + 14, peakPt.y - 10)})`}>
                                  <rect
                                    x="-32"
                                    y="-13"
                                    width="64"
                                    height="15"
                                    rx="3"
                                    fill="#dc2626"
                                  />
                                  <text
                                    x="0"
                                    y="-2.5"
                                    textAnchor="middle"
                                    fill="#ffffff"
                                    fontSize="9"
                                    fontFamily="ui-monospace, monospace"
                                    fontWeight="bold"
                                  >
                                    Peak {chartMetrics.max}
                                  </text>
                                </g>
                              </g>
                            )}

                            {/* Active Hover Crosshair & Inset Tooltip */}
                            {hoveredPt && (
                              <g>
                                <line
                                  x1={hoveredPt.x}
                                  y1={padTop}
                                  x2={hoveredPt.x}
                                  y2={padTop + chartH}
                                  stroke="#156550"
                                  strokeWidth="1.5"
                                  strokeDasharray="3 3"
                                />
                                <circle
                                  cx={hoveredPt.x}
                                  cy={hoveredPt.y}
                                  r="6"
                                  fill="#092c24"
                                  stroke="#a7f3d0"
                                  strokeWidth="2.5"
                                />
                                {/* Clamped Float Tag Inside SVG Box */}
                                <g
                                  transform={`translate(${Math.max(padLeft + 48, Math.min(padLeft + chartW - 48, hoveredPt.x))}, ${Math.max(padTop + 16, Math.min(padTop + chartH - 16, hoveredPt.y - 18))})`}
                                >
                                  <rect
                                    x="-44"
                                    y="-14"
                                    width="88"
                                    height="18"
                                    rx="4"
                                    fill="#092c24"
                                    opacity="0.95"
                                  />
                                  <text
                                    x="0"
                                    y="-1"
                                    textAnchor="middle"
                                    fill="#a7f3d0"
                                    fontSize="10"
                                    fontWeight="bold"
                                    fontFamily="ui-monospace, monospace"
                                  >
                                    {hoveredPt.val !== null ? hoveredPt.val : 'N/A'} {activeUnit}
                                  </text>
                                </g>
                              </g>
                            )}
                          </svg>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Chart Box Legend & Footer Strip */}
                  <div className="bg-[#f7fcf9] border-t border-[#e1f2ec] px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-[#156550] font-semibold text-[11px]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#156550]" />
                        <span>Predicted Trajectory</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-red-700 font-semibold text-[11px]">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                        <span>Peak Hazard Spike</span>
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-500 italic">
                      * Interactive: Hover or scrub along the curve to inspect any hourly forecast within the box.
                    </span>
                  </div>

                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl text-xs text-slate-500 border border-slate-200">
                Forecast data is currently unavailable for this specific pollutant parameter.
              </div>
            )}

          </div>

          {/* 6. HEALTH GUIDANCE & VULNERABLE PERSONAS */}
          <div className="rounded-3xl bg-white border border-[#c5e6db] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#e1f2ec] pb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-[#156550]" />
                <h3 className="text-lg font-black text-[#092c24]">
                  What should I do? Health Guidance & Vulnerable Groups
                </h3>
              </div>
              <span className="text-xs font-bold text-[#156550] bg-[#eef8f4] px-3 py-1 rounded-full border border-[#c5e6db]">
                AQI Tier: {data.assessment.usCategory.label}
              </span>
            </div>

            {/* Persona Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Persona 1: General Population */}
              <div className="p-5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#092c24]">
                  <Users className="w-4 h-4 text-[#156550]" />
                  <span>General Public</span>
                </div>
                <p className="text-xs text-[#375249] leading-relaxed">
                  {data.assessment.healthGuidance.general}
                </p>
              </div>

              {/* Persona 2: Sensitive Groups */}
              <div className="p-5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#092c24]">
                  <Activity className="w-4 h-4 text-orange-600" />
                  <span>Respiratory & Heart</span>
                </div>
                <p className="text-xs text-[#375249] leading-relaxed">
                  {data.assessment.healthGuidance.sensitive}
                </p>
              </div>

              {/* Persona 3: Children & Seniors */}
              <div className="p-5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#092c24]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Children & Elderly</span>
                </div>
                <p className="text-xs text-[#375249] leading-relaxed">
                  {data.assessment.healthGuidance.childrenElderly}
                </p>
              </div>

              {/* Persona 4: Outdoor Workers */}
              <div className="p-5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#092c24]">
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>Outdoor Workers</span>
                </div>
                <p className="text-xs text-[#375249] leading-relaxed">
                  {data.assessment.healthGuidance.outdoorWorkers}
                </p>
              </div>

            </div>

            {/* Medical Disclaimer Callout */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
              <span>
                <strong>Non-Diagnostic Disclaimer:</strong> This health guidance is provided for informational and environmental situational awareness based on public health AQI guidelines (US EPA & WHO). It does not constitute medical advice or clinical diagnosis. If you experience respiratory distress, chest tightness, or severe discomfort, consult a qualified medical professional immediately.
              </span>
            </div>

          </div>
        </>
      )}

    </div>
  );
};
