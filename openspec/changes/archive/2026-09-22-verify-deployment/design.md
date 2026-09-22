## Context

See proposal.md — Why. The deployment artifacts already exist and were designed in
`add-deployment-infra`. This change is a verification pass plus a small
`render.yaml` refresh; it introduces no new architecture. Constraints from the
original design still hold: **no paid subscriptions**, single-origin serving to
keep the `sameSite=strict` session cookie, and the owner runs the actual public
deployment (we commit configuration only).

## Goals / Non-Goals

**Goals:**
- Prove the production image builds and runs with all current features.
- Close the `render.yaml` photo-storage gap and document the ephemeral-FS caveat.
- Recommend and document the go-live path.

**Non-Goals:**
- No actual public deployment performed here (owner's action).
- No object-storage (S3/R2) photo backend — deferred (US-026b follow-up).
- No changes to application code, endpoints, or the data model.

## Decisions

### Validate by running the real prod stack locally
Build the image and bring up `docker-compose.prod.yml` with a throwaway (weak,
local-only, gitignored) `.env.prod`, then smoke-test through the container. This
is the highest-fidelity check short of a cloud deploy and exercises the exact
artifact that ships.
- **Alternative (rejected):** trust the config by inspection — would miss runtime
  issues like `sharp` musl binaries or a missing embedded asset.

### Recommended go-live path: local Docker + Cloudflare Tunnel
Primary path is self-hosted Docker + a Cloudflare quick tunnel: free, no account
needed, and — crucially — the **DB and uploads live on persistent named volumes**
so photos survive redeploys. Render stays a documented secondary path for a quick
cloud demo, with an explicit ephemeral-filesystem warning for photos.

### `render.yaml` refresh only
The compose stack already carries the `gym_prod_uploads` volume + `PHOTO_STORAGE_DIR`
(added in US-026b). Only `render.yaml` lacked the photo env; add it plus the
ephemeral-FS note. No Dockerfile/entrypoint change is needed — the image already
builds `sharp` on Alpine and the `copy-assets` build step places the logo in `dist`.

## Risks / Trade-offs

- **`sharp` arch mismatch (build vs deploy host)** → validated locally on the same
  arch; for cross-arch cloud builds, the provider builds the image on its own host
  so the prebuilt musl binary matches. Mitigation documented if it ever surfaces.
- **Render free tier loses photos** → documented; the recommended tunnel path
  avoids it entirely with a persistent volume.
- **Weak local `.env.prod` during validation** → gitignored and deleted after the
  run; real secrets are the owner's to set at go-live.

## Migration Plan

- No migration. `render.yaml` is edited; the validation is a one-off local run torn
  down with `docker compose ... down -v`.
