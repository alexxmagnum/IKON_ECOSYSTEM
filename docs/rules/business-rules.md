# IKON_ECOSYSTEM — Business Rules

Fuente de verdad: documentación funcional `docs/00`–`docs/53` y diagramas en `docs/diagrams/`.

Este catálogo define el comportamiento funcional verificable del sistema.

No contiene código, SQL ni contratos de API.

Cada regla tiene un identificador único e inmutable (`BR-NNNN`).

---

# 1. Identidad y autenticación

---

## BR-0001

Identidad única por persona

Cada persona dispone de una única identidad de usuario dentro de IKON.

Impacto

- Authentication
- Profile
- Members

Justificación

Evita cuentas duplicadas y mantiene historial, membresía y reservas unificados.

---

## BR-0002

Exploración sin registro completo

Un visitante puede explorar contenido público sin completar un registro largo.

Impacto

- Authentication
- CMS
- Restaurant
- Events

Justificación

Reduce fricción de entrada y permite descubrir el club antes de comprometerse.

---

## BR-0003

Guest no puede reservar

Un Guest no autenticado no puede crear reservas, pagar ni crear experiencias.

Impacto

- Authentication
- Booking Engine
- Payments
- Social Experience Engine

Justificación

Las operaciones con compromiso requieren identidad verificable.

---

## BR-0004

Registro progresivo

El perfil no exige completarse íntegramente en el alta inicial; los datos se solicitan cuando aportan valor al caso de uso.

Impacto

- Authentication
- Profile

Justificación

Documentado en autenticación: fricción mínima sin sacrificar calidad de datos.

---

## BR-0005

Recuperación de acceso preserva historial

Recuperar el acceso no implica perder reservas, historial, membresía ni actividad.

Impacto

- Authentication
- Members
- Booking Engine
- Profile

Justificación

La cuenta es el contenedor de la relación con el club.

---

## BR-0006

Credenciales de autenticación no son públicas

La información utilizada para autenticar nunca se muestra públicamente en el perfil ni en contenido social.

Impacto

- Authentication
- Profile
- Security

Justificación

Protege la privacidad y reduce riesgo de suplantación.

---

## BR-0007

Verificación de correo para acciones sensibles

Determinadas acciones (reservas sensibles, vincular membresía, crear contenido comunitario) pueden requerir correo verificado.

Impacto

- Authentication
- Booking Engine
- Members
- CMS

Justificación

Aumenta la confianza de las operaciones críticas.

---

## BR-0008

Vinculación de membresía existente

Una cuenta nueva puede vincularse a una membresía existente solo mediante verificación controlada, nunca solo con datos públicos.

Impacto

- Authentication
- Members

Justificación

Evita apropiación indebida de beneficios de socio.

---

## BR-0009

Cierre de sesiones remotas

El usuario puede cerrar sesiones abiertas en otros dispositivos.

Impacto

- Authentication
- Security

Justificación

Mitiga acceso no autorizado tras pérdida de dispositivo.

---

## BR-0010

Autenticación reforzada para accesos sensibles

Perfiles con capacidad de modificar configuración crítica pueden requerir autenticación multifactor.

Impacto

- Authentication
- Platform Admin
- Security

Justificación

Protege la operación del club y de la plataforma.

---

# 2. Roles y permisos

---

## BR-0011

Autorización exclusivamente RBAC

Toda autorización se obtiene mediante roles y permisos. No se conceden permisos individuales ACL por usuario.

Impacto

- Permissions
- Platform Admin
- All modules

Justificación

Modelo RBAC documentado: escalable, auditable y coherente.

---

## BR-0012

Un usuario puede tener varios roles

Un mismo usuario puede acumular uno o varios roles simultáneos.

Impacto

- Permissions
- Authentication

Justificación

Permite escenarios reales (socio + organizador, staff + manager parcial).

---

## BR-0013

Validación de permisos en servidor

Toda operación sensible se valida en servidor; ocultar UI no constituye autorización.

Impacto

- Permissions
- Security
- Platform Admin

Justificación

Principio de seguridad documentado en permisos.

---

## BR-0014

Mínimo privilegio

Cada rol concede únicamente los permisos necesarios para su función.

Impacto

- Permissions
- Staff
- Manager
- Club Admin
- Platform Admin

Justificación

Reduce superficie de abuso y error operativo.

---

## BR-0015

Guest solo contenido público

El rol Guest únicamente accede a contenido e información pública autorizada.

Impacto

- Permissions
- CMS
- Events
- Restaurant

Justificación

Modelo RBAC canónico (DEC-002).

---

## BR-0016

Ownership de reservas (BOOKING)

Toda reserva tiene un **owner** (`user_id` del creador / titular).

Permisos sobre BOOKING:

| Acción | Guest | Member / Socio / Organizer | Staff | Manager | Club Admin | Platform Admin |
|---|---|---|---|---|---|---|
| Consultar propia | No | Sí | Sí | Sí | Sí | Sí |
| Consultar ajena | No | No | Sí (ámbito operativo) | Sí | Sí | Sí |
| Crear | No | Sí (si no Suspended) | Sí | Sí | Sí | Sí |
| Modificar propia | No | Sí (según reglas del recurso) | Sí | Sí | Sí | Sí |
| Modificar ajena | No | No | Sí | Sí | Sí | Sí |
| Cancelar propia | No | Sí (según política) | Sí | Sí | Sí | Sí |
| Cancelar ajena | No | No | Sí | Sí | Sí | Sí |

Organizer no obtiene ownership de reservas ajenas; solo gestiona experiencias/partidos propios según `27_PERMISSIONS.md`.

