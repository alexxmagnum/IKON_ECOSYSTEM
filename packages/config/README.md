# @motanos/config

Runtime configuration and environment validation for MotanOS.

## Entrypoints

- `@motanos/config` — **public** env only (`NEXT_PUBLIC_*`)
- `@motanos/config/server` — server env including `DATABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

## Rules (ADR-002 / DEC-005)

- Never commit real secret values.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or `DATABASE_URL` to the frontend.
- Use `.env.example` for variable names only.

## Variables

| Name | Scope |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public |
| `DATABASE_URL` | server |
| `SUPABASE_SERVICE_ROLE_KEY` | server |
