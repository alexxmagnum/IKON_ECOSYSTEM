# @motanos/auth

Technical identity layer for MotanOS (Supabase Auth integration).

## Entrypoints

- `@motanos/auth` — browser client + session helpers
- `@motanos/auth/server` — server clients including service-role helper

## Phase 2 scope

- User / Session types
- getSession / getCurrentUser / requireSession
- Supabase client factories

## Out of scope

- Login / register pages
- Password recovery UX
- IKON-specific screens

## Security

- Anon key only on browser clients
- Service role only via `@motanos/auth/server` (ADR-002 / DEC-005)
