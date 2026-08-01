# 30 — AUTOMATION_ENGINE

## Objetivo

Definir el sistema de automatización de IKON.

El Automation Engine será responsable de ejecutar procesos automáticos, reducir tareas manuales y coordinar acciones entre los distintos módulos del ecosistema.

La automatización deberá ahorrar tiempo tanto a los usuarios como al personal del club.

Nunca sustituirá la atención humana cuando esta aporte más valor.

---

# Filosofía

Automatizar no significa eliminar personas.

Significa eliminar tareas repetitivas.

El personal del club debe dedicar más tiempo a atender personas y menos tiempo a repetir procesos administrativos.

---

# Principios

## Automatizar solo cuando aporte valor

No toda tarea debe automatizarse.

Solo aquellas que:

* sean repetitivas,
* tengan reglas claras,
* reduzcan errores,
* mejoren la experiencia.

---

## Transparencia

Toda automatización deberá poder entenderse.

El sistema nunca actuará de forma impredecible.

---

## Reversibilidad

Siempre que sea posible, las acciones automáticas importantes deberán poder revisarse o deshacerse.

---

## Seguridad

Las automatizaciones respetarán siempre los permisos definidos en `27_PERMISSIONS.md`.

Nunca realizarán acciones para las que un usuario no tenga autorización.

---

# Arquitectura

El Automation Engine estará desacoplado del resto del sistema.

Las automatizaciones se ejecutarán mediante eventos y flujos.

La implementación principal utilizará **n8n autohospedado**, conectado mediante APIs y webhooks.

---

# Eventos que pueden iniciar una automatización

* Usuario registrado.
* Nueva reserva.
* Reserva cancelada.
* Pago confirmado.
* Pago rechazado.
* Nuevo socio.
* Experiencia creada.
* Evento publicado.
* Torneo abierto.
* Pedido completado.
* Cambio de estado.
* Recordatorio programado.

---

# Tipos de automatización

## Comunicación

* Confirmaciones.
* Recordatorios.
* Emails.
* Push notifications.

---

## Operativas

* Actualizar estados.
* Sincronizar datos.
* Generar tareas.
* Crear registros.

---

## Comerciales

* Campañas.
* Ofertas segmentadas.
* Recuperación de reservas abandonadas.
* Invitaciones.

---

## Comunidad

* Completar grupos.
* Proponer experiencias.
* Avisar de plazas disponibles.
* Recomendar actividades.

---

## Administración

* Informes automáticos.
* Auditorías.
* Exportaciones.
* Copias de seguridad programadas.

---

# Flujos principales

## Reserva creada

Evento:

Reserva confirmada.

Automáticamente:

* enviar confirmación,
* actualizar disponibilidad,
* generar recordatorio,
* registrar analítica.

---

## Pago completado

Evento:

Pago recibido.

Automáticamente:

* emitir confirmación,
* actualizar reserva,
* registrar transacción,
* enviar factura cuando proceda.

---

## Nueva experiencia

Evento:

Usuario crea experiencia.

Automáticamente:

* validar información,
* publicar,
* avisar a usuarios compatibles,
* actualizar recomendaciones.

---

## Recordatorios

El sistema enviará recordatorios únicamente cuando aporten valor.

Ejemplos:

* partida mañana,
* mesa en dos horas,
* torneo este fin de semana.

Nunca se enviarán recordatorios redundantes.

---

# Integraciones

El Automation Engine podrá comunicarse con:

* Supabase.
* Stripe.
* Resend.
* Notification Engine.
* Recommendation Engine.
* Social Experience Engine (`48_SOCIAL_EXPERIENCE_ENGINE.md`).
* CMS.
* Calendarios externos (cuando proceda).

Cada integración deberá estar aislada mediante conectores.

---

# Registro

Cada automatización deberá registrar:

* fecha,
* evento origen,
* acciones ejecutadas,
* resultado,
* errores.

---

# Reintentos

Las tareas temporales que fallen podrán reintentarse automáticamente.

Los reintentos deberán ser limitados y registrados.

---

# Errores

Una automatización fallida no deberá bloquear el funcionamiento del resto del sistema.

Siempre que sea posible, los errores deberán aislarse.

---

# Rendimiento

Las automatizaciones se ejecutarán en segundo plano.

El usuario nunca deberá esperar a que finalicen para continuar utilizando la aplicación.

---

# Supervisión

El sistema permitirá conocer:

* automatizaciones activas,
* automatizaciones fallidas,
* tiempo de ejecución,
* frecuencia,
* historial.

---

# Lo que nunca automatizaremos

* Decisiones humanas importantes.
* Cambios irreversibles sin confirmación.
* Acciones que afecten económicamente al usuario sin autorización.
* Comunicación masiva sin control.

---

# Criterios de aceptación

El Automation Engine será correcto cuando:

* reduzca tareas manuales del personal,
* no degrade el rendimiento,
* registre todas las ejecuciones,
* pueda recuperarse de errores,
* mantenga los permisos del sistema,
* resulte comprensible y mantenible.

---

# Regla final

La mejor automatización es aquella que el usuario nunca percibe.

Simplemente siente que IKON funciona de forma fluida, organizada y eficiente.

La tecnología permanece invisible.

La experiencia mejora.
