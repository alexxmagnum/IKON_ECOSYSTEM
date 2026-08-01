# `@motanos/domain-restaurant`

Restaurant Domain Module foundation for MotanOS.

## Placement

```
MotanOS Core → Shared Engines → Domain Modules → Restaurant
```

Restaurant is a consuming domain. It is not a shared engine.

## Scope (current)

- Domain types: RestaurantVenue, RestaurantZone, RestaurantTable, Menu, MenuCategory, MenuItem
- Table and menu statuses aligned with SoT
- ORDER statuses declared for future alignment (no order workflows)
- Contracts and service interfaces
- Typed references to Booking and Payments engines

## Out of scope (current)

- UI / visual carta / QR checkout
- Kitchen, POS, delivery, stock, inventory
- Persistence, migrations, gateways
- Customer branding packages

## Dependencies

Allowed: `@motanos/contracts`, `@motanos/booking`, `@motanos/payments`

Forbidden: `@motanos/database`, `@motanos/auth`, `@motanos/permissions`, customer branding packages, Next.js, infrastructure SDKs
