import { config } from '../config/env.js';
import { cacheService } from './cacheService.js';

export interface GeospatialData {
  elevation: number; // in meters
  terrainType: 'Lowland Basin / Floodplain' | 'Undulating Plains' | 'Plateau' | 'Hilly / Ridge';
  drainageClass: 'Impeded / Low Gradient' | 'Moderate' | 'Rapid Runoff';
  urbanDensityProxy: 'Low Rural' | 'Moderate Suburban' | 'High Built-up Urban';
  isDemo: boolean;
  dataSource: string;
}

export class GeospatialService {
  async getElevation(latitude: number, longitude: number, forceDemo = false): Promise<GeospatialData> {
    if (config.demoMode || forceDemo) {
      return this.getMockGeospatial(latitude, longitude);
    }

    const cacheKey = cacheService.geoKey('elevation', latitude, longitude);
    const cached = cacheService.get<GeospatialData>(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://api.open-meteo.com/v1/elevation?latitude=${latitude}&longitude=${longitude}`;
      const response = await fetch(url, { headers: { 'User-Agent': 'ClimateShield/1.0' }, signal: AbortSignal.timeout(4000) });

      if (!response.ok) {
        throw new Error(`Open-Meteo elevation returned ${response.status}`);
      }

      const data = (await response.json()) as any;
      const elevation = data.elevation?.[0] ?? 450;

      let terrain: GeospatialData['terrainType'] = 'Undulating Plains';
      let drainage: GeospatialData['drainageClass'] = 'Moderate';

      if (elevation < 150) {
        terrain = 'Lowland Basin / Floodplain';
        drainage = 'Impeded / Low Gradient';
      } else if (elevation > 800) {
        terrain = 'Hilly / Ridge';
        drainage = 'Rapid Runoff';
      } else if (elevation >= 400 && elevation <= 800) {
        terrain = 'Plateau';
      }

      const result: GeospatialData = {
        elevation: Math.round(elevation),
        terrainType: terrain,
        drainageClass: drainage,
        urbanDensityProxy: 'Moderate Suburban',
        isDemo: false,
        dataSource: 'OPEN-METEO DIGITAL ELEVATION MODEL (DEM)'
      };

      cacheService.set(cacheKey, result, 60 * 60 * 1000); // 1 hour TTL
      return result;
    } catch (err) {
      return this.getMockGeospatial(latitude, longitude);
    }
  }

  private getMockGeospatial(latitude: number, longitude: number): GeospatialData {
    const el = Math.round(350 + Math.abs(Math.sin(latitude * 3) * 320));
    return {
      elevation: el,
      terrainType: el < 200 ? 'Lowland Basin / Floodplain' : 'Plateau',
      drainageClass: el < 200 ? 'Impeded / Low Gradient' : 'Moderate',
      urbanDensityProxy: 'Moderate Suburban',
      isDemo: true,
      dataSource: 'DEMO / MOCK GEOSPATIAL DATA'
    };
  }
}

export const geospatialService = new GeospatialService();
