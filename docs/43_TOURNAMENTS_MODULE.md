# 43 — TOURNAMENTS_MODULE

# El motor competitivo del ecosistema IKON

---

# Objetivo

Definir el funcionamiento completo del módulo de Torneos de IKON.

El módulo permitirá crear, gestionar y automatizar competiciones deportivas para todas las disciplinas del club.

Los torneos serán una experiencia completa, integrando deporte, restauración, comunidad, premios y analítica.

---

# Visión

Un torneo no comienza el día de la competición.

Empieza cuando un jugador descubre el evento.

Continúa durante la inscripción.

La preparación.

La competición.

La entrega de premios.

La comida.

Las fotografías.

Y termina cuando los participantes ya están esperando el siguiente torneo.

IKON deberá acompañar todo ese recorrido.

---

# Deportes compatibles

El módulo deberá funcionar para:

* Golf
* Pádel
* Fútbol 7
* Billar
* Dardos

Toda la lógica común será compartida.

Cada deporte añadirá únicamente sus reglas específicas.

---

# Alcance

Este módulo incluye:

* Creación de torneos.
* Inscripciones.
* Categorías.
* Modalidades.
* Cuadros.
* Grupos.
* Eliminatorias.
* Clasificaciones.
* Resultados.
* Premios.
* Patrocinadores.
* Fotografías.
* Entrega de trofeos.
* Historial.
* Analítica.

---

# Filosofía

Un torneo debe ser una experiencia.

No únicamente una clasificación.

Debe generar:

* emoción,
* participación,
* comunidad,
* consumo,
* fidelización.

---

# Actores

## Visitante

Puede consultar:

* torneos públicos,
* clasificaciones públicas,
* calendario.

---

## Usuario registrado

Puede:

* inscribirse,
* cancelar inscripción,
* consultar resultados,
* seguir el torneo.

---

## Socio

Además podrá:

* acceder a torneos privados,
* obtener descuentos,
* disfrutar de prioridad de inscripción.

---

## Staff

Puede:

* validar jugadores,
* registrar resultados,
* gestionar incidencias.

---

## Árbitro

Puede:

* validar partidos,
* modificar resultados autorizados,
* cerrar enfrentamientos,
* resolver incidencias deportivas.

---

## Manager

Puede:

* crear torneos,
* configurar reglas,
* gestionar cuadros,
* publicar resultados,
* consultar estadísticas.

---

# Tipos de torneo

El sistema deberá permitir:

* Eliminación directa.
* Doble eliminación.
* Liga.
* Round Robin.
* Grupos + eliminatorias.
* Match Play.
* Stroke Play.
* Stableford.
* Scramble.
* Formatos personalizados.

---

# Casos de uso

## Crear torneo

El organizador define:

* deporte,
* modalidad,
* fechas,
* categorías,
* plazas,
* precio,
* premios,
* patrocinadores,
* reglas.

---

## Abrir inscripciones

Los jugadores podrán inscribirse.

Si el torneo es de pago,

el sistema solicitará el pago antes de confirmar la plaza.

---

## Lista de espera

Cuando el torneo esté completo,

IKON gestionará automáticamente las plazas liberadas.

---

## Publicar cuadros

El sistema generará automáticamente:

* grupos,
* eliminatorias,
* calendarios,

según el formato elegido.

---

## Registrar resultados

Los resultados podrán introducirse mediante:

* staff,
* árbitro,
* validación conjunta de jugadores (si el club lo permite).

---

## Clasificaciones

Las clasificaciones se actualizarán automáticamente.

---

## Finalización

Al terminar el torneo:

* publicación de resultados,
* entrega de premios,
* galería de fotografías,
* valoración,
* estadísticas,
* propuesta del siguiente torneo.

---

# Estados

## Tournament

Estados canónicos (ver `docs/rules/state-machines.md` — TOURNAMENT):

* Draft
* Published
* RegistrationOpen
* RegistrationClosed
* Scheduled
* Running
* Finished
* Archived
* Cancelled

## Tournament Entry

* Pending
* Confirmed
* Waitlisted
* Cancelled
* Validated

## Tournament Match

* Pending
* Scheduled
* InProgress
* Finished
* Suspended

---

# Reglas de negocio

## RB-001

No podrán superarse las plazas disponibles.

---

## RB-002

Cada modalidad aplicará automáticamente sus reglas de clasificación.

---

## RB-003

Una baja actualizará automáticamente la lista de espera.

---

## RB-004

Solo usuarios autorizados podrán modificar resultados.

---

## RB-005

Un torneo podrá exigir una membresía determinada.

---

## RB-006

Las reglas deportivas serán configurables por torneo.

---

# Integración con Golf

* Salidas.
* Tarjetas.
* Clasificaciones.
* Handicap (si el club lo utiliza).

---

# Integración con Pádel

* Cuadros.
* Pistas.
* Horarios.

---

# Integración con Fútbol 7

* Equipos.
* Calendario.
* Resultados.

---

# Integración con Restaurante

Cada torneo podrá incluir:

* desayuno,
* comida,
* entrega de premios,
* cena,
* menú especial.

Todo podrá reservarse desde el mismo torneo.

---

# Integración con Eventos

El torneo podrá generar automáticamente:

* ceremonia de apertura,
* entrega de premios,
* fiesta final.

---

# Integración con Comunidad

Los jugadores podrán:

* compartir resultados,
* publicar fotografías,
* comentar,
* felicitar a otros participantes,
* organizar nuevas partidas.

---

# Integración con Social Experience Engine

El sistema podrá:

* recomendar torneos,
* encontrar parejas,
* completar equipos,
* sugerir rivales.

---

# Automatizaciones

* Apertura automática de inscripciones.
* Recordatorios.
* Confirmaciones.
* Generación de cuadros.
* Actualización de clasificaciones.
* Entrega de premios.
* Solicitud de valoración.
* Publicación de fotografías.
* Recomendación del siguiente torneo.

---

# Analítica

El sistema medirá:

* participantes,
* ocupación,
* ingresos,
* recurrencia,
* satisfacción,
* consumo asociado,
* nuevos socios generados,
* impacto sobre el club.

---

# Casos límite

* Empates.
* Abandono de un jugador.
* Suspensión por lluvia.
* Error en un resultado.
* Modificación del cuadro.
* Ampliación de plazas.
* Baja del ganador.
* Reclamaciones.

Todos estos escenarios deberán resolverse manteniendo la integridad deportiva y la coherencia del torneo.

---

# Criterios de aceptación

El módulo se considerará completo cuando:

* crear un torneo sea sencillo,
* los jugadores puedan inscribirse fácilmente,
* los cuadros se generen automáticamente,
* las clasificaciones sean fiables,
* el personal gestione la competición desde una única interfaz,
* el torneo se integre con el resto del ecosistema IKON.

---

# Visión a largo plazo

El módulo de Torneos deberá convertirse en la referencia del club para cualquier competición.

No solo gestionará resultados.

Gestionará toda la experiencia competitiva.

Desde la primera inscripción hasta la fotografía del campeón.

---

# Regla final

Un torneo no termina cuando se entrega un trofeo.

Termina cuando los jugadores ya están preguntando cuándo será el siguiente.

IKON deberá conseguir que cada torneo deje recuerdos, fortalezca la comunidad y aumente el deseo de volver al club.
