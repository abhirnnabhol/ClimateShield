import { Router } from 'express';
import { profileController } from '../controllers/profileController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => profileController.getProfile(req, res));
router.put('/', requireAuth, (req, res) => profileController.updateProfile(req, res));
router.post('/change-password', requireAuth, (req, res) => profileController.changePassword(req, res));
router.get('/notifications', requireAuth, (req, res) => profileController.getNotificationSettings(req, res));
router.put('/notifications', requireAuth, (req, res) => profileController.updateNotificationSettings(req, res));

export default router;
