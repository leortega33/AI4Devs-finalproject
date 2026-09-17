import fs from 'fs';
import os from 'os';
import path from 'path';
import request from 'supertest';
import type { Express } from 'express';

// Exercises the deployment-related concerns wired in `createApp`:
// the health endpoint and the single-origin SPA serving (US infra change).
describe('createApp deployment concerns', () => {
  let app: Express;
  let clientDist: string;

  beforeAll(async () => {
    clientDist = fs.mkdtempSync(path.join(os.tmpdir(), 'client-dist-'));
    fs.writeFileSync(
      path.join(clientDist, 'index.html'),
      '<!doctype html><title>SPA</title><div id="root"></div>',
    );
    process.env.SERVE_FRONTEND = 'true';
    process.env.CLIENT_DIST = clientDist;
    const mod = await import('./index');
    app = mod.createApp();
  });

  afterAll(() => {
    delete process.env.SERVE_FRONTEND;
    delete process.env.CLIENT_DIST;
    fs.rmSync(clientDist, { recursive: true, force: true });
  });

  it('should expose an unauthenticated health check', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should serve the SPA index for a non-API route when SERVE_FRONTEND is on', async () => {
    const response = await request(app).get('/clients');

    expect(response.status).toBe(200);
    expect(response.text).toContain('<div id="root">');
  });

  it('should not let the SPA fallback hijack protected API routes', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
  });

  it('should return a JSON 404 for an unknown API route', async () => {
    const response = await request(app).get('/api/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
