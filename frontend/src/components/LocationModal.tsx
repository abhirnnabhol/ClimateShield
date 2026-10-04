import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Navigation, 
  MapPin, 
  X, 
  Loader2, 
  Check, 
  Leaf, 
  Globe, 
  Compass, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { LocationSearchResult, Location } from '../types';
import { useAuth } from '../context/AuthContext';
import { LeafletRiskMap } from './LeafletRiskMap';
import { GoogleMapsSelect } from './GoogleMapsSelect';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSaved?: (location: Location) => void;
  initialQuery?: string;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onLocationSaved,
  initialQuery = ''
}) => {
  const { user, setPrimaryLocationState, primaryLocation } = useAuth();
  const [tab, setTab] = useState<'search' | 'current' | 'map'>('search');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedResult, setSelectedResult] = useState<LocationSearchResult | null>(null);

  // Map click coordinates (defaults to user primary location or default central hub Bhopal)
  const [mapCoords, setMapCoords] = useState<{ lat: number; lon: number }>({
    lat: primaryLocation?.latitude || 23.2599,
    lon: primaryLocation?.longitude || 77.4126
  });

  // Farmer optional details
  const [cropType, setCropType] = useState(user?.cropType || '');
  const [farmArea, setFarmArea] = useState(user?.farmArea || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocStatus, setCurrentLocStatus] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  // When switching to map tab, ensure default coords have resolved details
  useEffect(() => {
    if (tab === 'map' && !selectedResult) {
      resolveAddress(mapCoords.lat, mapCoords.lon);
    }
  }, [tab]);

  if (!isOpen) return null;

  const handleSearch = async (q: string) => {
    if (!q || q.trim().length < 2) return;
    setIsSearching(true);
    setError(null);
    try {
      const res = await api.searchLocations(q);
      setResults(res);
      if (res.length > 0) {
        setSelectedResult(res[0]);
        setMapCoords({ lat: res[0].latitude, lon: res[0].longitude });
      }
    } catch (err: any) {
      setError(err.message || 'Location search failed');
    } finally {
      setIsSearching(false);
    }
  };

  // Helper to reverse geocode coordinates and set as selected
  const resolveAddress = async (lat: number, lon: number): Promise<LocationSearchResult> => {
    try {
      const details = await api.getLocationDetails(lat, lon);
      setSelectedResult(details);
      return details;
    } catch {
      const fallback: LocationSearchResult = {
        name: `Coordinates (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`,
        latitude: lat,
        longitude: lon,
        city: 'Selected Sector',
        state: 'Monitored Region',
        country: 'India',
        formattedAddress: `Lat: ${lat.toFixed(4)}°, Lon: ${lon.toFixed(4)}°`,
        timezone: 'UTC',
        provider: 'GEOPIN'
      };
      setSelectedResult(fallback);
      return fallback;
    }
  };

  // 1. USE CURRENT LOCATION (Robust GPS + IP Fallback)
  const handleUseCurrentLocation = async () => {
    setTab('current');
    setIsLocating(true);
    setError(null);
    setCurrentLocStatus('Querying device GPS / satellite positioning...');

    if (!navigator.geolocation) {
      fallbackToNetworkLocation('Browser geolocation not supported on this device');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setCurrentLocStatus('Coordinates acquired. Resolving regional address...');
          const details = await resolveAddress(lat, lon);
          setMapCoords({ lat, lon });
          setCurrentLocStatus(`✓ Successfully acquired device GPS: ${details.city || details.name}`);
        } catch (e: any) {
          fallbackToNetworkLocation('Reverse geocoding timed out, falling back to regional network');
        } finally {
          setIsLocating(false);
        }
      },
      (geoError) => {
        console.warn('Browser GPS unavailable:', geoError.message);
        fallbackToNetworkLocation(`Device GPS notice: ${geoError.message}`);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  // IP / Network based fallback if GPS is blocked by browser policy
  const fallbackToNetworkLocation = async (reason: string) => {
    setCurrentLocStatus('Attempting network IP geolocation fallback...');
    try {
      const ipRes = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) })
        .then((r) => r.json())
        .catch(() => null);

      if (ipRes && ipRes.latitude && ipRes.longitude) {
        const lat = parseFloat(ipRes.latitude);
        const lon = parseFloat(ipRes.longitude);
        setMapCoords({ lat, lon });
        const details = await resolveAddress(lat, lon);
        setCurrentLocStatus(`✓ Acquired network location: ${details.city || ipRes.city || 'Local Sector'}`);
        setIsLocating(false);
        return;
      }
    } catch {
      // Ignore
    }

    // Default to prime central baseline if both fail
    const defaultLat = 23.2599;
    const defaultLon = 77.4126;
    setMapCoords({ lat: defaultLat, lon: defaultLon });
    const details = await resolveAddress(defaultLat, defaultLon);
    setCurrentLocStatus(`Using standard regional baseline (${details.city}). Please select on map or search if needed.`);
    setIsLocating(false);
  };

  // 2. SELECT ON MAP POINT HANDLER
  const handleMapPointSelect = async (lat: number, lon: number) => {
    setMapCoords({ lat, lon });
    // Immediately set quick preview
    setSelectedResult({
      name: `Pinned Location (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`,
      latitude: lat,
      longitude: lon,
      city: 'Resolving address...',
      state: '',
      country: '',
      formattedAddress: `Coordinates: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`,
      timezone: 'UTC',
      provider: 'map'
    });

    // Reverse geocode to get true place name
    await resolveAddress(lat, lon);
  };

  const handleSaveLocation = async () => {
    if (!selectedResult) {
      setError('Please select or search a location first');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await api.saveLocation({
        name: selectedResult.formattedAddress || selectedResult.name,
        latitude: selectedResult.latitude,
        longitude: selectedResult.longitude,
        city: selectedResult.city || selectedResult.name.split(',')[0],
        state: selectedResult.state || selectedResult.name.split(',')[1]?.trim() || '',
        country: selectedResult.country || 'India',
        isPrimary: true,
        cropType: user?.userType === 'Farmer' ? cropType : undefined,
        farmArea: user?.userType === 'Farmer' ? farmArea : undefined
      });

      if (res.location) {
        setPrimaryLocationState(res.location);
        if (onLocationSaved) onLocationSaved(res.location);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save monitored location');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#092c24]/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#c5e6db] rounded-3xl w-full max-w-xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#e1f2ec] bg-[#f4fbf7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#092c24] text-[#a7f3d0] flex items-center justify-center shadow-xs">
              <Leaf className="w-5 h-5 fill-[#a7f3d0]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#092c24]">Configure Monitored Region</h2>
              <p className="text-[11px] text-[#479b89]">
                Choose your primary hyperlocal location for continuous environmental risk assessment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#479b89] hover:text-[#092c24] hover:bg-[#eef8f4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-[#c5e6db] bg-[#eef8f4] p-2 gap-1.5">
          <button
            type="button"
            onClick={() => setTab('search')}
            className={`flex-1 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              tab === 'search' ? 'bg-[#092c24] text-white shadow-xs' : 'text-[#156550] hover:text-[#092c24]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
          
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className={`flex-1 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              tab === 'current' ? 'bg-[#092c24] text-white shadow-xs' : 'text-[#156550] hover:text-[#092c24]'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Current Location</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('map');
              if (!selectedResult) resolveAddress(mapCoords.lat, mapCoords.lon);
            }}
            className={`flex-1 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              tab === 'map' ? 'bg-[#092c24] text-white shadow-xs' : 'text-[#156550] hover:text-[#092c24]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Select on Map</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: SEARCH LOCATION */}
          {tab === 'search' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#479b89] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search city, district, village (e.g. Bhopal, Indore, Delhi)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  className="w-full pl-10 pr-24 py-2.5 rounded-full bg-[#f7fcf9] border border-[#c5e6db] text-xs text-slate-800 placeholder-[#479b89]/70 focus:outline-none focus:border-[#092c24] focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleSearch(searchQuery)}
                  disabled={isSearching}
                  className="absolute right-1.5 top-1.5 px-4 py-1.5 rounded-full bg-[#092c24] hover:bg-[#051c16] text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
                </button>
              </div>

              {/* Quick Picks */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-[#375249] font-bold text-[11px]">Quick Picks:</span>
                {['Bhopal', 'Indore', 'New Delhi', 'Mumbai', 'London', 'Phoenix'].map((city) => (
                  <button
                    type="button"
                    key={city}
                    onClick={() => {
                      setSearchQuery(city);
                      handleSearch(city);
                    }}
                    className="px-3 py-1 rounded-full bg-[#eef8f4] hover:bg-[#e1f2ec] text-[#092c24] text-[11px] font-bold border border-[#c5e6db] transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>

              {/* Search Results List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
                {results.map((res, idx) => {
                  const isSelected =
                    selectedResult?.latitude === res.latitude &&
                    selectedResult?.longitude === res.longitude;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedResult(res);
                        setMapCoords({ lat: res.latitude, lon: res.longitude });
                      }}
                      className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                        isSelected
                          ? 'bg-[#eef8f4] border-[#156550] text-[#092c24] font-bold'
                          : 'bg-[#f7fcf9] border-[#c5e6db] hover:bg-[#eef8f4] text-[#1e3a34]'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-[#092c24]">{res.name}</div>
                        <div className="text-[11px] text-[#479b89]">{res.formattedAddress}</div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="text-[10px] text-[#375249] font-mono">
                          {res.latitude.toFixed(2)}°, {res.longitude.toFixed(2)}°
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#156550]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: USE CURRENT LOCATION */}
          {tab === 'current' && (
            <div className="p-4 sm:p-5 rounded-3xl bg-[#f7fcf9] border border-[#c5e6db] space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#eef8f4] border border-[#a8dec9] text-[#156550] flex items-center justify-center mx-auto shadow-xs">
                {isLocating ? (
                  <Loader2 className="w-7 h-7 animate-spin text-[#156550]" />
                ) : (
                  <Navigation className="w-7 h-7 text-[#092c24]" />
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#092c24]">
                  {isLocating ? 'Detecting Device Geolocation...' : 'Device Location Telemetry'}
                </h3>
                <p className="text-xs text-[#375249] mt-1 max-w-sm mx-auto">
                  {currentLocStatus || 'Click below to query your browser GPS sensors or network triangulation.'}
                </p>
              </div>

              {selectedResult && !isLocating && (
                <div className="p-3.5 rounded-2xl bg-white border border-[#a8dec9] text-left space-y-1 shadow-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#156550]">
                      Acquired Coordinates
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Ready
                    </span>
                  </div>
                  <div className="text-sm font-black text-[#092c24]">
                    {selectedResult.city || selectedResult.name}
                  </div>
                  <div className="text-xs text-[#375249]">
                    {selectedResult.formattedAddress || `${selectedResult.state}, ${selectedResult.country}`}
                  </div>
                  <div className="text-[11px] font-mono text-[#479b89]">
                    Latitude: {selectedResult.latitude.toFixed(4)}° • Longitude: {selectedResult.longitude.toFixed(4)}°
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="px-5 py-2 rounded-full bg-[#092c24] hover:bg-[#051c16] text-[#a7f3d0] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Detecting...' : 'Re-detect Current Location'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SELECT ON MAP (GOOGLE MAPS) */}
          {tab === 'map' && (
            <div className="space-y-3">
              <GoogleMapsSelect
                initialLat={mapCoords.lat}
                initialLon={mapCoords.lon}
                className="h-64 sm:h-72"
                onLocationSelect={(loc) => {
                  const resultObj: LocationSearchResult = {
                    name: loc.name,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    city: loc.city || loc.name,
                    state: loc.state || '',
                    country: loc.country || 'India',
                    formattedAddress: loc.formattedAddress || `${loc.name}, ${loc.state || ''}, ${loc.country || ''}`,
                    timezone: 'UTC',
                    provider: 'google'
                  };
                  setSelectedResult(resultObj);
                  setMapCoords({ lat: loc.latitude, lon: loc.longitude });
                }}
                onConfirmLocation={async (loc) => {
                  const resultObj: LocationSearchResult = {
                    name: loc.name,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    city: loc.city || loc.name,
                    state: loc.state || '',
                    country: loc.country || 'India',
                    formattedAddress: loc.formattedAddress || `${loc.name}, ${loc.state || ''}, ${loc.country || ''}`,
                    timezone: 'UTC',
                    provider: 'google'
                  };
                  setSelectedResult(resultObj);
                  setMapCoords({ lat: loc.latitude, lon: loc.longitude });
                  
                  // Auto-save upon explicit confirmation
                  setSaving(true);
                  setError(null);
                  try {
                    const res = await api.saveLocation({
                      name: resultObj.formattedAddress || resultObj.name,
                      latitude: resultObj.latitude,
                      longitude: resultObj.longitude,
                      city: resultObj.city || resultObj.name.split(',')[0],
                      state: resultObj.state || '',
                      country: resultObj.country || 'India',
                      isPrimary: true,
                      cropType: user?.userType === 'Farmer' ? cropType : undefined,
                      farmArea: user?.userType === 'Farmer' ? farmArea : undefined
                    });

                    if (res.location) {
                      setPrimaryLocationState(res.location);
                      if (onLocationSaved) onLocationSaved(res.location);
                      onClose();
                    }
                  } catch (err: any) {
                    setError(err.message || 'Failed to save monitored location');
                  } finally {
                    setSaving(false);
                  }
                }}
              />

              {/* Selected Pinned Location Info Card */}
              {selectedResult && (
                <div className="p-3 rounded-xl bg-[#f7fcf9] border border-[#c5e6db] flex items-center justify-between text-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#479b89] block">Pinned Region</span>
                      <span className="font-bold text-[#092c24]">
                        {selectedResult.city || selectedResult.name}
                      </span>
                      <span className="text-[#375249] text-[11px] ml-1.5">
                        ({mapCoords.lat.toFixed(4)}°, {mapCoords.lon.toFixed(4)}°)
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#d7f1e6] text-[#092c24] font-bold px-2 py-0.5 rounded-full border border-[#a8dec9]">
                    ✓ Pin Active
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Farmer specific fields */}
          {user?.userType === 'Farmer' && (
            <div className="p-4 rounded-2xl bg-[#eef8f4] border border-[#c5e6db] space-y-3">
              <div className="text-xs font-bold text-[#156550] uppercase tracking-wider">
                🌾 Agricultural Context (Optional for Farmers)
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1e3a34] block mb-1">Primary Crop Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Wheat, Soybean"
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#c5e6db] text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1e3a34] block mb-1">Farm Area / Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 25 Hectares"
                    value={farmArea}
                    onChange={(e) => setFarmArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#c5e6db] text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-[#e1f2ec] bg-[#f4fbf7]">
          <div className="text-xs text-[#375249]">
            {selectedResult ? (
              <span className="text-[#092c24] font-bold truncate max-w-[200px] sm:max-w-xs block">
                Selected: {selectedResult.city || selectedResult.name}
              </span>
            ) : (
              <span>Pick a location to continue</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#479b89] hover:text-[#092c24] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveLocation}
              disabled={saving || !selectedResult}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#092c24] hover:bg-[#051c16] text-white text-xs font-bold transition-all shadow-md shadow-[#092c24]/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin text-[#a7f3d0]" /> : <Check className="w-4 h-4 text-[#a7f3d0]" />}
              <span>Save & Monitor Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