Impacto

- Permissions
- Profile
- Booking Engine
- Payments

Justificación

Resuelve ownership enforceable; alineado con RBAC y DEC-002.

---

## BR-0017

Staff limitado a tareas operativas

Staff gestiona únicamente tareas operativas de su ámbito; no configura el sistema crítico.

Impacto

- Permissions
- Booking Engine
- Restaurant
- Platform Admin

Justificación

Separación entre operación diaria y administración.

---

## BR-0018

Manager gestiona operación diaria

Manager administra operación, contenidos operativos y analítica autorizada, sin modificar configuración crítica del sistema.

Impacto

- Permissions
- CMS
- Events
- Analytics

Justificación

Rol documentado en permisos y módulos operativos.

---

## BR-0019

Club Admin acotado al club del despliegue

Club Admin administra únicamente el club del despliegue actual (single-tenant v1).

Impacto

- Permissions
- Platform Admin

Justificación

DEC-001 en `docs/project/DECISIONS.md`: IKON_ECOSYSTEM v1 es single-tenant.

---

## BR-0020

Platform Admin acceso completo de plataforma

Platform Admin tiene acceso completo a la plataforma según su rol, sin omitir auditoría.

Impacto

- Permissions
- Platform Admin
- Audit

Justificación

Nivel máximo del modelo de actores documentado.

---

## BR-0021

Asignación de roles auditable

Toda asignación o revocación de rol queda asociada a un actor responsable.

Impacto

- Permissions
- Audit
- Platform Admin

Justificación

Principio de auditoría de acciones importantes.

---

# 3. Membresías

---

## BR-0022

Separación plan / membresía

`MEMBERSHIP_PLAN` define el producto; `MEMBERSHIP` representa la relación activa del usuario con ese plan.

Impacto

- Members
- Payments
- Data Model

Justificación

Evita mezclar catálogo de planes con estado individual del socio.

---

## BR-0023

Usuario sin membresía válida

Un usuario registrado puede existir sin ser socio.

Impacto

- Members
- Profile
- Booking Engine

Justificación

Modelo de dominio: la membresía es opcional.

---

## BR-0024

Beneficios solo con membresía activa

Las ventajas de socio solo aplican cuando la membresía está en estado activo válido.

Impacto

- Members
- Booking Engine
- Events
- Tournaments
- Restaurant

Justificación

Impide uso de beneficios caducados o suspendidos.

---

## BR-0025

Prioridad de reserva según membresía

Las prioridades de anticipación y acceso respetan el tipo de usuario y su membresía.

Impacto

- Members
- Booking Engine
- Golf
- Padel
- Events

Justificación

RB-006 del Booking Engine y reglas de módulos deportivos/eventos.

---

## BR-0026

Renovación preserva historial

La renovación de una membresía no crea un usuario nuevo ni borra el historial del socio.

Impacto

- Members
- Payments
- Profile

Justificación

El ciclo de vida del socio es continuo.

---

## BR-0027

Pago de cuota confirma renovación

Cuando la renovación requiere cobro, la membresía no se considera renovada hasta confirmación del pago.

Impacto

- Members
- Payments

Justificación

Alineado con la regla de confirmación post-pago.

---

## BR-0028

Invitados de socio controlados

Los invitados de un socio solo acceden a experiencias/reservas explícitamente autorizadas por las reglas del club.

Impacto

- Members
- Booking Engine
- Social Experience Engine

Justificación

Documentado en autenticación y módulo de socios.

---

## BR-0029

Estados de membresía explícitos

Una membresía siempre tiene un estado interpretable (por ejemplo activa, pendiente, suspendida, vencida, cancelada) según configuración del club.

Impacto

- Members
- Booking Engine
- Payments

Justificación

Permite validaciones deterministas en reservas y beneficios.

---

# 4. Reservas

---

## BR-0030

Motor unificado de reservas

Toda reserva de cualquier recurso del club pasa por el Booking Engine único.

Impacto

- Booking Engine
- Golf
- Padel
- Football
- Billiard
- Darts
- Restaurant
- Events

Justificación

Visión del Booking Module: un proceso, múltiples recursos.

---

## BR-0031

Prohibición de solapes activos

Nunca pueden existir dos reservas **availability-blocking** solapadas sobre el mismo recurso.

Estados que **bloquean disponibilidad** (ocupan el slot del recurso):

* `Draft` (mientras exista hold temporal)
* `Pending`
* `PaymentPending`
* `Confirmed`
* `CheckedIn`
* `InProgress`

Estados que **no bloquean** disponibilidad:

* `Waitlisted`
* `Completed`
* `Cancelled`
* `NoShow`
* `Expired`

Impacto

- Booking Engine
- All bookable domains

Justificación

RB-001 del Booking Module; alineado con `state-machines.md` (BOOKING) y DEC de disponibilidad.

---

## BR-0032

Disponibilidad siempre real

La disponibilidad mostrada incorpora reservas existentes, bloqueos, mantenimiento, horarios y eventos que afecten al recurso.

Impacto

- Booking Engine
- Analytics

Justificación

Nunca se muestra disponibilidad incorrecta.

---

## BR-0033

Revalidación en modificación

Toda modificación de reserva vuelve a validar disponibilidad, reglas, permisos y capacidad.

Impacto

- Booking Engine

Justificación

RB-002 del Booking Module.

---

## BR-0034

Política de cancelación por recurso

Las políticas de cancelación dependen del recurso reservado y de la configuración del club.

Impacto

- Booking Engine
- Payments
- Notification Engine

Justificación

RB-003 del Booking Module.

---

