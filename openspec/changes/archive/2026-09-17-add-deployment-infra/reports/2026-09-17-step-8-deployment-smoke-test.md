# Step 8 Report - Deployment Smoke Test (Dockerized single-origin app)

- Date: 2026-09-17
- Change: add-deployment-infra
- Agent: GitHub Copilot (backend-developer)

## Environment

- Built the image (`docker build -t gym-app .`) and ran the production compose
  stack: `docker compose -f docker-compose.prod.yml --env-file .env.prod up -d`.
- `.env.prod` held throwaway secrets only (gitignored, deleted after the test).
- The app container runs `NODE_ENV=production`, `SERVE_FRONTEND=true`, serving
  the built SPA and the API on the same origin (`http://localhost:3000`).
- Startup applied migrations automatically (`prisma migrate deploy`), and the
  admin was created via `docker compose ... run --rm app npx prisma db seed`.

## Fix applied during this step

Prisma engines failed on Alpine (`Could not parse schema engine response` /
libssl not detected). Fixed by installing `openssl` + `libc6-compat` in the
Alpine build and runtime stages and adding `linux-musl-openssl-3.0.x` to the
Prisma `binaryTargets`. After the fix, migrations and queries run cleanly.

## Smoke Test Results (curl over http://localhost:3000)

| Check | Expected | Result |
|---|---|---|
| `GET /api/health` | 200 `{ "status": "ok" }` | **200**, `application/json`, `{"status":"ok"}` ✓ |
| `GET /` | 200, serves SPA `index.html` | **200**, `text/html`, contains `<div id="root"></div>` ✓ |
| `GET /clients` (SPA fallback) | 200, serves SPA | **200**, `text/html` ✓ |
| `GET /api/auth/me` (no cookie) | 401 | **401** ✓ |
| `GET /api/nope` (unknown API) | 404 JSON | **404**, `{"success":false,"error":{"code":"NOT_FOUND"}}` ✓ |
| `POST /api/auth/login` (valid) | 200 + session cookie | **200**, `Set-Cookie: session=...; HttpOnly; Secure; SameSite=Strict` ✓ |

The login response confirms the single-origin production cookie:
`HttpOnly; Secure; SameSite=Strict`. Over plain `curl`/http the Secure cookie is
not re-sent (by design); the full authenticated round-trip is validated in
Step 9 via a browser (localhost is a secure context) and in production via the
HTTPS tunnel.

## Cleanup

- `docker compose -f docker-compose.prod.yml down -v` (removed the throwaway DB volume).
- Deleted `.env.prod`. The local dev database was untouched (`Client=0`).

## Outcome

- Step 8 status: PASS
- Blocking issues: none (the Alpine/Prisma openssl issue was fixed here).
