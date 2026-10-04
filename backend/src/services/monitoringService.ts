import { db } from '../db/index.js';
import { riskService } from './riskService.js';
import { notificationService } from './notificationService.js';
import { Alert } from '../types/shared.js';

export interface MonitoringJobReport {
  timestamp: string;
  totalLocationsProcessed: number;
  newAssessmentsSaved: number;
  alertsCreated: number;
  details: Array<{
    locationId: string;
    locationName: string;
    overallScore: number;
    overallLevel: string;
    alertGenerated: boolean;
  }>;
}

export class MonitoringService {
  private isRunning = false;

  async runMonitoringCycle(): Promise<MonitoringJobReport> {
    if (this.isRunning) {
      console.log('[MonitoringService] Cycle already in progress, skipping concurrent run.');
      return {
        timestamp: new Date().toISOString(),
        totalLocationsProcessed: 0,
        newAssessmentsSaved: 0,
        alertsCreated: 0,
        details: []
      };
    }

    this.isRunning = true;
    console.log('[MonitoringService] Starting automated climate monitoring scan cycle...');

    const report: MonitoringJobReport = {
      timestamp: new Date().toISOString(),
      totalLocationsProcessed: 0,
      newAssessmentsSaved: 0,
      alertsCreated: 0,
      details: []
    };

    try {
      const locations = db.getAllLocations();
      report.totalLocationsProcessed = locations.length;

      for (const loc of locations) {
        try {
          const user = db.findUserById(loc.userId);
          const userType = user?.userType || 'Resident';

          // Run risk analysis for location
          const assessment = await riskService.analyzeRisk(loc.latitude, loc.longitude, {
            locationId: loc.id,
            locationName: loc.name,
            userType
          });

          // Save assessment to risk history database
          db.saveRiskAssessment(assessment);
          report.newAssessmentsSaved++;

          let alertCreated = false;

          // Check if risk warrants generating an alert
          if (assessment.overallScore >= 50 && user) {
            const topHazard =
              assessment.overallScore === assessment.heat.score
                ? 'heat'
                : assessment.overallScore === assessment.flood.score
                ? 'flood'
                : 'drought';

            const userSettings = db.getNotificationSettings(user.id);

            // Determine if an alert was already issued recently for this location to avoid spamming
            const existingAlerts = db.getUserAlerts(user.id);
            const recentSameAlert = existingAlerts.find(
              (a) =>
                a.locationId === loc.id &&
                a.type === topHazard &&
                !a.isRead &&
                Date.now() - new Date(a.createdAt).getTime() < 12 * 3600000 // within last 12 hrs
            );

            if (!recentSameAlert) {
              const hazardTitle =
                topHazard === 'heat'
                  ? 'Elevated Heat Stress Warning'
                  : topHazard === 'flood'
                  ? 'Localized Inundation Warning'
                  : 'Agricultural Drought Watch';

              const factors =
                topHazard === 'heat'
                  ? assessment.heat.factors.map((f) => `${f.name}: ${f.value}`)
                  : topHazard === 'flood'
                  ? assessment.flood.factors.map((f) => `${f.name}: ${f.value}`)
                  : assessment.drought.factors.map((f) => `${f.name}: ${f.value}`);

              const newAlertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'> = {
                userId: user.id,
                locationId: loc.id,
                locationName: loc.name,
                type: topHazard,
                severity: assessment.overallLevel,
                title: `${assessment.overallLevel}: ${hazardTitle}`,
                message:
                  assessment.activeWarning?.what ||
                  `Automated monitoring detected ${assessment.overallLevel} risk levels (${assessment.overallScore}/100) at ${loc.name}.`,
                expectedTime: assessment.activeWarning?.when || 'Next 24 to 72 hours',
                factors,
                recommendations: assessment.recommendations.map((r) => `${r.action} - ${r.explanation}`),
                isRead: false
              };

              const createdAlert = db.createAlert(newAlertData);
              report.alertsCreated++;
              alertCreated = true;

              // Dispatch notification through user's active channels
              await notificationService.sendNotification(user, createdAlert, userSettings);
            }
          }

          report.details.push({
            locationId: loc.id,
            locationName: loc.name,
            overallScore: assessment.overallScore,
            overallLevel: assessment.overallLevel,
            alertGenerated: alertCreated
          });
        } catch (locErr) {
          console.error(`[MonitoringService] Failed processing location ${loc.id} (${loc.name}):`, locErr);
        }
      }

      console.log(`[MonitoringService] Completed cycle: processed ${report.totalLocationsProcessed} locations, saved ${report.newAssessmentsSaved} assessments, generated ${report.alertsCreated} alerts.`);
    } finally {
      this.isRunning = false;
    }

    return report;
  }
}

export const monitoringService = new MonitoringService();
