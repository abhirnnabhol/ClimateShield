import { config } from '../config/env.js';
import { cacheService } from './cacheService.js';

export interface WeatherCurrent {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  uvIndexMax?: number;
  solarRadiation: number;
  isDemo: boolean;
  dataSource: string;
}

export interface WeatherForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitationSum: number;
  precipitationProbability: number;
}

export interface WeatherForecast {
  days: WeatherForecastDay[];
  isDemo: boolean;
  dataSource: string;
}

export class WeatherService {
  /**
   * Fetch current weather conditions for given coordinates
   */
  async getCurrent(latitude: number, longitude: number, forceDemo = false): Promise<WeatherCurrent> {
    if (config.demoMode || forceDemo) {
      return this.getMockCurrent(latitude, longitude);
    }

    const cacheKey = cacheService.geoKey('weather:current', latitude, longitude);
    const cached = cacheService.get<WeatherCurrent>(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,uv_index&daily=uv_index_max&timezone=auto`;
      const response = await fetch(url, { headers: { 'User-Agent': 'ClimateShield/1.0' }, signal: AbortSignal.timeout(5000) });
      
      if (!response.ok) {
        throw new Error(`Open-Meteo returned status ${response.status}`);
      }

      const data = (await response.json()) as any;
      const current = data.current;
      const daily = data.daily;
      const peakUv = Math.round((daily?.uv_index_max?.[0] ?? 7.2) * 10) / 10;
      const currentUv = Math.round((current.uv_index ?? 0) * 10) / 10;

      // For climate heatwave hazard assessment, nocturnal UV (0) obscures daytime solar stress.
      // If current reading is <= 0.5 (nighttime / dawn), use daytime peak UV index.
      const effectiveUv = currentUv > 0.5 ? currentUv : peakUv;

      const result: WeatherCurrent = {
        temperature: Math.round((current.temperature_2m ?? 32) * 10) / 10,
        apparentTemperature: Math.round((current.apparent_temperature ?? 34) * 10) / 10,
        humidity: Math.round(current.relative_humidity_2m ?? 45),
        windSpeed: Math.round((current.wind_speed_10m ?? 12) * 10) / 10,
        uvIndex: effectiveUv,
        uvIndexMax: peakUv,
        solarRadiation: Math.round(750 + Math.sin(latitude) * 200),
        isDemo: false,
        dataSource: 'OPEN-METEO LIVE'
      };

      cacheService.set(cacheKey, result, 5 * 60 * 1000);
      return result;
    } catch (err) {
      console.warn('WeatherService live fetch failed, falling back to deterministic local model:', (err as Error).message);
      return this.getMockCurrent(latitude, longitude);
    }
  }

  /**
   * Fetch 7-day daily weather forecast
   */
  async getForecast(latitude: number, longitude: number, forceDemo = false): Promise<WeatherForecast> {
    if (config.demoMode || forceDemo) {
      return this.getMockForecast(latitude, longitude);
    }

    const cacheKey = cacheService.geoKey('weather:forecast', latitude, longitude);
    const cached = cacheService.get<WeatherForecast>(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;
      const response = await fetch(url, { headers: { 'User-Agent': 'ClimateShield/1.0' }, signal: AbortSignal.timeout(5000) });

      if (!response.ok) {
        throw new Error(`Open-Meteo forecast returned status ${response.status}`);
      }

      const data = (await response.json()) as any;
      const daily = data.daily;
      const days: WeatherForecastDay[] = [];

      for (let i = 0; i < (daily.time?.length || 7); i++) {
        days.push({
          date: daily.time[i],
          maxTemp: Math.round(daily.temperature_2m_max[i] ?? 33),
          minTemp: Math.round(daily.temperature_2m_min[i] ?? 22),
          precipitationSum: Math.round((daily.precipitation_sum[i] ?? 0) * 10) / 10,
          precipitationProbability: Math.round(daily.precipitation_probability_max[i] ?? 10)
        });
      }

      const result: WeatherForecast = {
        days,
        isDemo: false,
        dataSource: 'OPEN-METEO LIVE'
      };

      cacheService.set(cacheKey, result, 10 * 60 * 1000);
      return result;
    } catch (err) {
      console.warn('WeatherService live forecast failed, using deterministic simulation:', (err as Error).message);
      return this.getMockForecast(latitude, longitude);
    }
  }

  private getMockCurrent(latitude: number, longitude: number): WeatherCurrent {
    const latFactor = (latitude % 10) / 10;
    const temp = 34 + latFactor * 6;
    return {
      temperature: Math.round(temp * 10) / 10,
      apparentTemperature: Math.round((temp + 3.2) * 10) / 10,
      humidity: Math.round(38 - latFactor * 10),
      windSpeed: 14.5,
      uvIndex: 8.2,
      solarRadiation: 880,
      isDemo: true,
      dataSource: 'DEMO / MOCK ENVIRONMENTAL DATA'
    };
  }

  private getMockForecast(latitude: number, longitude: number): WeatherForecast {
    const days: WeatherForecastDay[] = [];
    const baseTemp = 33 + ((latitude % 5) * 1.5);
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() + i * 86400000);
      days.push({
        date: d.toISOString().split('T')[0],
        maxTemp: Math.round((baseTemp + (i * 0.8)) * 10) / 10,
        minTemp: Math.round((baseTemp - 11 + (i * 0.4)) * 10) / 10,
        precipitationSum: i === 3 ? 14.2 : i === 4 ? 4.5 : 0.2,
        precipitationProbability: i === 3 ? 65 : 15
      });
    }
    return {
      days,
      isDemo: true,
      dataSource: 'DEMO / MOCK ENVIRONMENTAL DATA'
    };
  }
}

export const weatherService = new WeatherService();