## BR-0035

Lista de espera automática

Cuando un recurso está completo, el usuario puede entrar en lista de espera; una plaza libre notifica al siguiente automáticamente.

La oferta de plaza desde lista de espera caduca tras un TTL configurable por club (**default: 15 minutos**). Si expira, se ofrece al siguiente en cola.

`Waitlisted` **no** bloquea disponibilidad del recurso.

Impacto

- Booking Engine
- Notification Engine

Justificación

RB-004 y sección Lista de espera del Booking Module.

---

## BR-0036

Reglas temporales del recurso

Cada recurso puede definir duración mínima/máxima, preparación, limpieza y separación entre reservas.

Impacto

- Booking Engine
- Golf
- Restaurant
- Padel

Justificación

RB-005 del Booking Module.

---

## BR-0037

Bloqueo temporal durante el proceso

Durante la creación de una reserva (especialmente con pago) el sistema aplica un bloqueo temporal sobre el recurso.

* TTL configurable por club (**default: 15 minutos**).
* Al expirar el TTL: la reserva en `Draft` / `PaymentPending` pasa a `Expired` o `Cancelled` según política, y el recurso se libera.
* Si el proceso falla (pago, validación, cancelación): el bloqueo se libera de inmediato.

Impacto

- Booking Engine
- Payments

Justificación

Flujos de booking/restaurant y casos límite de pago.

---

## BR-0038

Confirmación condicionada al pago

Si la reserva requiere pago, el estado `Confirmed` solo se alcanza tras `PAYMENT` en estado `Captured`.

Impacto

- Booking Engine
- Payments

Justificación

Integración Pagos–Reservas; máquina `PAYMENT` canónica.

---

## BR-0039

Usuario suspendido no crea reservas

Un usuario suspendido no puede crear nuevas reservas.

Impacto

- Booking Engine
- Permissions
- Billiard
- Darts

Justificación

Reglas explícitas en módulos de billar y dardos; coherente con estado de usuario.

---

## BR-0040

Check-in actualiza estado

El check-in (QR, recepción o manual) actualiza el estado de la reserva y, cuando aplique, del recurso/mesa.

Impacto

- Booking Engine
- Restaurant
- Golf
- Padel
- Football

Justificación

Casos de uso de check-in documentados.

---

## BR-0041

No Show aplica política del club

Si el usuario no se presenta, el sistema puede aplicar automáticamente las políticas de No Show definidas por el club.

Impacto

- Booking Engine
- Payments
- Analytics
- Notification Engine

Justificación

Caso de uso No Show del Booking Module.

---

## BR-0042

Cancelación libera disponibilidad

Toda cancelación válida actualiza inmediatamente la disponibilidad del recurso.

Impacto

- Booking Engine
- Notification Engine

Justificación

Común a Booking, Padel, Football, Billiard, Darts, Events.

---

## BR-0043

Calendario unificado

Todos los recursos utilizan el mismo motor de calendario; cada módulo solo decide la representación visual.

Impacto

- Booking Engine
- All bookable domains

Justificación

Sección Calendario del Booking Module.

---

## BR-0044

Recurso bloqueado no es reservable

Un recurso en estado bloqueado, mantenimiento o fuera de servicio no acepta nuevas reservas de usuario.

Impacto

- Booking Engine
- Golf
- Restaurant

Justificación

Estados de recurso documentados.

---

## BR-0045

Auditoría de reserva

Toda creación, modificación, cancelación, check-in y No Show queda registrada de forma trazable.

Impacto

- Booking Engine
- Audit
- Analytics

Justificación

Criterios de aceptación: reservas registradas y trazables.

---

## BR-0046

Participantes en reserva

Una reserva puede incluir participantes; las reglas de capacidad y confirmación se aplican sobre el conjunto.

Impacto

- Booking Engine
- Social Experience Engine
- Golf
- Padel
- Football

Justificación

Modelo de booking con participantes y flujos sociales.

---

# 5. Golf

---

## BR-0047

Golf usa Booking Engine

Las salidas de golf (tee times) se reservan exclusivamente mediante el Booking Engine.

Impacto

- Golf
- Booking Engine

Justificación

Golf es experiencia de ecosistema, no un motor de reservas paralelo.

---

## BR-0048

Experiencia continua de jornada

Una jornada de golf se modela como recorrido continuo (antes, durante y después), no como acciones aisladas.

Impacto

- Golf
- Social Experience Engine
- Restaurant
- Recommendation Engine

Justificación

Filosofía de `37_GOLF_ECOSYSTEM.md`.

---

## BR-0049

Completar grupo de jugadores

Si faltan jugadores, el Social Experience Engine puede buscar compatibles e invitaciones sin imponer jugadores automáticamente.

Impacto

- Golf
- Social Experience Engine
- Notification Engine

Justificación

Problema “somos tres / no encuentro con quién jugar”.

---

## BR-0050

Resultado opcional post-partida

El registro de resultado/scorecard puede realizarse cuando proceda; no bloquea la existencia de la reserva confirmada.

Impacto

- Golf
- Analytics

Justificación

Flujo golf: jugar primero; resultado cuando corresponda.

---

## BR-0051

Cierre de campo anula o reprograma

Lluvia, mantenimiento o cierre del campo deben actualizar disponibilidad y notificar a afectados.

Impacto

- Golf
- Booking Engine
- Notification Engine

Justificación

Actores Marshall/Greenkeeper y casos especiales del flujo golf.

---

## BR-0052

Post-partida sugiere restaurante y siguiente actividad

Tras finalizar, el Recommendation Engine puede sugerir restaurante, próxima partida, torneo o evento.

