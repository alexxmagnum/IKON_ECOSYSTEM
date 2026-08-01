# 44 — MEMBERS_MODULE

# El corazón de la comunidad IKON

---

# Objetivo

Definir el funcionamiento completo del módulo de Socios de IKON.

El módulo gestionará todo el ciclo de vida de un miembro del club, desde su alta hasta su baja, incluyendo beneficios, membresías, ventajas, renovaciones y participación dentro del ecosistema.

El objetivo no es únicamente administrar una base de datos de socios.

El objetivo es fortalecer la comunidad del club.

---

# Visión

Un socio no es un cliente.

Es parte del club.

IKON deberá hacer que ser socio resulte sencillo, atractivo y valioso.

Cada interacción deberá reforzar el sentimiento de pertenencia.

---

# Alcance

Este módulo incluye:

* Altas de socios.
* Renovaciones.
* Tipos de membresía.
* Beneficios.
* Cuotas.
* Estado del socio.
* Carné digital.
* Historial.
* Invitados.
* Ventajas exclusivas.
* Integración con reservas.
* Integración con eventos.
* Integración con pagos.

---

# Filosofía

Ser socio debe abrir puertas.

No complicarlas.

IKON deberá hacer visibles todas las ventajas de pertenecer al club.

---

# Actores

## Visitante

Puede:

* consultar información sobre las membresías,
* solicitar hacerse socio,
* comparar planes.

---

## Usuario registrado

Puede:

* solicitar una membresía,
* consultar ventajas,
* gestionar su solicitud.

---

## Socio

Puede:

* consultar su estado,
* renovar,
* modificar datos,
* acceder a ventajas,
* invitar acompañantes (si su membresía lo permite),
* consultar historial.

---

## Staff

Puede:

* validar altas,
* comprobar membresías,
* registrar incidencias.

---

## Manager

Puede:

* crear tipos de membresía,
* aprobar solicitudes,
* suspender membresías,
* gestionar beneficios,
* consultar estadísticas.

---

# Tipos de membresía

Ejemplos:

* Individual.
* Familiar.
* Junior.
* Senior.
* Empresa.
* Premium.
* Honorífica.
* Temporal.
* Personalizada.

Cada club podrá definir sus propios planes.

---

# Casos de uso

## Solicitar membresía

El usuario completa el proceso de alta.

La solicitud podrá requerir aprobación manual o automática.

---

## Renovar

El sistema podrá gestionar:

* renovación manual,
* renovación automática,
* recordatorios previos.

---

## Consultar ventajas

Cada socio visualizará únicamente los beneficios correspondientes a su plan.

---

## Carné digital

Cada socio dispondrá de un carné digital con:

* fotografía (opcional),
* nombre,
* número de socio,
* tipo de membresía,
* estado,
* código QR.

El QR podrá utilizarse para:

* check-in,
* identificación,
* acceso a eventos,
* validación de ventajas.

---

## Invitados

Las membresías que lo permitan podrán gestionar:

* invitados,
* límites,
* historial,
* validación.

---

# Estados

## Membresía

* Solicitud.
* Pendiente.
* Activa.
* Suspendida.
* Caducada.
* Cancelada.

---

## Renovación

* Pendiente.
* Pagada.
* Rechazada.
* Completada.

---

# Beneficios

Cada membresía podrá definir:

* descuentos,
* prioridad en reservas,
* acceso a eventos privados,
* tarifas especiales,
* promociones,
* ventajas gastronómicas,
* acceso a instalaciones,
* invitaciones.

---

# Reglas de negocio

## RB-001

Solo una membresía activa por usuario, salvo que el club permita excepciones.

---

## RB-002

Las ventajas dependerán exclusivamente del tipo de membresía.

---

## RB-003

Una membresía suspendida perderá temporalmente los privilegios asociados.

---

## RB-004

La renovación actualizará automáticamente la fecha de vencimiento.

---

## RB-005

El sistema notificará con antelación la próxima caducidad.

---

# Integración con Reservas

El módulo aplicará automáticamente:

* prioridades,
* tarifas,
* restricciones,
* límites.

---

# Integración con Eventos

Los socios podrán acceder a:

* preventas,
* eventos exclusivos,
* descuentos.

---

# Integración con Restaurante

Podrán aplicarse automáticamente:

* descuentos,
* promociones,
* menús exclusivos.

---

# Integración con Golf

Las reglas de membresía podrán afectar:

* reservas,
* torneos,
* horarios,
* precios.

---

# Integración con Pagos

Todas las cuotas y renovaciones se registrarán automáticamente.

---

# Integración con Social Experience Engine

El sistema podrá utilizar la información de la membresía para:

* recomendar actividades,
* sugerir grupos,
* promover la participación.

---

# Automatizaciones

Ejemplos:

* Bienvenida al nuevo socio.
* Recordatorio de renovación.
* Aviso de vencimiento.
* Activación automática tras el pago.
* Envío del carné digital.
* Felicitación de aniversario como socio.

---

# Analítica

El sistema medirá:

* nuevos socios,
* renovaciones,
* bajas,
* recurrencia,
* permanencia media,
* utilización de beneficios,
* participación en eventos,
* satisfacción.

---

# Casos límite

* Pago rechazado.
* Renovación duplicada.
* Suspensión temporal.
* Cambio de tipo de membresía.
* Baja voluntaria.
* Recuperación tras suspensión.
* Error durante la validación del QR.

Todos estos escenarios deberán resolverse garantizando la consistencia de los datos y el correcto estado de la membresía.

---

# Criterios de aceptación

El módulo se considerará completo cuando:

* el alta de un socio resulte sencilla,
* las renovaciones puedan automatizarse,
* las ventajas se apliquen correctamente,
* el carné digital funcione en todo el ecosistema,
* las integraciones respeten el tipo de membresía,
* el personal pueda gestionar fácilmente el ciclo de vida del socio.

---

# Visión a largo plazo

El módulo de Socios deberá convertirse en mucho más que un sistema administrativo.

Será la puerta de entrada a toda la experiencia IKON.

Cada socio deberá sentir que pertenece a una comunidad activa y exclusiva.

---

# Regla final

Ser socio no consiste únicamente en pagar una cuota.

Consiste en formar parte de un club.

IKON deberá conseguir que cada miembro perciba ese valor en cada interacción con la plataforma.
