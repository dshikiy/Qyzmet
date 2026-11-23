# QyzmetTap

**QyzmetTap** — Қазақстандағы (алғашқы қала: Ақтау) сенімді мамандарды жақын жерден табуға арналған толыққанды веб-платформа.

## Технологиялық стек

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React
- **Backend:** Next.js Route Handlers, Auth.js v5 (Credentials + JWT), Prisma ORM
- **Database:** PostgreSQL (Neon PostgreSQL)
- **Maps & Geolocation:** MapLibre GL JS + OpenStreetMap tiles + Browser Geolocation API
- **Testing:** Vitest, React Testing Library, Playwright

## Жергілікті іске қосу (Local Setup)

1. Тәуелділіктерді орнату:
   ```bash
   npm install
   ```

2. Орта айнымалыларын баптау (`.env.example` негізінде `.env` жасаңыз):
   ```bash
   cp .env.example .env
   ```
   `DATABASE_URL` (Neon PostgreSQL) және `AUTH_SECRET` мәндерін толтырыңыз.

3. Дерекқор схемасын синхрондау және 6 бастапқы санатты жүктеу:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. Әкімші аккаунтын қауіпсіз құру:
   ```bash
   ADMIN_EMAIL="admin@qyzmettap.kz" ADMIN_PASSWORD="StrongPassword123!" npm run db:bootstrap-admin
   ```

5. Әзірлеу серверін іске қосу:
   ```bash
   npm run dev
   ```

## Тестілеу және тексеру

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

## Docker арқылы іске қосу

```bash
docker compose up --build
```

# Qyzmet
