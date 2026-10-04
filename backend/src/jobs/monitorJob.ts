import cron from 'node-cron';
import { config } from '../config/env.js';
import { monitoringService } from '../services/monitoringService.js';

export function initializeMonitoringJob() {
  if (!config.monitoringAutoStart) {
    console.log('[MonitorJob] Auto-monitoring is disabled via configuration.');
    return;
  }

  console.log(`[MonitorJob] Initializing cron schedule with expression: "${config.monitoringCron}"`);

  cron.schedule(config.monitoringCron, async () => {
    console.log('[MonitorJob] Triggering scheduled climate assessment cycle...');
    try {
      await monitoringService.runMonitoringCycle();
    } catch (err) {
      console.error('[MonitorJob] Scheduled job encountered error:', err);
    }
  });

  // Run a quick background warmup cycle after 5 seconds
  setTimeout(async () => {
    try {
      console.log('[MonitorJob] Running initial startup climate health check...');
      await monitoringService.runMonitoringCycle();
    } catch (err) {
      console.error('[MonitorJob] Initial run error:', err);
    }
  }, 5000);
}
