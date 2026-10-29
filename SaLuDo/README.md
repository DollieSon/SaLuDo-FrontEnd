# SaLuDo Frontend

React 19 + TypeScript + Vite single-page app for the SaLuDo HR/recruitment system. It talks to the SaLuDo backend API (`SaLuDo-BackEnd`).

## Getting Started

```bash
npm install
npm run dev        # http://localhost:5173, expects the API at http://localhost:3000/api/
```

Set the backend URL at build time with `VITE_API_URL` (default `http://localhost:3000/api/`); the WebSocket URL is derived from it. The backend must list this app's origin in its `CORS_ORIGIN` (defaults include `http://localhost:5173`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build (does not type-check) |
| `npx tsc -p tsconfig.app.json` | Type-check |
| `npm run lint` | ESLint |
| `npm test` | Vitest (jsdom) |
| `npm run test:watch` | Vitest in watch mode |

## Authentication

- The access token (15 minutes) is kept **in memory only** (`src/utils/tokenStore.ts`); nothing auth-related is stored in `localStorage`.
- The refresh token is an HttpOnly cookie set by the API. On page load `AuthContext` restores the session by calling `POST users/auth/refresh` with `credentials: 'include'`.
- Use `apiClient` (axios) or the `api.ts` helpers: both attach the token and refresh it on a 401. Downloads and API images need `src/utils/fileDownload.ts` and `src/hooks/useAuthenticatedImage.ts`, because plain links can't send the token.
- The applicant form at `/candidate-form?jobId=...` is public and only uses the backend's `/api/public/*` endpoints.

## Tests

`npm test` runs the Vitest suite in `src/**/__tests__/` covering the token store, `authFetch` (token injection, refresh-and-retry, cross-tab refresh lock, legacy-token migration) and `AuthContext` (session restore, login/logout without browser storage).

## Docker

The `Dockerfile` builds with Node 24 and serves the bundle from unprivileged nginx on **port 8080**. `nginx.conf` includes `security-headers.inc` (Content-Security-Policy, X-Frame-Options, HSTS, etc.). The CSP's API origins are derived from `VITE_API_URL` at container start (`derive-api-origin.envsh`); set `API_ORIGIN` / `API_WS_ORIGIN` to override.

```bash
docker build --build-arg VITE_API_URL=https://api.example.com/api/ -t saludo-frontend .
docker run -p 8080:8080 saludo-frontend
```

If the app is deployed as a static site (e.g. Render static site) instead, configure equivalent security headers on the host.

---

## Vite template notes

This project started from the Vite React + TypeScript template, which provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
