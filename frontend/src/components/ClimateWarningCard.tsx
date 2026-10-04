import React from 'react';
import { AlertTriangle, MapPin, Calendar, HelpCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ClimateWarning } from '../types';
import { RiskBadge } from './RiskBadge';

interface ClimateWarningCardProps {
  warning: ClimateWarning;
}

export const ClimateWarningCard: React.FC<ClimateWarningCardProps> = ({ warning }) => {
  const getSeverityStyle = () => {
    switch (warning.severity) {
      case 'EXTREME':
        return 'from-red-50 via-rose-50 to-orange-50 border-red-300 shadow-red-500/5';
      case 'HIGH':
        return 'from-orange-50 via-amber-50 to-yellow-50 border-orange-300 shadow-orange-500/5';
      default:
        return 'from-yellow-50 via-amber-50 to-yellow-100 border-yellow-300 shadow-yellow-500/5';
    }
  };

  return (
    <div
      className={`rounded-3xl bg-gradient-to-r ${getSeverityStyle()} border-2 p-6 sm:p-8 shadow-xl relative overflow-hidden`}
    >
      {/* Alert Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-red-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shadow-xs">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-black tracking-wider text-red-700">
                Early Warning Bulletin
              </span>
              <RiskBadge level={warning.severity} size="sm" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {warning.title}
            </h2>
          </div>
        </div>
      </div>

      {/* Structured 5-W Grid: WHAT, WHERE, WHEN, WHY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>What</span>
          </div>
          <p className="text-xs font-bold text-slate-800 leading-snug">{warning.what}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Where</span>
          </div>
          <p className="text-xs font-bold text-slate-800 leading-snug">{warning.where}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-cyan-600" />
            <span>When</span>
          </div>
          <p className="text-xs font-bold text-slate-800 leading-snug">{warning.when}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500">
            <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
            <span>Why</span>
          </div>
          <p className="text-xs font-medium text-slate-700 leading-snug">{warning.why}</p>
        </div>
      </div>

      {/* What To Do (Actionable Guidance) */}
      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-start gap-3.5 mb-4 shadow-2xs">
        <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700 mt-0.5 flex-shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 mb-1">
            Recommended Preparedness Action
          </h4>
          <p className="text-xs font-semibold text-emerald-800 leading-relaxed">
            {warning.whatToDo}
          </p>
        </div>
      </div>

      {/* Official Guidance Distinction Notice */}
      <p className="text-xs text-slate-600 italic bg-white/90 px-4 py-2.5 rounded-xl border border-slate-200">
        {warning.isOfficialGuidanceDistinction}
      </p>
    </div>
  );
};
