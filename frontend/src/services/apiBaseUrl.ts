// Base URL for API calls.
// - Explicit `VITE_API_URL` always wins (dev or custom setups).
// - In a production build (single-origin deployment) it defaults to '' so
//   requests are relative (same origin) and the session cookie stays same-site.
// - In dev it defaults to the local backend.
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:3000');
