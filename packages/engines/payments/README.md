# `@motanos/payments`

Shared Payments Engine foundation for MotanOS.

## Placement

```
MotanOS Core → Shared Engines → @motanos/payments → Domain Modules
```

This package is platform infrastructure. It does not belong to a customer implementation or to any consuming domain module.

## Scope (current)

- Domain types: PaymentIntent, Payment, Refund, Money
- PAYMENT statuses aligned with SoT state machines (DEC-003)
- API-oriented TypeScript contracts (no HTTP handlers)
- Service interfaces and provider abstraction only

## Out of scope (current)

- Real charges, webhooks, invoices, wallets, credits
- Database migrations / Drizzle schema
- Concrete gateway SDKs or adapters
- Checkout UI / payment pages

## Dependencies

Allowed: `@motanos/core`, `@motanos/contracts`

Forbidden: customer implementation packages, domain packages, other engines, `@motanos/database`, Next.js, auth vendors, payment gateway SDKs