Impacto

- Golf
- Restaurant
- Recommendation Engine
- Events
- Tournaments

Justificación

Pilares Club y Fidelización del ecosistema golf.

---

## BR-0053

Visitante no reserva golf

Un visitante puede descubrir el club de golf pero no reservar salidas.

Impacto

- Golf
- Authentication
- Booking Engine

Justificación

Actores del ecosistema golf.

---

# 6. Pádel

---

## BR-0054

Sin doble reserva de pista

Una pista de pádel no puede reservarse dos veces para el mismo horario.

Impacto

- Padel
- Booking Engine

Justificación

RB-001 Pádel.

---

## BR-0055

Organizador define aforo del partido

El organizador puede definir el número máximo de participantes del partido.

Impacto

- Padel
- Social Experience Engine

Justificación

RB-002 Pádel.

---

## BR-0056

Sin auto-añadir jugadores

El sistema nunca añade automáticamente un jugador sin respetar las preferencias del organizador.

Impacto

- Padel
- Social Experience Engine
- Recommendation Engine

Justificación

RB-003 Pádel.

---

## BR-0057

Cancelación libera pista inmediatamente

Las cancelaciones de pádel actualizan inmediatamente la disponibilidad.

Impacto

- Padel
- Booking Engine

Justificación

RB-004 Pádel.

---

## BR-0058

Prioridades de usuario en pádel

Las reservas de pádel respetan normas del club y prioridades por tipo de usuario/membresía.

Impacto

- Padel
- Members
- Booking Engine

Justificación

RB-005 Pádel.

---

## BR-0059

Privacidad al buscar jugadores

La búsqueda de compañeros respeta la configuración de privacidad de cada usuario.

Impacto

- Padel
- Social Experience Engine
- Profile

Justificación

Caso de uso Buscar jugadores.

---

## BR-0060

Partido abierto con lista de espera

Un partido completo puede ofrecer lista de espera según reglas del club.

Impacto

- Padel
- Booking Engine
- Notification Engine

Justificación

Caso de uso Lista de espera Pádel.

---

# 7. Fútbol 7

---

## BR-0061

Una reserva de campo por horario

No puede existir más de una reserva activa del campo para el mismo horario.

Impacto

- Football
- Booking Engine

Justificación

RB-001 Fútbol 7.

---

## BR-0062

Plazas no confirmadas no son definitivas

Los participantes no confirmados no ocupan definitivamente una plaza hasta cumplir las reglas del club.

Impacto

- Football
- Social Experience Engine
- Booking Engine

Justificación

RB-002 Fútbol 7.

---

## BR-0063

Cancelación libera campo inmediatamente

Una cancelación actualiza inmediatamente la disponibilidad del campo.

Impacto

- Football
- Booking Engine

Justificación

RB-003 Fútbol 7.

---

## BR-0064

Prioridades de usuario en fútbol

Las reservas respetan las prioridades de cada tipo de usuario.

Impacto

- Football
- Members
- Booking Engine

Justificación

RB-004 Fútbol 7.

---

## BR-0065

Sin auto-convocatoria forzada

El sistema nunca añade automáticamente jugadores sin respetar las preferencias del organizador.

Impacto

- Football
- Social Experience Engine

Justificación

RB-005 Fútbol 7.

---

## BR-0066

Equipos asociados al partido

La formación de equipos pertenece al partido y no crea reservas alternativas del campo.

Impacto

- Football
- Booking Engine

Justificación

Casos de uso Crear equipos / modelo de dominio.

---

## BR-0067

Privacidad en búsqueda de jugadores

Buscar jugadores para fútbol 7 respeta la privacidad configurada por cada persona.

Impacto

- Football
- Social Experience Engine
- Profile

Justificación

Caso de uso Buscar jugadores.

---

# 8. Billar

---

## BR-0068

Sin solape de mesa de billar

Una mesa de billar no puede reservarse dos veces para el mismo horario.

Impacto

- Billiard
- Booking Engine

Justificación

Regla de negocio del módulo Billar.

---

## BR-0069

Cancelación libera mesa de billar

Las cancelaciones actualizan la disponibilidad de la mesa inmediatamente.

Impacto

- Billiard
- Booking Engine

Justificación

Regla de negocio del módulo Billar.

---

## BR-0070

Usuario suspendido no reserva billar

Los usuarios suspendidos no pueden crear nuevas reservas de billar.

Impacto

- Billiard
- Booking Engine
- Permissions

Justificación

Regla explícita del módulo Billar.

---

## BR-0071

Ligas respetan reglas del club

Las ligas de billar respetan las reglas configuradas por el club.

Impacto

- Billiard
- Tournaments

Justificación

Regla de negocio del módulo Billar.

---

## BR-0072

Post-partida puede enlazar restaurante

Tras una partida, el sistema puede facilitar continuidad hacia restaurante u otras experiencias sociales.

Impacto

- Billiard
- Restaurant
- Social Experience Engine
- Recommendation Engine

Justificación

Integraciones documentadas del módulo.

---

# 9. Dardos

---

## BR-0073

Sin solapes en zona de dardos

No pueden existir reservas solapadas de la zona de dardos.

Impacto

- Darts
- Booking Engine

Justificación

RB-001 Dardos.

---

## BR-0074

Cancelación libera zona de dardos

Las cancelaciones actualizan inmediatamente la disponibilidad.

Impacto

- Darts
- Booking Engine

Justificación

RB-002 Dardos.

---

## BR-0075

Usuario suspendido no reserva dardos

Los usuarios suspendidos no pueden crear nuevas reservas de dardos.

