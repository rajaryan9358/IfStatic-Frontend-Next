This is a Next.js App Router frontend.

## Local development

1) Start the PHP API (default: `http://localhost:5000`)

```bash
cd ../server-php
composer install
cp .env.example .env
composer start
```

2) Point the frontend to the API (optional if you keep the default port)

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

3) Start the Next.js dev server

```bash
cd ../frontend
npm install
npm run dev
```
