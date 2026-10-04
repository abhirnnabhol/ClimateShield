import { Router, Request, Response } from 'express';
import { weatherService } from '../services/weatherService.js';

const router = Router();

router.get('/current', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    if (isNaN(lat) || isNaN(lon)) {
      res.status(400).json({ error: 'Valid lat and lon query parameters required' });
      return;
    }
    const current = await weatherService.getCurrent(lat, lon);
    res.status(200).json(current);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch current weather' });
  }
});

router.get('/forecast', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    if (isNaN(lat) || isNaN(lon)) {
      res.status(400).json({ error: 'Valid lat and lon query parameters required' });
      return;
    }
    const forecast = await weatherService.getForecast(lat, lon);
    res.status(200).json(forecast);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weather forecast' });
  }
});

export default router;
