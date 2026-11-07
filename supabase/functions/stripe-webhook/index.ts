import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'stripe-signature, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables missing in Edge Function');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const bodyText = await req.text();
    let event: any;

    try {
      event = JSON.parse(bodyText);
    } catch {
      return new Response('Invalid payload', { status: 400 });
    }

    // Process Stripe subscription events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data?.object;
        const userId = session?.client_reference_id || session?.metadata?.user_id;
        const customerId = session?.customer;
        const subscriptionId = session?.subscription;

        console.log(`[Stripe Webhook] checkout.session.completed for user ${userId}`);

        if (userId) {
          const { error } = await supabaseAdmin
            .from('profiles')
            .update({
              is_pro: true,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
            })
            .eq('id', userId);

          if (error) {
            console.error('Failed updating profile is_pro on checkout:', error);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data?.object;
        const isActive = sub?.status === 'active' || sub?.status === 'trialing';
        const customerId = sub?.customer;
        const subId = sub?.id;
        const userId = sub?.metadata?.user_id;

        console.log(`[Stripe Webhook] subscription.updated status: ${sub?.status}, isActive: ${isActive}`);

        if (userId) {
          await supabaseAdmin
            .from('profiles')
            .update({ is_pro: isActive, stripe_subscription_id: subId })
            .eq('id', userId);
        } else if (customerId) {
          await supabaseAdmin
            .from('profiles')
            .update({ is_pro: isActive })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data?.object;
        const customerId = sub?.customer;
        const userId = sub?.metadata?.user_id;

        console.log(`[Stripe Webhook] subscription.deleted for sub: ${sub?.id}`);

        if (userId) {
          await supabaseAdmin
            .from('profiles')
            .update({ is_pro: false })
            .eq('id', userId);
        } else if (customerId) {
          await supabaseAdmin
            .from('profiles')
            .update({ is_pro: false })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data?.object;
        const customerId = invoice?.customer;
        if (customerId) {
          await supabaseAdmin
            .from('profiles')
            .update({ is_pro: true })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    console.error('Stripe webhook processing error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
