# TableFolk

Social dining PWA. Live at [tablefolk.club](https://tablefolk.club).

## Local development setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env.local` file in the repo root with two variables:
   ```
   REACT_APP_SUPABASE_URL=https://jrwugzljctnvcodvlvqf.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=<see public/waitlist.html>
   ```

   The anon key is public by design (it ships in the deployed bundle and in static HTML). Grep `public/waitlist.html` for `apikey` to find the exact value.

   Without `.env.local`, `npm start` will fail at module init with `supabaseUrl is required`.

3. Start the dev server:
   ```
   npm start
   ```

For the full environment-variable reference (prod/Netlify + Supabase Edge Function secrets), see [REQUIRED_ENV_VARS.md](REQUIRED_ENV_VARS.md).
