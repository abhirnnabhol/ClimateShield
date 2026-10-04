import { config } from '../config/env.js';
import { cacheService } from './cacheService.js';

export interface RainfallData {
  rainfall24h: number; // in mm
  rainfall7d: number;  // in mm
  historicalAnomalyPercent: number; // e.g. -35% vs seasonal baseline
  condition: 'Extreme Deficit' | 'Moderate Deficit' | 'Normal' | 'Surplus' | 'Heavy Torrential';
  consecutiveDryDays: number;
  isDemo: boolean;
  dataSource: string;
}

export class RainfallService {
  async getRainfall(latitude: number, longitude: number, forceDemo = false): Promise<RainfallData> {
    if (config.demoMode || forceDemo) {
      return this.getMockRainfall(latitude, longitude);
    }

    const cacheKey = cacheService.geoKey('rainfall', latitude, longitude);
    const cached = cacheService.get<RainfallData>(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_sum&past_days=7&forecast_days=1&timezone=auto`;
      const response = await fetch(url, { headers: { 'User-Agent': 'ClimateShield/1.0' }, signal: AbortSignal.timeout(5000) });

      if (!response.ok) {
        throw new Error(`Open-Meteo precipitation failed with ${response.status}`);
      }

      const data = (await response.json()) as any;
      const sums: number[] = data.daily?.precipitation_sum || [];
      const past7Sums = sums.slice(0, 7);
      const total7d = past7Sums.reduce((acc, val) => acc + (val || 0), 0);
      const latest24h = sums[sums.length - 1] ?? 0;

      // Calculate consecutive dry days (< 1mm)
      let dryDays = 0;
      for (let i = past7Sums.length - 1; i >= 0; i--) {
        if (past7Sums[i] < 1.0) {
          dryDays++;
        } else {
          break;
        }
      }

      const baselineNormal7d = 25.0; // typical temperate/tropical baseline in mm
      const anomaly = Math.round(((total7d - baselineNormal7d) / baselineNormal7d) * 100);

      let condition: RainfallData['condition'] = 'Normal';
      if (total7d < 5 && dryDays >= 5) condition = 'Extreme Deficit';
      else if (anomaly < -25) condition = 'Moderate Deficit';
      else if (latest24h > 50 || total7d > 100) condition = 'Heavy Torrential';
      else if (anomaly > 30) condition = 'Surplus';

      const result: RainfallData = {
        rainfall24h: Math.round(latest24h * 10) / 10,
        rainfall7d: Math.round(total7d * 10) / 10,
        historicalAnomalyPercent: anomaly,
        condition,
        consecutiveDryDays: dryDays,
        isDemo: false,
        dataSource: 'OPEN-METEO LIVE'
      };

      cacheService.set(cacheKey, result, 5 * 60 * 1000);
      return result;
    } catch (err) {
      console.warn('RainfallService fetch failed, using fallback:', (err as Error).message);
      return this.getMockRainfall(latitude, longitude);
    }
  }

  private getMockRainfall(latitude: number, longitude: number): RainfallData {
    const hash = Math.abs(Math.sin(latitude * 11 + longitude * 17));
    const rainfall24h = Math.round(hash * 6 * 10) / 10;
    const rainfall7d = Math.round((rainfall24h * 3.5 + 4) * 10) / 10;
    return {
      rainfall24h,
      rainfall7d,
      historicalAnomalyPercent: -38,
      condition: 'Moderate Deficit',
      consecutiveDryDays: 8,
      isDemo: true,
      dataSource: 'DEMO / MOCK ENVIRONMENTAL DATA'
    };
  }
}

export const rainfallService = new RainfallService();
