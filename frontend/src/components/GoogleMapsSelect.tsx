import React, { useEffect, useState } from 'react';
import { 
  MapPin, 
  Check, 
  RotateCcw, 
  Loader2, 
  Compass, 
  ExternalLink,
  Building2,
  Lock,
  Globe,
  Navigation
} from 'lucide-react';
import { api } from '../services/api';

export interface GoogleMapsSelectedLocation {
  name: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  formattedAddress?: string;
}

interface GoogleMapsSelectProps {
  initialLat?: number;
  initialLon?: number;
  onConfirmLocation?: (location: GoogleMapsSelectedLocation) => void;
  onLocationSelect?: (location: GoogleMapsSelectedLocation) => void;
  className?: string;
}

// Verified Climate Monitoring Regional Hubs for 1-click selection
const CLIMATE_MONITORED_HUBS = [
  { id: 'bhopal', name: 'Bhopal (Central Agricultural Zone)', city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126, desc: 'Central agriculture & lake catchment' },
  { id: 'indore', name: 'Indore (Malwa Plateau)', city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577, desc: 'Soybean & wheat heartland' },
  { id: 'delhi', name: 'New Delhi (Northern Plains)', city: 'New Delhi', state: 'Delhi', lat: 28.6139, lon: 77.2090, desc: 'Yamuna basin & urban heat index' },
  { id: 'mumbai', name: 'Mumbai (Konkan Coast)', city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, desc: 'Coastal monsoon & storm surge' },
  { id: 'bengaluru', name: 'Bengaluru (Deccan Plateau)', city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, desc: 'Deccan water table & micro-climate' },
  { id: 'jaipur', name: 'Jaipur (Semi-Arid Zone)', city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, desc: 'Arid climate & heat wave vulnerability' },
  { id: 'chennai', name: 'Chennai (Coromandel Coast)', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, desc: 'Northeast monsoon & coastal reservoir' },
  { id: 'kolkata', name: 'Kolkata (Ganges Delta)', city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, desc: 'Deltaic wetlands & cyclone radar' }
];

