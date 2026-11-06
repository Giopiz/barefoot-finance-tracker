# Barefoot Flow 🚀

High-performance daily cashflow & micro-learning SaaS prototype inspired by Scott Pape's *The Barefoot Investor*.

Built with **Next.js**, **Tailwind CSS**, **Zustand**, **Supabase**, and **Stripe**.

## Core Features
- **Workshop Engine**: High-contrast, stress-free mobile-first dashboard with visual pacing bars.
- **Barefoot & 50/30/20 Frameworks**: Automatic paycheck auto-split across Splurge, Daily Bills, Fire Extinguisher, and Smile.
- **Actionable Academy**: Micro-learning swipeable flashcards with direct actions ("Move $5 to Savings").
- **2-Tap Hardware Keypad**: Instant expense logging with category tagging and habit streaks.
- **Supabase SSR**: Database schema, Row-Level Security (RLS), and auth middleware.
- **Stripe Subscriptions**: Integrated Pro subscription ($2.99 AUD/mo).

## Setup
```bash
npm install
npm run dev
```

Configure your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ykwxkazmztqrgmpzhchv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
