# MotanOS — Permission Matrix

Fuente: `27_PERMISSIONS.md`, `permissions.mmd`, DEC-002, BR-0016.

Leyenda: `Y` = permitido · `N` = denegado · `O` = solo propio (owner) · `A` = ámbito operativo autorizado

Roles oficiales: Guest · Member · Socio · Organizer · Staff · Manager · Club Admin · Platform Admin

---

## BOOKINGS

| Acción | Guest | Member | Socio | Organizer | Staff | Manager | Club Admin | Platform Admin |
|---|---|---|---|---|---|---|---|---|
| READ propia | N | Y | Y | Y | Y | Y | Y | Y |
| READ ajena | N | N | N | N | A | Y | Y | Y |
| CREATE | N | Y | Y | Y | Y | Y | Y | Y |
| UPDATE propia | N | O | O | O | Y | Y | Y | Y |
| UPDATE ajena | N | N | N | N | A | Y | Y | Y |
| CANCEL propia | N | O | O | O | Y | Y | Y | Y |
| CANCEL ajena | N | N | N | N | A | Y | Y | Y |
| APPROVE / check-in | N | N | N | N | Y | Y | Y | Y |
| CONFIGURE reglas recurso | N | N | N | N | N | Y | Y | Y |
| EXPORT | N | N | N | N | N | Y | Y | Y |

---

## PROFILE

| Acción | Guest | Member | Socio | Organizer | Staff | Manager | Club Admin | Platform Admin |
|---|---|---|---|---|---|---|---|---|
| READ público | Y | Y | Y | Y | Y | Y | Y | Y |
| READ privado ajeno | N | N | N | N | A | A | Y | Y |
| UPDATE propio | N | Y | Y | Y | Y | Y | Y | Y |
| UPDATE ajeno | N | N | N | N | N | A | Y | Y |

---

## MEMBERS / MEMBERSHIP

| Acción | Guest | Member | Socio | Organizer | Staff | Manager | Club Admin | Platform Admin |
|---|---|---|---|---|---|---|---|---|
| READ planes públicos | Y | Y | Y | Y | Y | Y | Y | Y |
| READ membresía propia | N | Y | Y | Y | Y | Y | Y | Y |
| CREATE solicitud | N | Y | Y | Y | Y | Y | Y | Y |
| MANAGE membresías | N | N | N | N | A | Y | Y | Y |

---

## EVENTS / TOURNAMENTS

| Acción | Guest | Member | Socio | Organizer | Staff | Manager | Club Admin | Platform Admin |
|---|---|---|---|---|---|---|---|---|
| READ públicos | Y | Y | Y | Y | Y | Y | Y | Y |
| READ privados | N | A | A | A | A | Y | Y | Y |
| REGISTER | N | Y | Y | Y | Y | Y | Y | Y |
| CREATE / PUBLISH | N | N | N | N | A | Y | Y | Y |
| UPDATE resultados | N | N | N | N | A | Y | Y | Y |

---

## EXPERIENCES (Social)

| Acción | Guest | Member | Socio | Organizer | Staff | Manager | Club Admin | Platform Admin |
|---|---|---|---|---|---|---|---|---|
| READ públicas | N | Y | Y | Y | Y | Y | Y | Y |
| CREATE | N | Y | Y | Y | Y | Y | Y | Y |
| UPDATE propia | N | O | O | O | Y | Y | Y | Y |
| UPDATE ajena | N | N | N | N | A | Y | Y | Y |

Organizer: únicamente experiencias/partidos creados por él.

---

## RESTAURANT / MENU / ORDERS

| Acción | Guest | Member | Socio | Organizer | Staff | Manager | Club Admin | Platform Admin |
|---|---|---|---|---|---|---|---|---|
| READ carta | Y | Y | Y | Y | Y | Y | Y | Y |
| CREATE reserva mesa | N | Y | Y | Y | Y | Y | Y | Y |
| CREATE order | N | Y | Y | Y | Y | Y | Y | Y |
| MANAGE mesas / carta | N | N | N | N | A | Y | Y | Y |

---

## PAYMENTS

| Acción | Guest | Member | Socio | Organizer | Staff | Manager | Club Admin | Platform Admin |
|---|---|---|---|---|---|---|---|---|
| PAY propio | N | Y | Y | Y | Y | Y | Y | Y |
| READ propio | N | Y | Y | Y | Y | Y | Y | Y |
| REFUND / MANAGE | N | N | N | N | N | A | Y | Y |

---

## CMS / SETTINGS / ANALYTICS / AUTOMATIONS

| Acción | Guest | Member | Socio | Organizer | Staff | Manager | Club Admin | Platform Admin |
|---|---|---|---|---|---|---|---|---|
| READ analytics operativo | N | N | N | N | A | Y | Y | Y |
| PUBLISH CMS | N | N | N | N | A | Y | Y | Y |
| CONFIGURE SETTINGS | N | N | N | N | N | N | Y | Y |
| MANAGE AUTOMATIONS | N | N | N | N | N | A | Y | Y |

---

## Notas

* Socio hereda permisos de Member y añade beneficios de membresía activa.
* Guest nunca crea BOOKING ni PAYMENT (BR-0003).
* User Suspended: no CREATE booking (BR-0039).
* Validación siempre en servidor (BR-0013).
* Single-tenant v1 (DEC-001).
