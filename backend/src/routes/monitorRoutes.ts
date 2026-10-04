import { Router } from 'express';
import { monitorController } from '../controllers/monitorController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Endpoint: POST /api/monitor/run
router.post('/run', requireAuth, (req, res) => monitorController.runMonitoring(req, res));

export default router;