Impacto

- Darts
- Booking Engine
- Permissions

Justificación

RB-003 Dardos.

---

## BR-0076

Ligas y torneos configurables

Ligas y torneos de dardos respetan las reglas configuradas por el club.

Impacto

- Darts
- Tournaments

Justificación

RB-004 Dardos.

---

## BR-0077

Organizador puede limitar acceso

El organizador puede limitar el acceso a una partida de dardos.

Impacto

- Darts
- Social Experience Engine

Justificación

RB-005 Dardos.

---

## BR-0078

Organización simple por defecto

La organización de partidas de dardos no debe convertirse en un proceso administrativo complejo para el usuario.

Impacto

- Darts
- Social Experience Engine
- Booking Engine

Justificación

Filosofía del módulo Dardos.

---

# 10. Restaurante

---

## BR-0079

Restaurante integrado en el ecosistema

El restaurante no opera como silo; se integra con reservas deportivas, eventos y experiencias.

Impacto

- Restaurant
- Golf
- Events
- Social Experience Engine

Justificación

Visión del Restaurant Module.

---

## BR-0080

Reserva de mesa vía Booking Engine

Las reservas de mesa, salón o terraza usan el Booking Engine unificado.

Impacto

- Restaurant
- Booking Engine

Justificación

Recursos reservables del Booking Module.

---

## BR-0081

Acceso sin reserva cuando el club lo permita

Si no se requiere reserva, el cliente puede acceder en walk-in con asignación de mesa cuando proceda.

Impacto

- Restaurant
- Booking Engine

Justificación

Flujo restaurant: ¿Reserva necesaria?

---

## BR-0082

Carta consultable sin registro

Un visitante puede consultar la carta digital sin registrarse.

Impacto

- Restaurant
- Digital Menu
- Authentication

Justificación

Caso de uso Consultar carta / Digital Menu.

---

## BR-0083

Pedido solo si está habilitado

Los pedidos desde PWA/QR solo existen cuando el club habilita esa capacidad.

Impacto

- Restaurant
- Digital Menu
- Payments

Justificación

Caso de uso Pedido del Restaurant Module.

---

## BR-0084

Check-in de mesa actualiza estado

Al registrar la llegada, se actualiza el estado de la reserva y de la mesa.

Impacto

- Restaurant
- Booking Engine

Justificación

Caso de uso Check-in restaurante.

---

## BR-0085

Depósito previo condiciona confirmación

Si la reserva gastronómica requiere depósito/pago previo, no se confirma hasta cobro validado.

Impacto

- Restaurant
- Payments
- Booking Engine

Justificación

Alineado con pagos y flujo restaurant.

---

## BR-0086

Cambio de mesa operativo

El personal puede cambiar la mesa asignada; el cliente debe permanecer informado cuando el cambio afecte su experiencia.

Impacto

- Restaurant
- Notification Engine
- Booking Engine

Justificación

Caso especial del flujo restaurant.

---

## BR-0087

Cierre temporal del restaurante

Un cierre temporal actualiza disponibilidad, libera o reprograma reservas afectadas y notifica.

Impacto

- Restaurant
- Booking Engine
- Notification Engine

Justificación

Caso especial documentado en el flujo.

---

## BR-0088

Carta digital no es un PDF estático

La carta es una experiencia interactiva (categorías, alérgenos, disponibilidad, favoritos) alineada a la identidad del club.

Impacto

- Digital Menu
- Restaurant
- CMS

Justificación

Visión de `36_DIGITAL_MENU.md`.

---

## BR-0089

Alérgenos visibles en carta

La información de alérgenos debe poder consultarse en los productos de la carta.

Impacto

- Digital Menu
- Restaurant

Justificación

Alcance de la carta digital.

---

## BR-0090

Post-servicio recomienda continuidad

Tras el servicio, pueden sugerirse evento, nueva reserva, menú especial o actividad del club.

Impacto

- Restaurant
- Recommendation Engine
- Events

Justificación

Flujo restaurant y filosofía de experiencia continua.

---

## BR-0091

Mesa como recurso reservable

Cada mesa reservable se modela como recurso del Booking Engine vinculado al restaurante.

Impacto

- Restaurant
- Booking Engine
- Data Model

Justificación

Diagrama de datos: DINING_TABLE ↔ RESOURCE.

---

# 11. Eventos

---

## BR-0092

Aforo estricto

Nunca pueden venderse ni confirmarse más plazas que el aforo permitido del evento.

Impacto

- Events
- Payments
- Booking Engine

Justificación

RB-001 Events.

---

## BR-0093

Cancelación libera plazas de evento

Las cancelaciones actualizan automáticamente la disponibilidad de plazas.

Impacto

- Events
- Notification Engine

Justificación

RB-002 Events.

---

## BR-0094

Política de cancelación por evento

Cada evento puede definir su propia política de cancelación.

Impacto

- Events
- Payments

Justificación

RB-003 Events.

---

## BR-0095

Eventos privados restringidos

Los eventos privados solo son visibles e inscribibles para usuarios autorizados.

Impacto

- Events
- Permissions
- CMS

Justificación

RB-004 Events.

---

## BR-0096

Prioridad de inscripción para socios

Los socios pueden disponer de prioridad de inscripción según reglas del club.

Impacto

- Events
- Members

Justificación

RB-005 Events.

---

## BR-0097

Pago previo puede ser obligatorio

Un evento puede requerir pago previo para confirmar la plaza.

Impacto

- Events
- Payments

Justificación

RB-006 Events.

---

## BR-0098

Evento distinto de experiencia social

