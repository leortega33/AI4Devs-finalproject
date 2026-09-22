## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/verify-deployment` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Build the production image

- [x] 1.1 `docker build -t gym-app:verify .` succeeds (multi-stage: frontend build → backend build → runtime)
- [x] 1.2 Inside the image, confirm `require('sharp')` loads (native musl binary), the export logo asset exists at `dist/infrastructure/pdf/assets/logo.png`, and `dist/index.js` + `public/index.html` are present

## 2. Run the production stack

- [x] 2.1 Create a throwaway, gitignored `.env.prod` (weak local-only values) and `docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build`
- [x] 2.2 Confirm the entrypoint runs `prisma migrate deploy` (all migrations applied) and the server listens; seed the admin one-off (`docker exec ... npx prisma db seed`)

## 3. Smoke-test the running artifact (MANDATORY - AGENT MUST EXECUTE)

- [x] 3.1 `GET /api/health` → 200; `GET /` serves the SPA `index.html` (200, text/html); `GET /api/auth/me` → 401 without a cookie
- [x] 3.2 Login → 200; `GET /api/auth/me` → 200; a protected endpoint (`GET /api/clients`) → 200
- [x] 3.3 Upload a progress photo (multipart) → stored as `image/webp` (exercises `sharp`) and served back 200; the file lands in the `/data/photos` uploads volume
- [x] 3.4 Restart the `app` container and confirm the photo file persists in the volume and still streams (volume durability)
- [x] 3.5 Export a routine PDF → 200 `application/pdf` with a valid `%PDF` signature (embedded logo)
- [x] 3.6 Document all outcomes in `openspec/changes/verify-deployment/reports/YYYY-MM-DD-deployment-verification.md`

## 4. Refresh deploy config

- [x] 4.1 Add `PHOTO_STORAGE`/`PHOTO_STORAGE_DIR` to `render.yaml` with a comment documenting Render's ephemeral filesystem (photos not durable there) and pointing to the local + Cloudflare Tunnel path as the recommended, photo-durable deployment

## 5. Tear down and clean up

- [x] 5.1 `docker compose -f docker-compose.prod.yml --env-file .env.prod down -v` (remove the test volumes), delete the throwaway `.env.prod` and the `gym-app:verify` image; restart the dev backend

## 6. Documentation + go-live guidance

- [x] 6.1 Confirm `docs/deployment.md` covers the recommended path (local Docker + Cloudflare Tunnel), the one-off admin seed, and the DB+uploads backup note (added in US-026b); update if anything is missing
- [x] 6.2 Provide the owner the final public-exposure steps (start the stack, run `cloudflared tunnel --url http://localhost:3000`); on feature close, note the deployment validation in `readme.md`/`prompts.md`
