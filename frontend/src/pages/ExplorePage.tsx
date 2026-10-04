import React, { useState, useEffect } from 'react';
import { Search, MapPin, Compass, RefreshCw, BookmarkPlus, Wind, Droplets, Thermometer, CloudRain } from 'lucide-react';
import { api } from '../services/api';
import { RiskAssessment, LocationSearchResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { LeafletRiskMap } from '../components/LeafletRiskMap';
import { GoogleMapsSelect, GoogleMapsSelectedLocation } from '../components/GoogleMapsSelect';
import { RiskBadge } from '../components/RiskBadge';
import { HazardRiskCard } from '../components/HazardRiskCard';
import { RiskTimeline } from '../components/RiskTimeline';
import { ExplainableRisk } from '../components/ExplainableRisk';
import { ImpactChainWidget } from '../components/ImpactChainWidget';
import { ScenarioSimulator } from '../components/ScenarioSimulator';
import { DataSourceCard } from '../components/DataSourceCard';

export const ExplorePage: React.FC = () => {
  const { user, setPrimaryLocationState, isDemoMode } = useAuth();
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
  const [loading, setLoading] = useState(false);
  const [savingPrimary, setSavingPrimary] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
    // Reuse existing ClimateShield environmental analysis workflow
    analyzeSelected(loc.latitude, loc.longitude, loc.name);
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

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Top Header & Mode Toggle Bar */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#156550]">
            <Compass className="w-3.5 h-3.5" />
            <span>Geospatial Risk Exploration</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-[#092c24] mt-1">
            Explore Climate Conditions Anywhere
          </h1>
          <p className="text-xs text-[#375249]">
            Search any city, village, district, or select directly on Google Maps to calculate instant multi-hazard risk profiles.
          </p>
        </div>

        {/* Exploration Workflow Mode Selector */}
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
            <span>Select on Map (Google Maps)</span>
          </button>
        </div>

        {/* Mode 1: Select on Map (Google Maps Platform) */}
        {exploreMode === 'map' && (
          <div className="space-y-3 p-5 sm:p-7 rounded-3xl bg-white border border-[#c5e6db] shadow-md animate-in fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-[#156550] bg-[#d7f1e6] px-2.5 py-0.5 rounded-full border border-[#a8dec9]">
                  Google Maps Platform Integration
                </span>
                <span className="text-xs text-[#375249]">· Google Geocoding API</span>
              </div>
              <h3 className="text-base font-black text-[#092c24]">
                Click anywhere on the Google Map to drop a target pin
              </h3>
              <p className="text-xs text-[#375249]">
                Coordinates will be reverse geocoded into locality, state, and country. Confirming runs the existing ClimateShield multi-hazard risk engine.
              </p>
            </div>

            <GoogleMapsSelect
              initialLat={selectedPlace.latitude}
              initialLon={selectedPlace.longitude}
              onLocationSelect={(loc) => {
                setSelectedPlace({
                  name: loc.name,
                  latitude: loc.latitude,
                  longitude: loc.longitude
                });
                setQuery(loc.name);
              }}
              onConfirmLocation={handleConfirmGoogleMapLocation}
              className="h-80 sm:h-96"
            />
          </div>
        )}

        {/* Mode 2: Search input with live suggestions */}
        {exploreMode === 'search' && (
          <div className="relative">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-[#479b89] absolute left-4" />
              <input
                type="text"
                placeholder="Search any city, village, district or area (e.g. Indore, Madhya Pradesh)..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                className="w-full pl-12 pr-28 py-3.5 rounded-full bg-white border border-[#c5e6db] text-sm text-slate-900 placeholder-[#479b89]/70 focus:outline-none focus:border-[#092c24] focus:ring-1 focus:ring-[#092c24] shadow-sm transition-colors"
              />
              <button
                onClick={() => handleSearch(query)}
                className="absolute right-2 px-5 py-2 rounded-full bg-[#092c24] hover:bg-[#051c16] text-white font-bold text-xs shadow-sm transition-colors"
              >
                Search
              </button>
            </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="text-[#375249] font-bold text-[11px]">Popular Locations:</span>
            {[
              { name: 'Indore, MP', lat: 22.7196, lon: 75.8577 },
              { name: 'Bhopal, MP', lat: 23.2599, lon: 77.4126 },
              { name: 'New Delhi', lat: 28.6139, lon: 77.2090 },
              { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
              { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
              { name: 'Phoenix, USA', lat: 33.4484, lon: -112.0740 }
            ].map((loc) => (
              <button
                key={loc.name}
                onClick={() => {
                  setQuery(loc.name);
                  setSelectedPlace({ name: loc.name, latitude: loc.lat, longitude: loc.lon });
                }}
                className="px-3.5 py-1 rounded-full bg-white border border-[#c5e6db] hover:border-[#156550] text-[#1e3a34] hover:text-[#092c24] text-[11px] font-bold transition-colors shadow-2xs"
              >
                {loc.name}
              </button>
            ))}
          </div>

          {/* Autocomplete dropdown */}
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-white border border-[#c5e6db] rounded-2xl shadow-xl overflow-hidden divide-y divide-[#e1f2ec] max-h-60 overflow-y-auto">
              {results.map((res, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectResult(res)}
                  className="p-3.5 hover:bg-[#eef8f4] cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <div className="font-bold text-[#092c24]">{res.name}</div>
                    <div className="text-[11px] text-[#479b89]">{res.formattedAddress}</div>
                  </div>
                  <span className="text-[10px] text-[#375249] font-mono">
                    {res.latitude.toFixed(2)}°, {res.longitude.toFixed(2)}°
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>

      {/* Selected Location Summary Bar */}
      <div className="p-6 rounded-3xl bg-white border border-[#c5e6db] flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#156550]">
            <MapPin className="w-3.5 h-3.5" />
            <span>Target Exploration Coordinates</span>
          </div>
          <h2 className="text-xl font-black text-[#092c24] mt-1">{selectedPlace.name}</h2>
          <div className="text-xs text-[#375249] font-mono mt-0.5">
            Latitude: {selectedPlace.latitude.toFixed(4)}° | Longitude: {selectedPlace.longitude.toFixed(4)}°
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={handleSetAsPrimary}
              disabled={savingPrimary || savedSuccess}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                savedSuccess
                  ? 'bg-[#d7f1e6] text-[#092c24] border border-[#a8dec9]'
                  : 'bg-[#092c24] hover:bg-[#051c16] text-white'
              }`}
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>{savedSuccess ? 'Monitored as Primary' : 'Set as My Monitored Location'}</span>
            </button>
          )}

          {assessment && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#375249] font-semibold">Risk:</span>
              <RiskBadge level={assessment.overallLevel} size="md" />
            </div>
          )}
        </div>
      </div>

      {/* Interactive Map with Risk Radius & Click-to-Explore */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#1e3a34] font-bold">
          <span>Geospatial Risk Zone Projection</span>
          <span className="text-[#156550]">Click anywhere to recalculate</span>
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
        <div className="p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#156550] animate-spin mx-auto" />
          <p className="text-xs text-[#1e3a34] font-bold">
            Ingesting digital elevation models, precipitation anomalies, and satellite proxies...
          </p>
        </div>
      ) : assessment ? (
        <div className="space-y-8">
          {/* Current Conditions Row */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#092c24]">Current Environmental Conditions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-[#c5e6db] flex items-center gap-3 shadow-2xs">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-[#479b89] uppercase font-bold">Temperature</div>
                  <div className="text-lg font-black text-[#092c24] font-mono">
                    {assessment.heat.temperature}°C
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#c5e6db] flex items-center gap-3 shadow-2xs">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-[#479b89] uppercase font-bold">Humidity</div>
                  <div className="text-lg font-black text-[#092c24] font-mono">
                    {assessment.heat.humidity}%
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#c5e6db] flex items-center gap-3 shadow-2xs">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-[#156550] border border-emerald-200">
                  <CloudRain className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-[#479b89] uppercase font-bold">24h Rainfall</div>
                  <div className="text-lg font-black text-[#092c24] font-mono">
                    {assessment.flood.rainfall24h} mm
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#c5e6db] flex items-center gap-3 shadow-2xs">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-[#479b89] uppercase font-bold">Elevation</div>
                  <div className="text-lg font-black text-[#092c24] font-mono">
                    {assessment.flood.elevation}m
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Core Hazard Risk Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HazardRiskCard
              hazard="heat"
              title="Heat Stress Index"
              data={assessment.heat}
            />
            <HazardRiskCard
              hazard="drought"
              title="Drought Deficit"
              data={assessment.drought}
            />
            <HazardRiskCard
              hazard="flood"
              title="Flood Inundation"
              data={assessment.flood}
            />
          </div>

          {/* Future Risk Timeline (24h, 3d, 7d) */}
          <RiskTimeline timeline={assessment.timeline} />

          {/* Factor Breakdown */}
          <ExplainableRisk assessment={assessment} />

          {/* Potential Impact Chain */}
          <ImpactChainWidget chains={assessment.impactChains} />

          {/* Scenario Simulation on Explored Target */}
          <ScenarioSimulator
            latitude={assessment.latitude}
            longitude={assessment.longitude}
          />

          {/* Transparent Data Grounding */}
          <DataSourceCard
            isDemo={assessment.isDemo || isDemoMode}
            lastUpdated={assessment.timestamp}
          />
        </div>
      ) : null}
    </div>
  );
};
