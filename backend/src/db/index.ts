import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Location,
  NotificationSettings,
  Alert,
  RiskAssessment,
  RiskHistoryPoint
} from '../types/shared.js';

interface DBUser extends User {
  passwordHash: string;
}

interface DatabaseSchema {
  users: DBUser[];
  locations: Location[];
  notificationSettings: Record<string, NotificationSettings>;
  riskAssessments: (RiskAssessment & { id: string })[];
  alerts: Alert[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'climateshield-db.json');

class DatabaseService {
  private db: DatabaseSchema = {
    users: [],
    locations: [],
    notificationSettings: {},
    riskAssessments: [],
    alerts: []
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
        // Ensure keys exist
        this.db.users = this.db.users || [];
        this.db.locations = this.db.locations || [];
        this.db.notificationSettings = this.db.notificationSettings || {};
        this.db.riskAssessments = this.db.riskAssessments || [];
        this.db.alerts = this.db.alerts || [];
      } catch (err) {
        console.error('Error reading database file, reinitializing:', err);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private seedInitialData() {
    console.log('Seeding initial demo data for ClimateShield...');
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('climate123', salt);
    const demoUserId = 'demo-user-climateshield-001';
    const demoLocationId = 'demo-location-bhopal-001';

    const now = new Date().toISOString();

    const demoUser: DBUser = {
      id: demoUserId,
      name: 'Demo Climate Officer',
      email: 'demo@climateshield.org',
      passwordHash: demoPasswordHash,
      userType: 'Farmer',
      cropType: 'Wheat & Soybean',
      farmArea: '45 Hectares',
      createdAt: now,
      updatedAt: now
    };

    const demoLocation: Location = {
      id: demoLocationId,
      userId: demoUserId,
      name: 'Bhopal, Madhya Pradesh',
      latitude: 23.2599,
      longitude: 77.4126,
      city: 'Bhopal',
      state: 'Madhya Pradesh',
      country: 'India',
      timezone: 'Asia/Kolkata',
      isPrimary: true,
      cropType: 'Wheat & Soybean',
      farmArea: '45 Hectares',
      createdAt: now,
      updatedAt: now
    };

    const demoSettings: NotificationSettings = {
      heatAlerts: true,
      droughtAlerts: true,
      floodAlerts: true,
      minimumSeverity: 'MODERATE',
      channels: {
        inApp: true,
        email: true,
        sms: false
      }
    };

    const demoAlerts: Alert[] = [
      {
        id: 'alert-001',
        userId: demoUserId,
        locationId: demoLocationId,
        locationName: 'Bhopal, Madhya Pradesh',
        type: 'heat',
        severity: 'HIGH',
        title: 'Elevated Heat Stress Warning',
        message: 'Afternoon surface temperatures forecasted to reach 41.5°C with high solar radiation. Moisture evaporation rate elevated.',
        expectedTime: 'Tomorrow, 12:00 PM - 5:00 PM',
        factors: ['High ambient temperature (41.5°C)', 'Low relative humidity (24%)', 'Peak solar irradiance (980 W/m²)'],
        recommendations: [
          'Shift irrigation cycles to late evening or pre-dawn to minimize evapotranspiration losses.',
          'Schedule farm hand and outdoor worker physical activities prior to 10:30 AM.',
          'Provide shade and abundant water for livestock.'
        ],
        isRead: false,
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: now
      },
      {
        id: 'alert-002',
        userId: demoUserId,
        locationId: demoLocationId,
        locationName: 'Bhopal, Madhya Pradesh',
        type: 'drought',
        severity: 'MODERATE',
        title: 'Early Drought Watch Indicator',
        message: 'Consecutive dry spell of 14 days detected with topsoil moisture dropping below 18%.',
        expectedTime: 'Next 7-10 Days',
        factors: ['Rainfall deficit (-42% vs seasonal norm)', 'Topsoil moisture depletion (17.5% m³/m³)', 'NDVI drop across rainfed vegetation'],
        recommendations: [
          'Implement soil mulching to conserve root zone moisture.',
          'Monitor groundwater extraction limits and prepare supplemental drip reservoirs.'
        ],
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
        updatedAt: now
      }
    ];

    // Seed 14 days of realistic risk history for charting
    const seededAssessments: (RiskAssessment & { id: string })[] = [];
    for (let i = 14; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dayFactor = Math.sin(i * 0.4);
      const heatScore = Math.min(95, Math.max(20, Math.round(58 + dayFactor * 16)));
      const droughtScore = Math.min(95, Math.max(15, Math.round(44 + (14 - i) * 1.8)));
      const floodScore = Math.min(95, Math.max(10, Math.round(28 - dayFactor * 8)));
      const overallScore = Math.round(heatScore * 0.45 + droughtScore * 0.35 + floodScore * 0.2);

      let overallLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' = 'MODERATE';
      if (overallScore >= 75) overallLevel = 'EXTREME';
      else if (overallScore >= 50) overallLevel = 'HIGH';
      else if (overallScore >= 25) overallLevel = 'MODERATE';
      else overallLevel = 'LOW';

      seededAssessments.push({
        id: `assessment-${i}`,
        locationId: demoLocationId,
        locationName: 'Bhopal, Madhya Pradesh',
        latitude: 23.2599,
        longitude: 77.4126,
        timestamp: d.toISOString(),
        overallScore,
        overallLevel,
        earlySignalState: overallScore >= 55 ? 'WATCH' : 'EARLY_SIGNAL',
        heat: {
          score: heatScore,
          level: heatScore >= 75 ? 'EXTREME' : heatScore >= 50 ? 'HIGH' : heatScore >= 25 ? 'MODERATE' : 'LOW',
          temperature: 39 + dayFactor * 3,
          humidity: 26 - dayFactor * 4,
          heatIndex: 41 + dayFactor * 3,
          factors: []
        },
        drought: {
          score: droughtScore,
          level: droughtScore >= 75 ? 'EXTREME' : droughtScore >= 50 ? 'HIGH' : droughtScore >= 25 ? 'MODERATE' : 'LOW',
          rainfallCondition: 'Deficit (-38%)',
          soilMoisture: 18 - (14 - i) * 0.4,
          vegetationNDVI: 0.38 - (14 - i) * 0.005,
          factors: []
        },
        flood: {
          score: floodScore,
          level: floodScore >= 75 ? 'EXTREME' : floodScore >= 50 ? 'HIGH' : floodScore >= 25 ? 'MODERATE' : 'LOW',
          rainfall24h: 1.2,
          groundSaturation: 22,
          elevation: 505,
          factors: []
        },
        timeline: [],
        earlySignals: [],
        impactChains: {
          heat: { hazard: 'heat', title: 'Heat Impact Chain', nodes: [] },
          drought: { hazard: 'drought', title: 'Drought Impact Chain', nodes: [] },
          flood: { hazard: 'flood', title: 'Flood Impact Chain', nodes: [] }
        },
        recommendations: [],
        activeWarning: null,
        dataSource: 'OPEN-METEO',
        isDemo: false
      });
    }

    this.db = {
      users: [demoUser],
      locations: [demoLocation],
      notificationSettings: {
        [demoUserId]: demoSettings
      },
      riskAssessments: seededAssessments,
      alerts: demoAlerts
    };

    this.save();
  }

  // Users
  public findUserByEmail(email: string): DBUser | undefined {
    return this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): DBUser | undefined {
    return this.db.users.find((u) => u.id === id);
  }

  public createUser(userData: Omit<DBUser, 'id' | 'createdAt' | 'updatedAt'>): DBUser {
    const now = new Date().toISOString();
    const newUser: DBUser = {
      ...userData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    this.db.users.push(newUser);

    // Create default notification settings
    this.db.notificationSettings[newUser.id] = {
      heatAlerts: true,
      droughtAlerts: true,
      floodAlerts: true,
      minimumSeverity: 'MODERATE',
      channels: {
        inApp: true,
        email: true,
        sms: false
      }
    };

    this.save();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<DBUser>): DBUser | undefined {
    const user = this.findUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return user;
  }

  // Locations
  public getPrimaryLocation(userId: string): Location | undefined {
    return this.db.locations.find((l) => l.userId === userId && l.isPrimary);
  }

  public getUserLocations(userId: string): Location[] {
    return this.db.locations.filter((l) => l.userId === userId);
  }

  public getAllLocations(): Location[] {
    return [...this.db.locations];
  }

  public saveLocation(locationData: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Location {
    const now = new Date().toISOString();
    if (locationData.isPrimary) {
      this.db.locations.forEach((l) => {
        if (l.userId === locationData.userId) {
          l.isPrimary = false;
        }
      });
    }

    const newLocation: Location = {
      ...locationData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };

    this.db.locations.push(newLocation);
    this.save();
    return newLocation;
  }

  public updatePrimaryLocation(userId: string, locationId: string): Location | undefined {
    let targetLoc: Location | undefined;
    this.db.locations.forEach((l) => {
      if (l.userId === userId) {
        if (l.id === locationId) {
          l.isPrimary = true;
          l.updatedAt = new Date().toISOString();
          targetLoc = l;
        } else {
          l.isPrimary = false;
        }
      }
    });
    this.save();
    return targetLoc;
  }

  public updateLocation(id: string, updates: Partial<Location>): Location | undefined {
    const loc = this.db.locations.find((l) => l.id === id);
    if (!loc) return undefined;
    Object.assign(loc, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return loc;
  }

  // Notification Settings
  public getNotificationSettings(userId: string): NotificationSettings {
    if (!this.db.notificationSettings[userId]) {
      this.db.notificationSettings[userId] = {
        heatAlerts: true,
        droughtAlerts: true,
        floodAlerts: true,
        minimumSeverity: 'MODERATE',
        channels: {
          inApp: true,
          email: false,
          sms: false
        }
      };
      this.save();
    }
    return this.db.notificationSettings[userId];
  }

  public updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>): NotificationSettings {
    const existing = this.getNotificationSettings(userId);
    const updated: NotificationSettings = {
      ...existing,
      ...settings,
      channels: {
        ...existing.channels,
        ...(settings.channels || {})
      }
    };
    this.db.notificationSettings[userId] = updated;
    this.save();
    return updated;
  }

  // Risk Assessments
  public saveRiskAssessment(assessment: RiskAssessment): RiskAssessment & { id: string } {
    const id = assessment.id || uuidv4();
    const stored = { ...assessment, id };
    this.db.riskAssessments.push(stored);
    // Keep max 2000 assessments
    if (this.db.riskAssessments.length > 2000) {
      this.db.riskAssessments.shift();
    }
    this.save();
    return stored;
  }

  public getLatestAssessment(locationId: string): (RiskAssessment & { id: string }) | undefined {
    for (let i = this.db.riskAssessments.length - 1; i >= 0; i--) {
      if (this.db.riskAssessments[i].locationId === locationId) {
        return this.db.riskAssessments[i];
      }
    }
    return undefined;
  }

  public getRiskHistory(locationId: string, days: number = 30): RiskHistoryPoint[] {
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    return this.db.riskAssessments
      .filter((ra) => (!locationId || ra.locationId === locationId) && ra.timestamp >= cutoff)
      .map((ra) => ({
        id: ra.id,
        locationId: ra.locationId || '',
        timestamp: ra.timestamp,
        heatScore: ra.heat.score,
        droughtScore: ra.drought.score,
        floodScore: ra.flood.score,
        overallScore: ra.overallScore,
        overallLevel: ra.overallLevel,
        dataSource: ra.dataSource
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  // Alerts
  public getUserAlerts(userId: string): Alert[] {
    return this.db.alerts
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAlertById(id: string): Alert | undefined {
    return this.db.alerts.find((a) => a.id === id);
  }

  public markAlertAsRead(id: string, userId: string): Alert | undefined {
    const alert = this.db.alerts.find((a) => a.id === id && a.userId === userId);
    if (!alert) return undefined;
    alert.isRead = true;
    alert.updatedAt = new Date().toISOString();
    this.save();
    return alert;
  }

  public createAlert(alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Alert {
    const now = new Date().toISOString();
    const newAlert: Alert = {
      ...alertData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    this.db.alerts.unshift(newAlert);
    this.save();
    return newAlert;
  }
}

export const db = new DatabaseService();
