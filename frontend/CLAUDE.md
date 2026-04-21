### Frontend Specifics

- Use functional components only. No classes.
- Prefer React Server Components; minimize `'use client'`.
- Use Shadcn UI + Radix UI + Tailwind CSS for all UI.
- Use `useForm` with Zod resolver for forms.
- Use TanStack React Query for data fetching, Zustand for client state.
- Favor named exports.

### Frontend — Structure

- `src/app/` — Next.js App Router pages and layouts
- `src/components/` — Shadcn UI and custom components
- `src/middleware.ts` — Auth route protection (redirects to `/auth/signin`)
- Path alias: `@/*` maps to `./src/*`
- State: Zustand stores, TanStack React Query for server state
- Auth: Custom `LuniAuthProvider` with SSR session support