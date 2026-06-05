# Vehicle Scout

Production-grade monorepo foundation for the Vehicle Listing Scout application.

## Tech Stack

| Layer    | Technologies                                              |
| -------- | --------------------------------------------------------- |
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui |
|          | TanStack Query, Zustand, Axios                            |
| Backend  | Node.js, Express, TypeScript, Prisma, PostgreSQL (Neon)   |
| Tooling  | pnpm workspaces, ESLint, Prettier, tsx, concurrently      |

## Project Structure

```
vehicle-scout/
├── apps/
│   ├── web/          # Next.js frontend (port 3000)
│   └── api/          # Express API (port 5000)
├── packages/         # Shared packages (future)
├── prisma/
│   └── schema.prisma
├── .env.example
├── package.json
└── pnpm-workspace.yaml
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database (e.g. [Neon](https://neon.tech))

## Getting Started

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env` at the repo root (optional, for Prisma CLI).

   Ensure these files exist with your values:

   - `apps/api/.env` — `PORT`, `DATABASE_URL`
   - `apps/web/.env.local` — `NEXT_PUBLIC_API_URL`

   Example Neon connection string:

   ```
   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
   ```

3. **Generate Prisma client**

   ```bash
   pnpm db:generate
   ```

   Migrations are not included in this scaffold. Run `pnpm exec prisma migrate dev` when you are ready to sync the database.

4. **Start development servers**

   ```bash
   pnpm dev
   ```

   - Frontend: http://localhost:3000
   - API health: http://localhost:5000/api/health

   > **Port 5000:** The API defaults to port `5000`. If another app is already using that port, the API will exit with `EADDRINUSE`. Stop the conflicting process or change `PORT` in `apps/api/.env` (and update `NEXT_PUBLIC_API_URL` in `apps/web/.env.local` to match).

## Scripts

| Script        | Description                          |
| ------------- | ------------------------------------ |
| `pnpm dev`    | Start web + API concurrently         |
| `pnpm dev:web`| Start Next.js only                   |
| `pnpm dev:api`| Start Express API only               |
| `pnpm build`  | Build all workspace packages         |
| `pnpm lint`   | Lint all workspace packages          |
| `pnpm db:generate` | Generate Prisma client          |

## API

### `GET /api/health`

```json
{ "status": "ok" }
```

CORS is enabled for `http://localhost:3000` by default (`CORS_ORIGIN` in `apps/api/.env`).

## License

Private — all rights reserved.
