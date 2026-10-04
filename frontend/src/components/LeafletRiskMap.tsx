import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RiskLevel } from '../types';

interface LeafletRiskMapProps {
  latitude: number;
  longitude: number;
  locationName: string;
  overallScore: number;
  overallLevel: RiskLevel;
  heatScore?: number;
  droughtScore?: number;
  floodScore?: number;
  onMapClick?: (lat: number, lon: number) => void;
  interactive?: boolean;
  className?: string;
}

export const LeafletRiskMap: React.FC<LeafletRiskMapProps> = ({
  latitude,
  longitude,
  locationName,
  overallScore,
  overallLevel,
  heatScore = 50,
  droughtScore = 40,
  floodScore = 30,
  onMapClick,
  className = 'h-96'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleLayersRef = useRef<L.Circle[]>([]);
  const onMapClickRef = useRef(onMapClick);

  // Keep onMapClickRef updated with latest function reference
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  const getRiskColor = (score: number) => {
    if (score >= 75) return '#ef4444'; // Red
    if (score >= 50) return '#f97316'; // Orange
    if (score >= 25) return '#eab308'; // Amber/Yellow
    return '#10b981'; // Emerald
  };

  // 1. Initialize and clean up Leaflet Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map container is already assigned
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 11,
        zoomControl: true,
        attributionControl: true
      });

      // CartoDB Voyager Light tiles for crisp geospatial contrast
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>, OpenStreetMap',
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // Register map click listener
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onMapClickRef.current) {
          onMapClickRef.current(e.latlng.lat, e.latlng.lng);
        }
      });

      mapInstanceRef.current = map;

      // Ensure proper size calculation
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run only on mount and unmount

  // 2. Update view, marker, and circles when coordinates or properties change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setView([latitude, longitude], map.getZoom() || 11);

    // Clear previous marker & circles
    if (markerRef.current) {
      markerRef.current.remove();
    }
    circleLayersRef.current.forEach((c) => c.remove());
    circleLayersRef.current = [];

    // Create custom pin icon
    const color = getRiskColor(overallScore);
    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: ${color}; opacity: 0.3; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 20px; height: 20px; border-radius: 50%; background-color: ${color}; border: 3px solid #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
    marker.bindPopup(`
      <div style="padding: 8px; font-family: system-ui, sans-serif; font-size: 13px; color: #0f172a;">
        <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px; color: #092c24;">${locationName}</div>
        <div style="display: flex; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
          <span style="color: #64748b;">Risk Index:</span>
          <span style="font-weight: 800; color: ${color};">${overallScore} / 100 (${overallLevel})</span>
        </div>
        <div style="font-size: 11px; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 6px;">
          🔥 Heat: ${heatScore} | 💧 Drought: ${droughtScore} | 🌧️ Flood: ${floodScore}
        </div>
      </div>
    `);
    markerRef.current = marker;

    // Add Risk Zones (radii circles around the point)
    const primaryCircle = L.circle([latitude, longitude], {
      color: color,
      fillColor: color,
      fillOpacity: 0.16,
      radius: 4000,
      weight: 2
    }).addTo(map);

    const outerCircle = L.circle([latitude, longitude], {
      color: color,
      fillColor: color,
      fillOpacity: 0.05,
      radius: 8500,
      weight: 1,
      dashArray: '4, 8'
    }).addTo(map);

    circleLayersRef.current = [primaryCircle, outerCircle];

    // Trigger invalidateSize to ensure tiles fill any resize safely
    const timeoutId = setTimeout(() => {
      if (mapInstanceRef.current && mapContainerRef.current) {
        try {
          mapInstanceRef.current.invalidateSize();
        } catch {
          // ignore if container unmounted
        }
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [latitude, longitude, overallScore, overallLevel, locationName, heatScore, droughtScore, floodScore]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md">
      {/* Map element */}
      <div 
        ref={mapContainerRef} 
        className={`w-full ${className} ${onMapClick ? 'cursor-crosshair' : ''}`} 
      />

      {/* Floating Legend */}
      <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl text-xs space-y-1.5 shadow-xl pointer-events-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
          Risk Zone Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-700">0 - 24: Low Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-700">25 - 49: Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-slate-700">50 - 74: High</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-slate-700">75 - 100: Extreme</span>
        </div>
        {onMapClick && (
          <div className="pt-1.5 border-t border-slate-200 text-[10px] font-bold text-[#156550] flex items-center gap-1">
            <span>📍 Click anywhere to place pin</span>
          </div>
        )}
      </div>
    </div>
  );
};
