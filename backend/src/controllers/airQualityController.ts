import { Request, Response } from 'express';
import { airQualityService } from '../services/airQualityService.js';
import { db } from '../db/index.js';

export class AirQualityController {
  async getAirQuality(req: Request, res: Response) {
    try {
      let lat = parseFloat(req.query.lat as string || req.query.latitude as string);
      let lon = parseFloat(req.query.lon as string || req.query.longitude as string);
      const forceDemo = req.query.demo === 'true';

      // If coordinates not provided in query, fall back to authenticated user's primary location
      if (isNaN(lat) || isNaN(lon)) {
        const userId = (req as any).user?.id;
        if (userId) {
          const primaryLoc = db.getPrimaryLocation(userId);
          if (primaryLoc) {
            lat = primaryLoc.latitude;
            lon = primaryLoc.longitude;
          }
        }
      }

      // Default fallback coordinates (Mumbai, India) if none available
      if (isNaN(lat) || isNaN(lon)) {
        lat = 19.076;
        lon = 72.877;
      }

      // Bounds validation
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({
          error: 'Invalid coordinates: latitude must be between -90 and 90, longitude between -180 and 180.'
        });
      }

      const airQuality = await airQualityService.getAirQuality(lat, lon, forceDemo);

      return res.status(200).json({
        success: true,
        airQuality
      });
    } catch (err) {
      console.error('[AirQualityController] Error fetching air quality:', err);
      return res.status(500).json({
        error: 'Failed to retrieve air quality intelligence',
        message: (err as Error).message
      });
    }
  }
}

export const airQualityController = new AirQualityController();
