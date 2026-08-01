# MotanOS

MotanOS is the modular software **platform**.

**IKON Sports & Lounge** is the first customer implementation (experience, branding, configuration).

IKON is not the architectural boundary.

## Architecture layers

- **Core MotanOS** — platform foundations (`packages/core`, `config`, `auth`, `permissions`, `database`, `contracts`, `ui`)
- **Shared Engines** — reusable capabilities (`packages/engines/*`)
- **Domain Modules** — business capabilities (`packages/domains/*`)
- **IKON Experience Layer** — implementation composition (`implementations/ikon`)

## Tenancy

DEC-001 Single-Tenant v1 — no `club_id`, no `tenant_id`, no multi-tenant SaaS in this phase.

## Secrets

ADR-002 / DEC-005 — centralized secrets governance. No Secrets Architect. Never commit real secrets.

## Bootstrap scripts

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm format
```

## App

```bash
pnpm --filter @motanos/web dev
```
