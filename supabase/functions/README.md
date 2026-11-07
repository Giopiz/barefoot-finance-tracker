# Supabase Edge Functions: Stripe Checkout & Webhook

This directory contains the production-ready Edge Functions for Barefoot Finance Tracker:

1. **`stripe-checkout`**: Generates a Stripe Checkout Session for product `price_1UYx27CQSn0ZIYPOI9b6m2Gl` ($2.99 AUD/mo).
2. **`stripe-webhook`**: Receives Stripe webhook events (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`) and updates `profiles.is_pro` using the Supabase Service Role key.

---

## Deployment & Configuration

### 1. Set Edge Function Secrets
Run the following commands using the Supabase CLI:

```bash
# Set your Stripe Secret Key and Webhook Secret
supabase secrets set STRIPE_SECRET_KEY=sk_test_... STRIPE_WEBHOOK_SECRET=whsec_... --project-ref ykwxkazmztqrgmpzhchv
```

### 2. Deploy Functions
Deploy both functions to your Sydney project (`ykwxkazmztqrgmpzhchv`):

```bash
supabase functions deploy stripe-checkout --project-ref ykwxkazmztqrgmpzhchv --no-verify-jwt
supabase functions deploy stripe-webhook --project-ref ykwxkazmztqrgmpzhchv --no-verify-jwt
```

### 3. Add Webhook to Stripe Dashboard
In your Stripe Dashboard (`acct_1SncUYCQSn0ZIYPO`):
- Go to **Developers > Webhooks > Add endpoint**.
- **Endpoint URL**: `https://ykwxkazmztqrgmpzhchv.supabase.co/functions/v1/stripe-webhook`
- **Events to send**:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
