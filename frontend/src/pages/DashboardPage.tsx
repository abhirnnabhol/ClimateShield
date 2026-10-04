import React, { useState, useEffect } from 'react';
import {
  MapPin,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Zap,
  Info,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { RiskAssessment } from '../types';
import { useAuth } from '../context/AuthContext';
import { RiskScoreCard } from '../components/RiskScoreCard';
import { HazardRiskCard } from '../components/HazardRiskCard';
import { RiskTimeline } from '../components/RiskTimeline';
import { ExplainableRisk } from '../components/ExplainableRisk';
import { ClimateWarningCard } from '../components/ClimateWarningCard';
import { EarlySignalsWidget } from '../components/EarlySignalsWidget';
import { ImpactChainWidget } from '../components/ImpactChainWidget';
import { ScenarioSimulator } from '../components/ScenarioSimulator';
import { DataSourceCard } from '../components/DataSourceCard';
import { MethodologyModal } from '../components/MethodologyModal';
import { ClimateCharacterScene } from '../components/ClimateCharacterScene';

interface DashboardPageProps {
  onOpenLocationModal: () => void;
  onNavigateToAlerts?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenLocationModal,
  onNavigateToAlerts
}) => {
  const { user, primaryLocation, isDemoMode } = useAuth();
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState<boolean>(false);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [demoTriggerLoading, setDemoTriggerLoading] = useState(false);
  const [demoTriggerMsg, setDemoTriggerMsg] = useState<string | null>(null);

  const isFetchingRef = React.useRef<boolean>(false);

  const fetchDashboardData = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setError(null);
    setRefreshing(true);
    try {
      const res = await api.getDashboard();
      if (res.needsLocationSetup) {
        setNeedsSetup(true);
        setAssessment(null);
      } else if (res.assessment) {
        setNeedsSetup(false);
        setAssessment(res.assessment);
      }
    } catch (err: any) {
      console.error('Fetch dashboard failed:', err);
      setError(err.message || 'Could not load climate dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [primaryLocation?.id, primaryLocation?.latitude, primaryLocation?.longitude, isDemoMode]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleTriggerDemoScenario = async (hazardType: 'heat' | 'flood' | 'drought' = 'flood') => {
    setDemoTriggerLoading(true);
    setDemoTriggerMsg(null);
    try {
      const res = await api.triggerDemoAlert(hazardType);
      setDemoTriggerMsg(`Demonstration ${hazardType.toUpperCase()} alert triggered! Navigate to the Alerts tab to inspect details.`);
      if (onNavigateToAlerts) {
        setTimeout(() => {
          onNavigateToAlerts();
        }, 1200);
      }
    } catch (err: any) {
      setDemoTriggerMsg('Failed to trigger demo alert');
    } finally {
      setDemoTriggerLoading(false);
    }
  };

  if (loading || !assessment) {
    if (needsSetup) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-8 sm:p-12 rounded-3xl bg-white border border-[#c5e6db] text-center space-y-6 shadow-xl shadow-[#092c24]/5">
          <div className="w-16 h-16 rounded-2xl bg-[#eef8f4] border border-[#c5e6db] text-[#156550] flex items-center justify-center mx-auto shadow-xs">
            <MapPin className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#092c24]">Configure Monitored Primary Zone</h2>
            <p className="text-xs text-[#375249] max-w-md mx-auto mt-2 leading-relaxed">
              ClimateShield needs your primary location coordinates to begin continuous environmental telemetry monitoring and automated risk evaluation.
            </p>
          </div>
          <button
            onClick={onOpenLocationModal}
            className="px-7 py-3 rounded-full bg-[#092c24] hover:bg-[#051c16] text-white font-bold text-xs shadow-lg shadow-[#092c24]/20 transition-all hover:scale-105"
          >
            Configure Monitored Location
          </button>
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-red-50 border border-red-200 text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-9 h-9 text-red-600 mx-auto" />
          <h3 className="text-base font-bold text-red-900">Telemetry Communication Error</h3>
          <p className="text-xs text-red-700">
            Live data temporarily unavailable. {error}
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs"
          >
            Retry Connection
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-9 h-9 text-[#156550] animate-spin" />
        <p className="text-xs font-bold text-[#1e3a34]">
          Synchronizing multi-satellite telemetry & environmental sensor vectors...
        </p>
      </div>
    );
  }

  // Calculate dynamic 10-second summary values
  const locationTitle = primaryLocation?.city || primaryLocation?.name || assessment.locationName || 'Monitored Region';
  const isTrendIncreasing = assessment.timeline.length > 1 && assessment.timeline[1].overallScore > assessment.overallScore;

  // Compute dominant hazard vector
  const dominantHazard: 'heat' | 'drought' | 'flood' = (() => {
    const h = assessment.heat.score;
    const d = assessment.drought.score;
    const f = assessment.flood.score;
    if (f >= h && f >= d) return 'flood';
    if (d >= h && d >= f) return 'drought';
    return 'heat';
  })();

  return (
    <div className="space-y-8 pb-16">
      {/* 10-Second Hackathon Judge Overview Bar (Section 9) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#f7fcf9] to-[#eef8f4] border border-[#c5e6db] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#156550]">
            <MapPin className="w-3.5 h-3.5" />
            <span>{locationTitle}</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#375249]">Climate Risk:</span>
            <span className="text-3xl font-black text-[#092c24] font-mono">
              {assessment.overallScore} <span className="text-base font-normal text-[#479b89]">/ 100</span>
            </span>
            <span
              className={`text-xs font-black px-3 py-1 rounded-full uppercase border ${
                assessment.overallLevel === 'EXTREME'
                  ? 'bg-red-100 text-red-800 border-red-300'
                  : assessment.overallLevel === 'HIGH'
                  ? 'bg-orange-100 text-orange-800 border-orange-300'
                  : assessment.overallLevel === 'MODERATE'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              {assessment.overallLevel}
            </span>
            <span className="flex items-center gap-1 text-xs text-[#156550] font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isTrendIncreasing ? 'Risk is currently increasing' : 'Conditions are nominal & buffered'}</span>
            </span>
          </div>
        </div>

        {/* Quick Hazard Pills + Demo Scenario Trigger */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-[#c5e6db] text-xs font-mono font-bold shadow-2xs">
            <span className="text-slate-700">🔥 Heat: <strong className="text-[#092c24]">{assessment.heat.score}</strong></span>
            <span className="text-[#c5e6db]">|</span>
            <span className="text-slate-700">💧 Drought: <strong className="text-[#092c24]">{assessment.drought.score}</strong></span>
            <span className="text-[#c5e6db]">|</span>
            <span className="text-slate-700">🌧️ Flood: <strong className="text-[#092c24]">{assessment.flood.score}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTriggerDemoScenario('flood')}
              disabled={demoTriggerLoading}
              title="Trigger a simulated high-risk flood scenario to demonstrate alert bulletins"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#092c24] hover:bg-[#051c16] text-[#a7f3d0] hover:text-white text-xs font-bold transition-all shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{demoTriggerLoading ? 'Triggering...' : '⚡ Trigger Demo Alert'}</span>
            </button>

            <button
              onClick={() => setMethodologyOpen(true)}
              className="p-2 rounded-full bg-white hover:bg-[#eef8f4] border border-[#c5e6db] text-[#156550] transition-colors"
              title="View Data Methodology & Architecture"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Demo Trigger Notification Banner */}
      {demoTriggerMsg && (
        <div className="p-4 rounded-2xl bg-[#d7f1e6] border border-[#a8dec9] text-xs text-[#092c24] font-bold flex items-center justify-between animate-in fade-in">
          <span>{demoTriggerMsg}</span>
          {onNavigateToAlerts && (
            <button
              onClick={onNavigateToAlerts}
              className="underline hover:text-[#051c16]"
            >
              Go to Alerts →
            </button>
          )}
        </div>
      )}

      {/* Active Warning Banner if significant hazard detected */}
      {assessment.activeWarning && (
        <ClimateWarningCard warning={assessment.activeWarning} />
      )}


      {/* Main Overall Risk Card */}
      <RiskScoreCard
        assessment={assessment}
        location={primaryLocation}
        onRefresh={handleRefresh}
        isLoading={loading || refreshing}
      />

      {/* Dynamic Environmental Climate Scene (Good, High, Extreme environment states) */}
      <ClimateCharacterScene
        score={assessment.overallScore}
        level={assessment.overallLevel as any}
        dominantHazard={dominantHazard}
        heatScore={assessment.heat.score}
        droughtScore={assessment.drought.score}
        floodScore={assessment.flood.score}
        locationName={locationTitle}
      />

      {/* 3 Core Hazard Risk Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-[#092c24]">Core Environmental Risk Vectors</h3>
          <span className="text-xs text-[#479b89] font-medium">Live multi-sensor telemetry indices</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <HazardRiskCard
            hazard="heat"
            title="Heat & Thermal Stress"
            data={assessment.heat}
          />
          <HazardRiskCard
            hazard="drought"
            title="Drought & Soil Deficit"
            data={assessment.drought}
          />
          <HazardRiskCard
            hazard="flood"
            title="Flood & Inundation"
            data={assessment.flood}
          />
        </div>
      </div>

      {/* 5-Stage Early Signals Widget */}
      <EarlySignalsWidget
        signals={assessment.earlySignals}
        overallEarlySignalState={assessment.earlySignalState}
      />

      {/* Forward Risk Timeline */}
      <RiskTimeline timeline={assessment.timeline} />

      {/* Explainable Factor Breakdown ("Why?") */}
      <ExplainableRisk assessment={assessment} />

      {/* Potential Impact Chain */}
      <ImpactChainWidget chains={assessment.impactChains} />

      {/* Transparent Data Sources Card (Section 3) */}
      <DataSourceCard
        isDemo={assessment.isDemo || isDemoMode}
        lastUpdated={assessment.timestamp}
        onRefresh={handleRefresh}
        isLoading={refreshing}
        onOpenMethodology={() => setMethodologyOpen(true)}
      />

      {/* Role-Personalized Guidance Card */}
      <div className="rounded-3xl bg-white border border-[#c5e6db] p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-5 border-b border-[#e1f2ec] pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#156550]">
              Personalized Guidance
            </span>
            <span className="text-xs bg-[#d7f1e6] text-[#092c24] border border-[#a8dec9] px-3 py-0.5 rounded-full font-bold">
              Profile: {user?.userType || 'Resident'}
            </span>
          </div>
          <span className="text-xs text-[#479b89] font-medium">Targeted Advisory</span>
        </div>

        <div className="space-y-3.5">
          {assessment.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#f7fcf9] border border-[#c5e6db] flex items-start gap-3.5"
            >
              <div
                className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
                  rec.priority === 'urgent'
                    ? 'bg-red-100 text-red-700'
                    : rec.priority === 'warning'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-[#d7f1e6] text-[#092c24]'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#092c24]">{rec.action}</h4>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                      rec.priority === 'urgent'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : rec.priority === 'warning'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-[#d7f1e6] text-[#092c24] border-[#a8dec9]'
                    }`}
                  >
                    {rec.priority}
                  </span>
                </div>
                <p className="text-xs text-[#375249] leading-relaxed">{rec.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What-If Climate Scenario Simulator */}
      <ScenarioSimulator
        latitude={assessment.latitude}
        longitude={assessment.longitude}
      />

      {/* Data & Methodology Modal */}
      <MethodologyModal
        isOpen={methodologyOpen}
        onClose={() => setMethodologyOpen(false)}
      />
    </div>
  );
};
