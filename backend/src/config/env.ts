import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'climateshield-super-secret-jwt-key-2026-production-grade',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || '',
  useLocalDb: process.env.USE_LOCAL_DB !== 'false',
  demoMode: process.env.DEMO_MODE === 'true',
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || '',
  geocodingApiKey: process.env.GEOCODING_API_KEY || '',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GEOCODING_API_KEY || '',
  monitoringCron: process.env.MONITORING_INTERVAL_CRON || '0 */6 * * *',
  monitoringAutoStart: process.env.MONITORING_AUTO_START !== 'false',
};
