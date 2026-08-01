# @motanos/auth

MotanOS identity runtime (Supabase Auth).

## Entrypoints

| Import | Purpose |
|---|---|
| `@motanos/auth` | Browser client + session helpers |
| `@motanos/auth/server` | Server clients including service-role |

## Helpers

- `getSession()`
- `getCurrentUser()`
- `requireUser()` / `requireSession()`
- `getCurrentUserFromAccessToken(token)`

## Security

- Browser uses anon key only
- Service role only via `@motanos/auth/server`
- Never import service-role helpers in React client components (ADR-002 / DEC-005)
