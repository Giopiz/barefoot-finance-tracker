import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    let userId: string | null = null;
    let userEmail: string | null = null;

    // Verify authenticated user from Authorization Bearer token if present
    const authHeader = req.headers.get('Authorization');
    if (authHeader && supabaseUrl && supabaseAnonKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
          userEmail = user.email ?? null;
        }
      } catch (authErr) {
        console.warn('Could not extract user from token:', authErr);
      }
    }

    let bodyData: any = {};
    try {
      bodyData = await req.json();
    } catch {
      // Body may be empty
    }

    userId = userId || bodyData.user_id || null;
    userEmail = userEmail || bodyData.email || null;
    const origin = bodyData.origin || req.headers.get('origin') || 'http://localhost:5173';
    const successUrl = `${origin}/?session_id={CHECKOUT_SESSION_ID}&checkout=success`;
    const cancelUrl = `${origin}/?checkout=cancelled`;
    const priceId = bodyData.price_id || 'price_1UYx27CQSn0ZIYPOI9b6m2Gl';

    if (!stripeKey) {
      // Graceful fallback for local development or prior to setting Supabase secrets
      return new Response(
        JSON.stringify({
          error: 'STRIPE_SECRET_KEY is not configured yet in Supabase Edge Function secrets.',
          mock_url: `${origin}/?session_id=mock_session_${Date.now()}&checkout=success`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Call Stripe Checkout Sessions API
    const params = new URLSearchParams();
    params.append('mode', 'subscription');
    params.append('success_url', successUrl);
    params.append('cancel_url', cancelUrl);
    params.append('line_items[0][price]', priceId);
    params.append('line_items[0][quantity]', '1');

    if (userId) {
      params.append('client_reference_id', userId);
      params.append('metadata[user_id]', userId);
      params.append('subscription_data[metadata][user_id]', userId);
    }
    if (userEmail) {
      params.append('customer_email', userEmail);
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) {
      throw new Error(session.error?.message || 'Failed creating Stripe checkout session');
    }

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
