import { Response } from 'express';
import { monitoringService } from '../services/monitoringService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class MonitorController {
  async runMonitoring(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log(`[Manual Monitor Trigger] Initiated by user ${req.user?.email || 'System'}`);
      const report = await monitoringService.runMonitoringCycle();

      res.status(200).json({
        message: 'Monitoring cycle executed successfully',
        report
      });
    } catch (err) {
      console.error('Manual monitoring trigger error:', err);
      res.status(500).json({ error: 'Failed to complete monitoring cycle' });
    }
  }
}

export const monitorController = new MonitorController();
