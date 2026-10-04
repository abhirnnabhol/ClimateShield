import { config } from '../config/env.js';

export interface LocationSearchResult {
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  timezone: string;
  formattedAddress: string;
  provider: 'GOOGLE GEOCODING API' | 'OPEN-METEO GEOCODING' | 'REVERSE GEOCODING' | 'DEMO / MOCK GEOCODER';
}

const MOCK_LOCATIONS: LocationSearchResult[] = [
  {
    name: 'Bhopal',
    latitude: 23.2599,
    longitude: 77.4126,
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    country: 'India',
    timezone: 'Asia/Kolkata',
    formattedAddress: 'Bhopal, Madhya Pradesh, India',
    provider: 'DEMO / MOCK GEOCODER'
  },
  {
    name: 'Indore',
    latitude: 22.7196,
    longitude: 75.8577,
    city: 'Indore',
    state: 'Madhya Pradesh',
    country: 'India',
    timezone: 'Asia/Kolkata',
    formattedAddress: 'Indore, Madhya Pradesh, India',
    provider: 'DEMO / MOCK GEOCODER'
  },
  {
    name: 'New Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    timezone: 'Asia/Kolkata',
    formattedAddress: 'New Delhi, Delhi, India',
    provider: 'DEMO / MOCK GEOCODER'
  },
  {
    name: 'Mumbai',
    latitude: 19.0760,
    longitude: 72.8777,
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    timezone: 'Asia/Kolkata',
    formattedAddress: 'Mumbai, Maharashtra, India',
    provider: 'DEMO / MOCK GEOCODER'
  },
  {
    name: 'Phoenix',
    latitude: 33.4484,
    longitude: -112.0740,
    city: 'Phoenix',
    state: 'Arizona',
    country: 'United States',
    timezone: 'America/Phoenix',
    formattedAddress: 'Phoenix, Arizona, United States',
    provider: 'DEMO / MOCK GEOCODER'
  },
  {
    name: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    city: 'London',
    state: 'Greater London',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    formattedAddress: 'London, Greater London, United Kingdom',
    provider: 'DEMO / MOCK GEOCODER'
  }
];

export class LocationService {
  async searchLocation(query: string): Promise<LocationSearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const cleanQuery = query.trim();

