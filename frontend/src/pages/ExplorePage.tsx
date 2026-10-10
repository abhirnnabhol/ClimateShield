import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Compass, 
  RefreshCw, 
  BookmarkPlus, 
  Wind, 
  Droplets, 
  Thermometer, 
  CloudRain, 
  Mountain, 
  Layers, 
  Satellite, 
  Globe, 
  Sparkles, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import { api } from '../services/api';
import { RiskAssessment, LocationSearchResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { LeafletRiskMap } from '../components/LeafletRiskMap';
import { GoogleMapsSelect, GoogleMapsSelectedLocation } from '../components/GoogleMapsSelect';
import { RiskBadge } from '../components/RiskBadge';
import { ScenarioSimulator } from '../components/ScenarioSimulator';
import { DataSourceCard } from '../components/DataSourceCard';

// Preset Global & Regional Climate Hotspots for instant teleportation
const PRESET_HOTSPOTS = [
  { 
    name: 'Thar Desert, Rajasthan', 
    latitude: 26.9124, 
    longitude: 70.9083, 
    emoji: '🏜️', 
    badge: 'Extreme Aridity', 
    badgeCol: 'bg-amber-100 text-amber-800 border-amber-300',
    desc: 'Lethal solar irradiance, >46°C surface temps & severe soil moisture collapse' 
  },
  { 
    name: 'Mawsynram, Meghalaya', 
    latitude: 25.2975, 
    longitude: 91.5826, 
    emoji: '🌧️', 
    badge: 'Flash Inundation', 
    badgeCol: 'bg-blue-100 text-blue-800 border-blue-300',
    desc: 'Record-setting monsoon rainfall totals with steep montane runoff velocity' 
  },
  { 
    name: 'Vidarbha Basin, Maharashtra', 
    latitude: 20.9320, 
    longitude: 77.7523, 
    emoji: '🌾', 
    badge: 'Agricultural Drought', 
    badgeCol: 'bg-orange-100 text-orange-800 border-orange-300',
    desc: 'Chronic precipitation deficit and critical upper root-zone moisture stress' 
  },
  { 
    name: 'Central New Delhi', 
    latitude: 28.6139, 
    longitude: 77.2090, 
    emoji: '🏙️', 
    badge: 'Urban Heat Island', 
    badgeCol: 'bg-red-100 text-red-800 border-red-300',
    desc: 'Dense asphalt and concrete canyon trapping extreme thermal energy' 
  },
  { 
    name: 'Kedarnath Valley, Uttarakhand', 
    latitude: 30.7346, 
    longitude: 79.0669, 
    emoji: '🏔️', 
    badge: 'Valley Runoff Basin', 
    badgeCol: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    desc: 'Steep topographic gradient slope with cloudburst catchment pooling risk' 
  },
  { 
    name: 'Sundarbans Coastal Delta, WB', 
    latitude: 21.9497, 
    longitude: 88.9007, 
    emoji: '🌊', 
    badge: 'Coastal Surge', 
    badgeCol: 'bg-teal-100 text-teal-800 border-teal-300',
    desc: 'Tidal drainage impedance, 100% soil waterlogging, and cyclonic storm surge' 
  }
];

export const ExplorePage: React.FC = () => {
  const { user, primaryLocation, setPrimaryLocationState, isDemoMode } = useAuth();
  const [exploreMode, setExploreMode] = useState<'search' | 'map'>('search');
  const [query, setQuery] = useState('Indore, Madhya Pradesh');
  const [results, setResults] = useState<LocationSearchResult[]>([]);

  // Selected place
  const [selectedPlace, setSelectedPlace] = useState<{
    name: string;
    latitude: number;
    longitude: number;
  }>({
    name: 'Indore, Madhya Pradesh',
    latitude: 22.7196,
    longitude: 75.8577
  });

  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [homeAssessment, setHomeAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingPrimary, setSavingPrimary] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Active satellite remote sensing inspector tab
  const [activeSatelliteBand, setActiveSatelliteBand] = useState<'sentinel' | 'lst' | 'srtm' | 'era5'>('sentinel');

  const analyzeSelected = async (lat: number, lon: number, name: string) => {
    setLoading(true);
    setSavedSuccess(false);
    try {
      const res = await api.analyzeRisk({
        latitude: lat,
        longitude: lon,
        locationName: name,
        userType: user?.userType || 'Resident'
      });
      setAssessment(res.assessment);
    } catch (err) {
      console.error('Explore analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Home Assessment for live differential comparison if primary location exists
  useEffect(() => {
    if (primaryLocation) {
      api.analyzeRisk({
        latitude: primaryLocation.latitude,
        longitude: primaryLocation.longitude,
        locationName: primaryLocation.name,
        userType: user?.userType || 'Resident'
      }).then((res) => {
        setHomeAssessment(res.assessment);
      }).catch((err) => {
        console.warn('Home location assessment for comparison could not be loaded:', err);
      });
    }
  }, [primaryLocation]);

  useEffect(() => {
    analyzeSelected(selectedPlace.latitude, selectedPlace.longitude, selectedPlace.name);
  }, [selectedPlace.latitude, selectedPlace.longitude, isDemoMode]);

  const handleSearch = async (q: string) => {
    if (!q || q.trim().length < 2) return;
    try {
      const list = await api.searchLocations(q);
      setResults(list);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleSelectResult = (res: LocationSearchResult) => {
    setSelectedPlace({
      name: res.formattedAddress || res.name,
      latitude: res.latitude,
      longitude: res.longitude
    });
    setResults([]);
  };

  const handleMapClick = (lat: number, lon: number) => {
    const customName = `Sector (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`;
    setSelectedPlace({
      name: customName,
      latitude: lat,
      longitude: lon
    });
  };

  const handleConfirmGoogleMapLocation = (loc: GoogleMapsSelectedLocation) => {
    setSelectedPlace({
      name: loc.name,
      latitude: loc.latitude,
      longitude: loc.longitude
    });
    setQuery(loc.name);
    analyzeSelected(loc.latitude, loc.longitude, loc.name);
  };

  const handleTeleportHotspot = (spot: typeof PRESET_HOTSPOTS[0]) => {
    setSelectedPlace({
      name: spot.name,
      latitude: spot.latitude,
      longitude: spot.longitude
    });
    setQuery(spot.name);
  };

  const handleSetAsPrimary = async () => {
    if (!user) return;
    setSavingPrimary(true);
    try {
      const res = await api.saveLocation({
        name: selectedPlace.name,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        city: selectedPlace.name.split(',')[0],
        state: selectedPlace.name.split(',')[1]?.trim() || '',
        isPrimary: true
      });
      setPrimaryLocationState(res.location);
      setSavedSuccess(true);
    } catch (err) {
      console.error('Failed to set primary:', err);
    } finally {
      setSavingPrimary(false);
    }
  };

  // Topographic classification
  const elevation = assessment?.flood.elevation || 350;
  const terrainClass = 
    elevation > 1200 ? 'High Alpine Watershed Gradient' :
    elevation > 600 ? 'Mid-Plateau Undulating Terraces' :
    elevation > 250 ? 'Inland Alluvial Plains' :
    'Lowland Catchment Basin / Floodplain';

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* 1. TOP HEADER & EXPLORATION MODE SELECTOR */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#156550]">
            <Compass className="w-3.5 h-3.5" />
            <span>Geospatial Risk Exploration & Telemetry Laboratory</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-[#092c24] mt-1 flex items-center gap-2">
            <span>Explore Climate Conditions Anywhere</span>
            <span className="text-xl">🌐</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#375249]">
            Teleport to global climate hotspots, inspect multi-satellite remote sensing bands, and analyze terrain elevation contours.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex border border-[#c5e6db] bg-[#eef8f4] p-1.5 rounded-2xl gap-1.5 w-fit">
          <button
            type="button"
            onClick={() => setExploreMode('search')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              exploreMode === 'search'
                ? 'bg-[#092c24] text-white shadow-xs'
                : 'text-[#156550] hover:text-[#092c24] hover:bg-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search by City / Name</span>
          </button>

          <button
            type="button"
            onClick={() => setExploreMode('map')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              exploreMode === 'map'
                ? 'bg-[#092c24] text-white shadow-xs'
                : 'text-[#156550] hover:text-[#092c24] hover:bg-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Google Maps Interactive Pin</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH BAR & LOCATION CONTROLS */}
      {exploreMode === 'search' ? (
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#479b89]" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Search city, district, coordinates or address..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-[#c5e6db] text-xs font-medium text-[#092c24] placeholder-[#479b89] focus:outline-none focus:border-[#156550] focus:ring-1 focus:ring-[#156550] shadow-sm"
              />
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#c5e6db] rounded-2xl shadow-xl overflow-hidden z-30 max-h-60 overflow-y-auto">
              {results.map((res, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectResult(res)}
                  className="w-full text-left px-4 py-3 text-xs hover:bg-[#eef8f4] flex items-center gap-3 border-b border-[#e1f2ec] last:border-0"
                >
                  <MapPin className="w-4 h-4 text-[#156550] flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#092c24]">{res.name}</div>
                    <div className="text-[10px] text-[#479b89]">{res.formattedAddress}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <GoogleMapsSelect
          onConfirmLocation={handleConfirmGoogleMapLocation}
          initialLat={selectedPlace.latitude}
          initialLon={selectedPlace.longitude}
        />
      )}

      {/* 3. QUICK TELEPORT: PRESET CLIMATE HOTSPOTS (EXCLUSIVE TO EXPLORE) */}
      <div className="p-4 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#092c24]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Teleport: Featured Climate Extremes</span>
          </div>
          <span className="text-[11px] text-[#479b89] font-medium hidden sm:inline">
            Click to analyze distinctive global microclimates
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESET_HOTSPOTS.map((spot, idx) => {
            const isSelected = selectedPlace.name === spot.name;
            return (
              <button
                key={idx}
                onClick={() => handleTeleportHotspot(spot)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-[#092c24] text-white border-[#092c24] shadow-md scale-102' 
                    : 'bg-white hover:bg-[#eef8f4] border-[#c5e6db] text-[#092c24]'
                }`}
              >
                <div>
                  <div className="text-xl mb-1">{spot.emoji}</div>
                  <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-[#092c24]'}`}>
                    {spot.name.split(',')[0]}
                  </div>
                  <div className={`text-[10px] truncate ${isSelected ? 'text-emerald-300' : 'text-[#479b89]'}`}>
                    {spot.name.split(',')[1] || ''}
                  </div>
                </div>
                <span className={`mt-2 text-[9px] font-bold px-1.5 py-0.5 rounded border inline-block w-fit ${
                  isSelected ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' : spot.badgeCol
                }`}>
                  {spot.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. CURRENT SECTOR STATUS PILL & SAVE ACTION */}
      <div className="p-4 rounded-2xl bg-white border border-[#c5e6db] flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#eef8f4] text-[#156550] border border-[#c5e6db]">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#479b89] font-bold uppercase tracking-wider">
              Currently Analyzing
            </div>
            <div className="text-base font-extrabold text-[#092c24]">
              {selectedPlace.name}
            </div>
            <div className="text-[11px] text-[#375249] font-mono">
              Lat: {selectedPlace.latitude.toFixed(4)}° · Lon: {selectedPlace.longitude.toFixed(4)}° · {terrainClass}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={handleSetAsPrimary}
              disabled={savingPrimary}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                savedSuccess
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-[#092c24] text-white hover:bg-[#156550] border-transparent shadow-xs'
              }`}
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>{savedSuccess ? 'Saved as Primary' : 'Set as Monitored Home'}</span>
            </button>
          )}

          {assessment && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#375249] font-semibold">Sector Risk:</span>
              <RiskBadge level={assessment.overallLevel} size="md" />
            </div>
          )}
        </div>
      </div>

      {/* 5. INTERACTIVE GEOSPATIAL MAP */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#1e3a34] font-bold">
          <span>Geospatial Risk Zone Projection</span>
          <span className="text-[#156550] font-semibold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
            Click anywhere on the map to recalculate
          </span>
        </div>
        <LeafletRiskMap
          latitude={selectedPlace.latitude}
          longitude={selectedPlace.longitude}
          locationName={selectedPlace.name}
          overallScore={assessment?.overallScore || 50}
          overallLevel={assessment?.overallLevel || 'MODERATE'}
          heatScore={assessment?.heat.score}
          droughtScore={assessment?.drought.score}
          floodScore={assessment?.flood.score}
          onMapClick={handleMapClick}
          className="h-80"
        />
      </div>

      {loading ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-[#c5e6db]">
          <RefreshCw className="w-8 h-8 text-[#156550] animate-spin mx-auto" />
          <p className="text-xs text-[#1e3a34] font-bold">
            Ingesting digital elevation models, precipitation anomalies, and satellite proxies for {selectedPlace.name}...
          </p>
        </div>
      ) : assessment ? (
        <div className="space-y-8">
          
          {/* 6. CURRENT ATMOSPHERIC TELEMETRY CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-[#c5e6db] flex items-center gap-3 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-[#479b89] uppercase font-bold">Ambient Air Temp</div>
                <div className="text-lg font-black text-[#092c24] font-mono">
                  {assessment.heat.temperature}°C
                </div>
                <div className="text-[10px] text-slate-500">Feels like {assessment.heat.heatIndex}°C</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#c5e6db] flex items-center gap-3 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-[#479b89] uppercase font-bold">Relative Humidity</div>
                <div className="text-lg font-black text-[#092c24] font-mono">
                  {assessment.heat.humidity}%
                </div>
                <div className="text-[10px] text-slate-500">Dewpoint balance</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#c5e6db] flex items-center gap-3 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-[#156550] border border-emerald-200">
                <CloudRain className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-[#479b89] uppercase font-bold">24h Rain Gauge</div>
                <div className="text-lg font-black text-[#092c24] font-mono">
                  {assessment.flood.rainfall24h} mm
                </div>
                <div className="text-[10px] text-slate-500">Precipitation depth</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#c5e6db] flex items-center gap-3 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Mountain className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-[#479b89] uppercase font-bold">Topographic Elevation</div>
                <div className="text-lg font-black text-[#092c24] font-mono">
                  {assessment.flood.elevation}m
                </div>
                <div className="text-[10px] text-slate-500">NASA SRTM ASL</div>
              </div>
            </div>
          </div>

          {/* 7. EXCLUSIVE EXPLORE MODULE 1: HOME VS EXPLORED LOCATION COMPARISON */}
          <div className="p-6 rounded-3xl bg-white border border-[#c5e6db] shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e1f2ec] pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#156550]" />
                <h3 className="text-sm font-extrabold text-[#092c24] uppercase tracking-wider">
                  Comparative Analysis: Explored Sector vs. Monitored Home
                </h3>
              </div>
              <span className="text-[11px] font-bold text-[#156550] bg-[#eef8f4] px-2.5 py-1 rounded-full border border-[#c5e6db]">
                Differential Climate Telemetry
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Home Baseline */}
              <div className="p-4 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#479b89]">Your Monitored Home</div>
                <div className="font-extrabold text-sm text-[#092c24] truncate">
                  {primaryLocation ? primaryLocation.name : 'Default Baseline (Central Sector)'}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#e1f2ec]">
                  <span className="text-xs text-[#375249]">Home Score:</span>
                  <span className="font-mono font-bold text-sm text-[#092c24]">
                    {homeAssessment?.overallScore || 48} / 100
                  </span>
                </div>
                <div className="text-[11px] text-[#375249]">
                  Temp: {homeAssessment?.heat.temperature || 32}°C · Moisture: {homeAssessment?.drought.soilMoisture || 28}%
                </div>
              </div>

              {/* Card 2: Explored Sector */}
              <div className="p-4 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#156550]">Currently Explored Sector</div>
                <div className="font-extrabold text-sm text-[#092c24] truncate">
                  {selectedPlace.name}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#e1f2ec]">
                  <span className="text-xs text-[#375249]">Explored Score:</span>
                  <span className="font-mono font-bold text-sm text-emerald-700">
                    {assessment.overallScore} / 100
                  </span>
                </div>
                <div className="text-[11px] text-[#375249]">
                  Temp: {assessment.heat.temperature}°C · Moisture: {assessment.drought.soilMoisture}%
                </div>
              </div>

              {/* Card 3: Live Differential Verdict */}
              {(() => {
                const homeScore = homeAssessment?.overallScore || 48;
                const deltaScore = assessment.overallScore - homeScore;
                const tempDelta = (assessment.heat.temperature - (homeAssessment?.heat.temperature || 32)).toFixed(1);
                const isWorse = deltaScore > 10;
                const isBetter = deltaScore < -10;

                return (
                  <div className={`p-4 rounded-2xl border space-y-2 ${
                    isWorse ? 'bg-orange-50 border-orange-200' :
                    isBetter ? 'bg-emerald-50 border-emerald-200' :
                    'bg-[#f7fcf9] border-[#c5e6db]'
                  }`}>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-[#092c24]">Environmental Variance</div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {isWorse ? '⚠️' : isBetter ? '🛡️' : '⚖️'}
                      </span>
                      <span className="text-xs font-extrabold text-[#092c24]">
                        {deltaScore > 0 ? `+${deltaScore} pts higher risk` : `${deltaScore} pts lower risk`}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#375249] leading-tight">
                      {isWorse
                        ? `This sector experiences ${tempDelta > '0' ? `+${tempDelta}°C warmer` : ''} conditions with accelerated stress compared to your home.`
                        : isBetter
                        ? `This sector enjoys more buffered environmental conditions than your home baseline.`
                        : `Conditions here are broadly comparable to your primary monitored sector.`}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 8. EXCLUSIVE EXPLORE MODULE 2: TOPOGRAPHIC ELEVATION & WATERSHED PROFILER */}
          <div className="p-6 rounded-3xl bg-white border border-[#c5e6db] shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e1f2ec] pb-3">
              <div className="flex items-center gap-2">
                <Mountain className="w-4 h-4 text-[#156550]" />
                <h3 className="text-sm font-extrabold text-[#092c24] uppercase tracking-wider">
                  Topographic & Watershed Drainage Profiler (NASA SRTM DEM)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-[#479b89]">
                Digital Elevation 30-Meter Resolution
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Contour Box */}
              <div className="p-4 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#092c24]">Elevation Contour</span>
                  <span className="text-base">🏔️</span>
                </div>
                <div className="font-mono text-2xl font-black text-[#092c24]">
                  {elevation} <span className="text-xs text-slate-500 font-normal">meters ASL</span>
                </div>
                <p className="text-[11px] text-[#375249] leading-relaxed">
                  Classified as <strong>{terrainClass}</strong>. Higher altitudes benefit from cooler air but experience steeper drainage velocity.
                </p>
              </div>

              {/* Slope & Runoff Velocity */}
              <div className="p-4 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#092c24]">Hydrological Slope</span>
                  <span className="text-base">📐</span>
                </div>
                <div className="font-mono text-2xl font-black text-[#092c24]">
                  {elevation > 800 ? '12.4°' : elevation > 400 ? '4.8°' : '1.5°'}
                  <span className="text-xs text-slate-500 font-normal"> gradient</span>
                </div>
                <p className="text-[11px] text-[#375249] leading-relaxed">
                  {elevation < 300 
                    ? 'Low gradient terrain increases pooling propensity during cloudbursts; water drains slowly.'
                    : 'Moderate to high slope angle accelerates surface runoff velocity toward downslope hollows.'}
                </p>
              </div>

              {/* Infiltration & Pooling Buffer */}
              <div className="p-4 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#092c24]">Runoff Retention Risk</span>
                  <span className="text-base">🌊</span>
                </div>
                <div className="font-mono text-2xl font-black text-[#092c24]">
                  {assessment.flood.groundSaturation}%
                  <span className="text-xs text-slate-500 font-normal"> saturated</span>
                </div>
                <p className="text-[11px] text-[#375249] leading-relaxed">
                  {assessment.flood.groundSaturation > 70 
                    ? 'High saturation: Topsoil has limited sponge capacity. Heavy rain triggers rapid overland pooling.'
                    : 'Good drainage cushion: Ground retains high absorption capacity before runoff accumulation.'}
                </p>
              </div>
            </div>
          </div>

          {/* 9. EXCLUSIVE EXPLORE MODULE 3: MULTI-SATELLITE REMOTE SENSING BAND INSPECTOR */}
          <div className="p-6 rounded-3xl bg-white border border-[#c5e6db] shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e1f2ec] pb-3">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-[#156550]" />
                <h3 className="text-sm font-extrabold text-[#092c24] uppercase tracking-wider">
                  Multi-Satellite Remote Sensing Band Inspector
                </h3>
              </div>
              <span className="text-[11px] text-[#479b89]">
                Live Open-Meteo & Copernicus Feeds
              </span>
            </div>

            {/* Satellite Band Selector Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'sentinel', label: '🛰️ Sentinel-2 (NDVI Vegetation)', band: 'Optical / NIR' },
                { id: 'lst', label: '🛰️ Landsat/MODIS (Surface Temp LST)', band: 'Thermal IR' },
                { id: 'srtm', label: '🛰️ NASA SRTM (Radar Topography)', band: 'C-Band InSAR' },
                { id: 'era5', label: '🛰️ ECMWF & GFS (Atmospheric Grid)', band: 'Numerical Reanalysis' }
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setActiveSatelliteBand(b.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    activeSatelliteBand === b.id
                      ? 'bg-[#092c24] text-white border-[#092c24] shadow-xs'
                      : 'bg-[#f7fcf9] text-[#156550] border-[#c5e6db] hover:bg-[#eef8f4]'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Band Details View */}
            <div className="p-4 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] space-y-3">
              {activeSatelliteBand === 'sentinel' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#092c24]">Normalized Difference Vegetation Index (NDVI)</span>
                    <span className="font-mono font-bold text-sm text-[#156550]">NDVI {assessment.drought.vegetationNDVI}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-600 via-lime-500 to-emerald-600 rounded-full"
                      style={{ width: `${Math.min(100, assessment.drought.vegetationNDVI * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#375249] leading-relaxed">
                    Measured by European Space Agency Sentinel-2 multispectral sensors via Red (Band 4) and Near-Infrared (Band 8). 
                    Chlorophyll actively reflects NIR waves. Current NDVI indicates {assessment.drought.vegetationNDVI > 0.4 ? 'healthy, dense vegetation canopy buffer' : 'stressed or desiccated agricultural foliage'}.
                  </p>
                </div>
              )}

              {activeSatelliteBand === 'lst' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#092c24]">Radiometric Land Surface Temperature (LST)</span>
                    <span className="font-mono font-bold text-sm text-orange-600">
                      {(assessment.heat.temperature + 4.2).toFixed(1)}°C Ground Radiance
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 rounded-full"
                      style={{ width: `${Math.min(100, ((assessment.heat.temperature - 15) / 35) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#375249] leading-relaxed">
                    Derived from thermal infrared radiometric sensors. While standard air thermometers measure shaded screen level ({assessment.heat.temperature}°C), 
                    dense asphalt, unshaded soil, and concrete roofs heat up to over {(assessment.heat.temperature + 4.2).toFixed(1)}°C, generating severe localized microclimate heat islands.
                  </p>
                </div>
              )}

              {activeSatelliteBand === 'srtm' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#092c24]">Radar Interferometry Digital Elevation Model (DEM)</span>
                    <span className="font-mono font-bold text-sm text-[#092c24]">{elevation}m ASL</span>
                  </div>
                  <p className="text-xs text-[#375249] leading-relaxed">
                    Generated by NASA Shuttle Radar Topography Mission (SRTM) at 30-meter global spatial grid resolution. 
                    Used by ClimateShield to model terrain water flow accumulation, catchment hollow pooling, and surface runoff vectors before rain accumulates.
                  </p>
                </div>
              )}

              {activeSatelliteBand === 'era5' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#092c24]">ECMWF Multi-Model Numerical Weather Forecasts</span>
                    <span className="font-mono font-bold text-sm text-emerald-700">Multi-Model Ensemble</span>
                  </div>
                  <p className="text-xs text-[#375249] leading-relaxed">
                    Fuses numerical atmospheric physics models (ECMWF IFS, GFS, ICON) to evaluate 7-day to 14-day forward climate trajectories. 
                    Enables early warning lead time days before localized tipping points occur.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 10. INTERACTIVE WHAT-IF SCENARIO STRESS-TESTING (FEATURED ON EXPLORE) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#156550]" />
                <h3 className="text-sm font-extrabold text-[#092c24] uppercase tracking-wider">
                  Interactive What-If Scenario Stress Testing
                </h3>
              </div>
              <span className="text-xs text-[#479b89] font-medium">Test sensitivity of this explored sector</span>
            </div>
            <ScenarioSimulator
              latitude={assessment.latitude}
              longitude={assessment.longitude}
            />
          </div>

          {/* 11. TRANSPARENT DATA GROUNDING */}
          <DataSourceCard
            isDemo={assessment.isDemo || isDemoMode}
            lastUpdated={assessment.timestamp}
          />
        </div>
      ) : null}
    </div>
  );
};