EVENT y EXPERIENCE son conceptos distintos; pueden relacionarse, pero no se confunden.

Impacto

- Events
- Social Experience Engine
- Data Model

Justificación

Decisión de modelado documentada en el ER.

---

## BR-0099

Evento conectable al ecosistema

Un evento debe poder conectarse con golf, pádel, fútbol, restaurante y comunidad cuando aporte valor.

Impacto

- Events
- Golf
- Restaurant
- Social Experience Engine

Justificación

Filosofía e integraciones del módulo Eventos.

---

## BR-0100

Lista de espera de evento

Si el aforo está completo, puede habilitarse lista de espera con notificación al liberarse una plaza.

Impacto

- Events
- Notification Engine

Justificación

Caso de uso Lista de espera Events.

---

# 12. Torneos

---

## BR-0101

Plazas de torneo no superables

No pueden superarse las plazas disponibles de un torneo.

Impacto

- Tournaments
- Payments

Justificación

RB-001 Tournaments.

---

## BR-0102

Clasificación según modalidad

Cada modalidad aplica automáticamente sus reglas de clasificación.

Impacto

- Tournaments
- Golf
- Padel
- Football
- Billiard
- Darts

Justificación

RB-002 Tournaments.

---

## BR-0103

Baja actualiza lista de espera

Una baja actualiza automáticamente la lista de espera del torneo.

Impacto

- Tournaments
- Notification Engine

Justificación

RB-003 Tournaments.

---

## BR-0104

Resultados solo por autorizados

Solo usuarios autorizados pueden modificar resultados.

Impacto

- Tournaments
- Permissions
- Audit

Justificación

RB-004 Tournaments.

---

## BR-0105

Membresía exigida configurable

Un torneo puede exigir una membresía determinada.

Impacto

- Tournaments
- Members

Justificación

RB-005 Tournaments.

---

## BR-0106

Reglas deportivas por torneo

Las reglas deportivas son configurables por torneo.

Impacto

- Tournaments

Justificación

RB-006 Tournaments.

---

## BR-0107

Torneo multi-deporte sobre el mismo motor

Golf, pádel, fútbol 7, billar y dardos usan el mismo módulo de torneos con reglas específicas.

Impacto

- Tournaments
- Sport modules

Justificación

Deportes compatibles del Tournaments Module.

---

## BR-0108

Integridad de resultados

Los escenarios límite (errores, disputas, cambios) deben resolverse manteniendo la integridad deportiva del torneo.

Impacto

- Tournaments
- Audit
- Notification Engine

Justificación

Casos límite del módulo.

---

# 13. Pagos

---

## BR-0109

Pago independiente y trazable

PAYMENT es una entidad independiente; todo pago queda registrado con trazabilidad completa.

Impacto

- Payments
- Audit
- Analytics

Justificación

RB-004 Payments y modelo de datos.

---

## BR-0110

Confirmación de reserva tras cobro

Una reserva que requiere pago no queda `Confirmed` hasta que `PAYMENT` alcanza `Captured`.

Impacto

- Payments
- Booking Engine

Justificación

RB-001 Payments; vocabulario canónico DEC-003.

---

## BR-0111

Configuración de pago anticipado por club

Cada club define qué servicios requieren pago anticipado.

Impacto

- Payments
- Booking Engine
- Events
- Tournaments
- Members
- Restaurant

Justificación

RB-002 Payments.

---

## BR-0112

Reembolsos según política

Los reembolsos respetan siempre la política de cancelación correspondiente.

Impacto

- Payments
- Booking Engine
- Events
- Tournaments

Justificación

RB-003 Payments.

---

## BR-0113

Importes finales visibles

Los importes mostrados al usuario son siempre los importes finales.

Impacto

- Payments
- Booking Engine
- Events
- Restaurant

Justificación

RB-005 Payments.

---

## BR-0114

Sin cobros duplicados (idempotencia)

Los reintentos, timeouts, cancelaciones y **webhooks duplicados** del proveedor de pagos no deben generar cobros duplicados.

Toda confirmación de pago debe ser **idempotente** respecto a `payment_intent_id` / identificador del proveedor.

Impacto

- Payments
- Booking Engine

Justificación

Casos límite del Payments Module.

---

## BR-0115

Liberación ante pago fallido

Si el pago se rechaza o expira, el proceso de reserva se cancela y se libera el bloqueo temporal del recurso.

Impacto

- Payments
- Booking Engine

Justificación

Flujos booking/restaurant/golf.

---

## BR-0116

Facturación asociada al pago

Cuando proceda, la factura se asocia al pago correspondiente.

Impacto

- Payments
- Members

Justificación

Alcance de facturas del Payments Module.

---

## BR-0117

Pago transparente en la experiencia

El usuario percibe el pago como parte natural de la experiencia, no como un silo administrativo.

Impacto

- Payments
- UX
- Booking Engine

Justificación

Regla final del Payments Module.

---

# 14. Social Experience Engine

---

## BR-0118

Privacidad prioritaria

La privacidad tiene siempre prioridad sobre el descubrimiento social.

Impacto

- Social Experience Engine
- Profile
- Notification Engine

Justificación

Filosofía de privacidad del motor social.

---

## BR-0119

Sin información privada no autorizada

Nunca se muestra información privada sin autorización del usuario.

Impacto

- Social Experience Engine
- Profile
- Permissions

Justificación

Principio explícito del Social Experience Engine.

---

## BR-0120

Invitaciones con estado

Toda invitación tiene un estado explícito (enviada, aceptada, rechazada, caducada, etc.).

Impacto

- Social Experience Engine
- Notification Engine

Justificación

