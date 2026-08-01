# 47 — BOOKING_MODULE

# El motor unificado de reservas de IKON

---

# Objetivo

Definir el funcionamiento completo del Motor de Reservas de IKON.

Este módulo será el núcleo operativo del ecosistema.

No pertenece a un deporte concreto ni al restaurante.

Su responsabilidad es gestionar cualquier reserva realizada dentro del club de forma consistente, segura y escalable.

Todos los módulos utilizarán este motor.

---

# Visión

Reservar debe ser una acción sencilla.

No importa si el usuario quiere:

* una salida de golf,
* una pista de pádel,
* un campo de fútbol 7,
* una mesa en el restaurante,
* una sala privada,
* una experiencia,
* una actividad.

El proceso siempre deberá sentirse igual.

El usuario aprende una vez.

IKON hace el resto.

---

# Filosofía

Una reserva representa un compromiso entre el usuario y el club.

El sistema deberá garantizar que:

* la disponibilidad sea siempre real,
* no existan conflictos,
* el usuario reciba confirmación inmediata,
* cualquier cambio quede registrado.

---

# Alcance

Este módulo incluye:

* Disponibilidad.
* Calendario.
* Recursos.
* Horarios.
* Confirmaciones.
* Cancelaciones.
* Modificaciones.
* Listas de espera.
* Bloqueos.
* Reglas de disponibilidad.
* Integración con pagos.
* Integración con notificaciones.

---

# Recursos reservables

El Booking Engine deberá poder gestionar cualquier recurso del club.

Ejemplos:

## Deportes

* Tee Times de Golf.
* Pistas de Pádel.
* Campo de Fútbol 7.
* Mesas de Billar.
* Zonas de Dardos.

---

## Restaurante

* Mesas.
* Salones.
* Terraza.

---

## Eventos

* Plazas.
* Actividades.
* Experiencias.

---

## Instalaciones

* Salas privadas.
* Aulas.
* Espacios para empresas.
* Zonas VIP.

Cada nuevo recurso deberá integrarse sin modificar el motor de reservas.

---

# Actores

## Visitante

Podrá consultar disponibilidad cuando el club lo permita.

---

## Usuario registrado

Puede:

* crear reservas,
* modificarlas,
* cancelarlas,
* consultar su historial.

---

## Socio

Además podrá disfrutar de:

* prioridades,
* descuentos,
* horarios exclusivos,
* reservas anticipadas.

---

## Staff

Puede:

* crear reservas manuales,
* modificar,
* cancelar,
* registrar llegadas.

---

## Manager

Puede:

* bloquear recursos,
* configurar disponibilidad,
* definir reglas,
* consultar ocupación.

---

# Casos de uso

## Nueva reserva

El usuario selecciona:

* recurso,
* fecha,
* hora,
* duración.

El sistema verifica:

* disponibilidad,
* permisos,
* reglas,
* pago (si procede).

La reserva queda confirmada.

---

## Modificar reserva

Siempre que las reglas del club lo permitan,

el usuario podrá cambiar:

* horario,
* duración,
* participantes,
* recurso.

---

## Cancelar reserva

La cancelación:

* actualizará la disponibilidad,
* activará listas de espera,
* aplicará la política correspondiente.

---

## Check-in

Podrá realizarse mediante:

* QR,
* recepción,
* validación manual.

---

## No Show

Cuando un usuario no se presente,

el sistema podrá aplicar automáticamente las políticas definidas por el club.

---

# Estados

## Reserva

* Pendiente.
* Confirmada.
* Lista de espera.
* Check-in realizado.
* En curso.
* Finalizada.
* Cancelada.
* No Show.

---

## Recurso

* Disponible.
* Reservado.
* Ocupado.
* Bloqueado.
* Mantenimiento.
* Fuera de servicio.

---

# Reglas de negocio

## RB-001

Nunca podrán existir reservas solapadas para el mismo recurso.

---

