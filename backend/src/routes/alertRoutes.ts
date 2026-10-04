import { Router } from 'express';
import { alertController } from '../controllers/alertController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => alertController.getAlerts(req, res));
router.post('/demo-trigger', requireAuth, (req, res) => alertController.triggerDemoAlert(req, res));
router.get('/:id', requireAuth, (req, res) => alertController.getAlertById(req, res));
router.patch('/:id/read', requireAuth, (req, res) => alertController.markAsRead(req, res));

export default router;
