import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, MapPin, Eye, CheckCheck, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { Alert } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { AlertDetailModal } from '../components/AlertDetailModal';

interface AlertsPageProps {
  onAlertsCountChange?: (count: number) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ onAlertsCountChange }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.getAlerts();
      setAlerts(res.alerts || []);
      const unread = (res.alerts || []).filter((a) => !a.isRead).length;
      if (onAlertsCountChange) onAlertsCountChange(unread);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markAlertAsRead(id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
      );
      const remainingUnread = alerts.filter((a) => a.id !== id && !a.isRead).length;
      if (onAlertsCountChange) onAlertsCountChange(remainingUnread);
    } catch (err) {
      console.error('Mark read failed:', err);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'unread') return !a.isRead;
    if (filter === 'read') return a.isRead;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#c5e6db] pb-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#156550]">
            <Bell className="w-3.5 h-3.5" />
            <span>Early Warning Bulletins</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-[#092c24] mt-1">
            Climate Early Warnings & Advisories
          </h1>
          <p className="text-xs text-[#375249] mt-0.5">
            Automated notifications generated when monitored locations cross environmental safety baselines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <button
            onClick={fetchAlerts}
            className="p-2 rounded-full bg-white border border-[#c5e6db] text-[#156550] hover:text-[#092c24] shadow-2xs"
            title="Refresh alerts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-[#eef8f4] p-1 rounded-full border border-[#c5e6db] text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
                filter === 'all' ? 'bg-[#092c24] text-white shadow-xs' : 'text-[#156550] hover:text-[#092c24]'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
                filter === 'unread' ? 'bg-[#092c24] text-white shadow-xs' : 'text-[#156550] hover:text-[#092c24]'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
                filter === 'read' ? 'bg-[#092c24] text-white shadow-xs' : 'text-[#156550] hover:text-[#092c24]'
              }`}
            >
              Read ({alerts.length - unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Hackathon Judge Simulation Control Strip (Requirement 16) */}
      <div className="p-4 rounded-2xl bg-[#eef8f4] border border-[#c5e6db] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#092c24] font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-[#156550] animate-ping" />
          <span>Hackathon Demo Scenarios:</span>
          <span className="text-[#375249] font-normal hidden sm:inline">
            Trigger a simulated high-risk event to review bulletin details & recommendations
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              const res = await api.triggerDemoAlert('flood');
              setAlerts((prev) => [res.alert, ...prev]);
              setSelectedAlert(res.alert);
              if (onAlertsCountChange) onAlertsCountChange(unreadCount + 1);
            }}
            className="px-3 py-1 rounded-full bg-white hover:bg-emerald-50 text-[#092c24] border border-[#c5e6db] font-bold text-[11px] transition-colors shadow-2xs"
          >
            🌊 Simulate Flood Alert
          </button>
          <button
            onClick={async () => {
              const res = await api.triggerDemoAlert('heat');
              setAlerts((prev) => [res.alert, ...prev]);
              setSelectedAlert(res.alert);
              if (onAlertsCountChange) onAlertsCountChange(unreadCount + 1);
            }}
            className="px-3 py-1 rounded-full bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[11px] transition-colors shadow-2xs"
          >
            🔥 Simulate Heat Alert
          </button>
          <button
            onClick={async () => {
              const res = await api.triggerDemoAlert('drought');
              setAlerts((prev) => [res.alert, ...prev]);
              setSelectedAlert(res.alert);
              if (onAlertsCountChange) onAlertsCountChange(unreadCount + 1);
            }}
            className="px-3 py-1 rounded-full bg-white hover:bg-orange-50 text-orange-900 border border-orange-200 font-bold text-[11px] transition-colors shadow-2xs"
          >
            💧 Simulate Drought Alert
          </button>
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="py-16 text-center text-[#479b89] text-xs flex items-center justify-center gap-2 font-bold">
          <RefreshCw className="w-4 h-4 animate-spin text-[#156550]" />
          <span>Retrieving registered alert logs...</span>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#c5e6db] space-y-3 shadow-xs">
          <CheckCircle className="w-12 h-12 text-[#156550] mx-auto" />
          <h3 className="text-base font-bold text-[#092c24]">No Active Alerts Found</h3>
          <p className="text-xs text-[#375249] max-w-sm mx-auto">
            {filter === 'unread'
              ? 'All climate warning notifications have been reviewed.'
              : 'No environmental threshold breaches detected for your active monitored locations.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alert.isRead
                  ? 'bg-[#f7fcf9]/80 border-[#c5e6db] opacity-80'
                  : 'bg-white border-[#c5e6db] shadow-md shadow-[#092c24]/5 ring-1 ring-[#092c24]/10'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <RiskBadge level={alert.severity} size="sm" />
                  {!alert.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  )}
                  <span className="text-xs font-bold text-[#1e3a34] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#156550]" />
                    <span>{alert.locationName}</span>
                  </span>
                  <span className="text-xs text-[#479b89] flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#092c24] leading-tight">
                    {alert.title}
                  </h3>
                  <p className="text-xs text-[#375249] mt-1 line-clamp-2 leading-relaxed font-normal">
                    {alert.message}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#479b89] pt-1">
                  <span>Expected: <strong className="text-[#092c24]">{alert.expectedTime}</strong></span>
                  {alert.recommendations && alert.recommendations.length > 0 && (
                    <span>• {alert.recommendations.length} action steps</span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#e1f2ec]">
                {!alert.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="p-2.5 rounded-full bg-[#f4fbf7] hover:bg-[#e1f2ec] text-[#156550] hover:text-[#092c24] border border-[#c5e6db] transition-colors"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedAlert(alert)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#eef8f4] hover:bg-[#e1f2ec] text-[#092c24] font-bold text-xs border border-[#c5e6db] transition-colors shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-[#156550]" />
                  <span>View Bulletin</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Details View */}
      <AlertDetailModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
};
