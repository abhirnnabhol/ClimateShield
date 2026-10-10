import {
  RiskAssessment,
  RiskLevel,
  RiskFactor,
  EarlySignalLevel,
  EarlySignal,
  ImpactChain,
  TimelinePoint,
  PersonalizedRecommendation,
  ClimateWarning,
  UserType,
  ScenarioSimulationRequest,
  ScenarioSimulationResult
} from '../types/shared.js';
import { weatherService } from './weatherService.js';
import { rainfallService } from './rainfallService.js';
import { satelliteService } from './satelliteService.js';
import { vegetationService } from './vegetationService.js';
import { soilMoistureService } from './soilMoistureService.js';
import { geospatialService } from './geospatialService.js';

export class RiskService {
  /**
   * Helper to categorize numeric score into standard 4 tiers
   */
  public scoreToLevel(score: number): RiskLevel {
    if (score >= 75) return 'EXTREME';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MODERATE';
    return 'LOW';
  }

  /**
   * Calculate Heat Index (Apparent temperature under humidity)
   */
  private calculateHeatIndex(tempC: number, rh: number): number {
    // Simplified Rothfusz regression converted to Celsius
    const t = (tempC * 9) / 5 + 32; // to Fahrenheit
    let hi = 0.5 * (t + 61.0 + (t - 68.0) * 1.2 + rh * 0.094);
    if (hi >= 80) {
      hi =
        -42.379 +
        2.04901523 * t +
        10.14333127 * rh -
        0.22475541 * t * rh -
        0.00683783 * t * t -
        0.05481717 * rh * rh +
        0.00122874 * t * t * rh +
        0.00085282 * t * rh * rh -
        0.00000199 * t * t * rh * rh;
    }
    return Math.round((((hi - 32) * 5) / 9) * 10) / 10;
  }