Modelo de invitaciones documentado.

---

## BR-0121

Grupos con membresía explícita

La pertenencia a un grupo se gestiona mediante membresía de grupo explícita.

Impacto

- Social Experience Engine
- Data Model

Justificación

Entidades GROUP / GROUP_MEMBER.

---

## BR-0122

Amistades bidireccionales con consentimiento

Una amistad requiere solicitud y aceptación; no se impone unilateralmente.

Impacto

- Social Experience Engine
- Profile

Justificación

Modelo FRIENDSHIP y flujo de invitaciones.

---

## BR-0123

Staff sin acceso a conversaciones privadas innecesarias

Staff/Manager no acceden a conversaciones privadas ni a información personal innecesaria.

Impacto

- Social Experience Engine
- Permissions
- Platform Admin

Justificación

Restricciones de actores del motor social.

---

## BR-0124

Experiencia distinta de reserva

Una experiencia social puede generar una o varias reservas, pero no sustituye al Booking Engine.

Impacto

- Social Experience Engine
- Booking Engine
- Events

Justificación

Modelo de dominio Experiencia ↔ Reserva.

---

## BR-0125

Sin análisis de contenido privado

La analítica social no analiza el contenido privado de las interacciones.

Impacto

- Social Experience Engine
- Analytics

Justificación

Restricción explícita del motor social.

---

## BR-0126

Compatibilidad respetuosa

Las recomendaciones de compañeros se basan en compatibilidad y preferencias, nunca en presión invasiva.

Impacto

- Social Experience Engine
- Recommendation Engine
- Golf
- Padel
- Football

Justificación

Filosofía de conexión humana del producto.

---

# 15. Notification Engine

---

## BR-0127

Solo notificaciones con valor

Una notificación solo se envía si aporta valor real al usuario en ese contexto.

Impacto

- Notification Engine
- All modules

Justificación

Filosofía del Notification Engine.

---

## BR-0128

Preferencias del usuario mandan

El envío respeta las preferencias de comunicación del usuario.

Impacto

- Notification Engine
- Profile

Justificación

Principio de control/personalización.

---

## BR-0129

Confirmación de reserva obligatoria cuando procede

Tras confirmar una reserva, el sistema envía confirmación por los canales habilitados y preferidos.

Impacto

- Notification Engine
- Booking Engine

Justificación

Integración Booking ↔ Notifications.

---

## BR-0130

Recordatorios contextuales

Los recordatorios se envían en el momento adecuado relativo a la actividad (no de forma spam).

Impacto

- Notification Engine
- Booking Engine
- Events
- Tournaments

Justificación

Principios Relevancia y Contexto.

---

## BR-0131

Aviso de lista de espera

Cuando se libera una plaza, se notifica al siguiente usuario de la lista de espera.

Impacto

- Notification Engine
- Booking Engine
- Events
- Tournaments

Justificación

Comportamiento documentado de waitlist.

---

## BR-0132

Canales configurables por club

Push, email, in-app y canales opcionales (SMS/WhatsApp) solo se usan si el club los habilita y el usuario lo permite.

Impacto

- Notification Engine
- Platform Admin

Justificación

Alcance del Notification Engine.

---

## BR-0133

Menos volumen, más calidad

El sistema prioriza pocas comunicaciones útiles frente a alta frecuencia irrelevante.

Impacto

- Notification Engine
- Analytics

Justificación

Regla final del Notification Engine.

---

# 16. Recommendation Engine

---

## BR-0134

Recomendaciones no invasivas

Las recomendaciones son discretas y nunca imponen decisiones al usuario.

Impacto

- Recommendation Engine
- UX

Justificación

Filosofía del Recommendation Engine.

---

## BR-0135

Recomendación siempre asociada a usuario

Toda recomendación pertenece a un usuario concreto.

Impacto

- Recommendation Engine
- Data Model

Justificación

Entidad Recomendación del modelo de dominio.

---

## BR-0136

Respeto de preferencias

Las sugerencias respetan preferencias, privacidad e historial autorizado del usuario.

Impacto

- Recommendation Engine
- Profile
- Social Experience Engine

Justificación

Principios documentados del motor.

---

## BR-0137

Sugerencias post-actividad

Tras golf, restaurante u otras experiencias, el motor puede sugerir continuidad (restaurante, partida, torneo, evento, menú).

Impacto

- Recommendation Engine
- Golf
- Restaurant
- Events
- Tournaments

Justificación

Flujos golf y restaurant; misión de más experiencias en el club.

---

## BR-0138

Recomendación no sustituye reglas de negocio

Una recomendación nunca bypassa disponibilidad, permisos, aforo ni pagos.

Impacto

- Recommendation Engine
- Booking Engine
- Permissions
- Payments

Justificación

Las reglas duras prevalecen sobre sugerencias.

---

# 17. CMS

---

## BR-0139

Contenido gestionable sin despliegue

El club puede crear y actualizar contenido sin modificar código ni realizar despliegues.

Impacto

- CMS
- Platform Admin

Justificación

Visión del CMS Module.

---

## BR-0140

Publicación solo por roles autorizados

Solo roles autorizados pueden publicar, editar o retirar contenido.

Impacto

- CMS
- Permissions

Justificación

RBAC y alcance del CMS.

---

## BR-0141

Contenido multilingüe soportado

El CMS permite contenido multilingüe según configuración del club.

Impacto

- CMS
- Profile

Justificación

Alcance CMS.

---

## BR-0142

Versionado de contenido

Los cambios relevantes de contenido se versionan para trazabilidad editorial.

Impacto

- CMS
- Audit
- Data Model

