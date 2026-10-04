import { Response } from 'express';
import { db } from '../db/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class AlertController {
  async getAlerts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const alerts = db.getUserAlerts(req.user.id);
      res.status(200).json({ alerts });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve alerts' });
    }
  }

  async getAlertById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const alert = db.getAlertById(id);

      if (!alert || alert.userId !== req.user.id) {
        res.status(404).json({ error: 'Alert not found' });
        return;
      }

      res.status(200).json({ alert });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch alert' });
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const updated = db.markAlertAsRead(id, req.user.id);

      if (!updated) {
        res.status(404).json({ error: 'Alert not found or already read' });
        return;
      }

      res.status(200).json({ alert: updated, message: 'Alert marked as read' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update alert' });
    }
  }

  async triggerDemoAlert(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const primary = db.getPrimaryLocation(req.user.id);
      const locationName = primary ? `${primary.city}, ${primary.state}` : 'Bhopal, Madhya Pradesh';
      const locationId = primary ? primary.id : 'demo-location-001';

      const hazardType = req.body?.type || 'flood';

      let alertData;
      if (hazardType === 'heat') {
        alertData = {
          userId: req.user.id,
          locationId,
          locationName,
          type: 'heat' as const,
          severity: 'HIGH' as const,
          title: '🚨 DEMO SCENARIO: HIGH HEAT STRESS ALERT',
          message: 'SIMULATION DEMO: Extreme surface temperature anomaly and sustained thermal stress index projected across the monitored agricultural grid.',
          expectedTime: 'Next 24–48 hours (Simulation)',
          factors: [
            'Projected ambient temperature surge (+5.5°C anomaly)',
            'Topsoil moisture depletion accelerated by evapotranspiration',
            'Sustained high solar irradiance flux (>920 W/m²)'
          ],
          recommendations: [
            'Shift irrigation cycles to nocturnal hours to minimize evaporative losses.',
            'Suspend non-essential outdoor physical labor during peak hours (11:00 AM – 4:00 PM).',
            'Ensure livestock shelters have continuous shade and adequate hydration points.',
            'Comply with municipal and regional health advisories.'
          ],
          isRead: false
        };
      } else if (hazardType === 'drought') {
        alertData = {
          userId: req.user.id,
          locationId,
          locationName,
          type: 'drought' as const,
          severity: 'HIGH' as const,
          title: '🚨 DEMO SCENARIO: SEVERE DROUGHT WATCH',
          message: 'SIMULATION DEMO: Prolonged 18-day dry spell combined with acute root-zone moisture deficit triggers critical agricultural drought threshold.',
          expectedTime: 'Next 7–14 days (Simulation)',
          factors: [
            'Consecutive dry days exceeding 18 days',
            'Precipitation deficit -58% relative to seasonal baseline',
            'Volumetric soil moisture dropping below 14% field capacity',
            'Vegetation canopy moisture stress score elevated to 78'
          ],
          recommendations: [
            'Prioritize precision drip irrigation for high-value standing crops.',
            'Apply biomass mulch across crop beds to retain sub-surface moisture.',
            'Audit groundwater reserves and secondary water catchment basins.'
          ],
          isRead: false
        };
      } else {
        alertData = {
          userId: req.user.id,
          locationId,
          locationName,
          type: 'flood' as const,
          severity: 'HIGH' as const,
          title: '🚨 DEMO SCENARIO: HIGH FLOOD RISK WARNING',
          message: 'SIMULATION DEMO: Torrential precipitation influx combined with saturated soil conditions and lowland basin drainage constraints.',
          expectedTime: 'Next 24–48 hours (Simulation)',
          factors: [
            'Heavy rainfall forecast (74 mm in next 24h)',
            'Recent 7-day rainfall accumulation (128 mm)',
            'Elevated soil moisture (91% saturation capacity)',
            'Local basin terrain characteristics (Impeded drainage gradient)'
          ],
          recommendations: [
            'Monitor local official weather advisories and emergency management bulletins.',
            'Avoid unnecessary travel through flood-prone lowlands and underpasses.',
            'Elevate and protect vital equipment, farm implements, and documents.',
            'Strictly comply with directives from local civil defense and disaster response authorities.'
          ],
          isRead: false
        };
      }

      const alert = db.createAlert(alertData);
      res.status(201).json({ alert, message: 'Demo scenario alert triggered successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to trigger demo alert' });
    }
  }
}

export const alertController = new AlertController();