  /**
   * Core transparent, rule-based environmental risk engine
   */
  async analyzeRisk(
    latitude: number,
    longitude: number,
    options: {
      locationId?: string;
      locationName?: string;
      userType?: UserType;
      forceDemo?: boolean;
    } = {}
  ): Promise<RiskAssessment> {
    const userType = options.userType || 'Resident';
    const forceDemo = options.forceDemo || false;

    // Fetch all environmental layers concurrently through dedicated services
    const [weather, forecast, rainfall, satellite, geospatial] = await Promise.all([
      weatherService.getCurrent(latitude, longitude, forceDemo),
      weatherService.getForecast(latitude, longitude, forceDemo),
      rainfallService.getRainfall(latitude, longitude, forceDemo),
      satelliteService.getSatelliteObservations(latitude, longitude, forceDemo),
      geospatialService.getElevation(latitude, longitude, forceDemo)
    ]);

    const soil = await soilMoistureService.getSoilMoisture(latitude, longitude, rainfall.rainfall24h, forceDemo);
    const vegetation = await vegetationService.getVegetationData(latitude, longitude, soil.surfaceMoisturePercent, forceDemo);

    const isDemo = weather.isDemo || rainfall.isDemo || satellite.isDemo;
    const dataSource = isDemo ? 'DEMO / MOCK ENVIRONMENTAL REPOSITORY' : 'OPEN-METEO & SATELLITE MULTI-SENSOR';

    // 1. Heat Risk Calculation (0 - 100)
    const heatIndex = this.calculateHeatIndex(weather.temperature, weather.humidity);
    let rawHeat = 0;
    // Ambient Temp component (max 40 pts)
    if (weather.temperature >= 44) rawHeat += 40;
    else if (weather.temperature >= 40) rawHeat += 34;
    else if (weather.temperature >= 35) rawHeat += 26;
    else if (weather.temperature >= 30) rawHeat += 16;
    else if (weather.temperature >= 25) rawHeat += 8;

    // Heat Index component (max 30 pts)
    if (heatIndex >= 45) rawHeat += 30;
    else if (heatIndex >= 40) rawHeat += 24;
    else if (heatIndex >= 35) rawHeat += 16;
    else if (heatIndex >= 30) rawHeat += 8;

    // Solar Irradiance / Land Surface Temp (max 20 pts)
    if (satellite.landSurfaceTemperature >= 45) rawHeat += 20;
    else if (satellite.landSurfaceTemperature >= 40) rawHeat += 15;
    else if (satellite.landSurfaceTemperature >= 35) rawHeat += 10;

    // UV & Forecast trend (max 10 pts)
    if (weather.uvIndex >= 9) rawHeat += 10;
    else if (weather.uvIndex >= 6) rawHeat += 6;

    const heatScore = Math.min(100, Math.max(5, Math.round(rawHeat)));
    const heatLevel = this.scoreToLevel(heatScore);

    const heatFactors: RiskFactor[] = [
      {
        name: 'Surface Temperature',
        value: `${weather.temperature}°C`,
        status: weather.temperature >= 40 ? 'EXTREME' : weather.temperature >= 35 ? 'HIGH' : weather.temperature >= 30 ? 'MODERATE' : 'LOW',
        weight: 35,
        description: 'Current ambient screen level temperature'
      },
      {
        name: 'Calculated Heat Index',
        value: `${heatIndex}°C`,
        status: heatIndex >= 42 ? 'EXTREME' : heatIndex >= 36 ? 'HIGH' : heatIndex >= 30 ? 'MODERATE' : 'LOW',
        weight: 30,
        description: 'Physiological perceived temperature combining humidity'
      },
      {
        name: 'Land Surface Temp (Satellite)',
        value: `${satellite.landSurfaceTemperature}°C`,
        status: satellite.landSurfaceTemperature >= 44 ? 'EXTREME' : satellite.landSurfaceTemperature >= 38 ? 'HIGH' : satellite.landSurfaceTemperature >= 32 ? 'MODERATE' : 'LOW',
        weight: 20,
        description: 'Thermal infrared radiometric surface emission'
      },
      {
        name: 'Solar Radiation & UV',
        value: `UV ${weather.uvIndex}`,
        status: weather.uvIndex >= 10 ? 'EXTREME' : weather.uvIndex >= 7 ? 'HIGH' : weather.uvIndex >= 3 ? 'MODERATE' : 'LOW',
        weight: 15,
        description: 'Daytime incoming solar irradiance and UV stress'
      }
    ];

    // 2. Drought Risk Calculation (0 - 100)
    let rawDrought = 0;
    // Rainfall deficit (max 35 pts) - buffered if soil retains healthy moisture
    if (rainfall.condition === 'Extreme Deficit') {
      rawDrought += (soil.surfaceMoisturePercent > 45 ? 12 : 35);
    } else if (rainfall.condition === 'Moderate Deficit') {
      rawDrought += (soil.surfaceMoisturePercent > 45 ? 6 : 20);
    } else if (rainfall.condition === 'Normal') {
      rawDrought += (soil.surfaceMoisturePercent > 45 ? 2 : 8);
    }

    // Soil moisture depletion (max 30 pts)
    if (soil.surfaceMoisturePercent <= 15) rawDrought += 30;
    else if (soil.surfaceMoisturePercent <= 25) rawDrought += 22;
    else if (soil.surfaceMoisturePercent <= 40) rawDrought += 12;

    // Vegetation Stress / NDVI (max 25 pts)
    if (vegetation.ndvi <= 0.25) rawDrought += 25;
    else if (vegetation.ndvi <= 0.38) rawDrought += 18;
    else if (vegetation.ndvi <= 0.50) rawDrought += 10;

    // Evaporative Demand / Temp (max 10 pts)
    if (weather.temperature >= 38) rawDrought += 10;
    else if (weather.temperature >= 32) rawDrought += 6;

    const droughtScore = Math.min(100, Math.max(5, Math.round(rawDrought)));
    const droughtLevel = this.scoreToLevel(droughtScore);

    const droughtFactors: RiskFactor[] = [
      {
        name: 'Precipitation Deficit',
        value: `${rainfall.historicalAnomalyPercent}% (${rainfall.rainfall7d}mm/7d)`,
        status:
          rainfall.consecutiveDryDays >= 20 && rainfall.historicalAnomalyPercent <= -50
            ? 'EXTREME'
            : rainfall.consecutiveDryDays >= 12 && rainfall.historicalAnomalyPercent <= -30
              ? 'HIGH'
              : rainfall.consecutiveDryDays >= 8 && rainfall.historicalAnomalyPercent <= -20
                ? 'MODERATE'
                : 'LOW',
        weight: 35,
        description: '7-day precipitation anomaly vs climatological baseline'
      },
      {
        name: 'Topsoil Moisture Depletion',
        value: `${soil.surfaceMoisturePercent}%`,
        status: soil.surfaceMoisturePercent < 20 ? 'HIGH' : soil.surfaceMoisturePercent < 35 ? 'MODERATE' : 'LOW',
        weight: 30,
        description: 'Volumetric soil water availability in upper root zone'
      },
      {
        name: 'Vegetation Greenness (NDVI)',
        value: `${vegetation.ndvi}`,
        status: vegetation.ndvi < 0.3 ? 'HIGH' : vegetation.ndvi < 0.45 ? 'MODERATE' : 'LOW',
        weight: 25,
        description: 'Canopy density and chlorophyl spectral reflectance'
      },
      {
        name: 'Consecutive Dry Days',
        value: `${rainfall.consecutiveDryDays} days`,
        status: rainfall.consecutiveDryDays >= 25 ? 'EXTREME' : rainfall.consecutiveDryDays >= 14 ? 'HIGH' : rainfall.consecutiveDryDays >= 8 ? 'MODERATE' : 'LOW',
        weight: 10,
        description: 'Uninterrupted period without measurable precipitation'
      }
    ];

    // 3. Flood Risk Calculation (0 - 100)
    let rawFlood = 0;
    // 24h & 7d Rainfall (max 45 pts)
    if (rainfall.rainfall24h >= 65 || rainfall.condition === 'Heavy Torrential') rawFlood += 45;
    else if (rainfall.rainfall24h >= 35) rawFlood += 32;
    else if (rainfall.rainfall24h >= 15) rawFlood += 18;
    else if (rainfall.rainfall24h >= 5) rawFlood += 8;

    // Ground Saturation (max 25 pts)
    if (soil.groundSaturationPercent >= 85) rawFlood += 25;
    else if (soil.groundSaturationPercent >= 70) rawFlood += 18;
    else if (soil.groundSaturationPercent >= 50) rawFlood += 10;

    // Topography & Drainage Class (max 20 pts)
    if (geospatial.terrainType === 'Lowland Basin / Floodplain') rawFlood += 20;
    else if (geospatial.drainageClass === 'Impeded / Low Gradient') rawFlood += 14;
    else if (geospatial.terrainType === 'Undulating Plains') rawFlood += 8;

    // Forecasted next 48h rain probability (max 10 pts)
    const upcomingRainProb = forecast.days[0]?.precipitationProbability || 10;
    if (upcomingRainProb >= 70) rawFlood += 10;
    else if (upcomingRainProb >= 40) rawFlood += 5;

    const floodScore = Math.min(100, Math.max(5, Math.round(rawFlood)));
    const floodLevel = this.scoreToLevel(floodScore);

    const floodFactors: RiskFactor[] = [
      {
        name: '24h Precipitation Influx',
        value: `${rainfall.rainfall24h} mm`,
        status: rainfall.rainfall24h >= 50 ? 'EXTREME' : rainfall.rainfall24h >= 25 ? 'HIGH' : rainfall.rainfall24h >= 10 ? 'MODERATE' : 'LOW',
        weight: 45,
        description: 'Rainfall accumulation over the past 24 hours'
      },
      {
        name: 'Ground Saturation Level',
        value: `${soil.groundSaturationPercent}%`,
        status: soil.groundSaturationPercent >= 80 ? 'EXTREME' : soil.groundSaturationPercent >= 60 ? 'HIGH' : 'LOW',
        weight: 25,
        description: 'Soil water holding capacity and runoff threshold'
      },
      {
        name: 'Topographic Basin Index',
        value: `${geospatial.elevation}m (${geospatial.terrainType})`,
        status: geospatial.terrainType === 'Lowland Basin / Floodplain' ? 'HIGH' : 'LOW',
        weight: 20,
        description: 'Digital Elevation Model contour and watershed drainage'
      },
      {
        name: 'Infiltration Capacity',
        value: soil.infiltrationCapacity,
        status: soil.infiltrationCapacity === 'Low / Saturated' ? 'HIGH' : 'LOW',
        weight: 10,
        description: 'Permeability of topsoil layer under runoff'
      }
    ];

    // Overall Risk: weighted composite with dominant hazard prioritization
    const dominantScore = Math.max(heatScore, droughtScore, floodScore);
    const avgScore = (heatScore + droughtScore + floodScore) / 3;
    const overallScore = Math.round(dominantScore * 0.65 + avgScore * 0.35);
    const overallLevel = this.scoreToLevel(overallScore);

    // Early Signal State Detection
    // NORMAL -> EARLY SIGNAL -> WATCH -> HIGH RISK -> EXTREME
    let earlySignalState: EarlySignalLevel = 'NORMAL';
    if (dominantScore >= 75) earlySignalState = 'EXTREME';
    else if (dominantScore >= 50) earlySignalState = 'HIGH_RISK';
    else if (dominantScore >= 35 || rainfall.historicalAnomalyPercent <= -25) earlySignalState = 'WATCH';
    else if (dominantScore >= 20 || rainfall.consecutiveDryDays >= 6 || weather.temperature >= 33) earlySignalState = 'EARLY_SIGNAL';

    // Early Signals by Hazard
    const earlySignals: EarlySignal[] = [
      {
        hazard: 'heat',
        status: heatScore >= 65 ? 'HIGH_RISK' : heatScore >= 45 ? 'WATCH' : heatScore >= 28 ? 'EARLY_SIGNAL' : 'NORMAL',
        trend: weather.temperature >= 35 ? 'increasing' : 'stable',
        explanation:
          weather.temperature >= 35
            ? 'Surface warming trend detected with rising solar irradiance and low moisture buffering.'
            : 'Thermal variables within typical regional safety limits.',
        confidence: 88
      },
      {
        hazard: 'drought',
        status: droughtScore >= 65 ? 'HIGH_RISK' : droughtScore >= 45 ? 'WATCH' : droughtScore >= 25 ? 'EARLY_SIGNAL' : 'NORMAL',
        trend: rainfall.consecutiveDryDays >= 7 ? 'increasing' : 'stable',
        explanation:
          rainfall.consecutiveDryDays >= 7
            ? 'Persistent dry spell accompanied by declining topsoil moisture and negative rainfall anomaly.'
            : 'Soil moisture reserves currently buffered.',
        confidence: 82
      },
      {
        hazard: 'flood',
        status: floodScore >= 65 ? 'HIGH_RISK' : floodScore >= 45 ? 'WATCH' : floodScore >= 25 ? 'EARLY_SIGNAL' : 'NORMAL',
        trend: rainfall.rainfall24h > 15 ? 'increasing' : 'stable',
        explanation:
          rainfall.rainfall24h > 15
            ? 'Recent precipitation is increasing ground saturation in low-gradient sectors.'
            : 'Precipitation volumes remain well below catchment capacity.',
        confidence: 85
      }
    ];

    // Timeline forecast generation (Today, Tomorrow, 3 Days, 7 Days)
    const timeline: TimelinePoint[] = [
      {
        period: 'Today',
        date: new Date().toISOString().split('T')[0],
        overallScore,
        overallLevel,
        heatScore,
        droughtScore,
        floodScore
      },
      {
        period: 'Tomorrow',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        overallScore: Math.min(100, Math.max(10, Math.round(overallScore * 1.05 + 2))),
        overallLevel: this.scoreToLevel(Math.min(100, Math.round(overallScore * 1.05 + 2))),
        heatScore: Math.min(100, Math.round(heatScore * 1.06)),
        droughtScore: Math.min(100, Math.round(droughtScore * 1.03)),
        floodScore: Math.max(10, Math.round(floodScore * 0.95))
      },
      {
        period: '3 Days',
        date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        overallScore: Math.min(100, Math.max(10, Math.round(overallScore * 1.12 + 4))),
        overallLevel: this.scoreToLevel(Math.min(100, Math.round(overallScore * 1.12 + 4))),
        heatScore: Math.min(100, Math.round(heatScore * 1.12)),
        droughtScore: Math.min(100, Math.round(droughtScore * 1.08)),
        floodScore: Math.max(10, Math.round(floodScore * 0.9))
      },
      {
        period: '7 Days',
        date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        overallScore: Math.min(100, Math.max(10, Math.round(overallScore * 1.18 + 5))),
        overallLevel: this.scoreToLevel(Math.min(100, Math.round(overallScore * 1.18 + 5))),
        heatScore: Math.min(100, Math.round(heatScore * 1.15)),
        droughtScore: Math.min(100, Math.round(droughtScore * 1.16)),
        floodScore: Math.max(10, Math.round(floodScore * 0.85))
      }
    ];

    // Potential Impact Chains
    const impactChains: { heat: ImpactChain; drought: ImpactChain; flood: ImpactChain } = {
      heat: {
        hazard: 'heat',
        title: 'Thermal Stress Cascade',
        nodes: [
          {
            id: 'h1',
            step: 1,
            title: 'High Solar Irradiance',
            description: `Intense solar influx of ${weather.solarRadiation} W/m²`,
            status: weather.solarRadiation > 700 ? 'active' : 'normal'
          },
          {
            id: 'h2',
            step: 2,
            title: 'Elevated Surface Heat',
            description: `Land surface reaches ${satellite.landSurfaceTemperature}°C`,
            status: satellite.landSurfaceTemperature > 38 ? 'active' : 'normal'
          },
          {
            id: 'h3',
            step: 3,
            title: 'Moisture Evapotranspiration',
            description: 'Rapid moisture loss from leaf canopy and topsoil',
            status: heatScore > 40 ? 'active' : 'projected'
          },
          {
            id: 'h4',
            step: 4,
            title: 'Physiological Heat Strain',
            description: 'Core body heat accumulation and outdoor fatigue risk',
            status: heatScore >= 50 ? 'active' : 'projected'
          },
          {
            id: 'h5',
            step: 5,
            title: 'Operational Heat Disruption',
            description: 'Loss of outdoor labor hours and thermal crop stress',
            status: heatScore >= 75 ? 'active' : 'projected'
          }
        ]
      },
      drought: {
        hazard: 'drought',
        title: 'Hydrological Deficit Cascade',
        nodes: [
          {
            id: 'd1',
            step: 1,
            title: 'Precipitation Deficit',
            description: `${rainfall.historicalAnomalyPercent}% deviation from expected baseline`,
            status: rainfall.historicalAnomalyPercent < -20 ? 'active' : 'normal'
          },
          {
            id: 'd2',
            step: 2,
            title: 'Topsoil Depletion',
            description: `Volumetric moisture down to ${soil.surfaceMoisturePercent}%`,
            status: soil.surfaceMoisturePercent < 25 ? 'active' : 'normal'
          },
          {
            id: 'd3',
            step: 3,
            title: 'Root Zone Stress',
            description: 'Capillary water uptake impaired in crop roots',
            status: droughtScore >= 40 ? 'active' : 'projected'
          },
          {
            id: 'd4',
            step: 4,
            title: 'Vegetation Desiccation (NDVI)',
            description: `Spectral greenness index drop to ${vegetation.ndvi}`,
            status: vegetation.ndvi < 0.35 ? 'active' : 'projected'
          },
          {
            id: 'd5',
            step: 5,
            title: 'Agricultural & Water Yield Impact',
            description: 'Crop yield reduction and groundwater depletion',
            status: droughtScore >= 70 ? 'active' : 'projected'
          }
        ]
      },
      flood: {
        hazard: 'flood',
        title: 'Runoff & Inundation Cascade',
        nodes: [
          {
            id: 'f1',
            step: 1,
            title: 'Intense Precipitation',
            description: `${rainfall.rainfall24h} mm rainfall recorded in past 24 hours`,
            status: rainfall.rainfall24h >= 20 ? 'active' : 'normal'
          },
          {
            id: 'f2',
            step: 2,
            title: 'Ground Saturation',
            description: `Soil saturation reaches ${soil.groundSaturationPercent}% field capacity`,
            status: soil.groundSaturationPercent >= 65 ? 'active' : 'normal'
          },
          {
            id: 'f3',
            step: 3,
            title: 'Surface Runoff Acceleration',
            description: 'Precipitation rate exceeds infiltration capacity',
            status: floodScore >= 45 ? 'active' : 'projected'
          },
          {
            id: 'f4',
            step: 4,
            title: 'Drainage Channel Stress',
            description: `Lowland basins (${geospatial.elevation}m) experience impeded outflow`,
            status: floodScore >= 55 ? 'active' : 'projected'
          },
          {
            id: 'f5',
            step: 5,
            title: 'Localized Inundation',
            description: 'Water accumulation across roads, fields, and basements',
            status: floodScore >= 75 ? 'active' : 'projected'
          }
        ]
      }
    };

    // Personalized Recommendations based on UserType and Dominant Hazards
    const recommendations: PersonalizedRecommendation[] = [];

    if (userType === 'Farmer') {
      if (heatScore >= 45) {
        recommendations.push({
          targetUserType: 'Farmer',
          hazard: 'heat',
          priority: heatScore >= 70 ? 'urgent' : 'advisory',
          action: 'Shift irrigation to nocturnal hours (8:00 PM – 5:00 AM)',
          explanation: 'Reduces daytime evapotranspiration loss by up to 35% and prevents thermal shock on crops.'
        });
      }
      if (droughtScore >= 40) {
        recommendations.push({
          targetUserType: 'Farmer',
          hazard: 'drought',
          priority: droughtScore >= 65 ? 'urgent' : 'warning',
          action: 'Deploy crop residue mulching and prioritize deficit drip irrigation',
          explanation: `Topsoil moisture is at ${soil.surfaceMoisturePercent}%. Mulching preserves sub-surface moisture retention for 5-8 days.`
        });
      }
      if (floodScore >= 45) {
        recommendations.push({
          targetUserType: 'Farmer',
          hazard: 'flood',
          priority: 'warning',
          action: 'Clear farm drainage furrows and elevate stored harvest/seed stock',
          explanation: `Field saturation is ${soil.groundSaturationPercent}%. Excess runoff can cause root waterlogging in low-lying sectors.`
        });
      }
    } else if (userType === 'Outdoor Worker') {
      if (heatScore >= 45) {
        recommendations.push({
          targetUserType: 'Outdoor Worker',
          hazard: 'heat',
          priority: heatScore >= 70 ? 'urgent' : 'warning',
          action: 'Enforce 15-minute shaded rest breaks per work hour; hydrate with electrolytes',
          explanation: `Heat index of ${heatIndex}°C significantly elevates the risk of heat exhaustion and cramps during continuous exertion.`
        });
        recommendations.push({
          targetUserType: 'Outdoor Worker',
          hazard: 'heat',
          priority: 'advisory',
          action: 'Wear light-colored, breathable clothing and UV-protective headgear',
          explanation: `Peak solar irradiance is ${weather.solarRadiation} W/m² with UV index ${weather.uvIndex}.`
        });
      }
      if (floodScore >= 50) {
        recommendations.push({
          targetUserType: 'Outdoor Worker',
          hazard: 'flood',
          priority: 'warning',
          action: 'Avoid worksites near storm drainage canals, trenches, and low underpasses',
          explanation: 'Rapid accumulation of surface runoff can create sudden water surges.'
        });
      }
    } else {
      // Resident / Other
      if (heatScore >= 45) {
        recommendations.push({
          targetUserType: 'Resident',
          hazard: 'heat',
          priority: heatScore >= 70 ? 'urgent' : 'advisory',
          action: 'Limit prolonged outdoor exposure during peak afternoon hours (12:00 PM – 4:30 PM)',
          explanation: `Ambient temperature (${weather.temperature}°C) and UV radiation (${weather.uvIndex}) peak during this window.`
        });
        recommendations.push({
          targetUserType: 'Resident',
          hazard: 'heat',
          priority: 'info',
          action: 'Check in on elderly relatives and ensure pets have continuous shaded water access',
          explanation: 'Vulnerable demographics have lower thermoregulation efficiency under sustained heat.'
        });
      }
      if (floodScore >= 45) {
        recommendations.push({
          targetUserType: 'Resident',
          hazard: 'flood',
          priority: floodScore >= 70 ? 'urgent' : 'warning',
          action: 'Never drive or walk through standing water of unknown depth',
          explanation: '6 inches of swift water can sweep adults; 12 inches can float vehicles.'
        });
      }
      if (droughtScore >= 50) {
        recommendations.push({
          targetUserType: 'Resident',
          hazard: 'drought',
          priority: 'advisory',
          action: 'Adopt domestic water conservation practices and repair leaking fixtures',
          explanation: 'Regional precipitation deficit is placing stress on municipal reservoirs.'
        });
      }
    }

    // Default safety fallback if low risk
    if (recommendations.length === 0) {
      recommendations.push({
        targetUserType: userType,
        hazard: 'general',
        priority: 'info',
        action: 'Environmental parameters remain within nominal seasonal safety baselines',
        explanation: 'Continue standard routine operations while ClimateShield automated monitoring runs in the background.'
      });
    }

    // Active Warning Generator (Section 13: WHAT, WHERE, WHEN, WHY, WHAT TO DO)
    let activeWarning: ClimateWarning | null = null;
    const locationDisplayName = options.locationName || `Sector (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;

    if (dominantScore >= 50) {
      const topHazard = dominantScore === heatScore ? 'heat' : dominantScore === floodScore ? 'flood' : 'drought';
      const severity = this.scoreToLevel(dominantScore);

      if (topHazard === 'heat') {
        activeWarning = {
          id: `warn-heat-${Date.now()}`,
          hazard: 'heat',
          severity,
          title: `${severity} HEAT STRESS WARNING`,
          what: `Elevated surface heat and thermal stress index (${heatIndex}°C).`,
          where: locationDisplayName,
          when: 'Expected to peak between 12:00 PM and 5:00 PM over the next 48-72 hours.',
          why: `Contributing factors: Ambient temp (${weather.temperature}°C), low atmospheric humidity (${weather.humidity}%), and direct solar flux (${weather.solarRadiation} W/m²).`,
          whatToDo:
            'Hydrate frequently, restrict strenuous outdoor labor during peak sunshine, ensure livestock ventilation, and monitor vulnerable individuals.',
          isOfficialGuidanceDistinction:
            'NOTICE: This is an analytical climate risk assessment generated by ClimateShield algorithms. In emergency situations, always follow directives from local meteorological and disaster management authorities.'
        };
      } else if (topHazard === 'flood') {
        activeWarning = {
          id: `warn-flood-${Date.now()}`,
          hazard: 'flood',
          severity,
          title: `${severity} LOCALIZED FLOOD & INUNDATION WARNING`,
          what: `High surface water accumulation and soil saturation (${soil.groundSaturationPercent}%).`,
          where: locationDisplayName,
          when: 'Active now through next 24 hours of forecasted precipitation.',
          why: `Contributing factors: 24h rainfall (${rainfall.rainfall24h} mm), low-gradient drainage terrain (${geospatial.terrainType}), and saturated topsoil.`,
          whatToDo:
            'Avoid low-lying underpasses and dry creek crossings. Move valuable assets and machinery to elevated ground.',
          isOfficialGuidanceDistinction:
            'NOTICE: This is an analytical climate risk assessment generated by ClimateShield algorithms. In emergency situations, always follow directives from local meteorological and disaster management authorities.'
        };
      } else {
        activeWarning = {
          id: `warn-drought-${Date.now()}`,
          hazard: 'drought',
          severity,
          title: `${severity} PROLONGED DROUGHT & MOISTURE DEFICIT ADVISORY`,
          what: `Soil desiccation and severe agricultural moisture deficiency.`,
          where: locationDisplayName,
          when: 'Developing over past 14 days and projected to intensify through the week.',
          why: `Contributing factors: Precipitation anomaly (${rainfall.historicalAnomalyPercent}%), volumetric soil moisture at ${soil.surfaceMoisturePercent}%, and vegetation NDVI down to ${vegetation.ndvi}.`,
          whatToDo:
            'Implement soil moisture conservation measures, activate secondary storage tanks, and follow regional water usage quotas.',
          isOfficialGuidanceDistinction:
            'NOTICE: This is an analytical climate risk assessment generated by ClimateShield algorithms. In emergency situations, always follow directives from local meteorological and disaster management authorities.'
        };
      }
    }

    return {
      locationId: options.locationId,
      locationName: locationDisplayName,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
      overallScore,
      overallLevel,
      earlySignalState,
      heat: {
        score: heatScore,
        level: heatLevel,
        temperature: weather.temperature,
        humidity: weather.humidity,
        heatIndex,
        factors: heatFactors,
        forecastSummary: `Forecast high of ${forecast.days[0]?.maxTemp ?? weather.temperature + 2}°C with ${weather.humidity}% humidity.`
      },
      drought: {
        score: droughtScore,
        level: droughtLevel,
        rainfallCondition: rainfall.condition,
        soilMoisture: soil.surfaceMoisturePercent,
        vegetationNDVI: vegetation.ndvi,
        factors: droughtFactors,
        forecastSummary: `${rainfall.consecutiveDryDays} dry days recorded; 7-day cumulative precip: ${rainfall.rainfall7d} mm.`
      },
      flood: {
        score: floodScore,
        level: floodLevel,
        rainfall24h: rainfall.rainfall24h,
        groundSaturation: soil.groundSaturationPercent,
        elevation: geospatial.elevation,
        factors: floodFactors,
        forecastSummary: `Upcoming precipitation probability ${forecast.days[0]?.precipitationProbability ?? 10}% over next 24h.`
      },
      timeline,
      earlySignals,
      impactChains,
      recommendations,
      activeWarning,
      dataSource,
      isDemo
    };
  }

  /**
   * Section 27: WHAT-IF CLIMATE SCENARIO SIMULATION
   */
  async simulateScenario(req: ScenarioSimulationRequest): Promise<ScenarioSimulationResult> {
    const baseline = await this.analyzeRisk(req.latitude, req.longitude);

    // Apply simulation shifts
    // 1. Temperature change delta (e.g. +3.5°C) -> increases heat score and drought evaporative demand
    const simTempShift = req.temperatureChange || 0;
    const simRainShift = req.rainfallChange || 0; // in percent e.g. +30% or -20%
    const simHumShift = req.humidityChange || 0; // in percent e.g. +10%

    // Calculate simulated heat score
    const tempImpact = simTempShift * 4.8;
    const humHeatImpact = (simHumShift / 100) * 8;
    const simulatedHeat = Math.min(100, Math.max(0, Math.round(baseline.heat.score + tempImpact + humHeatImpact)));

    // Calculate simulated drought score
    // Higher temp increases drought, lower rain increases drought
    const rainDroughtImpact = -(simRainShift / 100) * 35;
    const tempDroughtImpact = simTempShift * 2.2;
    const simulatedDrought = Math.min(100, Math.max(0, Math.round(baseline.drought.score + rainDroughtImpact + tempDroughtImpact)));

    // Calculate simulated flood score
    // Higher rain sharply increases flood risk, higher humidity increases runoff
    const rainFloodImpact = (simRainShift / 100) * 45;
    const simulatedFlood = Math.min(100, Math.max(0, Math.round(baseline.flood.score + rainFloodImpact)));

    const simDominant = Math.max(simulatedHeat, simulatedDrought, simulatedFlood);
    const simAvg = (simulatedHeat + simulatedDrought + simulatedFlood) / 3;
    const simulatedOverall = Math.min(100, Math.max(0, Math.round(simDominant * 0.65 + simAvg * 0.35)));

    const analysis: string[] = [];

    if (simRainShift > 20) {
      analysis.push(`Rainfall increase of ${simRainShift}% increases flood vulnerability by +${simulatedFlood - baseline.flood.score} points.`);
    } else if (simRainShift < -20) {
      analysis.push(`Rainfall reduction of ${Math.abs(simRainShift)}% accelerates soil moisture deficit by +${simulatedDrought - baseline.drought.score} points.`);
    }

    if (simTempShift > 2) {
      analysis.push(`A +${simTempShift}°C warming anomaly pushes the local heat stress index up by +${simulatedHeat - baseline.heat.score} points, exceeding safe physical thresholds.`);
    } else if (simTempShift < -2) {
      analysis.push(`A cooling anomaly of ${simTempShift}°C lowers overall thermal stress by ${Math.abs(simulatedHeat - baseline.heat.score)} points.`);
    }

    if (analysis.length === 0) {
      analysis.push('Moderate parameter adjustments produce proportional, buffered shifts in local climate risk vectors.');
    }

    return {
      baseline: {
        heatScore: baseline.heat.score,
        droughtScore: baseline.drought.score,
        floodScore: baseline.flood.score,
        overallScore: baseline.overallScore,
        overallLevel: baseline.overallLevel
      },
      simulated: {
        heatScore: simulatedHeat,
        droughtScore: simulatedDrought,
        floodScore: simulatedFlood,
        overallScore: simulatedOverall,
        overallLevel: this.scoreToLevel(simulatedOverall)
      },
      delta: {
        heatDelta: simulatedHeat - baseline.heat.score,
        droughtDelta: simulatedDrought - baseline.drought.score,
        floodDelta: simulatedFlood - baseline.flood.score,
        overallDelta: simulatedOverall - baseline.overallScore
      },
      analysis,
      isSimulation: true
    };
  }
}

export const riskService = new RiskService();
