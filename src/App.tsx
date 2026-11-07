import { useState, useEffect } from 'react';
import { useBarefootStore } from './store/useBarefootStore';
import { SetupScreen } from './components/SetupScreen';
import { MainDashboard } from './components/MainDashboard';
import { AuthModal } from './components/AuthModal';
import { Smartphone, Monitor, Sun, Moon, RotateCcw, Cloud } from 'lucide-react';

export function App() {
  const isConfigured = useBarefootStore((state) => state.paycheck.isConfigured);
  const theme = useBarefootStore((state) => state.theme);
  const toggleTheme = useBarefootStore((state) => state.toggleTheme);
  const resetAll = useBarefootStore((state) => state.resetAll);
  const initAuth = useBarefootStore((state) => state.initAuth);
  const user = useBarefootStore((state) => state.user);
  const isCloudSyncing = useBarefootStore((state) => state.isCloudSyncing);
  const setAuthModalOpen = useBarefootStore((state) => state.setAuthModalOpen);

  // Initialize Supabase Auth session & real-time synchronization on startup
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Desktop device frame toggle state
  const [deviceFrameMode, setDeviceFrameMode] = useState<'device' | 'fluid'>('device');

  const content = !isConfigured ? <SetupScreen /> : <MainDashboard />;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#07090e]' : 'bg-[#e2e8f0]'
      }`}
    >
      {/* Desktop Presentation Toolbar (visible only on md screens and up) */}
      <aside className="hidden md:flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-[#0f1115]/90 backdrop-blur-md text-[#9ca3af] text-xs font-mono select-none sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white flex items-center gap-1.5 font-display text-sm">
            <span className="w-2 h-2 rounded-full bg-[#ff5a36] animate-pulse" />
            WORKSHOP FLOW • CLIENT PREVIEW
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
            iPhone 15 Pro (393 × 852)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Frame Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-black/40 border border-white/10">
            <button
              type="button"
              onClick={() => setDeviceFrameMode('device')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                deviceFrameMode === 'device'
                  ? 'bg-[#ff5a36] text-white shadow-xs'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Device Frame</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceFrameMode('fluid')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                deviceFrameMode === 'fluid'
                  ? 'bg-[#ff5a36] text-white shadow-xs'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Fluid Center</span>
            </button>
          </div>

          {/* Cloud Auth / Sync Status Button */}
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="p-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer border border-white/10 flex items-center gap-1.5 text-[#f3f4f6]"
            title={user ? `Signed in as ${user.email}` : 'Sign in or sync with Supabase Cloud'}
          >
            <Cloud className={`w-3.5 h-3.5 ${user ? 'text-[#10b981]' : 'text-slate-400'}`} />
            <span className="text-[10px] font-mono">
              {user ? (isCloudSyncing ? 'Syncing...' : 'Cloud Synced') : 'Sign In'}
            </span>
          </button>

          {/* Theme Quick Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#f3f4f6] transition cursor-pointer border border-white/10 flex items-center gap-1"
            title="Toggle Dark / Light Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={resetAll}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-red-400 transition cursor-pointer border border-white/10 flex items-center gap-1"
            title="Reset All Demo Data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[10px]">Reset</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="w-full flex items-center justify-center p-0 md:py-8">
        {deviceFrameMode === 'device' ? (
          /* High-Fidelity Smartphone Mockup Frame for Desktop */
          <div className="relative md:rounded-[52px] md:border-[10px] md:border-[#222731] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.15)] overflow-hidden w-full max-w-[412px] md:h-[870px] flex flex-col bg-[#0b0f19]">
            {/* Simulated Phone Dynamic Island / Speaker */}
            <div className="hidden md:flex items-center justify-between px-7 pt-3.5 pb-1 text-white text-[11px] font-mono select-none z-50 bg-inherit">
              <span className="font-bold tracking-tight">9:41</span>
              <div className="w-24 h-4 rounded-full bg-black border border-white/10 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2" />
                <div className="w-2 h-2 rounded-full bg-[#10b981]/80" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">5G</span>
                <div className="w-5 h-2.5 rounded-xs border border-white/60 p-0.5 flex items-center">
                  <div className="h-full w-3 bg-white rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Inner App Frame with Native Scrolling */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative">
              {content}
            </div>

            {/* Phone Home Indicator Bar at Bottom */}
            <div className="hidden md:flex justify-center pb-2 pt-1 bg-inherit pointer-events-none z-50">
              <div className="w-32 h-1 bg-white/30 rounded-full" />
            </div>
          </div>
        ) : (
          /* Fluid Screen Mode (standard responsive layout) */
          <div className="w-full max-w-md shadow-2xl">
            {content}
          </div>
        )}
      </div>

      {/* Global Auth & Cloud Sync Modal */}
      <AuthModal />
    </div>
  );
}

export default App;
