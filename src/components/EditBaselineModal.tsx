import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  RotateCcw,
  Sliders,
  DollarSign,
  AlertTriangle,
  Lock,
  Sparkles,
  HardDriveDownload,
} from 'lucide-react';
import {
  useBarefootStore,
  getFrameworkSplits,
  type BudgetFramework,
} from '../store/useBarefootStore';
import { DataExportModal } from './DataExportModal';

interface EditBaselineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditBaselineModal: React.FC<EditBaselineModalProps> = ({
  isOpen,
  onClose,
}) => {
  const paycheck = useBarefootStore((state) => state.paycheck);
  const updateBaseline = useBarefootStore((state) => state.updateBaseline);
  const resetAll = useBarefootStore((state) => state.resetAll);
  const isProUser = useBarefootStore((state) => state.isProUser);
  const customSplits = useBarefootStore((state) => state.customSplits);
  const setCustomSplits = useBarefootStore((state) => state.setCustomSplits);
  const setPremiumModalOpen = useBarefootStore((state) => state.setPremiumModalOpen);
  const theme = useBarefootStore((state) => state.theme);

  const [amountStr, setAmountStr] = useState(paycheck.amount ? paycheck.amount.toString() : '');
  const [frequency, setFrequency] = useState<'weekly' | 'fortnightly' | 'monthly'>(
    paycheck.frequency || 'fortnightly'
  );
  const [framework, setFramework] = useState<BudgetFramework>(
    paycheck.framework || 'barefoot'
  );
  const [customDraft, setCustomDraft] = useState(
    customSplits || {
      billsPct: 60,
      splurgePct: 15,
      firePct: 15,
      smilePct: 10,
    }
  );

  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmountStr(paycheck.amount ? paycheck.amount.toString() : '');
      setFrequency(paycheck.frequency || 'fortnightly');
      setFramework(paycheck.framework || 'barefoot');
      setCustomDraft(customSplits);
      setShowConfirmReset(false);
      setSavedSuccess(false);
    }
  }, [isOpen, paycheck, customSplits]);

  // Scroll lock and keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const rawAmount = parseFloat(amountStr) || 0;
  // Guard income amount between $1 and $10,000,000
  const currentAmount = Math.min(10000000, Math.max(0, rawAmount));

  const previewSplits = getFrameworkSplits(
    currentAmount,
    framework,
    framework === 'custom' ? customDraft : undefined
  );

  const totalCustomPct =
    Math.max(0, customDraft.billsPct) +
    Math.max(0, customDraft.splurgePct) +
    Math.max(0, customDraft.firePct) +
    Math.max(0, customDraft.smilePct);

  const isCustomValid = framework !== 'custom' || totalCustomPct === 100;

  const fmt = (val: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSave = () => {
    if (currentAmount <= 0 || !isCustomValid) return;
    if (framework === 'custom') {
      setCustomSplits(customDraft);
    }
    updateBaseline(currentAmount, framework, frequency);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  const handleResetConfirm = () => {
    resetAll();
    setShowConfirmReset(false);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none"
    >
      <div
        className={`w-full max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl border flex flex-col overflow-hidden max-h-[92vh] ${
          theme === 'dark'
            ? 'bg-[#181b20] border-white/10 text-[#f3f4f6]'
            : 'bg-white border-black/10 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 px-6 flex items-center justify-between border-b ${
            theme === 'dark' ? 'border-white/10' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#ff5a36]" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest">
              Adjust Baseline & Framework
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-full transition cursor-pointer ${
              theme === 'dark'
                ? 'text-[#9ca3af] hover:text-white hover:bg-[#1f232a]'
                : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Income Input */}
          <div className="space-y-2">
            <label
              htmlFor="edit-paycheck-amount"
              className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#9ca3af] block"
            >
              Paycheck Income Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ff5a36]" />
              <input
                id="edit-paycheck-amount"
                name="paycheckAmount"
                type="number"
                min="1"
                max="10000000"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="4000"
                aria-label="Paycheck Income Amount"
                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border text-xl font-mono-nums font-bold focus:outline-hidden focus:border-[#ff5a36] transition ${
                  theme === 'dark'
                    ? 'bg-[#0f1115] border-white/10 text-white'
                    : 'bg-slate-50 border-black/10 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Frequency Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#9ca3af] block">
              Pay Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['weekly', 'fortnightly', 'monthly'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`py-2 px-1 text-xs font-mono font-bold rounded-xl border capitalize transition cursor-pointer ${
                    frequency === freq
                      ? 'bg-[#ff5a36]/20 text-[#ff5a36] border-[#ff5a36]'
                      : theme === 'dark'
                      ? 'bg-[#1f232a] text-[#9ca3af] border-white/5 hover:bg-[#282d36]'
                      : 'bg-slate-100 text-slate-600 border-black/5 hover:bg-slate-200'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Framework Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#9ca3af] block">
              Budgeting Framework
            </label>
            <div className="space-y-2">
              {/* Option A: Barefoot */}
              <button
                type="button"
                onClick={() => setFramework('barefoot')}
                className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  framework === 'barefoot'
                    ? 'bg-[#ff5a36]/15 border-[#ff5a36] shadow-2xs'
                    : theme === 'dark'
                    ? 'bg-[#0f1115] border-white/10 hover:border-white/20'
                    : 'bg-slate-50 border-black/10 hover:border-black/20'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm">Barefoot Style</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#ff5a36]/20 text-[#ff5a36]">
                      RECOMMENDED
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9ca3af] mt-0.5">
                    60% Daily Bills • 20% Fire/Debt • 10% Splurge • 10% Smile
                  </p>
                </div>
                {framework === 'barefoot' && (
                  <Check className="w-5 h-5 text-[#ff5a36] stroke-[2.5]" />
                )}
              </button>

              {/* Option B: 50/30/20 */}
              <button
                type="button"
                onClick={() => setFramework('50-30-20')}
                className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  framework === '50-30-20'
                    ? 'bg-[#ff5a36]/15 border-[#ff5a36] shadow-2xs'
                    : theme === 'dark'
                    ? 'bg-[#0f1115] border-white/10 hover:border-white/20'
                    : 'bg-slate-50 border-black/10 hover:border-black/20'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm">50 / 30 / 20 Rule</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400">
                      CLASSIC
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9ca3af] mt-0.5">
                    50% Needs • 30% Wants (Fun) • 20% Savings
                  </p>
                </div>
                {framework === '50-30-20' && (
                  <Check className="w-5 h-5 text-[#ff5a36] stroke-[2.5]" />
                )}
              </button>

              {/* Option C: Custom PRO */}
              <button
                type="button"
                onClick={() => {
                  if (isProUser) {
                    setFramework('custom');
                  } else {
                    setPremiumModalOpen(true);
                  }
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  framework === 'custom'
                    ? 'bg-[#ff5a36]/15 border-[#ff5a36] shadow-2xs'
                    : theme === 'dark'
                    ? 'bg-[#0f1115] border-white/10 hover:border-white/20'
                    : 'bg-slate-50 border-black/10 hover:border-black/20'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm">Custom Split</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                        isProUser
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {isProUser ? <Sparkles className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                      {isProUser ? 'PRO UNLOCKED' : 'PRO'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9ca3af] mt-0.5">
                    Configure tailored percentage ratios per bucket
                  </p>
                </div>
                {framework === 'custom' ? (
                  <Check className="w-5 h-5 text-[#ff5a36] stroke-[2.5]" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-400" />
                )}
              </button>
            </div>
          </div>

          {/* Custom Pro Percentage Inputs */}
          {framework === 'custom' && (
            <div
              className={`p-4 rounded-2xl border space-y-3 animate-in fade-in ${
                theme === 'dark' ? 'bg-[#0f1115] border-white/10' : 'bg-slate-50 border-black/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9ca3af]">
                  Custom Ratio Allocation
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    totalCustomPct === 100
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  Sum: {totalCustomPct}% {totalCustomPct === 100 ? '✓' : '(Target 100%)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label htmlFor="custom-bills-pct" className="text-[10px] text-[#9ca3af] block mb-1">
                    Bills %
                  </label>
                  <input
                    id="custom-bills-pct"
                    name="customBillsPct"
                    type="number"
                    min="0"
                    max="100"
                    aria-label="Bills percentage"
                    value={customDraft.billsPct}
                    onChange={(e) =>
                      setCustomDraft({
                        ...customDraft,
                        billsPct: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 font-mono-nums font-bold"
                  />
                </div>
                <div>
                  <label htmlFor="custom-splurge-pct" className="text-[10px] text-[#ff5a36] block mb-1">
                    Fun/Splurge %
                  </label>
                  <input
                    id="custom-splurge-pct"
                    name="customSplurgePct"
                    type="number"
                    min="0"
                    max="100"
                    aria-label="Fun and Splurge percentage"
                    value={customDraft.splurgePct}
                    onChange={(e) =>
                      setCustomDraft({
                        ...customDraft,
                        splurgePct: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 font-mono-nums font-bold text-[#ff5a36]"
                  />
                </div>
                <div>
                  <label htmlFor="custom-fire-pct" className="text-[10px] text-[#9ca3af] block mb-1">
                    Fire/Savings %
                  </label>
                  <input
                    id="custom-fire-pct"
                    name="customFirePct"
                    type="number"
                    min="0"
                    max="100"
                    aria-label="Fire and Savings percentage"
                    value={customDraft.firePct}
                    onChange={(e) =>
                      setCustomDraft({
                        ...customDraft,
                        firePct: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 font-mono-nums font-bold"
                  />
                </div>
                <div>
                  <label htmlFor="custom-smile-pct" className="text-[10px] text-emerald-400 block mb-1">
                    Smile Goals %
                  </label>
                  <input
                    id="custom-smile-pct"
                    name="customSmilePct"
                    type="number"
                    min="0"
                    max="100"
                    aria-label="Smile goals percentage"
                    value={customDraft.smilePct}
                    onChange={(e) =>
                      setCustomDraft({
                        ...customDraft,
                        smilePct: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 font-mono-nums font-bold text-emerald-400"
                  />
                </div>
              </div>

              {totalCustomPct !== 100 && (
                <p className="text-[11px] text-amber-400 font-medium">
                  ⚠️ The percentages must add up to exactly 100% to save.
                </p>
              )}
            </div>
          )}

          {/* Real-time Target Breakdown Preview */}
          {currentAmount > 0 && (
            <div
              className={`p-4 rounded-2xl border ${
                theme === 'dark'
                  ? 'bg-[#0f1115] border-white/10'
                  : 'bg-slate-50 border-black/10'
              }`}
            >
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9ca3af] block mb-2">
                New Target Splits Preview
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-white/5 flex justify-between items-center">
                  <span className="text-[#9ca3af]">{previewSplits.splurgeLabel}</span>
                  <span className="font-mono font-bold text-[#ff5a36]">
                    {fmt(previewSplits.splurge)}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 flex justify-between items-center">
                  <span className="text-[#9ca3af]">{previewSplits.billsLabel}</span>
                  <span className="font-mono font-bold">{fmt(previewSplits.bills)}</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 flex justify-between items-center">
                  <span className="text-[#9ca3af]">Fire / Savings</span>
                  <span className="font-mono font-bold">{fmt(previewSplits.fire)}</span>
                </div>
                {previewSplits.smile > 0 && (
                  <div className="p-2 rounded-xl bg-white/5 flex justify-between items-center">
                    <span className="text-[#9ca3af]">Smile Goal</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {fmt(previewSplits.smile)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Data Sovereignty & Offline Backup Card */}
          <div className="pt-2 border-t border-white/5">
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                theme === 'dark' ? 'bg-[#0f1115] border-white/5' : 'bg-slate-50 border-black/5'
              }`}
            >
              <div>
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <HardDriveDownload className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>Data Sovereignty & Export</span>
                </span>
                <p className={`text-[10px] mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  One-click CSV spreadsheet & JSON vault backup
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExportOpen(true)}
                className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold transition cursor-pointer text-[#ff5a36] hover:text-[#e04825]"
              >
                Export
              </button>
            </div>
          </div>

          {/* Reset All Data Area */}
          <div className="pt-2 border-t border-white/5">
            {showConfirmReset ? (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
                <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Are you sure you want to wipe all records?</span>
                </div>
                <p className="text-[11px] text-[#9ca3af]">
                  This clears all logged expenses, streaks, and returns to the initial onboarding screen.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetConfirm}
                    className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs cursor-pointer"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#9ca3af] text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-mono font-bold text-[#9ca3af] hover:text-red-400 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All History & Start Over</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`p-4 px-6 border-t ${
            theme === 'dark' ? 'border-white/10 bg-[#181b20]' : 'border-slate-100 bg-white'
          }`}
        >
          <button
            type="button"
            disabled={currentAmount <= 0 || !isCustomValid}
            onClick={handleSave}
            className={`w-full py-4 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              savedSuccess
                ? 'bg-emerald-500 text-white'
                : 'bg-[#ff5a36] hover:bg-[#e04825] active:scale-98 text-white shadow-ember disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Saved & Recalculated!</span>
              </>
            ) : (
              <span>Save & Update Dashboard</span>
            )}
          </button>
        </div>
      </div>

      {/* Offline Data Sovereignty & Export Modal */}
      <DataExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
};
