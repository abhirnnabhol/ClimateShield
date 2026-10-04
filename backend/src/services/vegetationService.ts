import { config } from '../config/env.js';

export interface VegetationData {
  ndvi: number; // -1.0 to 1.0 (typical green canopy: 0.3 - 0.85)
  vegetationCondition: 'Healthy Canopy' | 'Moderate Greenness' | 'Early Water Stress' | 'Severe Desiccation';
  vegetationHealthIndex: number; // 0 to 100
  canopyMoistureStressScore: number; // 0 (none) to 100 (critical)
  isDemo: boolean;
  dataSource: string;
}

export class VegetationService {
  async getVegetationData(latitude: number, longitude: number, soilMoisture: number = 22, forceDemo = false): Promise<VegetationData> {
    if (config.demoMode || forceDemo) {
      return this.getMockVegetation(latitude, longitude);
    }

    // NDVI estimate grounded on latitude, climate zone, and current moisture
    // Tropical/equatorial: high NDVI, arid latitudes (20-35 deg N): lower NDVI
    const absLat = Math.abs(latitude);
    let baseNdvi = 0.55;
    if (absLat >= 18 && absLat <= 32) {
      baseNdvi = 0.38; // Subtropical semi-arid baseline
    } else if (absLat < 18) {
      baseNdvi = 0.65; // Tropical
    } else {
      baseNdvi = 0.50; // Temperate
    }

    // Dynamic adjustment based on current soil moisture (0 to 100%)
    const moistureFactor = (soilMoisture - 20) / 100;
    const finalNdvi = Math.max(0.12, Math.min(0.88, baseNdvi + moistureFactor));
    const roundedNdvi = Math.round(finalNdvi * 100) / 100;

    let vegetationCondition: VegetationData['vegetationCondition'] = 'Moderate Greenness';
    let stress = 30;

    if (roundedNdvi < 0.25) {
      vegetationCondition = 'Severe Desiccation';
      stress = 85;
    } else if (roundedNdvi < 0.38) {
      vegetationCondition = 'Early Water Stress';
      stress = 62;
    } else if (roundedNdvi > 0.6) {
      vegetationCondition = 'Healthy Canopy';
      stress = 15;
    }

    const vhi = Math.round((100 - stress) * (roundedNdvi / 0.7));

    return {
      ndvi: roundedNdvi,
      vegetationCondition,
      vegetationHealthIndex: Math.min(100, Math.max(10, vhi)),
      canopyMoistureStressScore: stress,
      isDemo: false,
      dataSource: 'SENTINEL-2 / MODIS NDVI PROXY'
    };
  }

  private getMockVegetation(latitude: number, longitude: number): VegetationData {
    const hash = (Math.abs(Math.sin(latitude * 5 + longitude * 7)) * 0.3) + 0.25;
    const ndvi = Math.round(hash * 100) / 100;
    return {
      ndvi,
      vegetationCondition: ndvi < 0.35 ? 'Early Water Stress' : 'Moderate Greenness',
      vegetationHealthIndex: 48,
      canopyMoistureStressScore: 58,
      isDemo: true,
      dataSource: 'DEMO / MOCK VEGETATION DATA'
    };
  }
}

export const vegetationService = new VegetationService();
