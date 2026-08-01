# 41 — DARTS_MODULE

# Competición, diversión y comunidad

---

# Objetivo

Definir el funcionamiento completo del módulo de Dardos dentro del ecosistema IKON.

El objetivo no es únicamente reservar una diana.

Debe facilitar la organización de partidas, retos, ligas y torneos, convirtiendo los dardos en una actividad social integrada con el resto del club.

---

# Visión

Los dardos son una actividad rápida, divertida y muy social.

Pueden surgir de forma espontánea:

* Después de jugar al golf.
* Después de una comida.
* Mientras se espera una reserva.
* Durante un evento.

IKON debe facilitar que cualquier momento pueda convertirse en una partida.

---

# Alcance

Este módulo incluye:

* Reservas de zonas de juego.
* Creación de partidas.
* Retos entre jugadores.
* Ligas.
* Torneos.
* Clasificaciones.
* Historial.
* Integración con Restaurante.
* Integración con Eventos.
* Integración con Comunidad.

---

# Filosofía

Los dardos deben fomentar la participación.

Nunca deben convertirse en una actividad complicada de organizar.

Cuantos menos pasos necesite un usuario para jugar,

mejor será la experiencia.

---

# Actores

## Visitante

Puede consultar:

* Disponibilidad.
* Eventos públicos.
* Información general.

No puede crear partidas.

---

## Usuario registrado

Puede:

* Reservar una diana.
* Crear una partida.
* Aceptar retos.
* Consultar historial.
* Participar en ligas abiertas.

---

## Socio

Además podrá:

* Acceder a ventajas.
* Participar en ligas privadas.
* Obtener prioridad cuando proceda.

---

## Staff

Puede:

* Gestionar reservas.
* Actualizar disponibilidad.
* Registrar incidencias.
* Realizar check-in.

---

## Manager

Puede:

* Crear ligas.
* Configurar campeonatos.
* Gestionar horarios.
* Consultar analítica.
* Administrar reglas del módulo.

---

# Casos de uso

## Reservar una zona

El usuario selecciona:

* Fecha.
* Hora.
* Duración.

El sistema mostrará únicamente horarios disponibles.

---

## Crear un reto

El usuario podrá crear un reto indicando:

* Modalidad.
* Número de jugadores.
* Nivel aproximado.
* Descripción opcional.

---

## Buscar rival

IKON podrá mostrar jugadores compatibles según:

* Disponibilidad.
* Frecuencia de juego.
* Nivel (si el club decide utilizarlo).
* Preferencias.

---

## Unirse a una partida

Cuando existan plazas disponibles,

los usuarios podrán solicitar unirse.

El organizador decidirá si acepta participantes.

---

## Check-in

El usuario podrá confirmar su llegada.

El personal también podrá registrar el acceso.

---

## Registrar resultado

Cuando esté habilitado,

podrá registrarse:

* Ganador.
* Marcador.
* Modalidad.
* Observaciones.

---

# Modalidades

El club podrá configurar modalidades como:

* 301
* 501
* Cricket
* Around the Clock
* Killer
* Modalidades personalizadas

---

# Estados

## Reserva

* Pendiente.
* Confirmada.
* En curso.
* Finalizada.
* Cancelada.

---

## Partida

* Abierta.
* Completa.
* Confirmada.
* En juego.
* Finalizada.
* Cancelada.

---

## Zona de juego

* Disponible.
* Reservada.
* Ocupada.
* Mantenimiento.
* Fuera de servicio.

---

# Reglas de negocio

## RB-001

No podrán existir reservas solapadas.

---

## RB-002

Las cancelaciones actualizarán inmediatamente la disponibilidad.

---

## RB-003

Los usuarios suspendidos no podrán crear nuevas reservas.

---

## RB-004

Las ligas y torneos respetarán las reglas configuradas por el club.

---

## RB-005

El organizador podrá limitar el acceso a una partida.

---

# Integración con Restaurante

Después de una partida,

IKON podrá sugerir automáticamente:

* Reservar mesa.
* Pedir bebidas.
* Promociones activas.
* Continuar la experiencia con el grupo.

---

# Integración con Eventos

Ejemplos:

* Noche de Dardos.
* Campeonato mensual.
* Liga de verano.
* Evento patrocinado.
* Torneo benéfico.

---

# Integración con Comunidad

Los jugadores podrán:

* Crear grupos.
* Invitar amigos.
* Compartir resultados.
* Organizar nuevas partidas.

---

# Integración con Social Experience Engine

El módulo utilizará el Social Experience Engine para:

* Encontrar rivales.
* Completar partidas.
* Recomendar jugadores.
* Crear grupos habituales.
* Proponer nuevas partidas.

---

# Automatizaciones

Ejemplos:

* Confirmación de reserva.
* Recordatorio antes de jugar.
* Aviso cuando un rival acepta.
* Invitación automática a jugadores compatibles.
* Solicitud de valoración.
* Propuesta de revancha.

---

# Analítica

El sistema medirá:

* Ocupación.
* Partidas creadas.
* Partidas completadas.
* Retos.
* Ligas activas.
* Frecuencia de juego.
* Recurrencia.
* Satisfacción.

---

# Casos límite

* Cancelación del organizador.
* Jugador que no se presenta.
* Zona fuera de servicio.
* Cambio de horario.
* Torneo suspendido.
* Empate en una clasificación.
* Error durante el registro del resultado.

Todos estos escenarios deberán resolverse manteniendo la coherencia del sistema y notificando correctamente a los participantes.

---

# Criterios de aceptación

El módulo se considerará completo cuando:

* Reservar una zona resulte sencillo.
* Crear un reto requiera pocos pasos.
* Encontrar rivales sea rápido.
* El personal pueda gestionar la operación diaria.
* El módulo se integre con el resto del ecosistema.
* Las automatizaciones reduzcan el trabajo manual.

---

# Visión a largo plazo

Los dardos deberán convertirse en una actividad social habitual dentro del club.

Una partida espontánea puede convertirse en una liga.

Una liga puede convertirse en una tradición.

IKON deberá facilitar ese crecimiento de forma natural.

---

# Regla final

Los dardos no son únicamente una competición.

Son una excusa para reunirse, disfrutar del club y crear nuevas experiencias.

IKON deberá convertir cada partida en una oportunidad para fortalecer la comunidad.
