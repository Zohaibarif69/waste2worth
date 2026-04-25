
## Running the code

1. Install dependencies:

```bash
npm i
```

2. Create local environment file:

```bash
cp .env.example .env.local
```

3. Update `.env.local` with your real Supabase credentials.

- Replace `YOUR_PROJECT_REF` in `DATABASE_URL`.
- Replace `YOUR_DB_PASSWORD` in `DATABASE_URL`.
- Keep `?sslmode=require` at the end of `DATABASE_URL`.
- Replace `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Set a strong random value for `NEXTAUTH_SECRET`.

4. Start the development server:

```bash
npm run dev
```

The app will fail fast if `DATABASE_URL` still contains placeholders.

## Waste Scan AI Provider

Waste scan classification is configured through environment variables:

- `WASTE_AI_PROVIDER=teachable_machine` (default) to use your Teachable Machine model.
- `WASTE_AI_PROVIDER=vision` to use Google Vision API.
- `TEACHABLE_MACHINE_MODEL_URL` should point to your model base URL, e.g. `https://teachablemachine.withgoogle.com/models/gxoGDbLZf/`.

Current inference integration is in `app/api/waste-scan/route.ts` and `lib/teachable-machine.ts`.
  