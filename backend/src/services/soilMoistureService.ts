import { config } from '../config/env.js';
import { cacheService } from './cacheService.js';

export interface SoilMoistureData {
  surfaceMoisturePercent: number; // 0 to 100% volumetric (m³/m³)
  rootZoneMoisturePercent: number; // 0 to 100%
  groundSaturationPercent: number; // 0 to 100% (field capacity vs saturation)
  infiltrationCapacity: 'High' | 'Moderate' | 'Low / Saturated';
  isDemo: boolean;
  dataSource: string;
}

export class SoilMoistureService {
  async getSoilMoisture(latitude: number, longitude: number, rainfall24h = 0, forceDemo = false): Promise<SoilMoistureData> {
    if (config.demoMode || forceDemo) {
      return this.getMockSoil(latitude, longitude, rainfall24h);
    }

    const cacheKey = cacheService.geoKey('soil', latitude, longitude);
    const cached = cacheService.get<SoilMoistureData>(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=soil_moisture_0_to_1cm,soil_moisture_1_to_3cm&timezone=auto`;
      const response = await fetch(url, { headers: { 'User-Agent': 'ClimateShield/1.0' }, signal: AbortSignal.timeout(5000) });

      if (!response.ok) {
        throw new Error(`Open-Meteo soil endpoint returned ${response.status}`);
      }

      const data = (await response.json()) as any;
      // Open-Meteo returns m³/m³ (typically 0.05 to 0.50)
      const topSoil = data.current?.soil_moisture_0_to_1cm ?? 0.18;
      const rootZone = data.current?.soil_moisture_1_to_3cm ?? 0.22;

      // Convert m³/m³ to percentage of saturation (typical porosity ~ 0.45)
      const surfacePercent = Math.min(100, Math.round((topSoil / 0.45) * 100));
      const rootZonePercent = Math.min(100, Math.round((rootZone / 0.45) * 100));
      const saturationPercent = Math.min(100, Math.round(surfacePercent * 0.7 + (rainfall24h * 1.2)));

      let infiltration: SoilMoistureData['infiltrationCapacity'] = 'Moderate';
      if (saturationPercent > 75) infiltration = 'Low / Saturated';
      else if (saturationPercent < 30) infiltration = 'High';

      const result: SoilMoistureData = {
        surfaceMoisturePercent: surfacePercent,
        rootZoneMoisturePercent: rootZonePercent,
        groundSaturationPercent: saturationPercent,
        infiltrationCapacity: infiltration,
        isDemo: false,
        dataSource: 'OPEN-METEO SOIL SENSOR REANALYSIS'
      };

      cacheService.set(cacheKey, result, 5 * 60 * 1000);
      return result;
    } catch (err) {
      return this.getMockSoil(latitude, longitude, rainfall24h);
    }
  }

  private getMockSoil(latitude: number, longitude: number, rainfall24h: number): SoilMoistureData {
    const base = 22 + ((latitude * 3 + longitude * 5) % 15);
    const saturation = Math.min(100, Math.round(base + rainfall24h * 1.5));
    return {
      surfaceMoisturePercent: Math.round(base),
      rootZoneMoisturePercent: Math.round(base + 5),
      groundSaturationPercent: saturation,
      infiltrationCapacity: saturation > 70 ? 'Low / Saturated' : 'Moderate',
      isDemo: true,
      dataSource: 'DEMO / MOCK SOIL MOISTURE'
    };
  }
}

export const soilMoistureService = new SoilMoistureService();
