import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../utils/supabase/client';

export type BudgetFramework = 'barefoot' | '50-30-20' | 'custom';

export interface AuthUser {
  id: string;
  email: string;
}

export interface ExpenseRecord {
  id: string;
  amount: number;
  category: 'splurge' | 'bill';
  note?: string;
  timestamp: number;
}

export interface PaycheckConfig {
  amount: number;
  isConfigured: boolean;
  frequency: 'weekly' | 'fortnightly' | 'monthly';
  framework: BudgetFramework;
}

export interface LessonItem {
  id: string;
  title: string;
  tag: string;
  readTime: string;
  summary: string;
  keyTakeaways: string[];
  actionPrompt: string;
  hasQuickAction?: boolean;
}

export interface BarefootState {
  // Paycheck setup
  paycheck: PaycheckConfig;

  // Running Balances
  splurgeBalance: number; // or "Wants" in 50/30/20
  billsBalance: number;   // or "Needs" in 50/30/20
  smileBalance: number;   // or "Goals"
  fireBalance: number;    // or "Savings/Debt/Mojo"

  // Expense History
  expenses: ExpenseRecord[];

  // Total paychecks logged
  paydayCount: number;

  // Gamification & Habit Streaks
  streakCount: number;
  lastLoggedDate: string | null;

  // Academy Micro-Learning State
  readLessonIds: string[];
  activeLessonIndex: number;
  lastSavingsActionNote: string | null;

  // Premium Modal State & Pro Tier
  isPremiumModalOpen: boolean;
  isProUser: boolean;
  customSplits: { billsPct: number; splurgePct: number; firePct: number; smilePct: number };

  // Supabase Auth & Cloud Sync State
  user: AuthUser | null;
  isAuthModalOpen: boolean;
  isCloudSyncing: boolean;
  lastSyncedAt: string | null;
  cloudSyncError: string | null;

  // Theme & Appearance (Calming Dark Slate / Navy vs Warm Light)
  theme: 'dark' | 'light';

