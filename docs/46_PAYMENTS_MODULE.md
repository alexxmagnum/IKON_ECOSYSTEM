# 46 — PAYMENTS_MODULE

# Pagos simples, seguros e integrados

---

# Objetivo

Definir el funcionamiento completo del módulo de Pagos de IKON.

El módulo permitirá gestionar todos los cobros realizados dentro del ecosistema del club de forma segura, transparente y automatizada.

Los pagos no serán un sistema independiente.

Serán una capa transversal integrada con todos los servicios de IKON.

---

# Visión

El usuario nunca debería preguntarse cómo pagar.

Simplemente disfrutará de la experiencia.

Reservar una salida.

Inscribirse en un torneo.

Comprar una membresía.

Reservar una mesa.

Todo deberá realizarse mediante un proceso de pago rápido y sencillo.

---

# Alcance

El módulo incluye:

* Pagos online.
* Pagos presenciales (cuando proceda).
* Membresías.
* Eventos.
* Torneos.
* Reservas.
* Restaurante.
* Reembolsos.
* Facturación.
* Historial.
* Métodos de pago.

---

# Filosofía

El proceso de pago debe ser:

* rápido,
* seguro,
* transparente,
* confiable.

Nunca deberá convertirse en un obstáculo para el usuario.

---

# Actores

## Usuario registrado

Puede:

* pagar reservas,
* pagar eventos,
* pagar torneos,
* renovar membresías,
* consultar pagos,
* descargar facturas.

---

## Socio

Además podrá beneficiarse de:

* descuentos,
* tarifas especiales,
* promociones exclusivas.

---

## Staff

Puede:

* comprobar pagos,
* registrar pagos presenciales,
* gestionar incidencias.

---

## Manager

Puede:

* configurar precios,
* consultar ingresos,
* gestionar devoluciones,
* emitir reembolsos cuando proceda,
* acceder a informes económicos.

---

# Conceptos de pago

El sistema deberá permitir cobrar por:

* Reservas.
* Green Fees.
* Pistas de pádel.
* Campo de fútbol 7.
* Restaurante.
* Eventos.
* Torneos.
* Membresías.
* Productos del club.
* Servicios adicionales.

---

# Métodos de pago

El sistema deberá permitir configurar:

* Tarjeta bancaria.
* Apple Pay.
* Google Pay.
* Otros métodos compatibles con el proveedor de pagos utilizado.

Los métodos disponibles dependerán del proveedor configurado por el club.

---

# Casos de uso

## Pagar una reserva

El usuario confirma la reserva.

↓

Selecciona el método de pago.

↓

Completa el pago.

↓

La reserva queda confirmada.

---

## Renovar membresía

El usuario acepta la renovación.

↓

Realiza el pago.

↓

La membresía se activa automáticamente.

---

## Pagar un torneo

La inscripción queda pendiente.

↓

Pago realizado.

↓

Inscripción confirmada.

---

## Reembolso

Cuando las normas del club lo permitan,

el personal autorizado podrá iniciar un reembolso.

---

## Facturas

El usuario podrá consultar:

* pagos,
* recibos,
* facturas disponibles.

---

# Estados

## Pago

Estados canónicos (únicos; ver `docs/rules/state-machines.md` y DEC-003):

* Pending
* Authorized
* Captured
* Failed
* Cancelled
* Refunded
* PartiallyRefunded

No se utilizarán otros nombres ni sinónimos para estos estados.

---

## Reembolso

Transiciones de reembolso se reflejan en `PAYMENT` como `PartiallyRefunded` o `Refunded`.

Estados operativos de un reembolso individual (subproceso):

* Pending
* Approved
* Processing
* Completed
* Rejected

---

# Reglas de negocio

## RB-001

Una reserva que requiera pago no quedará `Confirmed` hasta que el pago alcance `Captured`.

---

## RB-002

Cada club podrá definir qué servicios requieren pago anticipado.

---

## RB-003

Los reembolsos respetarán siempre la política de cancelación correspondiente.

---

## RB-004

Todo pago deberá quedar registrado con su correspondiente trazabilidad.

---

## RB-005

Los importes mostrados al usuario deberán ser siempre los importes finales.

---

# Integración con Reservas

El pago podrá confirmar automáticamente:

* reservas,
* green fees,
* pistas,
* instalaciones.

---

# Integración con Eventos

Los eventos de pago activarán automáticamente la inscripción tras la confirmación del cobro.

---

# Integración con Torneos

El pago validará la participación cuando sea obligatorio.

---

# Integración con Membresías

Las cuotas actualizarán automáticamente el estado del socio.

---

# Integración con Restaurante

Cuando el club lo habilite,

el sistema podrá gestionar:

* pagos anticipados,
* depósitos para grupos,
* reservas con garantía.

---

# Integración con Analytics

Toda operación económica alimentará automáticamente el sistema de analítica.

---

# Automatizaciones

Ejemplos:

* Confirmación de pago.
* Envío de recibo.
* Activación de la membresía.
* Confirmación de reserva.
* Recordatorio de pago pendiente.
* Aviso de renovación próxima.

---

# Analítica

El sistema medirá:

* ingresos,
* pagos completados,
* pagos fallidos,
* reembolsos,
* ticket medio,
* ingresos por módulo,
* evolución mensual.

---

# Casos límite

* Pago rechazado.
* Doble intento de pago.
* Error de comunicación con el proveedor.
* Reembolso parcial.
* Cancelación durante el proceso de pago.
* Cambio de precio antes de finalizar la compra.
* Interrupción de la conexión.

Todos estos escenarios deberán resolverse garantizando la integridad de la operación y evitando cobros duplicados.

---

# Seguridad

El sistema nunca almacenará directamente datos sensibles de tarjetas bancarias.

Toda la información de pago será gestionada mediante el proveedor de pagos configurado por el club.

IKON almacenará únicamente la información necesaria para identificar la operación y mantener la trazabilidad.

---

# Criterios de aceptación

El módulo se considerará completo cuando:

* pagar resulte sencillo desde cualquier dispositivo,
* las reservas se confirmen automáticamente tras el pago,
* los reembolsos respeten las reglas del club,
* los usuarios puedan consultar su historial de pagos,
* el personal pueda gestionar incidencias de forma eficiente,
* toda la información económica quede correctamente registrada.

---

# Visión a largo plazo

El módulo de Pagos deberá integrarse de forma completamente transparente con el resto del ecosistema.

El usuario no deberá percibir los pagos como un proceso independiente, sino como una parte natural de la experiencia IKON.

---

# Regla final

Pagar nunca debe ser el momento más complicado de una experiencia.

Debe ser el paso más sencillo.

IKON deberá conseguir que el usuario pueda centrarse en disfrutar del club, no en completar un proceso de pago.
