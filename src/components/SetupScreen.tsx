import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Crown,
  Check,
  Sun,
  Moon,
  Cloud,
} from 'lucide-react';
import { useBarefootStore, type BudgetFramework, getFrameworkSplits } from '../store/useBarefootStore';
import { PremiumModal } from './PremiumModal';
import { BrandLogo } from './BrandLogo';

export const SetupScreen: React.FC = () => {
  const setupPaycheck = useBarefootStore((state) => state.setupPaycheck);
  const setPremiumModalOpen = useBarefootStore((state) => state.setPremiumModalOpen);
  const isProUser = useBarefootStore((state) => state.isProUser);
  const customSplits = useBarefootStore((state) => state.customSplits);
  const theme = useBarefootStore((state) => state.theme);
  const toggleTheme = useBarefootStore((state) => state.toggleTheme);
  const setAuthModalOpen = useBarefootStore((state) => state.setAuthModalOpen);

  // Wizard state: 1 or 2
  const [step, setStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const [amountStr, setAmountStr] = useState('2500');
  const [frequency, setFrequency] = useState<'weekly' | 'fortnightly' | 'monthly'>('fortnightly');
  const [selectedFramework, setSelectedFramework] = useState<BudgetFramework>('barefoot');

  const rawAmount = parseFloat(amountStr) || 0;
  const amount = Math.min(10000000, Math.max(0, rawAmount));
  const previewSplits = getFrameworkSplits(amount, selectedFramework, customSplits);

  const presets = [1500, 2500, 4000, 6000];

  const handleNextStep = () => {
    if (amount <= 0) return;
    setDirection('forward');
    setStep(2);
  };

  const handlePrevStep = () => {
    setDirection('backward');
    setStep(1);
  };

  const handleFrameworkSelect = (framework: BudgetFramework) => {
    if (framework === 'custom' && !isProUser) {
      setPremiumModalOpen(true);
      return;
    }
    setSelectedFramework(framework);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    setupPaycheck(amount, selectedFramework, frequency);
  };

  return (
    <div
      data-theme={theme}
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-[#0b0f19] text-[#f1f5f9]' : 'bg-[#f7f5f0] text-[#0f172a]'
      } flex flex-col justify-between p-5 sm:p-6 max-w-md mx-auto font-sans transition-colors duration-300 select-none`}
    >
      {/* Top Bar with Brand Logo & Theme Toggle */}
      <header className="pt-2 flex items-center justify-between">
        <BrandLogo size="md" showWordmark={true} />

        <div className="flex items-center gap-2">
          {/* Sign In Cloud Trigger */}
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 ${
              theme === 'dark'
                ? 'bg-[#131b2e] hover:bg-[#1a253e] text-[#94a3b8] hover:text-white border-white/10'
                : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-black/10'
            }`}
            title="Sign in to restore existing data"
          >
            <Cloud className="w-3.5 h-3.5 text-slate-400" />
            <span>Sign In</span>
          </button>

          {/* Step Progress Pill */}
          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
              theme === 'dark'
                ? 'bg-[#131b2e] text-[#94a3b8] border-white/10'
                : 'bg-white text-slate-600 border-black/10'
            }`}
          >
            Step {step} of 2
          </span>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition cursor-pointer border ${
              theme === 'dark'
                ? 'bg-[#131b2e] hover:bg-[#1a253e] text-amber-400 border-white/10'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-black/10'
            }`}
            title="Toggle Dark / Light Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Wizard Progress Line */}
      <div className="my-3">
        <div
          className={`h-1.5 w-full rounded-full overflow-hidden ${
            theme === 'dark' ? 'bg-[#131b2e]' : 'bg-slate-200'
          }`}
        >
          <div
            className="h-full bg-[#ff5a36] rounded-full transition-all duration-300 ease-out shadow-glow-ember-sm"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
      </div>

      {/* Main Form Content with Slide Transitions */}
      <div className="my-auto py-2">
        {step === 1 ? (
          /* STEP 1: Let's set your baseline */
          <div
            className={`space-y-5 ${
              direction === 'forward' ? 'anim-slide-in-left' : 'anim-slide-in-left'
            }`}
          >
            <div className="text-center space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#ff5a36]">
                Step 1 of 2
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                Let's set your baseline
              </h1>
              <p
                className={`text-xs max-w-xs mx-auto leading-relaxed ${
                  theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'
                }`}
              >
                How much take-home pay lands in your account each cycle?
              </p>
            </div>

            {/* Income Input Card */}
            <div
              className={`rounded-3xl p-6 border shadow-workshop space-y-4 relative overflow-hidden transition-colors ${
                theme === 'dark'
                  ? 'bg-[#131b2e] border-white/10'
                  : 'bg-white border-black/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                    theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-400'
                  }`}
                >
                  Net Paycheck
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                  AFTER TAX
                </span>
              </div>

              <div className="relative flex items-center justify-center py-2">
                <span
                  className={`font-display text-3xl font-bold mr-1 select-none ${
                    theme === 'dark' ? 'text-[#64748b]' : 'text-slate-300'
                  }`}
                >
                  $
                </span>
                <input
                  id="setup-income-amount"
                  name="incomeAmount"
                  type="number"
                  min="1"
                  max="10000000"
                  step="any"
                  aria-label="Net Paycheck Amount"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="0"
                  autoFocus
                  className="w-48 text-center font-display text-4xl sm:text-5xl font-black bg-transparent focus:outline-hidden tracking-tight"
                />
              </div>

              {/* Quick Select Presets */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmountStr(preset.toString())}
                    className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl border transition cursor-pointer ${
                      amount === preset
                        ? 'bg-[#ff5a36]/20 text-[#ff5a36] border-[#ff5a36]/50'
                        : theme === 'dark'
                        ? 'bg-[#0e1424] text-[#94a3b8] border-white/5 hover:border-white/20'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    ${preset.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Frequency Selector */}
              <div
                className={`grid grid-cols-3 gap-1 p-1 rounded-2xl border ${
                  theme === 'dark'
                    ? 'bg-[#0e1424] border-white/5'
                    : 'bg-slate-100 border-slate-200'
                }`}
              >
                {(['weekly', 'fortnightly', 'monthly'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFrequency(freq)}
                    className={`py-2 text-xs font-semibold rounded-xl capitalize transition-all cursor-pointer ${
                      frequency === freq
                        ? 'bg-[#ff5a36] text-white shadow-xs font-bold'
                        : theme === 'dark'
                        ? 'text-[#94a3b8] hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {freq === 'fortnightly' ? 'Fortnight' : freq}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 1 CTA */}
            <button
              type="button"
              disabled={amount <= 0}
              onClick={handleNextStep}
              className="w-full py-4 px-6 rounded-2xl bg-[#ff5a36] hover:bg-[#e04825] active:scale-98 tap-bounce text-white font-display font-bold text-base shadow-ember flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continue to Budget Style</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* STEP 2: Choose your style */
          <div className="space-y-4 anim-slide-in-right">
            {/* Back Button */}
            <button
              type="button"
              onClick={handlePrevStep}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer p-1 ${
                theme === 'dark' ? 'text-[#94a3b8] hover:text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Income</span>
            </button>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#ff5a36]">
                Step 2 of 2
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                Choose your style
              </h1>
              <p
                className={`text-xs max-w-xs mx-auto leading-relaxed ${
                  theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'
                }`}
              >
                Select the cashflow rule that best fits your lifestyle.
              </p>
            </div>

            {/* Framework Options */}
            <div className="space-y-2">
              {/* Option A: Barefoot Style */}
              <div
                onClick={() => handleFrameworkSelect('barefoot')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedFramework === 'barefoot'
                    ? 'border-[#ff5a36] shadow-glow-ember-sm ' +
                      (theme === 'dark' ? 'bg-[#1a253e]' : 'bg-orange-50/70')
                    : (theme === 'dark'
                        ? 'bg-[#131b2e] border-white/10 hover:border-white/20'
                        : 'bg-white border-black/10 hover:border-black/20')
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      selectedFramework === 'barefoot'
                        ? 'border-[#ff5a36] bg-[#ff5a36] text-white'
                        : 'border-[#64748b] bg-transparent'
                    }`}
                  >
                    {selectedFramework === 'barefoot' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-sm font-bold">Barefoot Style</h3>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-[#ff5a36]/20 text-[#ff5a36] border border-[#ff5a36]/30">
                        Popular
                      </span>
                    </div>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'
                      }`}
                    >
                      60% Daily • 20% Debt • 10% Splurge • 10% Smile
                    </p>
                  </div>
                </div>
              </div>

              {/* Option B: The 50/30/20 Rule */}
              <div
                onClick={() => handleFrameworkSelect('50-30-20')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedFramework === '50-30-20'
                    ? 'border-[#ff5a36] shadow-glow-ember-sm ' +
                      (theme === 'dark' ? 'bg-[#1a253e]' : 'bg-orange-50/70')
                    : (theme === 'dark'
                        ? 'bg-[#131b2e] border-white/10 hover:border-white/20'
                        : 'bg-white border-black/10 hover:border-black/20')
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      selectedFramework === '50-30-20'
                        ? 'border-[#ff5a36] bg-[#ff5a36] text-white'
                        : 'border-[#64748b] bg-transparent'
                    }`}
                  >
                    {selectedFramework === '50-30-20' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-sm font-bold">The 50/30/20 Rule</h3>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                          theme === 'dark'
                            ? 'bg-white/10 text-slate-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Classic
                      </span>
                    </div>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'
                      }`}
                    >
                      50% Needs • 30% Wants • 20% Savings
                    </p>
                  </div>
                </div>
              </div>

              {/* Option C: Custom Split */}
              <div
                onClick={() => handleFrameworkSelect('custom')}
                className={`p-3.5 rounded-2xl border border-dashed border-[#ff5a36]/40 transition-all cursor-pointer flex items-center justify-between group ${
                  theme === 'dark'
                    ? 'bg-[#131b2e]/60 hover:bg-[#1a253e]'
                    : 'bg-amber-50/40 hover:bg-amber-50/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ff5a36]/20 text-[#ff5a36] flex items-center justify-center">
                    <Lock className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-sm font-bold">Custom Split</h3>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-[#ff5a36]/20 text-[#ff5a36] inline-flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5" /> PRO
                      </span>
                    </div>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'
                      }`}
                    >
                      Precision formula & ratios
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-[#ff5a36] group-hover:underline">
                  Unlock →
                </span>
              </div>
            </div>

            {/* Live Preview Card */}
            <div
              className={`rounded-2xl p-4 border space-y-2 text-xs ${
                theme === 'dark'
                  ? 'bg-[#131b2e] border-white/10'
                  : 'bg-white border-black/10'
              }`}
            >
              <div className="flex items-center justify-between font-bold pb-1.5 border-b border-white/5">
                <span className="flex items-center gap-1.5 text-[#ff5a36]">
                  <Sparkles className="w-3.5 h-3.5" />
                  {previewSplits.frameworkName} Preview
                </span>
                <span className="font-mono-nums text-slate-400">
                  ${amount.toLocaleString()} / {frequency}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div
                  className={`p-2.5 rounded-xl border ${
                    theme === 'dark'
                      ? 'bg-[#0e1424] border-white/5'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="text-[9px] font-mono font-bold text-[#ff5a36] uppercase tracking-wider block">
                    {previewSplits.splurgeLabel} ({previewSplits.splurgePct}%)
                  </span>
                  <span className="font-display text-lg font-black text-[#ff5a36]">
                    ${Math.round(previewSplits.splurge).toLocaleString()}
                  </span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border ${
                    theme === 'dark'
                      ? 'bg-[#0e1424] border-white/5'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span
                    className={`text-[9px] font-mono font-bold uppercase tracking-wider block ${
                      theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'
                    }`}
                  >
                    {previewSplits.billsLabel} ({previewSplits.billsPct}%)
                  </span>
                  <span className="font-display text-lg font-black">
                    ${Math.round(previewSplits.bills).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Launch Dashboard Button */}
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="w-full py-4 px-6 rounded-2xl bg-[#ff5a36] hover:bg-[#e04825] active:scale-98 tap-bounce text-white font-display font-bold text-base shadow-ember flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Complete Setup & Launch Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <footer className="text-center pb-2 text-[11px] text-[#64748b] flex items-center justify-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
        <span>Stored securely on device • Calming & stress-free</span>
      </footer>

      <PremiumModal />
    </div>
  );
};
