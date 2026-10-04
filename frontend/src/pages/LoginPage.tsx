import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Loader2,
  Sparkles,
  Leaf,
  Activity,
  Zap,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserType } from '../types';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<UserType>('Resident');
  const [cropType, setCropType] = useState('Wheat & Soybean');
  const [farmArea, setFarmArea] = useState('45 Hectares');

  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'error' | 'success' | 'info'; message: string }>>([]);

  const addToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDemoQuickFill = (autoSubmit = false) => {
    setEmail('demo@climateshield.org');
    setPassword('climate123');
    if (autoSubmit) {
      handleDirectLogin('demo@climateshield.org', 'climate123');
    } else {
      addToast('Demo credentials pre-filled (demo@climateshield.org / climate123)', 'info');
    }
  };

  const handleDirectLogin = async (eMail: string, pass: string) => {
    setLoading(true);
    try {
      await login(eMail, pass);
      addToast('Welcome back to ClimateShield!', 'success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      addToast(err.message || 'Authentication error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
        addToast('Welcome back to ClimateShield!', 'success');
        if (onSuccess) onSuccess();
      } else if (tab === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await register({
          name,
          email,
          password,
          userType: 'Resident'
        });
        addToast('Account created successfully!', 'success');
        if (onSuccess) onSuccess();
      } else if (tab === 'forgot') {
        addToast(
          'If an account exists with this email, password reset instructions have been dispatched.',
          'success'
        );
      }
    } catch (err: any) {
      addToast(err.message || 'Authentication error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-1 sm:py-2">
      {/* Locked Fixed Dimensions Container: Exactly identical size for both Log In and Sign Up */}
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-[#c5e6db] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 lg:h-[570px] min-h-[570px]">
        
        {/* ========================================================= */}
        {/* LEFT BOX: BRAND SHOWCASE & CREDIBILITY HIGHLIGHTS         */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#06241c] via-[#092c24] to-[#041913] p-6 lg:p-7 text-white flex flex-col justify-between relative overflow-hidden h-full">
          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#156550]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#10b981] text-[#092c24] flex items-center justify-center font-black shadow-md shadow-emerald-950/40 shrink-0">
                  <Leaf className="w-5 h-5 fill-[#092c24] stroke-[#10b981]" />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-white leading-none">
                    ClimateShield
                  </h1>
                  <span className="text-[9px] font-bold tracking-wider uppercase text-[#a7f3d0] opacity-80 block mt-0.5">
                    Disaster Prediction Network
                  </span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#a7f3d0] bg-white/10 px-2.5 py-1 rounded-full border border-white/15 backdrop-blur-xs">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>Verified Platform</span>
              </span>
            </div>

            {/* Headline & Subtitle */}
            <div className="space-y-1 pt-1">
              <h2 className="text-xl sm:text-2xl lg:text-[25px] font-black tracking-tight leading-tight text-white">
                Proactive Resilience{' '}
                <span className="text-[#34d399] block">Powered by Telemetry.</span>
              </h2>
              <p className="text-xs text-[#d1fae5]/80 leading-relaxed font-normal">
                Continuous localized climate intelligence combining satellite observation, meteorological anomalies, and soil moisture telemetry to forecast hazards before human disruption occurs.
              </p>
            </div>

            {/* 3 Credibility / Feature Cards Stack */}
            <div className="space-y-2 pt-1">
              {/* Card 1 */}
              <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5 text-emerald-300">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white leading-tight">Multi-Hazard Telemetry</h3>
                  <p className="text-[11px] text-[#a7f3d0]/80 leading-snug mt-0.5">
                    Synchronous tracking of heat anomalies, drought deficit, and flood precipitation.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0 mt-0.5 text-teal-300">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white leading-tight">AI Early Signal Detection</h3>
                  <p className="text-[11px] text-[#a7f3d0]/80 leading-snug mt-0.5">
                    Proactive warnings dispatched 3 to 14 days ahead of acute threshold breaches.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5 text-emerald-300">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white leading-tight">Role-Specific Advisory</h3>
                  <p className="text-[11px] text-[#a7f3d0]/80 leading-snug mt-0.5">
                    Targeted mitigation protocols tailored for residents, farmers, and municipal teams.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-[#a7f3d0]/70">
            <span>ClimateShield Engine v2.4</span>
            <span>Deterministic AI</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT BOX: AUTHENTICATION (LOG IN & SIGN UP)              */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 bg-white p-6 lg:p-7 flex flex-col justify-between h-full overflow-hidden">
          <div className="max-w-md w-full mx-auto space-y-3.5 my-auto">
            
            {/* Top Pill & Title */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#eef8f4] text-[#156550] border border-[#c5e6db] mb-1.5">
                <Shield className="w-3 h-3 text-[#156550]" />
                <span>Secure Authentication</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#092c24] tracking-tight">
                {tab === 'login' && 'Log In to ClimateShield'}
                {tab === 'register' && 'Create Your Account'}
                {tab === 'forgot' && 'Reset Your Password'}
              </h2>
              <p className="text-xs text-[#375249] mt-0.5 font-medium leading-relaxed">
                {tab === 'login' && 'Enter your credentials to access live hazard telemetry and alert bulletins.'}
                {tab === 'register' && 'Register to monitor coordinates and access personalized mitigation guidance.'}
                {tab === 'forgot' && 'Enter your registered email address to receive password recovery instructions.'}
              </p>
            </div>

            {/* Quick 1-Click Demo Evaluation Bar (In Login Tab) */}
            {tab === 'login' && (
              <div className="px-3 py-1.5 rounded-xl bg-[#eef8f4] border border-[#c5e6db] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#156550]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-semibold text-[11px] text-[#092c24]">
                    Demo: <strong className="font-mono text-emerald-800">demo@climateshield.org</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDemoQuickFill(true)}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-md bg-[#092c24] hover:bg-[#051c16] text-[#a7f3d0] font-bold text-[10px] transition-all shadow-2xs cursor-pointer shrink-0"
                >
                  ⚡ 1-Click Login
                </button>
              </div>
            )}

            {/* Form Fields: Designed with identical vertical footprint in both tabs */}
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* =================================================== */}
              {/* TAB: LOGIN FORM                                     */}
              {/* =================================================== */}
              {tab === 'login' && (
                <>
                  {/* Email */}
                  <div>
                    <label className="text-[11px] text-[#1e3a34] block mb-1 font-bold">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-[#479b89] absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#f7fcf9] border border-[#c5e6db] text-xs text-slate-800 focus:outline-none focus:border-[#092c24] focus:ring-1 focus:ring-[#092c24] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-[#1e3a34] font-bold">
                        Password
                      </label>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="text-[#3d6559]">
                          Default demo:{' '}
                          <button
                            type="button"
                            onClick={() => setPassword('climate123')}
                            className="font-mono text-emerald-700 font-bold hover:underline cursor-pointer"
                          >
                            climate123
                          </button>
                        </span>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setTab('forgot')}
                          className="text-[#156550] hover:text-[#092c24] font-semibold hover:underline"
                        >
                          Forgot?
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-[#479b89] absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#f7fcf9] border border-[#c5e6db] text-xs text-slate-800 focus:outline-none focus:border-[#092c24] focus:ring-1 focus:ring-[#092c24] focus:bg-white transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-[#479b89] hover:text-[#092c24] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* =================================================== */}
              {/* TAB: SIGN UP / REGISTER FORM                        */}
              {/* =================================================== */}
              {tab === 'register' && (
                <>
                  {/* Full Name */}
                  <div>
                    <label className="text-[11px] text-[#1e3a34] block mb-1 font-bold">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-[#479b89] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="Maya Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#f7fcf9] border border-[#c5e6db] text-xs text-slate-800 focus:outline-none focus:border-[#092c24] focus:ring-1 focus:ring-[#092c24] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="text-[11px] text-[#1e3a34] block mb-1 font-bold">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-[#479b89] absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="maya@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#f7fcf9] border border-[#c5e6db] text-xs text-slate-800 focus:outline-none focus:border-[#092c24] focus:ring-1 focus:ring-[#092c24] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-[11px] text-[#1e3a34] block mb-1 font-bold">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-[#479b89] absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#f7fcf9] border border-[#c5e6db] text-xs text-slate-800 focus:outline-none focus:border-[#092c24] focus:ring-1 focus:ring-[#092c24] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-[11px] text-[#1e3a34] block mb-1 font-bold">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-[#479b89] absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#f7fcf9] border border-[#c5e6db] text-xs text-slate-800 focus:outline-none focus:border-[#092c24] focus:ring-1 focus:ring-[#092c24] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* =================================================== */}
              {/* TAB: FORGOT PASSWORD FORM                           */}
              {/* =================================================== */}
              {tab === 'forgot' && (
                <div>
                  <label className="text-[11px] text-[#1e3a34] block mb-1 font-bold">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#479b89] absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#f7fcf9] border border-[#c5e6db] text-xs text-slate-800 focus:outline-none focus:border-[#092c24] focus:ring-1 focus:ring-[#092c24] focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#092c24] hover:bg-[#051c16] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-[#092c24]/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.008] active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-1"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#a7f3d0]" />
                ) : (
                  <>
                    <span>
                      {tab === 'login' && 'Log In to ClimateShield'}
                      {tab === 'register' && 'Create Monitored Account'}
                      {tab === 'forgot' && 'Send Password Recovery'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#a7f3d0]" />
                  </>
                )}
              </button>
            </form>

            {/* Account Switcher Footer */}
            <div className="pt-2 border-t border-[#e1f2ec] text-center text-xs text-[#375249]">
              {tab === 'forgot' ? (
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-[#156550] font-bold hover:underline cursor-pointer"
                >
                  ← Back to Login
                </button>
              ) : (
                <span>
                  {tab === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
                    className="text-[#092c24] font-black hover:underline cursor-pointer ml-1"
                  >
                    {tab === 'login' ? 'Sign Up' : 'Log In'}
                  </button>
                </span>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Floating Toast Notification Stack (Bottom Right) */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-3 rounded-2xl shadow-xl border flex items-center justify-between gap-3 text-xs font-semibold pointer-events-auto backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 ${
                toast.type === 'error'
                  ? 'bg-red-50/95 text-red-800 border-red-200 shadow-red-900/10'
                  : toast.type === 'success'
                  ? 'bg-emerald-50/95 text-emerald-900 border-emerald-200 shadow-emerald-900/10'
                  : 'bg-slate-900/90 text-white border-slate-800 shadow-black/20'
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                {toast.type === 'info' && <Sparkles className="w-4 h-4 text-[#a7f3d0] shrink-0" />}
                <span className="leading-tight">{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-black/10 transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
