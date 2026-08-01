# 40 — BILLIARD_MODULE

# El deporte social indoor

---

# Objetivo

Definir el funcionamiento del módulo de Billar dentro del ecosistema IKON.

El objetivo del módulo es facilitar la reserva de mesas, la organización de partidas y la creación de una comunidad de jugadores.

El billar será una actividad social complementaria al resto de experiencias del club.

---

# Visión

El billar representa una forma diferente de disfrutar del club.

No requiere grandes grupos.

No depende del clima.

Puede formar parte de una tarde completa:

Comida.

↓

Golf.

↓

Billar.

↓

Cena.

Todo conectado mediante IKON.

---

# Alcance

El módulo incluye:

* reservas,
* disponibilidad,
* creación de partidas,
* búsqueda de rivales,
* retos,
* historial,
* integración con eventos,
* integración con restaurante.

---

# Actores

## Visitante

Puede consultar disponibilidad e información pública.

---

## Usuario registrado

Puede:

* reservar una mesa,
* crear partidas,
* aceptar retos,
* consultar historial.

---

## Socio

Además podrá acceder a ventajas y ligas privadas.

---

## Staff

Gestiona reservas y disponibilidad.

---

## Manager

Administra horarios, eventos y analítica.

---

# Casos de uso

* Reservar mesa.
* Crear un reto.
* Invitar a otro jugador.
* Buscar rival disponible.
* Registrar resultado (opcional).
* Participar en una liga.

---

# Estados

Reserva:

* Pendiente.
* Confirmada.
* En curso.
* Finalizada.
* Cancelada.

Mesa:

* Disponible.
* Reservada.
* Ocupada.
* Mantenimiento.

---

# Reglas de negocio

* Una mesa no podrá reservarse dos veces para el mismo horario.
* Las cancelaciones actualizarán la disponibilidad inmediatamente.
* Las ligas respetarán las reglas definidas por el club.
* Los usuarios suspendidos no podrán crear nuevas reservas.

---

# Integraciones

* Restaurante.
* Eventos.
* Torneos.
* Social Experience Engine.
* Notification Engine.
* Analytics.

---

# Automatizaciones

* Confirmación.
* Recordatorio.
* Aviso cuando una mesa queda libre.
* Invitación automática a rivales habituales.

---

# Analítica

* Ocupación.
* Tiempo medio de uso.
* Retos creados.
* Ligas activas.
* Satisfacción.

---

# Criterios de aceptación

El módulo será correcto cuando:

* reservar resulte sencillo,
* crear un reto requiera pocos pasos,
* el personal gestione fácilmente la disponibilidad,
* el billar se integre con el resto del ecosistema.

---

# Regla final

El billar no es únicamente un juego.

Es otra forma de reunir personas dentro de IKON.
