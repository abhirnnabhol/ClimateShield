import React, { useState, useEffect, useRef } from 'react';
import { Activity, Clock, MapPin, Database } from 'lucide-react';
import { RiskAssessment, Location } from '../types';
import { RiskBadge } from './RiskBadge';

interface RiskScoreCardProps {
  assessment: RiskAssessment;
  location?: Location | null;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  assessment,
  location,
  onRefresh,
  isLoading = false
}) => {
  const { overallScore, overallLevel, dataSource, isDemo, timestamp } = assessment;

  // Resolve unique location identifier to reliably detect location changes
  const locationId = location?.id || assessment.locationId || assessment.locationName || `${assessment.latitude?.toFixed(4)},${assessment.longitude?.toFixed(4)}`;

  // Actual dynamic calculated score (clamped between 0 and 100)
  const targetScore = Math.max(0, Math.min(100, Math.round(overallScore ?? 0)));
  const [animatedScore, setAnimatedScore] = useState<number>(0);

  // Unique session key for this specific assessment
  const currentKey = `${locationId}__${targetScore}__${timestamp}`;

  // Robust animation state machine ref to guarantee EXACTLY ONE animation per assessment
  const animTrackerRef = useRef<{
    assessmentKey: string;
    targetScore: number;
    startTime: number | null;
    duration: number;
    isCompleted: boolean;
    rafId: number | null;
    hasLogged: boolean;
  }>({
    assessmentKey: '',
    targetScore: -1,
    startTime: null,
    duration: 1600,
    isCompleted: false,
    rafId: null,
    hasLogged: false
  });

  useEffect(() => {
    // 1. Guard: do not start animation while still calculating/loading
    if (isLoading) {
      return;
    }

    const tracker = animTrackerRef.current;

    // 2. Handle score of 0
    if (targetScore === 0) {
      if (tracker.assessmentKey !== currentKey) {
        if (tracker.rafId) {
          cancelAnimationFrame(tracker.rafId);
          tracker.rafId = null;
        }
        tracker.assessmentKey = currentKey;
        tracker.targetScore = 0;
        tracker.startTime = performance.now();
        tracker.isCompleted = true;
        setAnimatedScore(0);
        if (!tracker.hasLogged) {
          tracker.hasLogged = true;
          console.log('[ClimateShield] Animation started for final score: 0');
        }
      }
      return;
    }

    // 3. If animation for THIS EXACT assessment is ALREADY completed, maintain score and exit
    if (tracker.assessmentKey === currentKey && tracker.isCompleted) {
      if (animatedScore !== targetScore) {
        setAnimatedScore(targetScore);
      }
      return;
    }

    // 4. If animation for THIS EXACT assessment was ALREADY started (e.g. StrictMode remount or parent re-render):
    // DO NOT reset to 0! DO NOT log again! Resume the RAF loop seamlessly from the original startTime.
    if (tracker.assessmentKey === currentKey && tracker.startTime !== null) {
      if (!tracker.rafId && !tracker.isCompleted) {
        const resumeLoop = (now: number) => {
          if (animTrackerRef.current.assessmentKey !== currentKey) return;
          const start = animTrackerRef.current.startTime ?? now;
          const elapsed = now - start;
          const progress = Math.min(elapsed / animTrackerRef.current.duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const currentVal = Math.min(targetScore, Math.round(eased * targetScore));

          setAnimatedScore(currentVal);

          if (progress < 1) {
            animTrackerRef.current.rafId = requestAnimationFrame(resumeLoop);
          } else {
            animTrackerRef.current.isCompleted = true;
            animTrackerRef.current.rafId = null;
            setAnimatedScore(targetScore);
          }
        };
        tracker.rafId = requestAnimationFrame(resumeLoop);
      }
      return;
    }

    // 5. This is a NEW assessment / NEW final score!
    // Cancel any previous RAF
    if (tracker.rafId) {
      cancelAnimationFrame(tracker.rafId);
      tracker.rafId = null;
    }

    // Initialize tracker for this final score
    tracker.assessmentKey = currentKey;
    tracker.targetScore = targetScore;
    tracker.startTime = performance.now();
    tracker.duration = 1600;
    tracker.isCompleted = false;
    tracker.hasLogged = true;

    // Reset animated score to 0 and begin the single continuous upward animation
    setAnimatedScore(0);
    console.log(`[ClimateShield] Animation started for final score: ${targetScore}`);

    const animateLoop = (now: number) => {
      if (animTrackerRef.current.assessmentKey !== currentKey) return;
      const start = animTrackerRef.current.startTime ?? now;
      const elapsed = now - start;
      const progress = Math.min(elapsed / animTrackerRef.current.duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.min(targetScore, Math.round(eased * targetScore));

      setAnimatedScore(currentVal);

      if (progress < 1) {
        animTrackerRef.current.rafId = requestAnimationFrame(animateLoop);
      } else {
        animTrackerRef.current.isCompleted = true;
        animTrackerRef.current.rafId = null;
        setAnimatedScore(targetScore);
      }
    };

    tracker.rafId = requestAnimationFrame(animateLoop);

    return () => {
      // On unmount/cleanup, cancel RAF handle to prevent leaks, but DO NOT erase tracker.assessmentKey or tracker.startTime
      if (animTrackerRef.current.rafId) {
        cancelAnimationFrame(animTrackerRef.current.rafId);
        animTrackerRef.current.rafId = null;
      }
    };
  }, [currentKey, targetScore, isLoading]);

  const getMeterColor = (score: number) => {
    if (score >= 75) return '#ef4444'; // Red
    if (score >= 50) return '#f97316'; // Orange
    if (score >= 25) return '#eab308'; // Amber/Yellow
    return '#10b981'; // Emerald
  };

  const getRiskExplanation = () => {
    if (overallScore >= 75) {
      return 'Severe climate stress detected across multiple environmental indicators. Immediate operational mitigations recommended.';
    }
    if (overallScore >= 50) {
      return 'Elevated climate anomalies observed. One or more environmental vectors have crossed the vigilance threshold.';
    }
    if (overallScore >= 25) {
      return 'Moderate environmental divergence. Nominal seasonal fluctuations with mild thermal or precipitation deviation.';
    }
    return 'Optimal stability. Key environmental vectors are well within standard regional safety baselines.';
  };

  // SVG Gauge calculations (synchronized with animatedScore)
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const formattedDate = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const getRelativeTime = (isoString: string) => {
    const diffMs = Math.max(0, Date.now() - new Date(isoString).getTime());
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Updated just now';
    if (diffMins === 1) return 'Updated 1 minute ago';
    if (diffMins < 60) return `Updated ${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `Updated ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white border border-[#c5e6db] p-6 sm:p-8 shadow-xl shadow-[#092c24]/5">
      {/* Background soft mint ambient flare */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-100/50 blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-teal-100/40 blur-3xl pointer-events-none -z-10" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e1f2ec] pb-5 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#156550]">
            <MapPin className="w-3.5 h-3.5" />
            <span>Monitored Region</span>
          </div>
          <h2 className="text-2xl font-black text-[#092c24] mt-1">
            {location?.city || location?.name || assessment.locationName || 'Monitored Region'}
          </h2>
          <div className="flex items-center gap-3 text-xs text-[#375249] mt-1 font-medium">
            <span>Lat: {assessment.latitude.toFixed(4)}°</span>
            <span>•</span>
            <span>Lon: {assessment.longitude.toFixed(4)}°</span>
            {location?.cropType && (
              <>
                <span>•</span>
                <span className="text-[#092c24] font-bold bg-[#d7f1e6] px-2 py-0.5 rounded-full border border-[#a8dec9]">
                  🌾 Crop: {location.cropType}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#eef8f4] border border-[#c5e6db] text-xs font-bold text-[#092c24]">
            <Activity className="w-3.5 h-3.5 text-[#156550] animate-pulse" />
            <span>Monitoring Active</span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-full bg-[#f4fbf7] hover:bg-[#e1f2ec] text-[#092c24] border border-[#c5e6db] transition-colors disabled:opacity-50"
              title="Refresh environmental sensors"
            >
              <Clock className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Main Score Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Circular Gauge */}
        <div className="md:col-span-4 flex items-center justify-center">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-[#e1f2ec]"
                strokeWidth="14"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke={getMeterColor(overallScore)}
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-black tracking-tight text-[#092c24] font-mono">
                {animatedScore}
              </span>
              <span className="text-xs text-[#479b89] font-bold uppercase tracking-wider mt-0.5">
                out of 100
              </span>
            </div>
          </div>
        </div>

        {/* Level & Diagnostic Breakdown */}
        <div className="md:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1e3a34]">
              Overall Climate Hazard Level:
            </span>
            <RiskBadge level={overallLevel} size="lg" />
          </div>

          <p className="text-sm text-[#2d4940] leading-relaxed font-normal">
            {getRiskExplanation()}
          </p>

          {/* Risk Level Tier Reference Matrix */}
          <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs font-bold">
            <div
              className={`p-2 rounded-xl border transition-colors ${
                overallLevel === 'LOW'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                  : 'bg-[#f7fcf9] border-[#c5e6db] text-[#479b89]'
              }`}
            >
              <div className="text-[11px] font-mono">0 - 24</div>
              <div className="mt-0.5 text-[10px]">LOW</div>
            </div>
            <div
              className={`p-2 rounded-xl border transition-colors ${
                overallLevel === 'MODERATE'
                  ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
                  : 'bg-[#f7fcf9] border-[#c5e6db] text-[#479b89]'
              }`}
            >
              <div className="text-[11px] font-mono">25 - 49</div>
              <div className="mt-0.5 text-[10px]">MODERATE</div>
            </div>
            <div
              className={`p-2 rounded-xl border transition-colors ${
                overallLevel === 'HIGH'
                  ? 'bg-orange-50 border-orange-300 text-orange-800 shadow-xs'
                  : 'bg-[#f7fcf9] border-[#c5e6db] text-[#479b89]'
              }`}
            >
              <div className="text-[11px] font-mono">50 - 74</div>
              <div className="mt-0.5 text-[10px]">HIGH</div>
            </div>
            <div
              className={`p-2 rounded-xl border transition-colors ${
                overallLevel === 'EXTREME'
                  ? 'bg-red-50 border-red-300 text-red-800 shadow-xs'
                  : 'bg-[#f7fcf9] border-[#c5e6db] text-[#479b89]'
              }`}
            >
              <div className="text-[11px] font-mono">75 - 100</div>
              <div className="mt-0.5 text-[10px]">EXTREME</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer telemetry attribution */}
      <div className="mt-6 pt-4 border-t border-[#e1f2ec] flex flex-wrap items-center justify-between text-xs text-[#479b89] gap-2">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-[#156550]" />
          <span>Telemetry Source:</span>
          <span className={`font-semibold ${isDemo ? 'text-amber-800' : 'text-[#092c24]'}`}>
            {dataSource}
          </span>
          {isDemo && (
            <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
              DEMO DATA
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#479b89]" />
          <span>{getRelativeTime(timestamp)} ({formattedDate})</span>
        </div>
      </div>
    </div>
  );
};