## RB-002

Toda modificación volverá a validar disponibilidad.

---

## RB-003

Las políticas de cancelación dependerán del recurso reservado.

---

## RB-004

Las listas de espera deberán actualizarse automáticamente.

---

## RB-005

Cada recurso podrá definir:

* duración mínima,
* duración máxima,
* tiempo de preparación,
* tiempo de limpieza,
* tiempo de separación entre reservas.

---

## RB-006

Las prioridades dependerán del tipo de usuario y de su membresía.

---

# Disponibilidad

El sistema calculará automáticamente la disponibilidad teniendo en cuenta:

* horario del club,
* mantenimiento,
* eventos,
* reservas existentes,
* bloqueos,
* climatología (cuando proceda).

Nunca se mostrará disponibilidad incorrecta.

---

# Calendario

Todos los recursos utilizarán un calendario unificado.

Cada módulo decidirá cómo representarlo visualmente.

---

# Lista de espera

Cuando un recurso esté completo,

el usuario podrá apuntarse.

Si aparece una plaza libre,

IKON notificará automáticamente al siguiente usuario.

---

# Integración con Pagos

Cuando una reserva requiera pago,

el estado solo cambiará a **Confirmada** tras la validación del cobro.

---

# Integración con Notificaciones

El sistema enviará automáticamente:

* confirmaciones,
* recordatorios,
* cambios,
* cancelaciones,
* avisos de disponibilidad.

---

# Integración con Analytics

Toda reserva alimentará automáticamente las métricas del club.

---

# Integración con Social Experience Engine

Las reservas podrán convertirse en experiencias.

Ejemplos:

Golf

↓

¿Te falta un jugador?

---

Restaurante

↓

Hay otra mesa con intereses similares.

---

Pádel

↓

Buscando pareja.

---

Fútbol 7

↓

Faltan dos jugadores.

---

# Automatizaciones

Ejemplos:

* Confirmación automática.
* Recordatorios.
* Activación de lista de espera.
* Cancelación automática por impago.
* Liberación de recursos.
* Solicitud de valoración.
* Recomendación de próxima reserva.

---

# Analítica

El sistema medirá:

* ocupación,
* cancelaciones,
* No Shows,
* utilización por recurso,
* horas punta,
* ingresos asociados,
* recurrencia.

---

# Casos límite

* Dos usuarios reservando el último recurso simultáneamente.
* Pago rechazado.
* Cancelación durante el proceso de pago.
* Recurso bloqueado mientras existe una reserva.
* Cambio de horario del club.
* Cierre por climatología.
* Error de sincronización.
* Caída temporal del proveedor de pagos.

Todos estos escenarios deberán resolverse garantizando la consistencia de la información y evitando conflictos.

---

# Escalabilidad

El Booking Engine deberá ser independiente de los módulos.

Cualquier nuevo recurso futuro deberá poder integrarse sin modificar la arquitectura principal.

Ejemplos:

* Simuladores.
* Spa.
* Gimnasio.
* Coworking.
* Salas de reuniones.
* Nuevos deportes.

---

# Criterios de aceptación

El módulo se considerará completo cuando:

* cualquier recurso del club pueda reservarse mediante el mismo motor,
* no existan conflictos de disponibilidad,
* las listas de espera funcionen automáticamente,
* las reglas de negocio se apliquen correctamente,
* el sistema escale sin modificaciones estructurales,
* todas las reservas queden registradas y trazables.

---

# Visión a largo plazo

El Booking Engine deberá convertirse en una de las piezas más sólidas del ecosistema IKON.

No será únicamente un calendario.

Será el motor que coordine toda la actividad del club.

Cada reserva será el punto de inicio de una nueva experiencia.

---

# Regla final

Una reserva no es un hueco en un calendario.

Es la promesa de una experiencia.

IKON deberá garantizar que esa experiencia comience desde el mismo instante en que el usuario pulsa el botón **Reservar**.