  // Actions
  setupPaycheck: (
    amount: number,
    framework: BudgetFramework,
    frequency?: 'weekly' | 'fortnightly' | 'monthly'
  ) => void;
  updateBaseline: (
    amount: number,
    framework: BudgetFramework,
    frequency?: 'weekly' | 'fortnightly' | 'monthly'
  ) => void;
  setFramework: (framework: BudgetFramework) => void;
  toggleTheme: () => void;
  logExpense: (amount: number, category: 'splurge' | 'bill', note?: string) => void;
  deleteExpense: (id: string) => void;
  triggerPayday: () => void;
  moveMoneyToSavings: (amount?: number) => void;
  clearSavingsActionNote: () => void;
  markLessonRead: (id: string) => void;
  setActiveLessonIndex: (index: number) => void;
  setPremiumModalOpen: (open: boolean) => void;
  setProUser: (pro: boolean) => void;
  setCustomSplits: (splits: { billsPct: number; splurgePct: number; firePct: number; smilePct: number }) => void;
  setAuthModalOpen: (open: boolean) => void;
  setUser: (user: AuthUser | null) => void;
  initAuth: () => Promise<void>;
  syncWithCloud: () => Promise<void>;
  pushLocalToCloud: () => Promise<void>;
  signOut: () => Promise<void>;
  restoreFromBackup: (backup: any) => void;
  resetAll: () => void;
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Math calculation helper based on selected framework
export function getFrameworkSplits(
  amount: number,
  framework: BudgetFramework,
  customSplits?: { billsPct: number; splurgePct: number; firePct: number; smilePct: number }
) {
  if (framework === 'custom') {
    const custom = customSplits || { billsPct: 60, splurgePct: 15, firePct: 15, smilePct: 10 };
    return {
      bills: (amount * custom.billsPct) / 100,
      splurge: (amount * custom.splurgePct) / 100,
      fire: (amount * custom.firePct) / 100,
      smile: (amount * custom.smilePct) / 100,
      billsPct: custom.billsPct,
      splurgePct: custom.splurgePct,
      firePct: custom.firePct,
      smilePct: custom.smilePct,
      splurgeLabel: 'Fun Left',
      billsLabel: 'Bills Left',
      frameworkName: 'Custom Split (PRO)',
    };
  }

  if (framework === '50-30-20') {
    // 50% Needs (Bills), 30% Wants (Splurge), 20% Savings (Fire), 0% Smile
    return {
      bills: amount * 0.5,
      splurge: amount * 0.3,
      fire: amount * 0.2,
      smile: amount * 0.0,
      billsPct: 50,
      splurgePct: 30,
      firePct: 20,
      smilePct: 0,
      splurgeLabel: 'Wants Left',
      billsLabel: 'Needs Left',
      frameworkName: '50/30/20 Rule',
    };
  }

  // Default: Barefoot Style (60% Daily, 20% Fire/Debt, 10% Splurge, 10% Smile)
  return {
    bills: amount * 0.6,
    splurge: amount * 0.1,
    fire: amount * 0.2,
    smile: amount * 0.1,
    billsPct: 60,
    splurgePct: 10,
    firePct: 20,
    smilePct: 10,
    splurgeLabel: 'Splurge Left',
    billsLabel: 'Bills Left',
    frameworkName: 'Barefoot Style',
  };
}

export const useBarefootStore = create<BarefootState>()(
  persist(
    (set, get) => ({
      paycheck: {
        amount: 0,
        isConfigured: false,
        frequency: 'fortnightly',
        framework: 'barefoot',
      },
      splurgeBalance: 0,
      billsBalance: 0,
      smileBalance: 0,
      fireBalance: 0,
      expenses: [],
      paydayCount: 0,
      streakCount: 1, // Start on Day 1 to encourage user
      lastLoggedDate: null,
      readLessonIds: [],
      activeLessonIndex: 0,
      lastSavingsActionNote: null,
      isPremiumModalOpen: false,
      isProUser: false,
      customSplits: { billsPct: 60, splurgePct: 15, firePct: 15, smilePct: 10 },

      // Supabase Auth & Cloud Sync initial state
      user: null,
      isAuthModalOpen: false,
      isCloudSyncing: false,
      lastSyncedAt: null,
      cloudSyncError: null,

      theme: 'dark', // Defaults to calming deep navy / dark slate

      setAuthModalOpen: (open: boolean) => set({ isAuthModalOpen: open }),
      setUser: (user: AuthUser | null) => set({ user }),

      initAuth: async () => {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            const u = data.session.user;
            set({ user: { id: u.id, email: u.email || 'user@barefoot.app' } });
            get().syncWithCloud();
          }

          supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              set({ user: { id: session.user.id, email: session.user.email || 'user@barefoot.app' } });
              get().syncWithCloud();
            } else {
              set({ user: null, lastSyncedAt: null });
            }
          });
        } catch (err: any) {
          console.error('Failed to init Supabase auth:', err);
        }
      },

      syncWithCloud: async () => {
        const { user } = get();
        if (!user) return;

        set({ isCloudSyncing: true, cloudSyncError: null });

        try {
          // 1. Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          // 2. Fetch buckets
          const { data: buckets } = await supabase
            .from('buckets')
            .select('*')
            .eq('user_id', user.id);

          // 3. Fetch transactions
          const { data: txs } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100);

          if (profile && buckets && buckets.length > 0) {
            const splurgeBucket = buckets.find((b) => b.type === 'splurge');
            const billsBucket = buckets.find((b) => b.type === 'bill');
            const fireBucket = buckets.find((b) => b.type === 'savings');
            const smileBucket = buckets.find((b) => b.type === 'goal');

            const formattedExpenses: ExpenseRecord[] = (txs || []).map((t) => ({
              id: t.id,
              amount: Number(t.amount) || 0,
              category: t.type === 'bill' ? 'bill' : 'splurge',
              note: t.description || undefined,
              timestamp: new Date(t.created_at).getTime(),
            }));

            set({
              paycheck: {
                amount: Number(profile.monthly_income) || get().paycheck.amount,
                framework: (profile.budget_framework as BudgetFramework) || 'barefoot',
                frequency: get().paycheck.frequency,
                isConfigured: true,
              },
              streakCount: Number(profile.current_streak) || 1,
              isProUser: Boolean(profile.is_pro ?? get().isProUser),
              splurgeBalance: splurgeBucket ? Number(splurgeBucket.balance) : get().splurgeBalance,
              billsBalance: billsBucket ? Number(billsBucket.balance) : get().billsBalance,
              fireBalance: fireBucket ? Number(fireBucket.balance) : get().fireBalance,
              smileBalance: smileBucket ? Number(smileBucket.balance) : get().smileBalance,
              expenses: formattedExpenses.length > 0 ? formattedExpenses : get().expenses,
              lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isCloudSyncing: false,
            });
          } else {
            // First time login: seed cloud with current local configuration
            await get().pushLocalToCloud();
          }
        } catch (err: any) {
          console.error('Failed to sync with Supabase:', err);
          set({
            isCloudSyncing: false,
            cloudSyncError: err.message || 'Cloud sync unavailable',
          });
        }
      },

      pushLocalToCloud: async () => {
        const { user, paycheck, splurgeBalance, billsBalance, fireBalance, smileBalance, streakCount, customSplits } = get();
        if (!user) return;

        set({ isCloudSyncing: true, cloudSyncError: null });

        try {
          const splits = getFrameworkSplits(paycheck.amount, paycheck.framework, customSplits);

          // Upsert Profile
          await supabase.from('profiles').upsert({
            id: user.id,
            monthly_income: paycheck.amount,
            budget_framework: paycheck.framework,
            current_streak: streakCount,
            is_pro: get().isProUser,
          });

          // Upsert / Seed Buckets
          const defaultBuckets = [
            { user_id: user.id, name: splits.splurgeLabel, type: 'splurge', balance: splurgeBalance, target_percentage: splits.splurgePct },
            { user_id: user.id, name: splits.billsLabel, type: 'bill', balance: billsBalance, target_percentage: splits.billsPct },
            { user_id: user.id, name: 'Fire / Savings', type: 'savings', balance: fireBalance, target_percentage: splits.firePct },
            { user_id: user.id, name: 'Smile Goal', type: 'goal', balance: smileBalance, target_percentage: splits.smilePct },
          ];

          for (const b of defaultBuckets) {
            const { data: existing } = await supabase
              .from('buckets')
              .select('id')
              .eq('user_id', user.id)
              .eq('type', b.type)
              .maybeSingle();

            if (existing) {
              await supabase.from('buckets').update(b).eq('id', existing.id);
            } else {
              await supabase.from('buckets').insert(b);
            }
          }

          set({
            isCloudSyncing: false,
            lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        } catch (err: any) {
          console.error('Failed pushing to Supabase:', err);
          set({ isCloudSyncing: false, cloudSyncError: err.message || 'Push failed' });
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.error('Error signing out:', err);
        }
        set({ user: null, lastSyncedAt: null });
      },

      setProUser: (pro: boolean) => set({ isProUser: pro }),
      setCustomSplits: (splits) => {
        set({ customSplits: splits });
        const { paycheck } = get();
        if (paycheck.framework === 'custom') {
          get().updateBaseline(paycheck.amount, 'custom', paycheck.frequency);
        }
      },

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      setupPaycheck: (amount: number, framework = 'barefoot', frequency = 'fortnightly') => {
        const valid = Math.min(10000000, Math.max(0, Number.isFinite(amount) ? amount : 0));
        const { customSplits } = get();
        const splits = getFrameworkSplits(valid, framework, customSplits);

        set({
          paycheck: {
            amount: valid,
            isConfigured: true,
            frequency,
            framework,
          },
          billsBalance: splits.bills,
          fireBalance: splits.fire,
          splurgeBalance: splits.splurge,
          smileBalance: splits.smile,
          paydayCount: 1,
        });
      },

      updateBaseline: (amount: number, framework = 'barefoot', frequency = 'fortnightly') => {
        const valid = Math.min(10000000, Math.max(0, Number.isFinite(amount) ? amount : 0));
        const { expenses, customSplits } = get();
        const splits = getFrameworkSplits(valid, framework, customSplits);

        // Calculate total spent in current cycle so balance adjusts intelligently without losing history
        const spentSplurge = expenses
          .filter((e) => e.category === 'splurge')
          .reduce((acc, e) => acc + (Number.isFinite(e.amount) ? e.amount : 0), 0);
        const spentBills = expenses
          .filter((e) => e.category === 'bill')
          .reduce((acc, e) => acc + (Number.isFinite(e.amount) ? e.amount : 0), 0);

        set({
          paycheck: {
            amount: valid,
            isConfigured: true,
            frequency,
            framework,
          },
          billsBalance: splits.bills - spentBills,
          fireBalance: splits.fire,
          splurgeBalance: splits.splurge - spentSplurge,
          smileBalance: splits.smile,
        });
      },

      setFramework: (framework: BudgetFramework) => {
        const { paycheck, customSplits } = get();
        if (paycheck.amount > 0) {
          const splits = getFrameworkSplits(paycheck.amount, framework, customSplits);
          set({
            paycheck: { ...paycheck, framework },
            billsBalance: splits.bills,
            fireBalance: splits.fire,
            splurgeBalance: splits.splurge,
            smileBalance: splits.smile,
          });
        } else {
          set({
            paycheck: { ...paycheck, framework },
          });
        }
      },

      logExpense: (amount: number, category: 'splurge' | 'bill', note?: string) => {
        if (!Number.isFinite(amount) || amount <= 0) return;
        const validAmount = Math.min(10000000, Math.round(amount * 100) / 100);

        const { paycheck, splurgeBalance, billsBalance, expenses, streakCount, lastLoggedDate } = get();
        const today = getTodayString();

        // Streak check: increase the streak by 1 every time user logs on a new day
        let newStreak = streakCount || 0;
        if (!lastLoggedDate) {
          newStreak = 1;
        } else if (lastLoggedDate !== today) {
          newStreak = (streakCount || 0) + 1;
        }

        const defaultNote =
          category === 'splurge'
            ? paycheck.framework === '50-30-20'
              ? 'Wants item'
              : 'Splurge item'
            : paycheck.framework === '50-30-20'
            ? 'Needs payment'
            : 'Bill payment';

        const sanitizedNote = (note?.trim() || defaultNote).slice(0, 80);

        const newRecord: ExpenseRecord = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
          amount: validAmount,
          category,
          note: sanitizedNote,
          timestamp: Date.now(),
        };

        if (category === 'splurge') {
          set({
            splurgeBalance: Math.max(-999999, splurgeBalance - validAmount),
            expenses: [newRecord, ...expenses],
            streakCount: newStreak,
            lastLoggedDate: today,
          });
        } else {
          set({
            billsBalance: Math.max(-999999, billsBalance - validAmount),
            expenses: [newRecord, ...expenses],
            streakCount: newStreak,
            lastLoggedDate: today,
          });
        }

        const currentUser = get().user;
        if (currentUser) {
          (async () => {
            try {
              await supabase.from('transactions').insert({
                user_id: currentUser.id,
                amount: validAmount,
                type: category,
                description: sanitizedNote,
              });
              await get().pushLocalToCloud();
            } catch (err) {
              console.error('Cloud transaction sync failed:', err);
            }
          })();
        }
      },

      deleteExpense: (id: string) => {
        const { expenses, splurgeBalance, billsBalance, user } = get();
        const target = expenses.find((e) => e.id === id);
        if (!target) return;
        const restoreAmount = Number.isFinite(target.amount) ? target.amount : 0;

        if (target.category === 'splurge') {
          set({
            splurgeBalance: splurgeBalance + restoreAmount,
            expenses: expenses.filter((e) => e.id !== id),
          });
        } else {
          set({
            billsBalance: billsBalance + restoreAmount,
            expenses: expenses.filter((e) => e.id !== id),
          });
        }

        if (user) {
          (async () => {
            try {
              await supabase
                .from('transactions')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);
              await get().pushLocalToCloud();
            } catch (err) {
              console.error('Cloud delete failed:', err);
            }
          })();
        }
      },

      moveMoneyToSavings: (amount = 5) => {
        if (!Number.isFinite(amount) || amount <= 0) return;
        const validAmount = Math.min(100000, Math.round(amount * 100) / 100);

        const { splurgeBalance, billsBalance, fireBalance, expenses } = get();
        // Take from splurge if positive, otherwise from bills
        const fromSplurge = splurgeBalance >= validAmount;
        const newRecord: ExpenseRecord = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
          amount: validAmount,
          category: fromSplurge ? 'splurge' : 'bill',
          note: '⚡ Academy Action: Moved $5 to Savings Vault',
          timestamp: Date.now(),
        };

        set({
          splurgeBalance: fromSplurge ? splurgeBalance - validAmount : splurgeBalance,
          billsBalance: !fromSplurge ? billsBalance - validAmount : billsBalance,
          fireBalance: fireBalance + validAmount,
          expenses: [newRecord, ...expenses],
          lastSavingsActionNote: `+$${validAmount} successfully moved to your Mojo Savings Vault! 🎉`,
        });
      },

      clearSavingsActionNote: () => {
        set({ lastSavingsActionNote: null });
      },

      triggerPayday: () => {
        const { paycheck, splurgeBalance, billsBalance, smileBalance, fireBalance, paydayCount, customSplits } = get();
        if (!paycheck.isConfigured || paycheck.amount <= 0) return;

        const splits = getFrameworkSplits(paycheck.amount, paycheck.framework, customSplits);

        set({
          splurgeBalance: splurgeBalance + splits.splurge,
          billsBalance: billsBalance + splits.bills,
          smileBalance: smileBalance + splits.smile,
          fireBalance: fireBalance + splits.fire,
          paydayCount: paydayCount + 1,
        });
      },

      markLessonRead: (id: string) => {
        const { readLessonIds } = get();
        if (!readLessonIds.includes(id)) {
          set({ readLessonIds: [...readLessonIds, id] });
        }
      },

      setActiveLessonIndex: (index: number) => {
        set({ activeLessonIndex: index });
      },

      setPremiumModalOpen: (open: boolean) => {
        set({ isPremiumModalOpen: open });
      },

      restoreFromBackup: (backup: any) => {
        if (!backup || typeof backup !== 'object') return;

        const paycheck = backup.paycheck || get().paycheck;
        const balances = backup.balances || {};
        const expenses = Array.isArray(backup.expenses) ? backup.expenses : get().expenses;

        set({
          paycheck: {
            amount: Number(paycheck.amount) || get().paycheck.amount,
            isConfigured: Boolean(paycheck.isConfigured ?? true),
            frequency: paycheck.frequency || get().paycheck.frequency,
            framework: paycheck.framework || get().paycheck.framework,
          },
          splurgeBalance: balances.splurgeBalance !== undefined ? Number(balances.splurgeBalance) : get().splurgeBalance,
          billsBalance: balances.billsBalance !== undefined ? Number(balances.billsBalance) : get().billsBalance,
          fireBalance: balances.fireBalance !== undefined ? Number(balances.fireBalance) : get().fireBalance,
          smileBalance: balances.smileBalance !== undefined ? Number(balances.smileBalance) : get().smileBalance,
          customSplits: backup.customSplits || get().customSplits,
          expenses,
          paydayCount: Number(backup.paydayCount) || get().paydayCount,
          streakCount: Number(backup.streakCount) || get().streakCount,
          readLessonIds: Array.isArray(backup.readLessonIds) ? backup.readLessonIds : get().readLessonIds,
          isProUser: backup.isProUser !== undefined ? Boolean(backup.isProUser) : get().isProUser,
        });

        if (get().user) {
          get().pushLocalToCloud();
        }
      },

      resetAll: () => {
        set({
          paycheck: {
            amount: 0,
            isConfigured: false,
            frequency: 'fortnightly',
            framework: 'barefoot',
          },
          splurgeBalance: 0,
          billsBalance: 0,
          smileBalance: 0,
          fireBalance: 0,
          expenses: [],
          paydayCount: 0,
          streakCount: 1,
          lastLoggedDate: null,
          readLessonIds: [],
          activeLessonIndex: 0,
          lastSavingsActionNote: null,
          isPremiumModalOpen: false,
          isProUser: false,
          customSplits: { billsPct: 60, splurgePct: 15, firePct: 15, smilePct: 10 },
          theme: 'dark',
        });
      },
    }),
    {
      name: 'barefoot-native-store-v4',
    }
  )
);
