# Deployment Verification Report

- Date: 2026-09-22
- Change: verify-deployment
- Agent: GitHub Copilot

## Environment

- Docker Engine 29.8.0, Docker Compose v5.5.1 (Apple Silicon / arm64).
- Built and ran the exact production artifact: `Dockerfile` +
  `docker-compose.prod.yml` with a throwaway, gitignored `.env.prod` (weak
  local-only values, deleted after the run).

## 1. Image build

- `docker build -t gym-app:verify .` → **success** (frontend build → backend build
  → `node:20.19-alpine` runtime).
- Inside the image:
  - `require('sharp')` → **OK, libvips 8.18.6** (native musl binary resolves).
  - `dist/infrastructure/pdf/assets/logo.png` → **present** (the `copy-assets`
    build step ships the export logo).
  - `dist/index.js` and `public/index.html` → **present** (backend + single-origin
    SPA).

## 2. Stack startup

- `docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build`
  → `db` healthy, `app` started, both named volumes created
  (`gym_prod_db_data`, `gym_prod_uploads`).
- Entrypoint ran `prisma migrate deploy` → **all migrations applied** (incl.
  attendance, progress, progress-photo, nutrition). Server: `listening on port 3000`.
- Admin seeded one-off: `docker exec gym-prod-app npx prisma db seed`.

## 3. Smoke tests (through the running container)

| Check | Result |
|---|---|
| `GET /api/health` | **200** |
| `GET /` (single-origin SPA) | **200**, `text/html` |
| `GET /api/auth/me` (no cookie) | **401** |
| Login | **200** |
| `GET /api/auth/me` (with cookie) | **200** |
| `GET /api/clients` (protected) | **200** |
| Upload progress photo (multipart) | stored as **image/webp** (sharp), served back **200** |
| Photo file location | `/data/photos/<uuid>.webp` in the `gym_prod_uploads` volume |
| **Restart `app`, re-check photo** | file **persists**, streams **200** (volume durability) |
| Routine PDF export | **200**, `application/pdf`, 27 KB, valid `%PDF` signature (embedded logo) |

## 4. Config refresh

- `render.yaml`: added `PHOTO_STORAGE=local` + `PHOTO_STORAGE_DIR=/data/photos`
  with a comment documenting Render's **ephemeral filesystem** (local photos are
  lost on redeploy) and pointing to the local + Cloudflare Tunnel path as the
  recommended, photo-durable deployment.

## 5. Cleanup

- `docker compose ... down -v` (removed the test volumes), deleted the throwaway
  `.env.prod` and the `gym-app:verify` image, restarted the dev backend.

## Result

The production deployment artifact **builds and runs correctly with every current
feature**, including `sharp`-based photo processing on a persistent volume and the
branded routine export. It is ready for go-live via the recommended path (local
Docker + Cloudflare Tunnel). Public exposure and real secrets are the owner's
final manual step (see `docs/deployment.md`).
