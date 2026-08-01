# 42 — EVENTS_MODULE

# El motor de experiencias del ecosistema IKON

---

# Objetivo

Definir el funcionamiento completo del módulo de Eventos de IKON.

Los eventos serán uno de los principales motores de actividad del club.

No serán simples publicaciones en un calendario.

Cada evento deberá convertirse en una experiencia capaz de generar comunidad, aumentar la participación y conectar todas las áreas del club.

---

# Visión

Un club vive gracias a las personas.

Las personas vuelven gracias a las experiencias.

Los eventos serán el principal mecanismo para crear esas experiencias.

Un evento puede:

* llenar el restaurante,
* aumentar las reservas de golf,
* atraer nuevos socios,
* generar partidas de pádel,
* crear nuevas amistades,
* incrementar el consumo,
* convertir visitantes en clientes habituales.

IKON facilitará todo ese proceso.

---

# Alcance

Este módulo incluye:

* Creación de eventos.
* Calendario.
* Publicación.
* Inscripciones.
* Aforo.
* Listas de espera.
* Check-in.
* Pagos.
* Fotografías.
* Patrocinadores.
* Promociones.
* Integración con deportes.
* Integración con restaurante.
* Integración con comunidad.
* Analítica.

---

# Filosofía

Un evento nunca existirá de forma aislada.

Siempre deberá poder conectarse con otros módulos del ecosistema.

Ejemplo.

Golf Clinic

↓

Reserva de salida

↓

Comida posterior

↓

Fotos

↓

Creación de nuevas partidas

↓

Reserva siguiente evento

Toda la experiencia debe estar conectada.

---

# Tipos de evento

## Deportivos

* Golf Clinic
* Demo de material
* Entrenamientos
* Jornadas de puertas abiertas
* Ligas
* Campeonatos
* Exhibiciones

---

## Gastronómicos

* BBQ
* Brunch
* Cata de vinos
* Cata de cerveza
* Cena temática
* Maridaje
* Menú degustación

---

## Sociales

* Música en directo
* Afterwork
* Networking
* Vermut del domingo
* Encuentro de socios
* Fiestas temáticas

---

## Familiares

* Eventos infantiles
* Halloween
* Navidad
* Reyes
* Talleres
* Actividades familiares

---

## Corporativos

* Presentaciones
* Empresas
* Team Building
* Conferencias
* Convenciones

---

# Actores

## Visitante

Puede:

* consultar eventos públicos,
* compartir eventos,
* solicitar información.

---

## Usuario registrado

Puede:

* inscribirse,
* cancelar,
* guardar favoritos,
* compartir,
* recibir recordatorios.

---

## Socio

Además podrá:

* acceder a eventos privados,
* disfrutar de preventa,
* obtener descuentos,
* reservar plazas prioritarias.

---

## Staff

Puede:

* gestionar asistentes,
* realizar check-in,
* controlar aforo,
* registrar incidencias.

---

## Manager

Puede:

* crear eventos,
* editar,
* cancelar,
* publicar,
* gestionar listas de espera,
* consultar estadísticas.

---

# Casos de uso

## Crear evento

El organizador configura:

* título,
* descripción,
* imágenes,
* categoría,
* ubicación,
* fecha,
* horario,
* capacidad,
* precio,
* patrocinadores,
* requisitos.

---

## Publicar

Estados disponibles:

* Borrador.
* Programado.
* Publicado.

---

## Inscripción

El usuario podrá:

* reservar plaza,
* pagar (si procede),
* cancelar,
* compartir el evento.

---

## Lista de espera

Cuando el evento esté completo,

IKON gestionará automáticamente las plazas que queden libres.

---

## Check-in

Podrá realizarse mediante:

* Código QR.
* Lista manual.
* Validación por el personal.

---

## Finalización

Una vez finalizado el evento,

el sistema podrá:

* publicar fotografías,
* solicitar valoración,
* recomendar eventos similares,
* generar estadísticas.

---

# Estados

## Evento

* Borrador
* Programado
* Publicado
* Completo
* En curso
* Finalizado
* Cancelado

---

## Inscripción

* Pendiente
* Confirmada
* Lista de espera
* Check-in realizado
* Asistió
* No asistió
* Cancelada

---

# Reglas de negocio

## RB-001

Nunca podrán venderse más plazas que el aforo permitido.

---

## RB-002

Las cancelaciones actualizarán automáticamente la disponibilidad.

---

## RB-003

Cada evento podrá definir su propia política de cancelación.

---

## RB-004

Los eventos privados únicamente serán visibles para usuarios autorizados.

---

## RB-005

Los socios podrán disponer de prioridad de inscripción.

---

## RB-006

Un evento podrá requerir pago previo para confirmar la plaza.

---

# Integración con Golf

Ejemplos:

* Golf Clinic.
* Demo de material.
* Ryder Cup.
* Campeonato Social.

El sistema podrá reservar automáticamente salidas y comunicar la información necesaria a los participantes.

---

# Integración con Pádel

* Clínics.
* Ligas.
* Torneos.
* Entrenamientos.

---

# Integración con Fútbol 7

* Campeonatos.
* Partidos amistosos.
* Jornadas deportivas.

---

# Integración con Restaurante

Cada evento podrá disponer de:

* Menú especial.
* Carta exclusiva.
* Reserva automática de mesa.
* Promociones.
* Packs gastronómicos.

---

# Integración con Comunidad

Los asistentes podrán:

* compartir fotografías,
* comentar,
* seguir a otros asistentes,
* organizar nuevas actividades,
* crear nuevas experiencias.

---

# Integración con Social Experience Engine

El sistema podrá:

* recomendar eventos,
* invitar automáticamente a usuarios compatibles,
* completar plazas libres,
* detectar usuarios interesados.

---

# Automatizaciones

Ejemplos:

* Publicación programada.
* Confirmaciones.
* Recordatorios.
* Lista de espera automática.
* Solicitud de valoración.
* Publicación automática de fotografías.
* Recomendación del siguiente evento.

---

# Analítica

El sistema medirá:

* asistentes,
* ocupación,
* ingresos,
* cancelaciones,
* satisfacción,
* conversión a socios,
* impacto en restaurante,
* impacto en deportes,
* recurrencia.

---

# Casos límite

* Cambio de ubicación.
* Cancelación por lluvia.
* Reducción del aforo.
* Pago rechazado.
* Sobreventa.
* Invitado que no se presenta.
* Evento dividido en varios turnos.
* Cierre temporal del club.

Todos estos escenarios deberán resolverse manteniendo la consistencia del sistema y notificando correctamente a los afectados.

---

# Criterios de aceptación

El módulo se considerará completo cuando:

* crear un evento resulte sencillo,
* la inscripción requiera pocos pasos,
* las listas de espera funcionen automáticamente,
* el personal pueda gestionar asistentes rápidamente,
* los eventos se integren con el resto del ecosistema,
* la analítica permita mejorar futuras experiencias.

---

# Visión a largo plazo

El módulo de Eventos deberá convertirse en el principal generador de actividad dentro de IKON.

Cada evento deberá aumentar la participación, fortalecer la comunidad y generar nuevas oportunidades para el club.

Los eventos no terminarán cuando finalicen.

Su impacto deberá continuar mediante nuevas amistades, nuevas reservas y nuevas experiencias.

---

# Regla final

Un evento no es una fecha en un calendario.

Es una oportunidad para reunir personas.

IKON deberá convertir cada evento en una experiencia memorable que motive a los asistentes a volver una y otra vez.
