import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { locationService } from '../services/locationService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const saveLocationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
  country: z.string().optional().default(''),
  timezone: z.string().optional().default('UTC'),
  isPrimary: z.boolean().optional().default(true),
  cropType: z.string().optional(),
  farmArea: z.string().optional()
});

export class LocationController {
  async search(req: Request, res: Response): Promise<void> {
    try {
      const q = (req.query.q as string) || '';
      if (!q || q.trim().length < 2) {
        res.status(200).json({ results: [] });
        return;
      }

      const results = await locationService.searchLocation(q);
      res.status(200).json({ results });
    } catch (err) {
      console.error('Location search error:', err);
      res.status(500).json({ error: 'Failed to search locations' });
    }
  }

  async getDetails(req: Request, res: Response): Promise<void> {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);

      if (isNaN(lat) || isNaN(lon)) {
        res.status(400).json({ error: 'Valid latitude and longitude required' });
        return;
      }

      const details = await locationService.getLocationDetails(lat, lon);
      res.status(200).json(details);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve location details' });
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const parsed = saveLocationSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid location data' });
        return;
      }

      const data = parsed.data;
      const created = db.saveLocation({
        userId: req.user.id,
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city || data.name,
        state: data.state || '',
        country: data.country || '',
        timezone: data.timezone || 'UTC',
        isPrimary: data.isPrimary !== false,
        cropType: data.cropType || req.user.cropType,
        farmArea: data.farmArea || req.user.farmArea
      });

      res.status(201).json({
        location: created,
        message: 'Monitored location saved successfully'
      });
    } catch (err) {
      console.error('Save location error:', err);
      res.status(500).json({ error: 'Failed to save monitored location' });
    }
  }

  async getPrimary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const primary = db.getPrimaryLocation(req.user.id);
      if (!primary) {
        res.status(404).json({ error: 'No primary location configured' });
        return;
      }

      res.status(200).json({ location: primary });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get primary location' });
    }
  }

  async updatePrimary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { locationId } = req.body;
      if (!locationId) {
        res.status(400).json({ error: 'locationId is required' });
        return;
      }

      const updated = db.updatePrimaryLocation(req.user.id, locationId);
      if (!updated) {
        res.status(404).json({ error: 'Location not found' });
        return;
      }

      res.status(200).json({ location: updated, message: 'Primary location updated' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update primary location' });
    }
  }

  async getUserLocations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const list = db.getUserLocations(req.user.id);
      res.status(200).json({ locations: list });
    } catch (err) {
      res.status(500).json({ error: 'Failed to list locations' });
    }
  }
}

export const locationController = new LocationController();
