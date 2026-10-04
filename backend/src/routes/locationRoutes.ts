import { Router } from 'express';
import { locationController } from '../controllers/locationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/search', (req, res) => locationController.search(req, res));
router.get('/details', (req, res) => locationController.getDetails(req, res));
router.post('/', requireAuth, (req, res) => locationController.create(req, res));
router.get('/', requireAuth, (req, res) => locationController.getUserLocations(req, res));
router.get('/primary', requireAuth, (req, res) => locationController.getPrimary(req, res));
router.put('/primary', requireAuth, (req, res) => locationController.updatePrimary(req, res));

export default router;