export const GoogleMapsSelect: React.FC<GoogleMapsSelectProps> = ({
  initialLat = 23.2599,
  initialLon = 77.4126,
  onConfirmLocation,
  onLocationSelect,
  className = 'h-72 sm:h-80'
}) => {
  const [selectedLat, setSelectedLat] = useState<number>(initialLat);
  const [selectedLon, setSelectedLon] = useState<number>(initialLon);
  const [isIdentifying, setIsIdentifying] = useState<boolean>(false);
  const [pendingSelection, setPendingSelection] = useState<GoogleMapsSelectedLocation | null>(null);

  // Manual coordinate inputs
  const [manualLat, setManualLat] = useState<string>(initialLat.toFixed(4));
  const [manualLon, setManualLon] = useState<string>(initialLon.toFixed(4));

  // Google Maps Embed URL (identical to MediCycle - zero API key required, official Google Maps iframe)
  const embedMapUrl = `https://maps.google.com/maps?q=${selectedLat},${selectedLon}&hl=en&z=14&output=embed`;
  const externalGoogleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${selectedLat},${selectedLon}`;

  // Initial load
  useEffect(() => {
    handleSelectLocation(initialLat, initialLon);
  }, []);

  // Updates active coordinates, reverse geocodes and updates state
  const handleSelectLocation = async (lat: number, lon: number) => {
    setSelectedLat(lat);
    setSelectedLon(lon);
    setManualLat(lat.toFixed(6));
    setManualLon(lon.toFixed(6));
    setIsIdentifying(true);

    // Initial placeholder so UI responds immediately
    const tempLocation: GoogleMapsSelectedLocation = {
      name: `Region (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`,
      latitude: lat,
      longitude: lon,
      formattedAddress: `Coordinates: ${lat.toFixed(6)}°, ${lon.toFixed(6)}°`
    };
    setPendingSelection(tempLocation);
    onLocationSelect?.(tempLocation);

    // Fetch accurate address from backend reverse geocoding
    try {
      const details = await api.getLocationDetails(lat, lon);
      if (details) {
        const locationData: GoogleMapsSelectedLocation = {
          name: details.name,
          latitude: lat,
          longitude: lon,
          city: details.city || details.name,
          state: details.state,
          country: details.country || 'India',
          formattedAddress: details.formattedAddress || `${details.name}, ${details.state || ''}`
        };
        setPendingSelection(locationData);
        onLocationSelect?.(locationData);
        setIsIdentifying(false);
        return;
      }
    } catch (e) {
      console.warn('Backend reverse geocode fallback:', e);
    }

    // Fallback to matched regional hub
    const closestHub = CLIMATE_MONITORED_HUBS.find(h => 
      Math.abs(h.lat - lat) < 0.25 && Math.abs(h.lon - lon) < 0.25
    );

    const fallbackLoc: GoogleMapsSelectedLocation = {
      name: closestHub ? closestHub.name : `Sector (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`,
      latitude: lat,
      longitude: lon,
      city: closestHub ? closestHub.city : 'Monitored Sector',
      state: closestHub ? closestHub.state : 'Monitored Region',
      country: 'India',
      formattedAddress: closestHub 
        ? `${closestHub.name}, ${closestHub.state}, India`
        : `Coordinates: ${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`
    };

    setPendingSelection(fallbackLoc);
    onLocationSelect?.(fallbackLoc);
    setIsIdentifying(false);
  };

  // Reset to initial
  const handleReset = () => {
    handleSelectLocation(initialLat, initialLon);
  };

  // Confirm Location
  const handleConfirm = () => {
    if (!pendingSelection) return;
    onLocationSelect?.(pendingSelection);
    onConfirmLocation?.(pendingSelection);
  };

  // Submit manual coordinates
  const handleManualCoordSubmit = () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (isNaN(lat) || isNaN(lon)) return;
    handleSelectLocation(lat, lon);
  };

  return (
    <div className="space-y-3.5">
      {/* Platform Branding Header (MediCycle style) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#092c24] via-[#156550] to-[#092c24] text-white shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center border border-white/20 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black tracking-tight text-white">
                Google Maps Verified Location Radar
              </h3>
            </div>
            <p className="text-[11px] text-emerald-100/80">
              Powered by Google Maps Platform • Controlled Climate Early Warning
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <Globe className="w-3 h-3" />
          Live Google Maps View
        </span>
      </div>

      {/* Main Google Maps View (Identical to MediCycle) */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-[#a8dec9] shadow-md bg-slate-100">
        <div className={`relative w-full ${className}`}>
          <iframe
            title={`Google Map view for ${pendingSelection?.name || 'Selected Location'}`}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src={embedMapUrl}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
        </div>

        {/* Floating status tag */}
        <div className="absolute top-3 left-3 z-[10] flex items-center gap-2 pointer-events-none">
          {isIdentifying ? (
            <div className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#a8dec9] shadow-md text-[11px] font-bold text-[#092c24] flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 text-[#156550] animate-spin" />
              <span>Resolving address...</span>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#c5e6db] shadow-xs text-[11px] font-semibold text-[#156550] flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-[#156550]" />
              <span>{pendingSelection?.city || pendingSelection?.name || 'Active Map Center'}</span>
            </div>
          )}
        </div>

        {/* External Link to Google Maps */}
        <a
          href={externalGoogleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 z-[10] px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-xs text-slate-800 hover:text-emerald-700 text-xs font-bold shadow-md border border-slate-200 flex items-center gap-1.5 transition-all hover:scale-105"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>

      {/* Quick Select Monitored Climate Hubs */}
      <div className="p-3 rounded-2xl bg-white border border-[#c5e6db] shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#092c24] uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-[#156550]" />
            Select Monitored Climate Region
          </span>
          <span className="text-[10px] text-[#479b89]">Click to position map</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CLIMATE_MONITORED_HUBS.map((hub) => {
            const isSelected = Math.abs(selectedLat - hub.lat) < 0.05 && Math.abs(selectedLon - hub.lon) < 0.05;
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => handleSelectLocation(hub.lat, hub.lon)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-[#092c24] text-[#a7f3d0] border-[#092c24] shadow-xs'
                    : 'bg-[#f7fcf9] text-[#1e3a34] hover:bg-[#eef8f4] border-[#c5e6db]'
                }`}
              >
                <MapPin className="w-3 h-3 text-[#156550]" />
                <span>{hub.city}</span>
                {isSelected && <Check className="w-3 h-3 text-[#a7f3d0]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Location Confirmation Panel */}
      {pendingSelection && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-white via-[#f7fcf9] to-[#eef8f4] border-2 border-[#156550] shadow-md animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#156550]">
                <span>📍</span>
                <span>Selected Climate Sector</span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-[#092c24]">
                {pendingSelection.name}
              </h4>
              <p className="text-xs text-[#375249] line-clamp-1">
                {pendingSelection.formattedAddress || `${pendingSelection.city || ''}, ${pendingSelection.state || ''}, ${pendingSelection.country || ''}`}
              </p>
              <div className="text-xs font-mono text-[#479b89] pt-1">
                Latitude: <strong className="text-[#092c24]">{pendingSelection.latitude.toFixed(6)}°</strong> • Longitude: <strong className="text-[#092c24]">{pendingSelection.longitude.toFixed(6)}°</strong>
              </div>
            </div>

            {/* Action Buttons: [ Reset ] and [ Confirm Location ] */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-full bg-white hover:bg-slate-100 text-[#1e3a34] font-bold text-xs border border-[#c5e6db] transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#479b89]" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="px-6 py-2.5 rounded-full bg-[#092c24] hover:bg-[#051c16] text-white font-bold text-xs shadow-md shadow-[#092c24]/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Check className="w-4 h-4 text-[#a7f3d0]" />
                <span>Confirm Location</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Direct Coordinates Form */}
      <div className="p-3 rounded-2xl bg-white border border-[#c5e6db] space-y-2 text-left shadow-2xs">
        <div className="text-xs font-bold text-[#092c24] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#156550]" />
            Direct GPS Coordinate Entry
          </span>
          <span className="text-[10px] text-[#479b89]">Enter any decimal coordinates</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase font-bold text-[#375249] block mb-0.5">Latitude</label>
            <input
              type="text"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-[#c5e6db] text-xs font-mono"
              placeholder="23.2599"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-[#375249] block mb-0.5">Longitude</label>
            <input
              type="text"
              value={manualLon}
              onChange={(e) => setManualLon(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-[#c5e6db] text-xs font-mono"
              placeholder="77.4126"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleManualCoordSubmit}
          className="w-full py-2 rounded-xl bg-[#092c24] hover:bg-[#051c16] text-[#a7f3d0] font-bold text-xs shadow-xs transition-colors"
        >
          Center Google Map to Coordinates
        </button>
      </div>
    </div>
  );
};
