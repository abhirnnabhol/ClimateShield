export type UserType = 'Resident' | 'Farmer' | 'Outdoor Worker' | 'Other';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';

export type EarlySignalLevel = 'NORMAL' | 'EARLY_SIGNAL' | 'WATCH' | 'HIGH_RISK' | 'EXTREME';

export interface User {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  cropType?: string;
  farmArea?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  notificationSettings: NotificationSettings;
  primaryLocation?: Location;
}

export interface Location {
  id: string;
  userId: string;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  timezone: string;
  isPrimary: boolean;
  cropType?: string;
  farmArea?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskFactor {
  name: string;
  value: string | number;
  status: RiskLevel;
  weight: number;
  description: string;
}

export interface RiskScore {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  forecastSummary?: string;
}

export interface EarlySignal {
  hazard: 'heat' | 'drought' | 'flood';
  status: EarlySignalLevel;
  trend: 'increasing' | 'stable' | 'decreasing';
  explanation: string;
  confidence: number;
}

export interface ImpactChainNode {
  id: string;
  step: number;
  title: string;
  description: string;
  status: 'normal' | 'active' | 'projected';
}

export interface ImpactChain {
  hazard: 'heat' | 'drought' | 'flood';
  title: string;
  nodes: ImpactChainNode[];
}

export interface TimelinePoint {
  period: 'Today' | 'Tomorrow' | '3 Days' | '7 Days';
  date: string;
  overallScore: number;
  overallLevel: RiskLevel;
  heatScore: number;
  droughtScore: number;
  floodScore: number;
}

export interface PersonalizedRecommendation {
  targetUserType: UserType | 'All';
  hazard: 'heat' | 'drought' | 'flood' | 'general';
  priority: 'info' | 'advisory' | 'warning' | 'urgent';
  action: string;
  explanation: string;
}

export interface ClimateWarning {
  id: string;
  hazard: 'heat' | 'drought' | 'flood';
  severity: RiskLevel;
  title: string;
  what: string;
  where: string;
  when: string;
  why: string;
  whatToDo: string;
  isOfficialGuidanceDistinction: string;
}

export interface RiskAssessment {
  id?: string;
  locationId?: string;
  locationName?: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  overallScore: number;
  overallLevel: RiskLevel;
  earlySignalState: EarlySignalLevel;
  heat: RiskScore & { temperature: number; humidity: number; heatIndex: number };
  drought: RiskScore & { rainfallCondition: string; soilMoisture: number; vegetationNDVI: number };
  flood: RiskScore & { rainfall24h: number; groundSaturation: number; elevation: number };
  timeline: TimelinePoint[];
  earlySignals: EarlySignal[];
  impactChains: {
    heat: ImpactChain;
    drought: ImpactChain;
    flood: ImpactChain;
  };
  recommendations: PersonalizedRecommendation[];
  activeWarning: ClimateWarning | null;
  dataSource: string;
  isDemo: boolean;
}

export interface Alert {
  id: string;
  userId: string;
  locationId: string;
  locationName: string;
  type: 'heat' | 'drought' | 'flood' | 'multi-hazard';
  severity: RiskLevel;
  title: string;
  message: string;
  expectedTime: string;
  factors: string[];
  recommendations: string[];
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  heatAlerts: boolean;
  droughtAlerts: boolean;
  floodAlerts: boolean;
  minimumSeverity: RiskLevel;
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
  };
}

export interface EnvironmentalData {
  latitude: number;
  longitude: number;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  rainfall24h: number;
  rainfall7d: number;
  windSpeed: number;
  soilMoisture: number;
  vegetationNDVI: number;
  elevation: number;
  solarRadiation: number;
  uvIndex: number;
  forecastDaily: {
    date: string;
    maxTemp: number;
    minTemp: number;
    precipitationSum: number;
    precipitationProbability: number;
  }[];
  dataSource: string;
  isDemo: boolean;
  timestamp: string;
}

export interface ScenarioSimulationRequest {
  latitude: number;
  longitude: number;
  temperatureChange: number; // in Celsius e.g. +3
  rainfallChange: number;    // in % e.g. +25
  humidityChange: number;    // in % e.g. -10
}

export interface ScenarioSimulationResult {
  baseline: {
    heatScore: number;
    droughtScore: number;
    floodScore: number;
    overallScore: number;
    overallLevel: RiskLevel;
  };
  simulated: {
    heatScore: number;
    droughtScore: number;
    floodScore: number;
    overallScore: number;
    overallLevel: RiskLevel;
  };
  delta: {
    heatDelta: number;
    droughtDelta: number;
    floodDelta: number;
    overallDelta: number;
  };
  analysis: string[];
  isSimulation: true;
}

export interface RiskHistoryPoint {
  id: string;
  locationId: string;
  timestamp: string;
  heatScore: number;
  droughtScore: number;
  floodScore: number;
  overallScore: number;
  overallLevel: RiskLevel;
  dataSource: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
