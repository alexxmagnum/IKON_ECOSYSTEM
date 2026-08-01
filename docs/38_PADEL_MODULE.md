# 38 — PADEL_MODULE

## Objetivo

Definir el funcionamiento completo del módulo de Pádel de IKON.

El objetivo no es únicamente reservar pistas.

Debe facilitar que las personas jueguen más, conozcan nuevos jugadores y formen parte de la comunidad del club.

El módulo deberá reducir al máximo la dificultad para organizar un partido.

---

# Visión

El mayor problema del pádel no suele ser encontrar una pista.

Es encontrar jugadores.

IKON deberá convertirse en el mejor organizador de partidos del club.

---

# Alcance

El módulo incluye:

* reservas de pistas,
* creación de partidos,
* búsqueda de jugadores,
* invitaciones,
* niveles,
* disponibilidad,
* check-in,
* resultados (opcional),
* historial,
* integración con torneos,
* integración con experiencias.

---

# Actores

## Visitante

Puede consultar:

* instalaciones,
* horarios públicos,
* eventos abiertos.

---

## Usuario registrado

Puede:

* reservar pistas,
* crear partidos,
* unirse a partidos,
* invitar jugadores,
* consultar su historial.

---

## Socio

Además podrá:

* acceder a ventajas,
* participar en ligas privadas,
* disfrutar de prioridades de reserva según las normas del club.

---

## Staff

Puede:

* gestionar reservas,
* bloquear pistas,
* registrar incidencias,
* realizar check-in.

---

## Manager

Puede:

* configurar horarios,
* gestionar ligas,
* administrar torneos,
* consultar analítica.

---

# Casos de uso

## Reservar pista

El usuario selecciona:

* fecha,
* hora,
* duración,
* pista.

El sistema mostrará únicamente horarios realmente disponibles.

---

## Crear partido

El creador podrá definir:

* nivel aproximado,
* modalidad (amistoso, entrenamiento, competición),
* plazas disponibles,
* si acepta jugadores desconocidos,
* descripción opcional.

---

## Buscar jugadores

El sistema permitirá buscar jugadores por:

* nivel,
* disponibilidad,
* idioma,
* frecuencia de juego,
* preferencias.

Siempre respetando la configuración de privacidad.

---

## Unirse a un partido

Si existen plazas libres,

el usuario podrá solicitar participar.

La aceptación dependerá de las preferencias definidas por el organizador.

---

## Lista de espera

Cuando un partido esté completo,

los usuarios podrán apuntarse a una lista de espera.

Si alguien cancela,

el sistema propondrá automáticamente la plaza al siguiente usuario.

---

## Check-in

El personal o el propio usuario podrán confirmar la llegada.

---

## Historial

Cada jugador podrá consultar:

* partidos,
* compañeros,
* estadísticas,
* reservas,
* experiencias asociadas.

---

# Estados de una reserva

* Pendiente.
* Confirmada.
* En espera.
* Check-in realizado.
* En juego.
* Finalizada.
* Cancelada.
* No presentado.

---

# Estados de un partido

* Buscando jugadores.
* Completo.
* Confirmado.
* En curso.
* Finalizado.
* Cancelado.

---

# Reglas de negocio

## RB-001

Una pista no podrá reservarse dos veces para el mismo horario.

---

## RB-002

El organizador podrá definir el número máximo de participantes.

---

## RB-003

El sistema nunca añadirá automáticamente un jugador sin respetar las preferencias del organizador.

---

## RB-004

Las cancelaciones actualizarán inmediatamente la disponibilidad.

---

## RB-005

Las reservas respetarán las normas del club y las prioridades de cada tipo de usuario.

---

# Motor Social

Este módulo utilizará el Social Experience Engine para facilitar:

* completar partidos,
* recomendar compañeros,
* crear nuevos grupos,
* sugerir rivales,
* organizar "quedadas" deportivas.

El objetivo es reducir el número de partidos que no llegan a jugarse por falta de jugadores.

---

# Integraciones

El módulo se integra con:

* 42_EVENTS_MODULE.md
* 43_TOURNAMENTS_MODULE.md
* 44_MEMBERS_MODULE.md
* 46_PAYMENTS_MODULE.md
* 47_BOOKING_MODULE.md
* Restaurante
* Comunidad
* Recommendation Engine
* Notification Engine
* Analytics
* Social Experience Engine

---

# Automatizaciones

Ejemplos:

* Confirmación de reserva.
* Aviso cuando falta un jugador.
* Recordatorio antes del partido.
* Invitación automática a jugadores compatibles.
* Liberación de pista tras cancelación.
* Propuesta de comida o bebida al finalizar.

---

# Analítica

El sistema medirá:

* ocupación de pistas,
* partidos creados,
* partidos completados,
* tiempo medio hasta completar un grupo,
* cancelaciones,
* no shows,
* utilización por franjas horarias,
* satisfacción.

---

# Casos límite

* Cancelación del organizador.
* Partido incompleto minutos antes del inicio.
* Retrasos.
* Cambio de pista por mantenimiento.
* Lluvia o condiciones meteorológicas adversas.
* Jugador suspendido tras confirmar asistencia.

Todos estos escenarios deberán resolverse manteniendo informados a los participantes.

---

# Criterios de aceptación

El módulo se considerará completo cuando:

* reservar una pista resulte sencillo,
* crear un partido requiera pocos pasos,
* encontrar jugadores compatibles sea rápido,
* las listas de espera funcionen automáticamente,
* el personal pueda gestionar la operación diaria,
* el módulo se integre con el resto del ecosistema.

---

# Visión a largo plazo

El módulo Pádel deberá convertirse en el principal facilitador de relaciones dentro del club.

Cada partido podrá generar nuevas amistades, nuevas experiencias y una mayor participación en la comunidad.

El éxito no dependerá únicamente de la ocupación de las pistas.

Dependerá de cuántas personas consigan jugar gracias a IKON.

---

# Regla final

Reservar una pista es una funcionalidad.

Conseguir que cuatro personas jueguen juntas y quieran repetir la semana siguiente es una experiencia.

Ese será el verdadero objetivo del módulo Pádel.
