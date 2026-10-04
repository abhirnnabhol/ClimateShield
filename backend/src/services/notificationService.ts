import { Alert, NotificationSettings, User } from '../types/shared.js';

export interface NotificationPayload {
  userId: string;
  userEmail: string;
  userName: string;
  alert: Alert;
}

export class NotificationService {
  /**
   * Dispatches notifications across user-preferred channels (In-App, Email, SMS/Webhook)
   */
  async sendNotification(user: User, alert: Alert, settings: NotificationSettings): Promise<boolean> {
    const isSeverityMet = this.checkSeverityThreshold(alert.severity, settings.minimumSeverity);
    if (!isSeverityMet) {
      console.log(`[NotificationService] Alert ${alert.id} (${alert.severity}) below user threshold (${settings.minimumSeverity}), skipped.`);
      return false;
    }

    // Check specific hazard setting
    if (alert.type === 'heat' && !settings.heatAlerts) return false;
    if (alert.type === 'drought' && !settings.droughtAlerts) return false;
    if (alert.type === 'flood' && !settings.floodAlerts) return false;

    console.log(`\n======================================================`);
    console.log(`🔔 [NOTIFICATION DISPATCH] ClimateShield Alert`);
    console.log(`User: ${user.name} (${user.email}) | Role: ${user.userType}`);
    console.log(`Title: ${alert.title} [${alert.severity}]`);
    console.log(`Location: ${alert.locationName} | Expected: ${alert.expectedTime}`);
    console.log(`Channels: In-App=${settings.channels.inApp}, Email=${settings.channels.email}, SMS=${settings.channels.sms}`);
    console.log(`Message: ${alert.message}`);
    console.log(`Recommendations: ${alert.recommendations.join(' | ')}`);
    console.log(`======================================================\n`);

    if (settings.channels.email) {
      // In production, integrate SendGrid/SES/Resend
      console.log(`[EMAIL DISPATCH SIMULATED] Sent climate warning email to ${user.email}`);
    }

    if (settings.channels.sms) {
      // In production, integrate Twilio/MessageBird
      console.log(`[SMS DISPATCH SIMULATED] Sent SMS climate alert to registered mobile`);
    }

    return true;
  }

  private checkSeverityThreshold(alertSeverity: string, minSeverity: string): boolean {
    const ranks: Record<string, number> = {
      LOW: 1,
      MODERATE: 2,
      HIGH: 3,
      EXTREME: 4
    };

    return (ranks[alertSeverity] || 1) >= (ranks[minSeverity] || 2);
  }
}

export const notificationService = new NotificationService();
