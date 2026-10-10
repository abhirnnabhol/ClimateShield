import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExplorePage } from './pages/ExplorePage';
import { AlertsPage } from './pages/AlertsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { AirQualityPage } from './pages/AirQualityPage';
import { AuthModal } from './pages/AuthModal';
import { LocationModal } from './components/LocationModal';
import { MethodologyModal } from './components/MethodologyModal';
import { api } from './services/api';
import { Leaf, Shield, Radio, MapPin, Globe, Phone } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isDemoMode, toggleDemoMode } = useAuth();
  // Default to 'login' when opening the site, per user instruction:
  // "when i open a website first login page should visible then"
  const [currentTab, setCurrentTab] = useState<string>('login');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

  // Sync initial tab based on user session
  useEffect(() => {
    if (user) {
      if (currentTab === 'login') {
        setCurrentTab('dashboard');
      }
      fetchAlertsCount();
    } else {
      if (currentTab === 'dashboard' || currentTab === 'alerts' || currentTab === 'profile' || currentTab === 'history' || currentTab === 'air-quality') {
        setCurrentTab('login');
      }
    }
  }, [user]);

  const fetchAlertsCount = async () => {
    try {
      const res = await api.getAlerts();
      const count = (res.alerts || []).filter((a) => !a.isRead).length;
      setUnreadAlertsCount(count);
    } catch {
      // Ignored if unauthenticated
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen text-slate-800 flex flex-col font-sans selection:bg-[#092c24] selection:text-[#a7f3d0]">
      {/* Demo Mode Notice Banner if active */}
      {isDemoMode && (
        <div className="bg-[#d7f1e6] border-b border-[#a8dec9] px-4 py-2 text-center text-xs text-[#092c24] flex items-center justify-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[#156550] animate-pulse" />
          <span>
            <strong>DEMO MODE ACTIVE:</strong> Environmental services are using deterministic mock/simulation data repositories.
          </span>
          <button
            onClick={toggleDemoMode}
            className="underline font-bold text-[#092c24] hover:text-[#051c16] ml-2 text-[11px]"
          >
            Switch to Live Sensors
          </button>
        </div>
      )}

      {/* Main Global Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAuthModal={handleOpenAuth}
        openLocationModal={() => setLocationModalOpen(true)}
        openMethodology={() => setMethodologyOpen(true)}
        unreadAlertsCount={unreadAlertsCount}
      />

      {/* Main Page Body */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 ${currentTab === 'login' ? 'py-2 flex items-center justify-center' : 'pt-6'}`}>
        {/* When unauthenticated or tab is login, show the prominent Login / Register page */}
        {currentTab === 'login' && (
          <LoginPage />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            onOpenLocationModal={() => setLocationModalOpen(true)}
            onNavigateToAlerts={() => setCurrentTab('alerts')}
            onNavigateToAirQuality={() => setCurrentTab('air-quality')}
          />
        )}

        {currentTab === 'explore' && <ExplorePage />}

        {currentTab === 'air-quality' && (
          <AirQualityPage onOpenLocationModal={() => setLocationModalOpen(true)} />
        )}

        {currentTab === 'alerts' && (
          <AlertsPage onAlertsCountChange={(cnt) => setUnreadAlertsCount(cnt)} />
        )}

        {currentTab === 'history' && <HistoryPage />}

        {currentTab === 'profile' && (
          <ProfilePage onOpenLocationModal={() => setLocationModalOpen(true)} />
        )}
      </main>

      {/* Deep Forest Green Bottom Strip Footer (Styled exactly like reference design footer) */}
      <footer className="mt-16 bg-[#092c24] text-[#a7f3d0] border-t border-[#134e41] py-8 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#a7f3d0] text-[#092c24] flex items-center justify-center font-bold shadow-xs">
              <Leaf className="w-4 h-4 fill-[#092c24] stroke-[#a7f3d0]" />
            </div>
            <div>
              <div className="font-black text-white text-sm tracking-wide">
                CLIMATE<span className="text-[#a7f3d0]">SHIELD</span>
              </div>
              <p className="text-[10px] text-[#6ee7b7] opacity-80">
                World Environmental Protection & Hyperlocal Hazard Early Warning
              </p>
            </div>
          </div>

          {/* Contact / Metadata Strip matching the image format */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-[#d1fae5] text-[11px] font-medium">
            <div className="flex items-center gap-1.5 hover:text-white transition-colors">
              <span>Hyperlocal Monitored Grids</span>
              <MapPin className="w-3.5 h-3.5 text-[#a7f3d0]" />
            </div>
            <div className="flex items-center gap-1.5 hover:text-white transition-colors">
              <span>climateshield.earth</span>
              <Globe className="w-3.5 h-3.5 text-[#a7f3d0]" />
            </div>
            <div className="flex items-center gap-1.5 hover:text-white transition-colors">
              <span>ISO 14001 Climate Early Warning</span>
              <Phone className="w-3.5 h-3.5 text-[#a7f3d0]" />
            </div>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setCurrentTab('dashboard');
          fetchAlertsCount();
        }}
      />

      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />

      <MethodologyModal
        isOpen={methodologyOpen}
        onClose={() => setMethodologyOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
