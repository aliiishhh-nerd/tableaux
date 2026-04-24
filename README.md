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

## Running tests

`npm test` runs the CRA test suite. One integration test for the RSVP happy path (at `src/__tests__/rsvp-happy-path.integration.test.js`) is gated behind `RUN_INTEGRATION=true` — it hits prod Supabase, so ordinary `npm test` skips it.

To run it, create `.env.test.local` in the repo root with the same two variables as `.env.local` (CRA does not load `.env.local` in the test environment). Then:

```
RUN_INTEGRATION=true CI=true npm test
```

For the full environment-variable reference (prod/Netlify + Supabase Edge Function secrets), see [REQUIRED_ENV_VARS.md](REQUIRED_ENV_VARS.md).
