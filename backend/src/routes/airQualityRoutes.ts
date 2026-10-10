import { Router } from 'express';
import { airQualityController } from '../controllers/airQualityController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, (req, res) => airQualityController.getAirQuality(req, res));

export default router;
