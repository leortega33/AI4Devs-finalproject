## Why

The deployment infrastructure (Dockerfile, `docker-compose.prod.yml`,
`render.yaml`, CI, `docs/deployment.md`) was set up in `add-deployment-infra`
(archived 2026-09-17) but **before** several features that touch the runtime:
progress photos (US-026b: `sharp` native module + a persistent uploads volume),
the routine-export brand logo asset (US-030), and new Prisma migrations
(attendance, progress, nutrition). Before going live we must prove the shipped
image actually builds and runs with everything, and close any config gaps.

## What Changes

- **Validate the deployment artifact end-to-end** by building the production image
  and running the full `docker-compose.prod.yml` stack locally, then smoke-testing
  health, single-origin SPA serving, auth, a photo upload (exercises `sharp` + the
  uploads volume), volume persistence across a container restart, and a routine
  PDF export (embedded logo). Captured in a verification report.
- **Refresh `render.yaml`**: add `PHOTO_STORAGE`/`PHOTO_STORAGE_DIR` and a comment
  documenting that Render's free-tier filesystem is ephemeral (local photos are
  lost on redeploy), pointing to the local + Cloudflare Tunnel path as the
  recommended, photo-durable deployment.
- **Confirm** the recommended go-live path (local Docker + Cloudflare Tunnel) and
  document the final public-exposure steps for the owner to run.

## Capabilities

### New Capabilities
_None._

### Modified Capabilities
_None — infrastructure/config validation only. The change sets `skip_specs: true`:
no application behavior or spec changes (the app image, endpoints, and outputs are
unchanged; this verifies and lightly refreshes deploy configuration)._

## Impact

- **Config:** `render.yaml` gains the photo-storage env vars + ephemeral-FS note.
  No change to the `Dockerfile`, `docker-compose.prod.yml` (already carries the
  `gym_prod_uploads` volume from US-026b), `entrypoint.sh`, or `docs/deployment.md`
  content beyond what US-026b added.
- **No application code, endpoints, models, or migrations change.**
- **Deliverable:** a deployment-verification report proving the artifact runs with
  all current features; go-live steps for the owner.
