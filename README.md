
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
  