import { Router } from 'express';
import { riskController } from '../controllers/riskController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', requireAuth, (req, res) => riskController.getDashboard(req, res));
router.post('/analyze', optionalAuth, (req, res) => riskController.analyze(req, res));
router.post('/scenario', (req, res) => riskController.simulateScenario(req, res));
router.get('/history', optionalAuth, (req, res) => riskController.getRiskHistory(req, res));
router.get('/location/:id', optionalAuth, (req, res) => riskController.getLocationRisk(req, res));

export default router;
