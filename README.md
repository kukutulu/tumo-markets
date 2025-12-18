# tumo-markets — Command Guide

**Prerequisites**

- **Node:** v18+ (install from nodejs.org)
- **Package manager:** `npm`, `pnpm`, or `yarn`

**Install dependencies**

- Using npm: `npm install` (or `npm ci` in CI)
- Using pnpm: `pnpm install`
- Using yarn: `yarn install`

**Environment**

- Copy `.env.example` to `.env.local` if present, or create a `.env.local` file with required environment variables.
- Check `next.config.ts` and `src` for any `NEXT_PUBLIC_` or runtime variables the app needs.

**Development**

- Start the dev server (Turbopack enabled):
  - `npm run dev`
  - `pnpm dev`
  - `yarn dev`

The app will run by default on `http://localhost:3000` unless configured otherwise.

**Build & Production**

- Build the production bundle:
  - `npm run build`
  - `pnpm build`
  - `yarn build`
- Start the production server (after build):
  - `npm run start`
  - `pnpm start`
  - `yarn start`

**Linting**

- Run ESLint:
  - `npm run lint`
  - `pnpm lint`
  - `yarn lint`

**Other scripts**

- `npm run push` — runs `node script/git-push.js` (used by repository scripts)

**Troubleshooting & Tips**

- If you see build errors, delete `.next` and try again: `rm -rf .next && npm run build` (use Windows equivalent `rd /s /q .next` in PowerShell).
- Ensure Node and package manager versions match team recommendations.
- For CI, prefer `npm ci` or the package-manager's lockfile-aware install.
