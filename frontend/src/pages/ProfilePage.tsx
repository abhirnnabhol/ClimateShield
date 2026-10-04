import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, MapPin, Shield, Check, Loader2, Play, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserType, RiskLevel, NotificationSettings } from '../types';

interface ProfilePageProps {
  onOpenLocationModal: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onOpenLocationModal }) => {
  const { user, primaryLocation, refreshUser } = useAuth();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [userType, setUserType] = useState<UserType>(user?.userType || 'Resident');
  const [cropType, setCropType] = useState(user?.cropType || '');
  const [farmArea, setFarmArea] = useState(user?.farmArea || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // Notification Settings
  const [settings, setSettings] = useState<NotificationSettings>({
    heatAlerts: true,
    droughtAlerts: true,
    floodAlerts: true,
    minimumSeverity: 'MODERATE',
    channels: {
      inApp: true,
      email: true,
      sms: false
    }
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Manual Monitor Trigger
  const [runningMonitor, setRunningMonitor] = useState(false);
  const [monitorReport, setMonitorReport] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setUserType(user.userType);
      setCropType(user.cropType || '');
      setFarmArea(user.farmArea || '');
    }
    loadNotificationSettings();
  }, [user]);

  const loadNotificationSettings = async () => {
    try {
      const res = await api.getNotificationSettings();
      if (res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      await api.updateProfile({
        name,
        userType,
        cropType: userType === 'Farmer' ? cropType : undefined,
        farmArea: userType === 'Farmer' ? farmArea : undefined
      });
      await refreshUser();
      setProfileMessage('Profile information saved successfully.');
    } catch (err: any) {
      setProfileMessage(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsMessage(null);
    try {
      await api.updateNotificationSettings(settings);
      setSettingsMessage('Notification preferences updated.');
    } catch (err: any) {
      setSettingsMessage(err.message || 'Failed to save notification settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setPasswordMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Password update failed');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRunMonitorCycle = async () => {
    setRunningMonitor(true);
    try {
      const res = await api.runMonitoringCycle();
      setMonitorReport(res.report);
    } catch (err: any) {
      alert(`Monitoring cycle failed: ${err.message}`);
    } finally {
      setRunningMonitor(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-[#c5e6db] pb-5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#156550]">
          <User className="w-3.5 h-3.5" />
          <span>User Configuration</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-[#092c24] mt-1">
          Profile & Environmental Alerts Setup
        </h1>
        <p className="text-xs text-[#375249] mt-0.5">
          Manage your account attributes, monitored primary zone, notification dispatch channels, and automated telemetry scans.
        </p>
      </div>

      {/* Primary Monitored Location Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#c5e6db] flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#479b89]">
            <MapPin className="w-3.5 h-3.5 text-[#156550]" />
            <span>Active Monitored Zone</span>
          </div>
          <h3 className="text-lg font-bold text-[#092c24]">
            {primaryLocation?.name || 'No Primary Location Configured'}
          </h3>
          {primaryLocation && (
            <div className="text-xs text-[#375249] font-mono">
              Coordinates: {primaryLocation.latitude.toFixed(4)}°, {primaryLocation.longitude.toFixed(4)}°
            </div>
          )}
        </div>
        <button
          onClick={onOpenLocationModal}
          className="px-4 py-2 rounded-full bg-[#eef8f4] hover:bg-[#e1f2ec] text-[#092c24] font-bold text-xs border border-[#c5e6db] transition-colors"
        >
          Change Monitored Location
        </button>
      </div>

      {/* User Information Form */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-white border border-[#c5e6db] space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e1f2ec] pb-3">
          <h3 className="text-base font-bold text-[#092c24]">Personal Profile</h3>
          {profileMessage && (
            <span className="text-xs text-[#156550] font-bold">{profileMessage}</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#1e3a34] block mb-1 font-semibold">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f7fcf9] border border-[#c5e6db] text-xs text-slate-800 focus:outline-none focus:border-[#092c24] focus:ring-1 focus:ring-[#092c24] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-[#1e3a34] block mb-1 font-semibold">Registered Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#eef8f4] border border-[#c5e6db] text-xs text-[#479b89] cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-[#1e3a34] block mb-1.5 font-semibold">User Role & Archetype</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(['Resident', 'Farmer', 'Outdoor Worker', 'Other'] as UserType[]).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setUserType(t)}
                className={`py-2 px-3 rounded-full border text-xs font-bold transition-all ${
                  userType === t
                    ? 'bg-[#092c24] border-[#092c24] text-white shadow-xs'
                    : 'bg-[#f7fcf9] border-[#c5e6db] text-[#156550] hover:bg-[#e1f2ec]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {userType === 'Farmer' && (
          <div className="p-4 rounded-2xl bg-[#eef8f4] border border-[#c5e6db] space-y-3">
            <span className="text-xs font-bold text-[#156550] uppercase tracking-wider">
              🌾 Agricultural Sector Parameters
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#1e3a34] block mb-1 font-semibold">Primary Crop Cultivated</label>
                <input
                  type="text"
                  placeholder="e.g. Wheat, Soybean"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#c5e6db] text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs text-[#1e3a34] block mb-1 font-semibold">Cultivated Farm Area</label>
                <input
                  type="text"
                  placeholder="e.g. 45 Hectares"
                  value={farmArea}
                  onChange={(e) => setFarmArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#c5e6db] text-xs text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingProfile}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#092c24] hover:bg-[#051c16] text-white text-xs font-bold shadow-md shadow-[#092c24]/20 disabled:opacity-50 transition-colors"
          >
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin text-[#a7f3d0]" /> : <Check className="w-4 h-4 text-[#a7f3d0]" />}
            <span>Save Profile</span>
          </button>
        </div>
      </form>

      {/* Notification Preferences */}
      <div className="p-6 rounded-3xl bg-white border border-[#c5e6db] space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e1f2ec] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#092c24]">Alert Trigger Preferences</h3>
            <p className="text-xs text-[#375249]">Configure hazard thresholds and automated dispatch channels.</p>
          </div>
          {settingsMessage && (
            <span className="text-xs text-[#156550] font-bold">{settingsMessage}</span>
          )}
        </div>

        {/* Hazard Toggles */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-[#1e3a34] uppercase tracking-wider">
            Hazard Alert Subscriptions
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="p-3.5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] flex items-center justify-between cursor-pointer hover:border-[#156550] transition-colors">
              <span className="text-xs font-bold text-[#092c24]">🔥 Heat Stress Alerts</span>
              <input
                type="checkbox"
                checked={settings.heatAlerts}
                onChange={(e) => setSettings({ ...settings, heatAlerts: e.target.checked })}
                className="w-4 h-4 accent-[#092c24] rounded"
              />
            </label>

            <label className="p-3.5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] flex items-center justify-between cursor-pointer hover:border-[#156550] transition-colors">
              <span className="text-xs font-bold text-[#092c24]">💧 Drought Deficit Alerts</span>
              <input
                type="checkbox"
                checked={settings.droughtAlerts}
                onChange={(e) => setSettings({ ...settings, droughtAlerts: e.target.checked })}
                className="w-4 h-4 accent-[#092c24] rounded"
              />
            </label>

            <label className="p-3.5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] flex items-center justify-between cursor-pointer hover:border-[#156550] transition-colors">
              <span className="text-xs font-bold text-[#092c24]">🌧️ Flood Inundation Alerts</span>
              <input
                type="checkbox"
                checked={settings.floodAlerts}
                onChange={(e) => setSettings({ ...settings, floodAlerts: e.target.checked })}
                className="w-4 h-4 accent-[#092c24] rounded"
              />
            </label>
          </div>
        </div>

        {/* Severity Minimum Threshold */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#1e3a34] uppercase tracking-wider">
            Minimum Trigger Severity
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(['MODERATE', 'HIGH', 'EXTREME'] as RiskLevel[]).map((lvl) => (
              <button
                type="button"
                key={lvl}
                onClick={() => setSettings({ ...settings, minimumSeverity: lvl })}
                className={`py-2 px-3 rounded-full border text-xs font-bold transition-all ${
                  settings.minimumSeverity === lvl
                    ? 'bg-[#092c24] border-[#092c24] text-[#a7f3d0] shadow-xs'
                    : 'bg-[#f7fcf9] border-[#c5e6db] text-[#156550] hover:bg-[#e1f2ec]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Channels */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#1e3a34] uppercase tracking-wider">
            Dispatch Channels
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="p-3.5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] flex items-center justify-between cursor-pointer">
              <span className="text-xs text-[#092c24] font-semibold">In-App Dashboard</span>
              <input
                type="checkbox"
                checked={settings.channels?.inApp !== false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    channels: { ...settings.channels, inApp: e.target.checked }
                  })
                }
                className="w-4 h-4 accent-[#092c24] rounded"
              />
            </label>

            <label className="p-3.5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] flex items-center justify-between cursor-pointer">
              <span className="text-xs text-[#092c24] font-semibold">Email Notifications</span>
              <input
                type="checkbox"
                checked={settings.channels?.email || false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    channels: { ...settings.channels, email: e.target.checked }
                  })
                }
                className="w-4 h-4 accent-[#092c24] rounded"
              />
            </label>

            <label className="p-3.5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] flex items-center justify-between cursor-pointer">
              <span className="text-xs text-[#092c24] font-semibold">SMS Alerts (Simulated)</span>
              <input
                type="checkbox"
                checked={settings.channels?.sms || false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    channels: { ...settings.channels, sms: e.target.checked }
                  })
                }
                className="w-4 h-4 accent-[#092c24] rounded"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#092c24] hover:bg-[#051c16] text-white text-xs font-bold shadow-md shadow-[#092c24]/20 disabled:opacity-50 transition-colors"
          >
            {savingSettings ? <Loader2 className="w-4 h-4 animate-spin text-[#a7f3d0]" /> : <Check className="w-4 h-4 text-[#a7f3d0]" />}
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      {/* Manual Monitoring Cycle Trigger (Section 22) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#eef8f4] to-[#e1f2ec] border border-[#c5e6db] space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#156550]">
              <Play className="w-3.5 h-3.5 fill-[#156550]" />
              <span>Background Job Controller</span>
            </div>
            <h3 className="text-base font-bold text-[#092c24] mt-0.5">
              Execute Automated Environmental Monitoring Scan
            </h3>
            <p className="text-xs text-[#375249] max-w-xl">
              Manually trigger <code className="bg-white/90 px-1.5 py-0.5 rounded text-[#092c24] font-mono text-[11px] border border-[#c5e6db]">POST /api/monitor/run</code> to scan all registered locations, re-evaluate satellite and weather indices, and generate warnings.
            </p>
          </div>

          <button
            onClick={handleRunMonitorCycle}
            disabled={runningMonitor}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#092c24] hover:bg-[#051c16] text-[#a7f3d0] font-black text-xs transition-all shadow-md shadow-[#092c24]/20 disabled:opacity-50"
          >
            {runningMonitor ? <Loader2 className="w-4 h-4 animate-spin text-[#a7f3d0]" /> : <Play className="w-4 h-4 fill-[#a7f3d0]" />}
            <span>{runningMonitor ? 'Executing Cycle...' : 'Run Monitoring Scan'}</span>
          </button>
        </div>

        {monitorReport && (
          <div className="p-4 rounded-2xl bg-white border border-[#c5e6db] space-y-2 text-xs font-mono shadow-sm">
            <div className="text-[#156550] font-bold">
              ✓ Monitoring Report Generated at {new Date(monitorReport.timestamp).toLocaleTimeString()}
            </div>
            <div className="grid grid-cols-3 gap-2 text-[#092c24]">
              <div>Locations Scanned: <strong>{monitorReport.totalLocationsProcessed}</strong></div>
              <div>Assessments Saved: <strong>{monitorReport.newAssessmentsSaved}</strong></div>
              <div>Alerts Generated: <strong>{monitorReport.alertsCreated}</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Security: Change Password */}
      <form onSubmit={handleChangePassword} className="p-6 rounded-3xl bg-white border border-[#c5e6db] space-y-4 shadow-sm">
        <div className="border-b border-[#e1f2ec] pb-3">
          <h3 className="text-base font-bold text-[#092c24]">Security & Password</h3>
        </div>

        {passwordError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
            {passwordError}
          </div>
        )}

        {passwordMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#156550] font-medium">
            {passwordMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-[#1e3a34] block mb-1 font-semibold">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#f7fcf9] border border-[#c5e6db] text-xs text-slate-800 focus:outline-none focus:border-[#092c24]"
            />
          </div>

          <div>
            <label className="text-xs text-[#1e3a34] block mb-1 font-semibold">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#f7fcf9] border border-[#c5e6db] text-xs text-slate-800 focus:outline-none focus:border-[#092c24]"
            />
          </div>

          <div>
            <label className="text-xs text-[#1e3a34] block mb-1 font-semibold">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#f7fcf9] border border-[#c5e6db] text-xs text-slate-800 focus:outline-none focus:border-[#092c24]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingPassword}
            className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#092c24] hover:bg-[#051c16] text-white text-xs font-bold disabled:opacity-50 transition-colors"
          >
            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin text-[#a7f3d0]" /> : <Lock className="w-3.5 h-3.5 text-[#a7f3d0]" />}
            <span>Update Password</span>
          </button>
        </div>
      </form>
    </div>
  );
};
