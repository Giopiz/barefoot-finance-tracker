import React, { useState, useEffect } from 'react';
import {
  Plus,
  RefreshCw,
  Sliders,
  Trash2,
  Receipt,
  Coffee,
  ChevronDown,
  ChevronUp,
  Flame,
  Smile,
  Wallet,
  GraduationCap,
  Sparkles,
  Sun,
  Moon,
  AlertTriangle,
  Filter,
  Cloud,
  HardDriveDownload,
} from 'lucide-react';
import { useBarefootStore, getFrameworkSplits } from '../store/useBarefootStore';
import { QuickLogModal } from './QuickLogModal';
import { PaydayModal } from './PaydayModal';
import { AcademyTab } from './AcademyTab';
import { PremiumModal } from './PremiumModal';
import { EditBaselineModal } from './EditBaselineModal';
import { DataExportModal } from './DataExportModal';
import { BrandLogo } from './BrandLogo';

interface MainDashboardProps {
  onEditPaycheck?: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = () => {
  const splurgeBalance = useBarefootStore((state) => state.splurgeBalance);
  const billsBalance = useBarefootStore((state) => state.billsBalance);
  const smileBalance = useBarefootStore((state) => state.smileBalance);
  const fireBalance = useBarefootStore((state) => state.fireBalance);
  const expenses = useBarefootStore((state) => state.expenses);
  const deleteExpense = useBarefootStore((state) => state.deleteExpense);
  const paycheck = useBarefootStore((state) => state.paycheck);
  const paydayCount = useBarefootStore((state) => state.paydayCount);
  const streakCount = useBarefootStore((state) => state.streakCount);
  const theme = useBarefootStore((state) => state.theme);
  const toggleTheme = useBarefootStore((state) => state.toggleTheme);
  const user = useBarefootStore((state) => state.user);
  const isCloudSyncing = useBarefootStore((state) => state.isCloudSyncing);
  const lastSyncedAt = useBarefootStore((state) => state.lastSyncedAt);
  const setAuthModalOpen = useBarefootStore((state) => state.setAuthModalOpen);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'academy'>('dashboard');
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isPaydayOpen, setIsPaydayOpen] = useState(false);
  const [isEditBaselineOpen, setIsEditBaselineOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [showOtherBuckets, setShowOtherBuckets] = useState(false);
  const [activityFilter, setActivityFilter] = useState<'all' | 'splurge' | 'bill'>('all');

  // Micro-interaction: Smooth progress bar load animation from 0% to target
  const [isPacingLoaded, setIsPacingLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsPacingLoaded(true), 120);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const splits = getFrameworkSplits(paycheck.amount, paycheck.framework);

  // Currency formatter
  const fmt = (val: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: val % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Pacing calculations relative to starting paycheck split
  const splurgeTarget = splits.splurge > 0 ? splits.splurge : 1;
  const billsTarget = splits.bills > 0 ? splits.bills : 1;

  const splurgePct = Math.max(0, Math.min(100, Math.round((splurgeBalance / splurgeTarget) * 100)));
  const billsPct = Math.max(0, Math.min(100, Math.round((billsBalance / billsTarget) * 100)));

  // Color coding: Green (#10b981), Yellow (#eab308), Red (#ff5a36 Ember)
  const getPacingStyle = (pct: number, balance: number) => {
    if (balance < 0) {
      return {
        bar: 'bg-red-500',
        text: 'text-red-400',
        label: 'Over Budget',
      };
    }
    if (pct > 50) {
      return {
        bar: 'bg-[#10b981]',
        text: 'text-[#10b981]',
        label: 'Optimal Pace',
      };
    }
    if (pct >= 20) {
      return {
        bar: 'bg-[#eab308]',
        text: 'text-[#eab308]',
        label: 'Getting Low • Steady',
      };
    }
    return {
      bar: 'bg-[#ff5a36]',
      text: 'text-[#ff5a36]',
      label: 'Nearly Empty',
    };
  };

  const splurgePacing = getPacingStyle(splurgePct, splurgeBalance);
  const billsPacing = getPacingStyle(billsPct, billsBalance);

  // Filtered expenses list
  const filteredExpenses = expenses.filter((item) => {
    if (activityFilter === 'all') return true;
    return item.category === activityFilter;
  });

  const totalFilteredSpent = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div
      data-theme={theme}
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-[#0b0f19] text-[#f1f5f9]' : 'bg-[#f7f5f0] text-[#0f172a]'
      } pb-32 max-w-md mx-auto font-sans transition-colors duration-300 flex flex-col justify-between select-none`}
    >
      {/* Top Mobile App Header */}
      <header
        className={`px-5 pt-4 pb-3 flex items-center justify-between border-b sticky top-0 z-30 backdrop-blur-md transition-colors ${
          theme === 'dark'
            ? 'bg-[#0b0f19]/85 border-white/10'
            : 'bg-[#f7f5f0]/85 border-black/10'
        }`}
      >
        <div>
          <BrandLogo size="md" showWordmark={true} />
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md border ${
                theme === 'dark'
                  ? 'bg-[#131b2e] text-[#94a3b8] border-white/10'
                  : 'bg-white text-slate-600 border-black/10'
              }`}
            >
              {splits.frameworkName}
            </span>
            <span
              className={`text-[10px] font-medium capitalize ${
                theme === 'dark' ? 'text-[#64748b]' : 'text-slate-400'
              }`}
            >
              Payday #{paydayCount} • {paycheck.frequency}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Supabase Cloud Sync Status Button */}
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className={`p-1.5 px-2 rounded-full transition cursor-pointer border flex items-center gap-1.5 text-[11px] font-mono ${
              user
                ? theme === 'dark'
                  ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/25'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : theme === 'dark'
                ? 'bg-[#131b2e] text-[#94a3b8] hover:text-white border-white/10 hover:border-white/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border-black/10 hover:border-black/20'
            }`}
            title={
              user
                ? `Signed in as ${user.email} (${isCloudSyncing ? 'Syncing...' : lastSyncedAt ? `Synced at ${lastSyncedAt}` : 'Connected'})`
                : 'Sign in to sync with Supabase Cloud'
            }
          >
            <Cloud className={`w-3.5 h-3.5 ${user ? 'text-[#10b981]' : 'text-slate-400'}`} />
            {user ? (
              <span className="flex items-center gap-1 text-[10px] font-bold">
                <span className={`w-1.5 h-1.5 rounded-full bg-[#10b981] ${isCloudSyncing ? 'animate-ping' : ''}`} />
                <span className="hidden sm:inline">{isCloudSyncing ? 'Syncing' : 'Synced'}</span>
              </span>
            ) : (
              <span className="text-[10px]">Cloud</span>
            )}
          </button>

          {/* Daily Habit Streak Counter (Flame Icon) */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ff5a36]/15 text-[#ff5a36] border border-[#ff5a36]/30 font-mono font-bold text-xs shadow-2xs"
            title={`${streakCount} day logging streak!`}
          >
            <Flame className="w-3.5 h-3.5 text-[#ff5a36] fill-[#ff5a36] animate-pulse" />
            <span>Streak: {streakCount}d</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-1.5 rounded-full transition cursor-pointer border ${
              theme === 'dark'
                ? 'bg-[#131b2e] hover:bg-[#1a253e] text-amber-400 border-white/10'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-black/10'
            }`}
            title="Toggle Dark / Light Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Top Up Payday Button */}
          <button
            type="button"
            onClick={() => setIsPaydayOpen(true)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer border ${
              theme === 'dark'
                ? 'bg-[#131b2e] hover:bg-[#1a253e] text-[#f1f5f9] border-white/10 hover:border-[#ff5a36]/40'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-black/10 hover:border-[#ff5a36]/40'
            }`}
            title="Add next paycheck and top up balances"
          >
            <RefreshCw className="w-3 h-3 text-[#ff5a36]" />
            <span>Payday</span>
          </button>

          {/* Quick Edit Baseline / Framework Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsEditBaselineOpen(true)}
            className={`p-1.5 rounded-full transition cursor-pointer ${
              theme === 'dark'
                ? 'text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#131b2e]'
                : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Adjust Baseline Income & Framework"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Quick Offline Data Sovereignty & Export Trigger */}
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className={`p-1.5 rounded-full transition cursor-pointer ${
              theme === 'dark'
                ? 'text-[#64748b] hover:text-[#10b981] hover:bg-[#131b2e]'
                : 'text-slate-400 hover:text-[#10b981] hover:bg-slate-100'
            }`}
            title="Data Sovereignty: One-Click CSV Export & Vault Backup"
          >
            <HardDriveDownload className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="px-5 space-y-4 pt-3 flex-1">
        {activeTab === 'academy' ? (
          <AcademyTab />
        ) : (
          <>
            {/* FRONT & CENTER CARD 1: SPLURGE / WANTS LEFT */}
            <div
              className={`rounded-3xl p-6 border shadow-workshop relative overflow-hidden transition-all group ${
                splurgeBalance < 0
                  ? 'border-red-500/50 bg-red-500/5'
                  : theme === 'dark'
                  ? 'bg-[#131b2e] border-white/10 hover:border-[#ff5a36]/50'
                  : 'bg-white border-black/10 hover:border-[#ff5a36]/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono font-bold text-[#ff5a36] uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <Coffee className="w-3.5 h-3.5 text-[#ff5a36]" />
                  {splits.splurgeLabel} ({splits.splurgePct}%)
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    splurgeBalance < 0
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : 'bg-[#ff5a36]/15 text-[#ff5a36] border-[#ff5a36]/30'
                  }`}
                >
                  {splurgeBalance < 0 ? 'OVER LIMIT' : 'GUILT-FREE'}
                </span>
              </div>

              <div className="pt-2 pb-1">
                <p
                  className={`font-display text-4xl sm:text-5xl font-black tracking-tight ${
                    splurgeBalance < 0 ? 'text-red-400' : ''
                  }`}
                >
                  {fmt(splurgeBalance)}
                </p>
                <p
                  className={`text-xs mt-0.5 font-medium ${
                    theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'
                  }`}
                >
                  Safe to spend freely on coffee, dining, and treats
                </p>
              </div>

              {/* OVER-BUDGET STATE WARNING BADGE */}
              {splurgeBalance < 0 && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="font-medium text-[11px]">
                    Over-allocated by{' '}
                    <strong className="font-mono font-bold text-red-200">
                      {fmt(Math.abs(splurgeBalance))}
                    </strong>{' '}
                    • Safe spend paused until next payday.
                  </span>
                </div>
              )}

              {/* Visual Pacing Bar with Smooth Loading Animation */}
              <div
                className={`mt-4 pt-3 border-t space-y-1.5 ${
                  theme === 'dark' ? 'border-white/5' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span className={`font-mono font-bold ${splurgePacing.text}`}>
                    {splurgePacing.label}
                  </span>
                  <span
                    className={`font-mono-nums font-semibold ${
                      theme === 'dark' ? 'text-[#64748b]' : 'text-slate-400'
                    }`}
                  >
                    {splurgePct}% remaining
                  </span>
                </div>
                <div
                  className={`h-2.5 w-full rounded-full overflow-hidden p-0.5 border ${
                    theme === 'dark'
                      ? 'bg-[#0b0f19] border-white/5'
                      : 'bg-slate-100 border-black/5'
                  }`}
                >
                  <div
                    className={`h-full ${splurgePacing.bar} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: isPacingLoaded ? `${splurgePct}%` : '0%' }}
                  />
                </div>
              </div>
            </div>

            {/* FRONT & CENTER CARD 2: BILLS / NEEDS LEFT */}
            <div
              className={`rounded-3xl p-6 border shadow-workshop relative overflow-hidden transition-all ${
                billsBalance < 0
                  ? 'border-red-500/50 bg-red-500/5'
                  : theme === 'dark'
                  ? 'bg-[#131b2e] border-white/10'
                  : 'bg-white border-black/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span
                  className={`font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px] ${
                    theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  {splits.billsLabel} ({splits.billsPct}%)
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    billsBalance < 0
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : theme === 'dark'
                      ? 'bg-[#0b0f19] text-[#94a3b8] border-white/5'
                      : 'bg-slate-100 text-slate-600 border-black/5'
                  }`}
                >
                  {billsBalance < 0 ? 'DEFICIT' : 'FIXED NEEDS'}
                </span>
              </div>

              <div className="pt-2 pb-1">
                <p
                  className={`font-display text-3xl sm:text-4xl font-black tracking-tight ${
                    billsBalance < 0 ? 'text-red-400' : ''
                  }`}
                >
                  {fmt(billsBalance)}
                </p>
                <p
                  className={`text-xs mt-0.5 font-medium ${
                    theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'
                  }`}
                >
                  Reserved for rent/mortgage, groceries, power, and fuel
                </p>
              </div>

              {/* OVER-BUDGET STATE WARNING BADGE FOR BILLS */}
              {billsBalance < 0 && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="font-medium text-[11px]">
                    Bills exceeded by{' '}
                    <strong className="font-mono font-bold text-red-200">
                      {fmt(Math.abs(billsBalance))}
                    </strong>{' '}
                    • Review upcoming fixed subscriptions.
                  </span>
                </div>
              )}

              {/* Visual Pacing Bar with Smooth Loading Animation */}
              <div
                className={`mt-4 pt-3 border-t space-y-1.5 ${
                  theme === 'dark' ? 'border-white/5' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span className={`font-mono font-bold ${billsPacing.text}`}>
                    {billsPacing.label}
                  </span>
                  <span
                    className={`font-mono-nums font-semibold ${
                      theme === 'dark' ? 'text-[#64748b]' : 'text-slate-400'
                    }`}
                  >
                    {billsPct}% remaining
                  </span>
                </div>
                <div
                  className={`h-2.5 w-full rounded-full overflow-hidden p-0.5 border ${
                    theme === 'dark'
                      ? 'bg-[#0b0f19] border-white/5'
                      : 'bg-slate-100 border-black/5'
                  }`}
                >
                  <div
                    className={`h-full ${billsPacing.bar} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: isPacingLoaded ? `${billsPct}%` : '0%' }}
                  />
                </div>
              </div>
            </div>

            {/* Collapsible: Peek at other buckets */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => setShowOtherBuckets(!showOtherBuckets)}
                className={`w-full flex items-center justify-between py-2 text-xs font-mono font-bold transition cursor-pointer ${
                  theme === 'dark'
                    ? 'text-[#64748b] hover:text-[#f1f5f9]'
                    : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                <span>
                  PEEK OTHER BUCKETS ({paycheck.framework === '50-30-20' ? 'SAVINGS' : 'MOJO & SMILE'})
                </span>
                {showOtherBuckets ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showOtherBuckets && (
                <div className="grid grid-cols-2 gap-3 pt-2 animate-in fade-in duration-200">
                  <div
                    className={`p-3.5 rounded-2xl border ${
                      theme === 'dark'
                        ? 'bg-[#131b2e] border-white/10'
                        : 'bg-white border-black/10'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#ff5a36] uppercase mb-0.5">
                      <Flame className="w-3 h-3 text-[#ff5a36]" />
                      {paycheck.framework === '50-30-20' ? 'Savings / Mojo' : 'Mojo / Fire (20%)'}
                    </div>
                    <p className="font-display text-xl font-bold">{fmt(fireBalance)}</p>
                    <p
                      className={`text-[10px] font-medium ${
                        theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'
                      }`}
                    >
                      Emergency reserve
                    </p>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl border ${
                      theme === 'dark'
                        ? 'bg-[#131b2e] border-white/10'
                        : 'bg-white border-black/10'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#10b981] uppercase mb-0.5">
                      <Smile className="w-3 h-3 text-[#10b981]" /> Smile (10%)
                    </div>
                    <p className="font-display text-xl font-bold">{fmt(smileBalance)}</p>
                    <p
                      className={`text-[10px] font-medium ${
                        theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'
                      }`}
                    >
                      Holidays & dreams
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity / Logged Expenses with FILTER PILLS & Premium Empty States */}
            <div className="pt-2 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span
                  className={`text-[11px] font-mono font-bold uppercase tracking-widest ${
                    theme === 'dark' ? 'text-[#64748b]' : 'text-slate-400'
                  }`}
                >
                  Recent Logs
                </span>

                {/* Filter Pills */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActivityFilter('all')}
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md transition cursor-pointer ${
                      activityFilter === 'all'
                        ? 'bg-[#ff5a36] text-white'
                        : theme === 'dark'
                        ? 'bg-[#131b2e] text-[#94a3b8] hover:text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    All ({expenses.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityFilter('splurge')}
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md transition cursor-pointer ${
                      activityFilter === 'splurge'
                        ? 'bg-[#ff5a36] text-white'
                        : theme === 'dark'
                        ? 'bg-[#131b2e] text-[#94a3b8] hover:text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {splits.splurgeLabel.split(' ')[0]} ({expenses.filter((e) => e.category === 'splurge').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityFilter('bill')}
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md transition cursor-pointer ${
                      activityFilter === 'bill'
                        ? 'bg-[#ff5a36] text-white'
                        : theme === 'dark'
                        ? 'bg-[#131b2e] text-[#94a3b8] hover:text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {splits.billsLabel.split(' ')[0]} ({expenses.filter((e) => e.category === 'bill').length})
                  </button>
                </div>
              </div>

              {/* Total Filtered Spent Banner */}
              {expenses.length > 0 && activityFilter !== 'all' && (
                <div
                  className={`text-[11px] font-mono px-3 py-1.5 rounded-xl border flex items-center justify-between ${
                    theme === 'dark'
                      ? 'bg-[#131b2e] border-white/5 text-[#94a3b8]'
                      : 'bg-white border-black/5 text-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Filter className="w-3 h-3 text-[#ff5a36]" /> Filtered Total:
                  </span>
                  <span className="font-bold text-[#ff5a36] font-mono-nums">
                    {fmt(totalFilteredSpent)}
                  </span>
                </div>
              )}

              {expenses.length === 0 ? (
                /* Premium Empty State Card */
                <div
                  className={`text-center py-8 px-6 rounded-3xl border shadow-workshop space-y-3.5 relative overflow-hidden transition-all ${
                    theme === 'dark'
                      ? 'bg-[#131b2e] border-white/10'
                      : 'bg-white border-black/10'
                  }`}
                >
                  {/* Glowing Icon Orb */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff5a36]/20 via-[#ff5a36]/10 to-transparent border border-[#ff5a36]/30 flex items-center justify-center mx-auto shadow-glow-ember-sm">
                    <Sparkles className="w-7 h-7 text-[#ff5a36] animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-display text-base font-bold tracking-tight">
                      Ready to build your wealth?
                    </h4>
                    <p
                      className={`text-xs max-w-xs mx-auto leading-relaxed ${
                        theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'
                      }`}
                    >
                      Log your first expense to activate your visual pacing bars and start your daily streak.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsLogOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff5a36] hover:bg-[#e04825] active:scale-95 tap-bounce text-white font-display font-bold text-xs shadow-ember transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Log First Expense</span>
                  </button>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div
                  className={`p-6 rounded-2xl border text-center text-xs ${
                    theme === 'dark'
                      ? 'bg-[#131b2e] border-white/5 text-[#94a3b8]'
                      : 'bg-white border-black/5 text-slate-500'
                  }`}
                >
                  No logs in this category yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                  {filteredExpenses.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-xs transition ${
                        theme === 'dark'
                          ? 'bg-[#131b2e] border-white/10 hover:border-white/20'
                          : 'bg-white border-black/10 hover:border-black/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2 rounded-xl text-xs ${
                            item.category === 'splurge'
                              ? 'bg-[#ff5a36]/15 text-[#ff5a36]'
                              : theme === 'dark'
                              ? 'bg-[#0b0f19] text-[#94a3b8]'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.category === 'splurge' ? (
                            <Coffee className="w-4 h-4" />
                          ) : (
                            <Receipt className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold capitalize">
                            {item.note || (item.category === 'splurge' ? splits.splurgeLabel : splits.billsLabel)}
                          </p>
                          <span
                            className={`text-[10px] capitalize font-medium ${
                              theme === 'dark' ? 'text-[#64748b]' : 'text-slate-400'
                            }`}
                          >
                            {item.category === 'splurge' ? 'Splurge / Wants' : 'Bills / Needs'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono-nums text-sm font-bold">
                          -{fmt(item.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteExpense(item.id)}
                          className="p-1 text-[#64748b] hover:text-[#ff5a36] transition cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* FLOATING WORKSHOP DOCK & TACTILE EMBER FAB (Spring Scale Animation) */}
      <div className="fixed bottom-3 inset-x-0 max-w-sm mx-auto z-40 px-4">
        <div
          className={`backdrop-blur-xl border rounded-full px-7 py-2.5 shadow-workshop flex items-center justify-between transition-colors ${
            theme === 'dark'
              ? 'bg-[#131b2e]/95 border-white/10'
              : 'bg-white/95 border-black/10'
          }`}
        >
          {/* Tab 1: Dashboard */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-[#ff5a36] font-bold'
                : theme === 'dark'
                ? 'text-[#64748b] hover:text-[#f1f5f9]'
                : 'text-slate-400 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[9px] font-mono uppercase tracking-wider">Engine</span>
          </button>

          {/* CENTER EMBER FLOATING ACTION BUTTON WITH TACTILE BOUNCE */}
          <div className="-mt-8">
            <button
              type="button"
              onClick={() => setIsLogOpen(true)}
              className="w-14 h-14 rounded-full bg-[#ff5a36] hover:bg-[#e04825] active:scale-90 tap-bounce text-white flex items-center justify-center shadow-ember hover:shadow-xl transition-all cursor-pointer border-4"
              style={{
                borderColor: theme === 'dark' ? '#0b0f19' : '#f7f5f0',
              }}
              title="Log Expense"
            >
              <Plus className="w-7 h-7 stroke-[2.8]" />
            </button>
          </div>

          {/* Tab 2: Academy */}
          <button
            type="button"
            onClick={() => setActiveTab('academy')}
            className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer relative ${
              activeTab === 'academy'
                ? 'text-[#ff5a36] font-bold'
                : theme === 'dark'
                ? 'text-[#64748b] hover:text-[#f1f5f9]'
                : 'text-slate-400 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-[9px] font-mono uppercase tracking-wider">Theory</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#10b981]" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <QuickLogModal isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} />
      <PaydayModal isOpen={isPaydayOpen} onClose={() => setIsPaydayOpen(false)} />
      <EditBaselineModal
        isOpen={isEditBaselineOpen}
        onClose={() => setIsEditBaselineOpen(false)}
      />
      <DataExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
      <PremiumModal />
    </div>
  );
};
