# Required Environment Variables

## Netlify (set in Netlify dashboard → Site settings → Environment variables)

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL | Supabase → Settings → API |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anon/public key | Supabase → Settings → API |

## Supabase Edge Functions (set in Supabase → Settings → Edge Functions → Secrets)

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `RESEND_API_KEY` | Resend API key for transactional email | resend.com → API Keys |

## Future (not yet required)

| Variable | Description |
|----------|-------------|
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for payments |
| `STRIPE_SECRET_KEY` | Stripe secret key (Edge Function only, never in client) |

## How to set Netlify env vars

1. Go to app.netlify.com → your site → Site configuration → Environment variables
2. Add each variable with its value
3. Redeploy the site for changes to take effect

## How to set Supabase Edge Function secrets

```bash
supabase secrets set RESEND_API_KEY=re_your_key_here
```
