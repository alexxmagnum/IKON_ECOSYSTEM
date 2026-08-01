# 35 — RESTAURANT_MODULE

## Objetivo

Definir el funcionamiento completo del restaurante dentro del ecosistema IKON.

El restaurante no será un módulo independiente.

Será uno de los principales generadores de experiencias del club.

Toda funcionalidad relacionada con gastronomía deberá respetar este documento.

---

# Visión

El restaurante no vende únicamente comida.

Forma parte de la experiencia IKON.

Una reserva de golf puede terminar en una comida.

Un torneo puede terminar en una cena.

Una cata puede convertirse en una nueva amistad.

El restaurante debe integrarse con todo el ecosistema.

---

# Alcance

Este módulo incluye:

* reservas,
* gestión de mesas,
* pedidos,
* carta,
* horarios,
* ocupación,
* promociones gastronómicas,
* integración con eventos,
* integración con experiencias.

No incluye la administración interna de cocina (ERP o TPV), salvo las integraciones necesarias.

---

# Actores

## Visitante

Puede consultar:

* carta,
* horarios,
* disponibilidad,
* información general.

---

## Usuario registrado

Puede:

* reservar mesa,
* modificar reserva,
* cancelar,
* realizar pedidos (si está habilitado),
* consultar historial.

---

## Socio

Además podrá acceder a:

* ventajas exclusivas,
* eventos gastronómicos,
* promociones específicas.

---

## Staff

Puede:

* gestionar reservas,
* registrar llegadas,
* actualizar disponibilidad,
* gestionar estados de mesas.

---

## Manager

Puede:

* administrar horarios,
* gestionar capacidad,
* consultar estadísticas,
* configurar promociones,
* supervisar la operación.

---

# Casos de uso

## Consultar carta

El usuario puede explorar la carta sin necesidad de registrarse.

---

## Reservar mesa

El usuario selecciona:

* fecha,
* hora,
* número de personas,
* preferencias (si existen).

El sistema propone las mejores opciones disponibles.

---

## Modificar reserva

Permitido mientras se respeten las reglas del club.

---

## Cancelar reserva

La cancelación actualizará automáticamente la disponibilidad.

Las políticas de cancelación podrán variar según el tipo de reserva.

---

## Check-in

Cuando el cliente llega,

el personal registra su llegada.

Esto actualiza automáticamente el estado de la mesa.

---

## Pedido

Si el club decide habilitar pedidos desde la PWA,

el usuario podrá realizar pedidos desde su mesa mediante QR o desde su reserva activa.

---

# Estados de una reserva

Una reserva podrá encontrarse en:

* Pendiente.
* Confirmada.
* En espera.
* Check-in realizado.
* En curso.
* Completada.
* Cancelada.
* No presentada (No Show).

Todos los cambios deberán quedar registrados.

---

# Estados de una mesa

Cada mesa podrá encontrarse en:

* Libre.
* Reservada.
* Ocupada.
* En preparación.
* Fuera de servicio.

Nunca existirán estados ambiguos.

---

# Reglas de negocio

## RB-001

Una mesa no puede asignarse a dos reservas que se solapen.

---

## RB-002

Una reserva cancelada libera automáticamente la disponibilidad.

---

## RB-003

Un usuario suspendido no puede realizar reservas.

---

## RB-004

Las reservas deben respetar el aforo disponible.

---

## RB-005

El sistema podrá gestionar listas de espera cuando el restaurante esté completo.

---

## RB-006

Las promociones gastronómicas podrán tener restricciones de fechas, horarios o tipo de usuario.

---

# Integraciones

Este módulo se integra con:

* 36_DIGITAL_MENU.md
* 42_EVENTS_MODULE.md
* 43_TOURNAMENTS_MODULE.md
* 44_MEMBERS_MODULE.md
* 46_PAYMENTS_MODULE.md
* 47_BOOKING_MODULE.md
* Recommendation Engine
* Notification Engine
* Analytics

---

# Automatizaciones

Ejemplos:

* Confirmación de reserva.
* Recordatorio antes de la llegada.
* Liberación automática de mesas por cancelación.
* Notificación cuando una mesa queda disponible desde lista de espera.
* Solicitud de valoración tras la visita.

---

# Analítica

El sistema medirá:

* ocupación,
* rotación de mesas,
* ticket medio,
* cancelaciones,
* no shows,
* tiempo medio de ocupación,
* conversión de reservas,
* satisfacción.

---

# Casos límite

* Dos usuarios intentando reservar la última mesa simultáneamente.
* Cliente que llega tarde.
* Mesa bloqueada por mantenimiento.
* Error en el pago de una reserva.
* Cancelación mientras existe lista de espera.
* Cierre excepcional del restaurante.
* Cambio de capacidad por climatología o eventos.

Todos estos casos deberán resolverse sin dejar el sistema en un estado inconsistente.

---

# Criterios de aceptación

El módulo se considerará completo cuando:

* un visitante pueda consultar la carta y disponibilidad,
* un usuario pueda reservar, modificar y cancelar una mesa,
* el personal pueda gestionar las reservas del servicio,
* las mesas reflejen siempre su estado real,
* las automatizaciones reduzcan trabajo manual,
* las reglas de negocio impidan conflictos de reservas,
* la analítica permita optimizar la operación del restaurante.

---

# Visión a largo plazo

El restaurante deberá convertirse en uno de los motores principales de la comunidad IKON.

No será únicamente un lugar donde comer.

Será un punto de encuentro entre personas, eventos y experiencias.

Cada reserva deberá tener el potencial de convertirse en una experiencia memorable.

---

# Regla final

El objetivo del módulo Restaurante no es llenar mesas.

Es conseguir que cada mesa ocupada forme parte de una experiencia excelente dentro de IKON.
