import React, { useState } from 'react';
import { X, Crown, Check, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
import { useBarefootStore } from '../store/useBarefootStore';

export const PremiumModal: React.FC = () => {
  const isPremiumModalOpen = useBarefootStore((state) => state.isPremiumModalOpen);
  const setPremiumModalOpen = useBarefootStore((state) => state.setPremiumModalOpen);
  const isProUser = useBarefootStore((state) => state.isProUser);
  const setProUser = useBarefootStore((state) => state.setProUser);

  const [isLoading, setIsLoading] = useState(false);
  const [activatedSuccess, setActivatedSuccess] = useState(false);

  if (!isPremiumModalOpen) return null;

  const handleSubscribe = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setProUser(true);
      setActivatedSuccess(true);

      setTimeout(() => {
        setActivatedSuccess(false);
        setPremiumModalOpen(false);
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-[#181b20] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-[rgba(255,255,255,0.08)] space-y-5">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-2xl bg-[#ff5a36]/15 text-[#ff5a36] border border-[#ff5a36]/30 flex items-center justify-center shadow-xs">
            <Crown className="w-5 h-5" />
          </div>
          <button
            onClick={() => setPremiumModalOpen(false)}
            className="p-1.5 rounded-full text-[#6b7280] hover:text-[#f3f4f6] hover:bg-[#1f232a] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#ff5a36]/15 text-[#ff5a36] border border-[#ff5a36]/30 inline-flex items-center gap-1 mb-2 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#ff5a36]" /> {isProUser ? 'PRO SUBSCRIBER' : 'PRO MODE'}
          </span>
          <h2 className="font-display text-xl font-black text-[#f3f4f6] tracking-tight">
            {isProUser ? 'Pro Engine is Active' : 'Unlock Custom Splits & Pro Engine'}
          </h2>
          <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">
            {isProUser
              ? 'Your subscription is active via Stripe (CellSideStudios). All custom ratios & lessons unlocked.'
              : 'Create tailored percentage ratios for your unique cashflow requirements.'}
          </p>
        </div>

        <div className="bg-[#0f1115] rounded-2xl p-4 border border-[rgba(255,255,255,0.06)] space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-[#f3f4f6] font-medium">
            <Check className="w-4 h-4 text-[#22c55e] shrink-0 stroke-[2.5]" />
            <span>Set custom % ratios (e.g. 70/15/10/5)</span>
          </div>
          <div className="flex items-center gap-2 text-[#f3f4f6] font-medium">
            <Check className="w-4 h-4 text-[#22c55e] shrink-0 stroke-[2.5]" />
            <span>Unlock all 30+ Tactical Micro-Lessons</span>
          </div>
          <div className="flex items-center gap-2 text-[#f3f4f6] font-medium">
            <Check className="w-4 h-4 text-[#22c55e] shrink-0 stroke-[2.5]" />
            <span>Export clean reports & projections</span>
          </div>
          <div className="flex items-center gap-2 text-[#f3f4f6] font-medium">
            <Check className="w-4 h-4 text-[#22c55e] shrink-0 stroke-[2.5]" />
            <span>Real-time cloud sync with Supabase RLS</span>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {isProUser ? (
            <button
              type="button"
              onClick={() => setPremiumModalOpen(false)}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Pro Plan Active</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isLoading || activatedSuccess}
              onClick={handleSubscribe}
              className={`w-full py-3.5 rounded-2xl font-display font-bold text-sm shadow-ember flex items-center justify-center gap-2 transition cursor-pointer ${
                activatedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#ff5a36] hover:bg-[#e04825] active:scale-98 text-white disabled:opacity-50'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting Stripe...</span>
                </>
              ) : activatedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Pro Activated ($2.99 AUD/mo)!</span>
                </>
              ) : (
                <span>Start 7-Day Free Trial ($2.99/mo)</span>
              )}
            </button>
          )}

          <p className="text-[10px] text-center text-[#6b7280] flex items-center justify-center gap-1 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e]" />
            <span>Stripe Security • Cancel anytime in 1-click</span>
          </p>
        </div>
      </div>
    </div>
  );
};
