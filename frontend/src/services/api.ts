import {
  AuthResponse,
  User,
  UserProfile,
  Location,
  RiskAssessment,
  Alert,
  NotificationSettings,
  RiskHistoryPoint,
  LocationSearchResult,
  ScenarioSimulationRequest,
  ScenarioSimulationResult,
  AirQualityData
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('climateshield_token');
  }

  private setToken(token: string) {
    localStorage.setItem('climateshield_token', token);
  }

  private removeToken() {
    localStorage.removeItem('climateshield_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Auth
  async register(data: {
    name: string;
    email: string;
    password: string;
    userType: string;
    cropType?: string;
    farmArea?: string;
  }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    this.setToken(res.token);
    return res;
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    this.setToken(res.token);
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      this.removeToken();
    }
  }

  async getMe(): Promise<{ user: User; primaryLocation?: Location; notificationSettings: NotificationSettings }> {
    return this.request('/auth/me');
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // Locations
  async searchLocations(query: string): Promise<LocationSearchResult[]> {
    const res = await this.request<{ results: LocationSearchResult[] }>(`/locations/search?q=${encodeURIComponent(query)}`);
    return res.results || [];
  }

  async getLocationDetails(lat: number, lon: number): Promise<LocationSearchResult> {
    return this.request<LocationSearchResult>(`/locations/details?lat=${lat}&lon=${lon}`);
  }

  async saveLocation(data: {
    name: string;
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
    country?: string;
    timezone?: string;
    isPrimary?: boolean;
    cropType?: string;
    farmArea?: string;
  }): Promise<{ location: Location; message: string }> {
    return this.request('/locations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getPrimaryLocation(): Promise<{ location: Location }> {
    return this.request('/locations/primary');
  }

  async updatePrimaryLocation(locationId: string): Promise<{ location: Location }> {
    return this.request('/locations/primary', {
      method: 'PUT',
      body: JSON.stringify({ locationId })
    });
  }

  async getUserLocations(): Promise<{ locations: Location[] }> {
    return this.request('/locations');
  }

  // Dashboard & Risk
  async getDashboard(): Promise<{
    needsLocationSetup?: boolean;
    location?: Location;
    assessment?: RiskAssessment;
    unreadAlertsCount?: number;
    activeAlerts?: Alert[];
  }> {
    return this.request('/dashboard');
  }

  async analyzeRisk(params: {
    latitude: number;
    longitude: number;
    locationName?: string;
    userType?: string;
  }): Promise<{ assessment: RiskAssessment }> {
    return this.request('/risk/analyze', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async simulateScenario(params: ScenarioSimulationRequest): Promise<ScenarioSimulationResult> {
    return this.request('/risk/scenario', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async getRiskHistory(params: { locationId?: string; days?: number }): Promise<{
    history: RiskHistoryPoint[];
    locationId: string;
    days: number;
  }> {
    const query = new URLSearchParams();
    if (params.locationId) query.set('locationId', params.locationId);
    if (params.days) query.set('days', params.days.toString());
    return this.request(`/risk/history?${query.toString()}`);
  }

  // Alerts
  async getAlerts(): Promise<{ alerts: Alert[] }> {
    return this.request('/alerts');
  }

  async getAlertById(id: string): Promise<{ alert: Alert }> {
    return this.request(`/alerts/${id}`);
  }

  async markAlertAsRead(id: string): Promise<{ alert: Alert }> {
    return this.request(`/alerts/${id}/read`, { method: 'PATCH' });
  }

  async triggerDemoAlert(type: 'heat' | 'flood' | 'drought' = 'flood'): Promise<{ alert: Alert; message: string }> {
    return this.request('/alerts/demo-trigger', {
      method: 'POST',
      body: JSON.stringify({ type })
    });
  }

  // Profile & Settings
  async getProfile(): Promise<{ user: User; primaryLocation?: Location; notificationSettings: NotificationSettings }> {
    return this.request('/profile');
  }

  async updateProfile(data: Partial<User>): Promise<{ user: User; message: string }> {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    return this.request('/profile/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getNotificationSettings(): Promise<{ settings: NotificationSettings }> {
    return this.request('/settings/notifications');
  }

  async updateNotificationSettings(data: Partial<NotificationSettings>): Promise<{ settings: NotificationSettings; message: string }> {
    return this.request('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Monitoring manual trigger
  async runMonitoringCycle(): Promise<{ message: string; report: any }> {
    return this.request('/monitor/run', { method: 'POST' });
  }

  // Air Quality Intelligence
  async getAirQuality(latitude?: number, longitude?: number): Promise<{ success: boolean; airQuality: AirQualityData }> {
    const query = (latitude !== undefined && longitude !== undefined)
      ? `?lat=${latitude}&lon=${longitude}`
      : '';
    return this.request<{ success: boolean; airQuality: AirQualityData }>(
      `/air-quality${query}`
    );
  }
}

export const api = new ApiClient();
