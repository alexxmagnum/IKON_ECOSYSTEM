# 39 — FOOTBALL7_MODULE

# El deporte de equipo de IKON

---

# Objetivo

Definir el funcionamiento completo del módulo de Fútbol 7 dentro del ecosistema IKON.

El módulo no estará orientado únicamente a la gestión del campo.

Su objetivo será facilitar la organización de partidos, mejorar la participación y convertir cada encuentro en una experiencia completa dentro del club.

---

# Visión

Organizar un partido de fútbol suele implicar decenas de mensajes.

¿Quién viene?

¿Quién falta?

¿Quién lleva peto?

¿Tenemos portero?

¿Jugamos el jueves o el viernes?

IKON eliminará toda esa fricción.

El objetivo es que organizar un partido sea tan sencillo como reservar una mesa.

---

# Alcance

Este módulo incluye:

* reservas del campo,
* creación de partidos,
* convocatorias,
* búsqueda de jugadores,
* equipos,
* lista de espera,
* check-in,
* resultados,
* estadísticas,
* historial,
* integración con torneos,
* integración con restaurante,
* integración con comunidad.

---

# Actores

## Visitante

Puede consultar:

* instalaciones,
* horarios públicos,
* eventos deportivos.

No puede participar en partidos.

---

## Usuario registrado

Puede:

* reservar el campo,
* crear partidos,
* unirse a partidos abiertos,
* aceptar invitaciones,
* consultar su historial.

---

## Socio

Además podrá:

* acceder a ventajas de reserva,
* participar en ligas privadas,
* organizar partidos exclusivos para socios.

---

## Staff

Puede:

* gestionar reservas,
* registrar asistencia,
* bloquear horarios,
* resolver incidencias.

---

## Manager

Puede:

* configurar horarios,
* gestionar ligas,
* crear campeonatos,
* consultar analítica,
* administrar reglas deportivas.

---

# Casos de uso

## Reservar el campo

El usuario selecciona:

* fecha,
* hora,
* duración.

El sistema muestra únicamente horarios disponibles.

---

## Crear un partido

El organizador define:

* modalidad,
* número de jugadores,
* nivel aproximado,
* si acepta jugadores desconocidos,
* descripción opcional.

---

## Convocar jugadores

Los invitados reciben una invitación.

Cada uno puede responder:

* Confirmo asistencia.
* No puedo asistir.
* Quizá.

El organizador ve el estado en tiempo real.

---

## Buscar jugadores

Cuando faltan jugadores,

IKON podrá mostrar usuarios compatibles según:

* nivel,
* edad (si el usuario desea compartirla),
* idioma,
* disponibilidad,
* frecuencia de juego,
* historial de participación.

Siempre respetando la privacidad configurada por cada persona.

---

## Lista de espera

Si el partido está completo,

otros usuarios podrán apuntarse.

Cuando alguien cancele,

el sistema ofrecerá automáticamente la plaza disponible.

---

## Crear equipos

El organizador podrá:

* crear equipos manualmente,
* sortear equipos,
* equilibrarlos según nivel (opcional).

---

## Check-in

Los participantes podrán confirmar su llegada.

El personal también podrá registrar el check-in.

---

## Resultado

Al finalizar el partido podrán registrarse:

* marcador,
* goleadores (opcional),
* asistencias (opcional),
* incidencias.

Estas funciones podrán activarse o desactivarse según la filosofía del club.

---

# Estados del partido

* Buscando jugadores.
* Convocatoria abierta.
* Completo.
* Confirmado.
* En curso.
* Finalizado.
* Cancelado.

---

# Estados del campo

* Disponible.
* Reservado.
* Ocupado.
* Mantenimiento.
* Fuera de servicio.

---

# Reglas de negocio

## RB-001

No podrá existir más de una reserva para el mismo horario.

---

## RB-002

Los participantes no confirmados no ocuparán definitivamente una plaza hasta cumplir las reglas definidas por el club.

---

## RB-003

Una cancelación actualizará inmediatamente la disponibilidad.

---

## RB-004

Las reservas respetarán las prioridades de cada tipo de usuario.

---

## RB-005

El sistema nunca añadirá automáticamente jugadores sin respetar las preferencias del organizador.

---

# Motor Social

Este módulo utilizará el **Social Experience Engine** para resolver uno de los mayores problemas del fútbol amateur:

"No llegamos a ser suficientes."

El sistema podrá:

* encontrar jugadores disponibles,
* completar convocatorias,
* recomendar personas compatibles,
* proponer rivales,
* sugerir partidos recurrentes.

---

# Integración con Restaurante

Al terminar el partido,

IKON podrá proponer automáticamente:

* reservar una mesa,
* compartir una pizza,
* ver el "tercer tiempo",
* celebrar un cumpleaños,
* organizar el siguiente partido.

El deporte no termina con el pitido final.

---

# Integraciones

El módulo se integra con:

* 42_EVENTS_MODULE.md
* 43_TOURNAMENTS_MODULE.md
* 44_MEMBERS_MODULE.md
* 45_PROFILE_MODULE.md
* 46_PAYMENTS_MODULE.md
* 47_BOOKING_MODULE.md
* Restaurante
* Comunidad
* Social Experience Engine
* Recommendation Engine
* Notification Engine
* Analytics

---

# Automatizaciones

Ejemplos:

* Confirmación de reserva.
* Recordatorio del partido.
* Aviso cuando faltan jugadores.
* Invitación automática a jugadores compatibles.
* Liberación de plazas canceladas.
* Propuesta de restaurante tras el encuentro.
* Solicitud de valoración de la experiencia.

---

# Analítica

El sistema medirá:

* ocupación del campo,
* partidos organizados,
* tiempo medio para completar una convocatoria,
* cancelaciones,
* no shows,
* frecuencia de juego,
* recurrencia,
* satisfacción.

---

# Casos límite

* Cancelación del organizador.
* Partido incompleto minutos antes del inicio.
* Cambio de horario por climatología.
* Campo cerrado por mantenimiento.
* Participante suspendido tras confirmar asistencia.
* Exceso de jugadores.
* Empate en una lista de espera.

Todos estos escenarios deberán resolverse de forma automática o asistida, sin generar confusión.

---

# Criterios de aceptación

El módulo se considerará completo cuando:

* reservar el campo resulte sencillo,
* organizar un partido requiera pocos pasos,
* completar una convocatoria sea rápido,
* el personal pueda gestionar la operación diaria,
* las automatizaciones reduzcan el trabajo manual,
* el módulo se integre con el resto del ecosistema IKON.

---

# Visión a largo plazo

El módulo de Fútbol 7 deberá convertirse en el punto de encuentro de jugadores que quieren disfrutar del deporte sin complicaciones.

El éxito no se medirá únicamente por las horas reservadas.

Se medirá por el número de partidos que IKON haya conseguido hacer posibles.

---

# Regla final

Reservar un campo es una operación.

Conseguir que catorce personas disfruten de un gran partido, compartan un rato en el restaurante y organicen el siguiente encuentro antes de irse a casa es una experiencia.

Ese será el verdadero objetivo del módulo de Fútbol 7.
