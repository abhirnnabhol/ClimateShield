import React from 'react';
import { X, AlertTriangle, MapPin, Calendar, CheckCircle, Check, Leaf } from 'lucide-react';
import { Alert } from '../types';
import { RiskBadge } from './RiskBadge';

interface AlertDetailModalProps {
  alert: Alert | null;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  onClose,
  onMarkAsRead
}) => {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#092c24]/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#c5e6db] rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e1f2ec] bg-[#f4fbf7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#156550]">
                Official Alert Bulletin
              </span>
              <h2 className="text-base font-bold text-[#092c24]">{alert.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#479b89] hover:text-[#092c24] hover:bg-[#eef8f4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2">
            <RiskBadge level={alert.severity} size="md" />
            <span className="text-xs bg-[#eef8f4] text-[#092c24] border border-[#c5e6db] px-3 py-1 rounded-full font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#156550]" />
              <span>{alert.locationName}</span>
            </span>
            <span className="text-xs bg-[#eef8f4] text-[#092c24] border border-[#c5e6db] px-3 py-1 rounded-full font-bold flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#156550]" />
              <span>{alert.expectedTime}</span>
            </span>
          </div>

          {/* Explanation message */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1e3a34] mb-1.5">
              Risk Explanation & Diagnostic
            </h3>
            <p className="text-sm text-[#1e3a34] leading-relaxed bg-[#f7fcf9] p-4 rounded-2xl border border-[#c5e6db]">
              {alert.message}
            </p>
          </div>

          {/* Contributing Factors */}
          {alert.factors && alert.factors.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1e3a34] mb-2">
                Key Contributing Environmental Factors
              </h3>
              <div className="space-y-1.5">
                {alert.factors.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#f7fcf9] border border-[#c5e6db] text-xs text-[#092c24] flex items-center gap-2 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#156550]" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prescribed Action Steps */}
          {alert.recommendations && alert.recommendations.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1e3a34] mb-2">
                Recommended Safeguards & Actions
              </h3>
              <div className="space-y-2">
                {alert.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#eef8f4] border border-[#c5e6db] flex items-start gap-2.5 text-xs"
                  >
                    <CheckCircle className="w-4 h-4 text-[#156550] mt-0.5 flex-shrink-0" />
                    <span className="text-[#092c24] font-medium leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#e1f2ec] bg-[#f4fbf7]">
          <span className="text-[11px] text-[#479b89] font-mono">
            Recorded at {new Date(alert.createdAt).toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            {!alert.isRead && (
              <button
                onClick={() => {
                  onMarkAsRead(alert.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#c5e6db] text-[#156550] hover:text-[#092c24] text-xs font-bold transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark as Reviewed</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-[#092c24] hover:bg-[#051c16] text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
