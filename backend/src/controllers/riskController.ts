import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { riskService } from '../services/riskService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const analyzeSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  locationName: z.string().optional(),
  userType: z.enum(['Resident', 'Farmer', 'Outdoor Worker', 'Other']).optional()
});

const scenarioSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  temperatureChange: z.number().min(-20).max(20),
  rainfallChange: z.number().min(-100).max(500),
  humidityChange: z.number().min(-100).max(100)
});

export class RiskController {
  async getDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      let primaryLocation = db.getPrimaryLocation(req.user.id);

      // If user hasn't set primary location yet, fallback to default Bhopal or first location
      if (!primaryLocation) {
        const userLocs = db.getUserLocations(req.user.id);
        if (userLocs.length > 0) {
          primaryLocation = userLocs[0];
        } else {
          // Return notice that location setup is pending
          res.status(200).json({
            needsLocationSetup: true,
            message: 'Please set your monitored location'
          });
          return;
        }
      }

      // Analyze real-time risk for this primary location
      const assessment = await riskService.analyzeRisk(primaryLocation.latitude, primaryLocation.longitude, {
        locationId: primaryLocation.id,
        locationName: primaryLocation.name,
        userType: req.user.userType
      });

      // Save latest assessment
      db.saveRiskAssessment(assessment);

      const unreadAlerts = db.getUserAlerts(req.user.id).filter((a) => !a.isRead);

      res.status(200).json({
        location: primaryLocation,
        assessment,
        unreadAlertsCount: unreadAlerts.length,
        activeAlerts: unreadAlerts.slice(0, 3)
      });
    } catch (err) {
      console.error('Dashboard error:', err);
      res.status(500).json({ error: 'Failed to generate dashboard risk data' });
    }
  }

  async getLocationRisk(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const locations = db.getAllLocations();
      const loc = locations.find((l) => l.id === id);

      if (!loc) {
        res.status(404).json({ error: 'Location not found' });
        return;
      }

      const userType = req.user?.userType || 'Resident';
      const assessment = await riskService.analyzeRisk(loc.latitude, loc.longitude, {
        locationId: loc.id,
        locationName: loc.name,
        userType
      });

      res.status(200).json({ location: loc, assessment });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve location risk' });
    }
  }

  async analyze(req: Request, res: Response): Promise<void> {
    try {
      const parsed = analyzeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid coordinates' });
        return;
      }

      const { latitude, longitude, locationName, userType } = parsed.data;

      const assessment = await riskService.analyzeRisk(latitude, longitude, {
        locationName: locationName || `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
        userType: userType || 'Resident'
      });

      res.status(200).json({ assessment });
    } catch (err) {
      console.error('Analyze error:', err);
      res.status(500).json({ error: 'Risk analysis computation failed' });
    }
  }

  async simulateScenario(req: Request, res: Response): Promise<void> {
    try {
      const parsed = scenarioSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid scenario parameters' });
        return;
      }

      const result = await riskService.simulateScenario(parsed.data);
      res.status(200).json(result);
    } catch (err) {
      console.error('Scenario error:', err);
      res.status(500).json({ error: 'Scenario simulation failed' });
    }
  }

  async getRiskHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const locationId = (req.query.locationId as string) || '';
      const days = parseInt((req.query.days as string) || '30', 10);

      // If no locationId specified and user logged in, use primary location
      let targetLocId = locationId;
      if (!targetLocId && req.user) {
        const primary = db.getPrimaryLocation(req.user.id);
        targetLocId = primary?.id || '';
      }

      const history = db.getRiskHistory(targetLocId, days);
      res.status(200).json({ history, locationId: targetLocId, days });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch risk history' });
    }
  }
}

export const riskController = new RiskController();
