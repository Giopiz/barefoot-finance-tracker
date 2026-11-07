import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useBarefootStore } from '../store/useBarefootStore';
import { supabase } from '../utils/supabase/client';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const storeIsOpen = useBarefootStore((state) => state.isAuthModalOpen);
  const setStoreIsOpen = useBarefootStore((state) => state.setAuthModalOpen);
  const user = useBarefootStore((state) => state.user);
  const isCloudSyncing = useBarefootStore((state) => state.isCloudSyncing);
  const lastSyncedAt = useBarefootStore((state) => state.lastSyncedAt);
  const syncWithCloud = useBarefootStore((state) => state.syncWithCloud);
  const signOut = useBarefootStore((state) => state.signOut);
  const theme = useBarefootStore((state) => state.theme);

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
  const handleClose = () => {
    if (propOnClose) propOnClose();
    setStoreIsOpen(false);
  };

  const [mode, setMode] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Close on Escape & Lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Reset transient form state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setLoading(false);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (mode !== 'magic' && (!password || password.length < 6)) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
        setSuccessMessage('Signed in successfully! Syncing your data...');
        setTimeout(() => {
          handleClose();
        }, 800);
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setSuccessMessage(
          'Account created! If confirmation is required, please check your inbox.'
        );
      } else if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setSuccessMessage('✨ Magic Link sent! Check your inbox to sign in instantly.');
      }
    } catch (err: any) {
      console.error('Supabase Auth Error:', err);
      const msg = err.message || 'Authentication failed. Please check your credentials.';
      if (msg.includes('Invalid login credentials')) {
        setErrorMessage('Incorrect email or password. Please try again.');
      } else if (msg.includes('User already registered')) {
        setErrorMessage('An account with this email already exists. Try signing in.');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForceSync = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await syncWithCloud();
      setSuccessMessage('Cloud sync complete!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sync with cloud.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      handleClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-sm rounded-3xl border shadow-2xl p-6 relative transition-all duration-200 overflow-hidden ${
          theme === 'dark'
            ? 'bg-[#131b2e] border-white/10 text-white shadow-black/80'
            : 'bg-white border-black/10 text-slate-900 shadow-slate-300/60'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Ember ambient glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#ff5a36]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36]">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-base font-bold font-display tracking-tight leading-snug">
                {user ? 'Cloud Account' : 'Cloud Backup & Sync'}
              </h2>
              <p
                className={`text-[11px] ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {user ? 'Connected with Supabase' : 'Sync your buckets across devices'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className={`p-1.5 rounded-full transition cursor-pointer ${
              theme === 'dark'
                ? 'hover:bg-white/10 text-slate-400 hover:text-white'
                : 'hover:bg-black/5 text-slate-500 hover:text-black'
            }`}
            aria-label="Close authentication modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ALREADY LOGGED IN VIEW */}
        {user ? (
          <div className="space-y-4 relative z-10 py-1">
            <div
              className={`p-3.5 rounded-2xl border ${
                theme === 'dark'
                  ? 'bg-black/20 border-white/10 text-slate-200'
                  : 'bg-slate-50 border-black/5 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center text-[#10b981]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#10b981] font-bold">
                    Connected Account
                  </div>
                  <div className="text-xs font-semibold truncate text-white">
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                  Sync Status:
                </span>
                <span className="flex items-center gap-1.5 font-bold text-[#10b981]">
                  <span
                    className={`w-2 h-2 rounded-full bg-[#10b981] ${
                      isCloudSyncing ? 'animate-ping' : ''
                    }`}
                  />
                  {isCloudSyncing ? 'Syncing...' : lastSyncedAt ? `Synced at ${lastSyncedAt}` : 'Ready'}
                </span>
              </div>
            </div>

            {successMessage && (
              <div
                role="status"
                className="p-2.5 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleForceSync}
                disabled={loading || isCloudSyncing}
                className="w-full py-2.5 px-3 rounded-xl bg-[#ff5a36] hover:bg-[#e04825] active:scale-98 disabled:opacity-50 text-white text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 cursor-pointer shadow-ember"
              >
                {loading || isCloudSyncing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>Sync Now</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  theme === 'dark'
                    ? 'border-white/10 hover:border-red-500/40 text-slate-300 hover:text-red-400 bg-white/5'
                    : 'border-black/10 hover:border-red-500/40 text-slate-700 hover:text-red-600 bg-black/5'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* NOT LOGGED IN AUTH FORMS */
          <div className="relative z-10">
            {/* Tabs */}
            <div className="flex p-0.5 rounded-xl bg-black/30 border border-white/5 mb-4">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-[#ff5a36] text-white shadow-xs'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#ff5a36] text-white shadow-xs'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setMode('magic')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                  mode === 'magic'
                    ? 'bg-[#ff5a36] text-white shadow-xs'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>Magic Link</span>
              </button>
            </div>

            {/* Error & Success Messages */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-3 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="mb-3 p-2.5 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="auth-email-input"
                  className={`block text-[11px] font-mono font-medium mb-1 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                      theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  />
                  <input
                    id="auth-email-input"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border transition outline-none font-mono ${
                      theme === 'dark'
                        ? 'bg-black/30 border-white/10 text-white focus:border-[#ff5a36] focus:ring-1 focus:ring-[#ff5a36]'
                        : 'bg-slate-50 border-black/10 text-slate-900 focus:border-[#ff5a36] focus:ring-1 focus:ring-[#ff5a36]'
                    }`}
                  />
                </div>
              </div>

              {/* Password Input (Hidden for Magic Link) */}
              {mode !== 'magic' && (
                <div>
                  <label
                    htmlFor="auth-password-input"
                    className={`block text-[11px] font-mono font-medium mb-1 ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                        theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    />
                    <input
                      id="auth-password-input"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signin' ? '••••••••' : 'Min. 6 characters'}
                      className={`w-full pl-9 pr-9 py-2 text-xs rounded-xl border transition outline-none font-mono ${
                        theme === 'dark'
                          ? 'bg-black/30 border-white/10 text-white focus:border-[#ff5a36] focus:ring-1 focus:ring-[#ff5a36]'
                          : 'bg-slate-50 border-black/10 text-slate-900 focus:border-[#ff5a36] focus:ring-1 focus:ring-[#ff5a36]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`p-1 absolute right-2.5 top-1/2 -translate-y-1/2 ${
                        theme === 'dark'
                          ? 'text-slate-500 hover:text-slate-300'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#ff5a36] hover:bg-[#e04825] active:scale-98 disabled:opacity-50 text-white font-bold text-xs transition shadow-ember flex items-center justify-center gap-1.5 cursor-pointer font-display"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    {mode === 'signin' && <span>Sign In</span>}
                    {mode === 'signup' && <span>Create Account</span>}
                    {mode === 'magic' && (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Send Magic Link</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </form>

            {/* Offline Local Guarantee Note */}
            <p
              className={`text-[10px] text-center mt-3 font-mono ${
                theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              🔒 100% private. Your device always operates offline-first with zero lag.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
