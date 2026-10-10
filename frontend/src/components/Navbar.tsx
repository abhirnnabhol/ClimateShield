import React, { useState } from 'react';
import { Shield, MapPin, Bell, BarChart2, User as UserIcon, LogOut, Menu, X, Compass, Radio, Leaf, Layers, Wind } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal?: (mode: 'login' | 'register') => void;
  openLocationModal: () => void;
  openMethodology?: () => void;
  unreadAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openAuthModal,
  openLocationModal,
  openMethodology,
  unreadAlertsCount
}) => {
  const { user, primaryLocation, logout, isDemoMode, toggleDemoMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    ...(user
      ? [
          { id: 'dashboard', label: 'Dashboard', icon: Shield },
          { id: 'explore', label: 'Explore', icon: Compass },
          { id: 'air-quality', label: 'Air Quality', icon: Wind },
          { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadAlertsCount },
          { id: 'history', label: 'History', icon: BarChart2 }
        ]
      : [
          { id: 'login', label: 'Login', icon: Shield }
        ])
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#c5e6db] px-4 lg:px-8 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => setCurrentTab(user ? 'dashboard' : 'login')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#092c24] to-[#156550] flex items-center justify-center shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 text-[#a7f3d0] fill-[#a7f3d0]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-[#092c24] group-hover:text-[#156550] transition-colors">
                Climate<span className="text-[#156550]">Shield</span>
              </span>
              <span className="text-[10px] font-black bg-[#d7f1e6] text-[#092c24] border border-[#a8dec9] px-2 py-0.5 rounded-full">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-[#479b89] tracking-wider font-bold uppercase">
              Early Warning & Environmental Resilience
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#eef8f4] border border-[#c5e6db] rounded-full p-1 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  active
                    ? 'bg-[#092c24] text-white shadow-sm'
                    : 'text-[#156550] hover:text-[#092c24] hover:bg-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Area */}
        <div className="hidden md:flex items-center gap-3">
          {/* Methodology & Architecture button */}
          {openMethodology && (
            <button
              onClick={openMethodology}
              title="Inspect System Architecture, Environmental Pipeline & Source Grounding"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#eef8f4] text-[#156550] hover:text-[#092c24] border border-[#c5e6db] text-xs font-bold transition-colors shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-[#156550]" />
              <span>Methodology</span>
            </button>
          )}

          {/* Demo Mode Toggle Badge */}
          <button
            onClick={toggleDemoMode}
            title="Toggle between live open sensor data and demo simulation mode"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              isDemoMode
                ? 'bg-[#d7f1e6] text-[#092c24] border-[#a8dec9] shadow-xs'
                : 'bg-[#f4fbf7] text-[#156550] border-[#c5e6db] hover:bg-[#e1f2ec]'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isDemoMode ? 'text-[#092c24] animate-pulse' : 'text-[#479b89]'}`} />
            <span>Demo Mode: {isDemoMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Location button if user is logged in */}
          {user && (
            <button
              onClick={openLocationModal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4fbf7] hover:bg-[#e1f2ec] border border-[#c5e6db] text-xs text-[#092c24] font-bold transition-colors shadow-xs"
              title="Change monitored primary location"
            >
              <MapPin className="w-3.5 h-3.5 text-[#156550]" />
              <span className="max-w-[130px] truncate">
                {primaryLocation?.city || primaryLocation?.name || 'Set Location'}
              </span>
            </button>
          )}

          {/* User Account / Auth Actions */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTab('profile')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-colors ${
                  currentTab === 'profile'
                    ? 'bg-[#092c24] text-white border-[#092c24]'
                    : 'bg-white border-[#c5e6db] text-[#092c24] hover:bg-[#f4fbf7]'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#a7f3d0] text-[#092c24] flex items-center justify-center text-[11px] font-black">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="font-bold leading-none">{user.name.split(' ')[0]}</div>
                  <div className="text-[10px] opacity-75 leading-none mt-0.5">{user.userType}</div>
                </div>
              </button>

              <button
                onClick={() => logout()}
                title="Sign out of ClimateShield"
                className="p-2 rounded-full bg-white hover:bg-red-50 border border-[#c5e6db] hover:border-red-200 text-slate-500 hover:text-red-600 transition-colors shadow-xs"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentTab('login')}
              className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-[#092c24] hover:bg-[#051c16] text-white shadow-md shadow-[#092c24]/20 transition-all hover:scale-105"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
          {user && unreadAlertsCount > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#092c24] hover:text-[#156550]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-[#c5e6db] space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold ${
                  active ? 'bg-[#092c24] text-white' : 'text-[#1e3a34] hover:bg-[#eef8f4]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-[#156550]" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-red-500 text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-[#c5e6db] flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDemoMode}
                className="text-xs font-bold text-[#092c24] bg-[#d7f1e6] px-3.5 py-1.5 rounded-full border border-[#a8dec9]"
              >
                Demo: {isDemoMode ? 'ON' : 'OFF'}
              </button>
              {openMethodology && (
                <button
                  onClick={() => {
                    openMethodology();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-[#156550] bg-white px-3 py-1.5 rounded-full border border-[#c5e6db]"
                >
                  Methodology
                </button>
              )}
            </div>
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentTab('profile');
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-[#1e3a34] hover:text-[#092c24] flex items-center gap-1"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-red-600 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setCurrentTab('login');
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-black bg-[#092c24] text-white px-5 py-2 rounded-full shadow-sm"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
