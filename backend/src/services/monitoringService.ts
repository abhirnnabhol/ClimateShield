import { db } from '../db/index.js';
import { riskService } from './riskService.js';
import { airQualityService } from './airQualityService.js';
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

          // Evaluate air quality threshold for atmospheric pollution alerts
          try {
            const aq = await airQualityService.getAirQuality(loc.latitude, loc.longitude);
            if (user && aq.current.usAqi && aq.current.usAqi >= 151) {
              const existingAlerts = db.getUserAlerts(user.id);
              const recentSameAqAlert = existingAlerts.find(
                (a) =>
                  a.locationId === loc.id &&
                  a.type === 'air-quality' &&
                  !a.isRead &&
                  Date.now() - new Date(a.createdAt).getTime() < 12 * 3600000 // 12h cooldown
              );

              if (!recentSameAqAlert) {
                const userSettings = db.getNotificationSettings(user.id);
                const aqSeverity =
                  aq.assessment.usCategory.code === 'HAZARDOUS' || aq.assessment.usCategory.code === 'VERY_UNHEALTHY'
                    ? 'EXTREME'
                    : 'HIGH';

                const newAqAlertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'> = {
                  userId: user.id,
                  locationId: loc.id,
                  locationName: loc.name,
                  type: 'air-quality',
                  severity: aqSeverity,
                  title: `${aqSeverity}: ${aq.assessment.usCategory.label} Air Quality Alert`,
                  message: `Atmospheric models project ${aq.assessment.usCategory.label} conditions (US AQI: ${aq.current.usAqi}) at ${loc.name}, driven primarily by ${aq.assessment.dominantPollutant.name}.`,
                  expectedTime: 'Current through next 24 to 48 hours',
                  factors: [
                    `US AQI: ${aq.current.usAqi} (${aq.assessment.usCategory.label})`,
                    `European AQI: ${aq.current.europeanAqi} (${aq.assessment.europeanCategory.label})`,
                    `Leading Concern: ${aq.assessment.dominantPollutant.name} (${aq.assessment.dominantPollutant.value} ${aq.assessment.dominantPollutant.unit})`,
                    `PM2.5: ${aq.current.pm2_5 ?? 'N/A'} μg/m³`,
                    `PM10: ${aq.current.pm10 ?? 'N/A'} μg/m³`
                  ],
                  recommendations: [
                    aq.assessment.healthGuidance.general,
                    aq.assessment.healthGuidance.sensitive,
                    aq.assessment.dominantPollutant.precautions
                  ],
                  isRead: false
                };

                const createdAqAlert = db.createAlert(newAqAlertData);
                report.alertsCreated++;
                alertCreated = true;
                await notificationService.sendNotification(user, createdAqAlert, userSettings);
              }
            }
          } catch (aqErr) {
            console.warn(`[MonitoringService] Air quality check failed for ${loc.name}:`, (aqErr as Error).message);
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