Justificación

Entidad CONTENT_VERSION del modelo de datos.

---

## BR-0143

Reutilización de activos

Los activos de media pueden reutilizarse en distintas piezas de contenido del ecosistema.

Impacto

- CMS
- Restaurant
- Events

Justificación

Principio de reutilización del CMS.

---

## BR-0144

Contenido alineado a identidad

La publicación debe respetar la identidad visual y verbal del club definida en guías de marca.

Impacto

- CMS
- Brand
- Design System

Justificación

Regla final CMS + brand guidelines.

---

# 18. Analytics

---

## BR-0145

Toda reserva alimenta métricas

Cada reserva genera señales de analítica (ocupación, cancelaciones, No Shows, ingresos asociados, etc.).

Impacto

- Analytics
- Booking Engine
- Payments

Justificación

Integración Analytics del Booking Module.

---

## BR-0146

Métricas por dominio

Golf, restaurante, eventos, torneos y comunidad aportan métricas específicas además de las transversales.

Impacto

- Analytics
- All modules

Justificación

Secciones de analítica de cada módulo.

---

## BR-0147

Sin privacidad sacrificada por analítica

La analítica no expone datos privados innecesarios ni analiza contenido privado de interacciones.

Impacto

- Analytics
- Social Experience Engine
- Security

Justificación

Restricciones de privacidad documentadas.

---

## BR-0148

Éxito no es solo volumen de reservas

Los indicadores deben incluir frecuencia, comunidad, restauración, torneos y fidelización, no solo tee times vendidos.

Impacto

- Analytics
- Golf
- Product

Justificación

Indicadores de éxito del ecosistema golf / manifiesto de experiencias.

---

# 19. Automatizaciones

---

## BR-0149

Automatizaciones fuera del camino crítico cuando sea posible

Las automatizaciones secundarias no deben bloquear la acción principal del usuario.

Impacto

- Automation Engine
- Booking Engine
- Notification Engine

Justificación

Principio de arquitectura: el usuario no espera procesos secundarios.

---

## BR-0150

Confirmaciones y recordatorios automatizables

Confirmaciones, recordatorios, waitlist y liberaciones de recurso pueden ejecutarse automáticamente.

Impacto

- Automation Engine
- Booking Engine
- Notification Engine

Justificación

Automatizaciones del Booking Module.

---

## BR-0151

Cancelación automática por impago

Una reserva pendiente de pago puede cancelarse automáticamente tras timeout según política del club.

Impacto

- Automation Engine
- Payments
- Booking Engine

Justificación

Automatizaciones y casos límite de pago.

---

## BR-0152

Trazabilidad de ejecuciones

Cada ejecución de automatización relevante queda registrada (quién/qué/cuándo/resultado).

Impacto

- Automation Engine
- Audit
- Data Model

Justificación

Entidad AUTOMATION_RUN y observabilidad.

---

## BR-0153

Automatización no viola permisos

Una automatización no puede realizar acciones que el actor/sistema no esté autorizado a ejecutar.

Impacto

- Automation Engine
- Permissions
- Security

Justificación

La autorización prevalece sobre la automatización.

---

# 20. Auditoría

---

## BR-0154

Acciones importantes auditables

Las acciones importantes (pagos, roles, resultados, cancelaciones, configuración crítica) deben poder asociarse a un usuario concreto.

Impacto

- Audit
- Permissions
- Payments
- Tournaments
- Platform Admin

Justificación

Principio de auditoría de Permissions.

---

## BR-0155

Inmutabilidad lógica del registro de auditoría

Un registro de auditoría no se edita para reescribir historia; se añaden nuevos eventos si hay corrección.

Impacto

- Audit
- Security

Justificación

Trazabilidad fiable para disputas y cumplimiento.

---

## BR-0156

Platform Admin no omite auditoría

Incluso Platform Admin deja rastro auditable de operaciones sensibles.

Impacto

- Audit
- Platform Admin
- Security

Justificación

Control total no implica opacidad.

---

## BR-0157

Datos de auditoría con mínimo privilegio de lectura

La consulta de auditoría está restringida a roles autorizados y no expone secretos de autenticación.

Impacto

- Audit
- Permissions
- Authentication
- Security

Justificación

Privacidad + seguridad por defecto.

---

## BR-0158

Consistencia ante concurrencia

En escenarios de última plaza o doble clic de pago, el sistema garantiza consistencia (un ganador, sin doble cobro, sin doble ocupación).

Impacto

- Audit
- Booking Engine
- Payments

Justificación

Casos límite de Booking y Payments.

---

## BR-0159

Estados de reserva finitos y explícitos

Una reserva solo puede estar en los estados canónicos de `state-machines.md` (BOOKING):

`Draft`, `Pending`, `Waitlisted`, `PaymentPending`, `Confirmed`, `CheckedIn`, `InProgress`, `Completed`, `Cancelled`, `NoShow`, `Expired`.

La exclusión de solapes usa el conjunto **availability-blocking** definido en BR-0031.

Impacto

- Booking Engine
- Audit
- Analytics

Justificación

Estados oficiales BOOKING; alineación con 47_BOOKING_MODULE.

---

## BR-0160

Estados de recurso finitos y explícitos

Un recurso solo puede estar en estados definidos (disponible, reservado, ocupado, bloqueado, mantenimiento, fuera de servicio).

Impacto

- Booking Engine
- Audit
- Platform Admin

Justificación

Estados de recurso del Booking Module.

---

# Fin del catálogo

Total de reglas: **160** (`BR-0001` … `BR-0160`).

Numeración consecutiva sin huecos.