    // If demo mode forced, filter mock locations
    if (config.demoMode) {
      return this.filterMockLocations(cleanQuery);
    }

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=8&language=en&format=json`;
      const response = await fetch(url, { headers: { 'User-Agent': 'ClimateShield/1.0' }, signal: AbortSignal.timeout(5000) });

      if (!response.ok) {
        throw new Error(`Open-Meteo Geocoding returned ${response.status}`);
      }

      const data = (await response.json()) as any;
      if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
        return this.filterMockLocations(cleanQuery);
      }

      return data.results.map((item: any) => {
        const parts = [item.name, item.admin1, item.country].filter(Boolean);
        return {
          name: item.name,
          latitude: item.latitude,
          longitude: item.longitude,
          city: item.name,
          state: item.admin1 || '',
          country: item.country || '',
          timezone: item.timezone || 'UTC',
          formattedAddress: parts.join(', '),
          provider: 'OPEN-METEO GEOCODING'
        };
      });
    } catch (err) {
      console.warn('Geocoding search API failed, falling back to mock locations:', (err as Error).message);
      return this.filterMockLocations(cleanQuery);
    }
  }

  async getLocationDetails(latitude: number, longitude: number): Promise<LocationSearchResult> {
    return this.reverseGeocode(latitude, longitude);
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<LocationSearchResult> {
    // 1. If Google Maps API key is configured, use Google Geocoding API
    if (config.googleMapsApiKey) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${encodeURIComponent(config.googleMapsApiKey)}&solution_id=gmp_git_agentskills_v1`;
        const googleRes = await fetch(googleUrl, { signal: AbortSignal.timeout(4000) });
        if (googleRes.ok) {
          const gData = (await googleRes.json()) as any;
          if (gData.status === 'OK' && Array.isArray(gData.results) && gData.results.length > 0) {
            const best = gData.results[0];
            let city = '';
            let town = '';
            let village = '';
            let sublocality = '';
            let county = '';
            let state = '';
            let country = '';

            for (const comp of best.address_components || []) {
              const types = comp.types || [];
              if (types.includes('locality')) city = comp.long_name;
              else if (types.includes('sublocality') || types.includes('sublocality_level_1')) sublocality = comp.long_name;
              else if (types.includes('postal_town') || types.includes('town')) town = comp.long_name;
              else if (types.includes('administrative_area_level_3') || types.includes('neighborhood')) village = comp.long_name;
              else if (types.includes('administrative_area_level_2') || types.includes('county')) county = comp.long_name;
              else if (types.includes('administrative_area_level_1')) state = comp.long_name;
              else if (types.includes('country')) country = comp.long_name;
            }

            const primaryPlace = city || town || village || sublocality || county || state || 'Selected Location';
            const regionParts = [state, country].filter(Boolean).join(', ');
            const displayName = regionParts ? `${primaryPlace}, ${regionParts}` : primaryPlace;

            return {
              name: displayName,
              latitude,
              longitude,
              city: primaryPlace,
              state,
              country,
              timezone: 'auto',
              formattedAddress: best.formatted_address || displayName,
              provider: 'GOOGLE GEOCODING API'
            };
          }
        }
      } catch (err) {
        console.warn('Google reverse geocode error, attempting open fallback:', err);
      }
    }

    // 2. OpenStreetMap reverse geocoding fallback
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'ClimateShield-App/1.0 (contact: info@climateshield.org)' },
        signal: AbortSignal.timeout(4000)
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        const addr = data.address || {};
        const city = addr.city || addr.town || addr.village || addr.county || 'Monitored Region';
        const state = addr.state || '';
        const country = addr.country || '';
        const parts = [city, state, country].filter(Boolean);

        return {
          name: city,
          latitude,
          longitude,
          city,
          state,
          country,
          timezone: 'auto',
          formattedAddress: parts.join(', ') || `Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
          provider: 'REVERSE GEOCODING'
        };
      }
    } catch {
      // Fallback below
    }

    // Nearest mock lookup or generic formatted name
    const closest = this.findNearestMock(latitude, longitude);
    if (closest) {
      return closest;
    }

    return {
      name: `Coordinates (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
      latitude,
      longitude,
      city: 'Local Area',
      state: 'Monitored Sector',
      country: '',
      timezone: 'UTC',
      formattedAddress: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
      provider: 'DEMO / MOCK GEOCODER'
    };
  }

  private filterMockLocations(query: string): LocationSearchResult[] {
    const q = query.toLowerCase();
    const matches = MOCK_LOCATIONS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q) ||
        m.state.toLowerCase().includes(q) ||
        m.country.toLowerCase().includes(q)
    );

    if (matches.length > 0) return matches;

    // Return synthetic match if not in mock
    return [
      {
        name: query,
        latitude: 23.2599,
        longitude: 77.4126,
        city: query,
        state: 'Simulated Zone',
        country: 'Global',
        timezone: 'UTC',
        formattedAddress: `${query} (Simulated Location)`,
        provider: 'DEMO / MOCK GEOCODER'
      }
    ];
  }

  private findNearestMock(lat: number, lon: number): LocationSearchResult | null {
    let closest: LocationSearchResult | null = null;
    let minDistance = Infinity;

    for (const loc of MOCK_LOCATIONS) {
      const dist = Math.hypot(loc.latitude - lat, loc.longitude - lon);
      if (dist < 1.0 && dist < minDistance) {
        minDistance = dist;
        closest = loc;
      }
    }
    return closest;
  }
}

export const locationService = new LocationService();
