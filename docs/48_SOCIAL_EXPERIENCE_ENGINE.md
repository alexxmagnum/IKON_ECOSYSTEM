# 48 — SOCIAL_EXPERIENCE_ENGINE

# El corazón social de IKON

---

# Objetivo

Definir el funcionamiento completo del Social Experience Engine de IKON.

Este será el motor encargado de conectar personas, facilitar relaciones y transformar actividades individuales en experiencias compartidas.

No será una red social.

Será un sistema diseñado para que los usuarios jueguen más, participen más y disfruten más del club.

---

# Visión

El mayor activo de un club no es el campo de golf.

Ni el restaurante.

Ni las instalaciones.

Son las personas.

IKON deberá ayudar a que esas personas se conozcan, jueguen juntas y vuelvan al club.

---

# Filosofía

No queremos que los usuarios pasen horas dentro de la aplicación.

Queremos que pasen horas disfrutando del club.

La aplicación únicamente actuará como facilitadora.

La mejor experiencia es aquella que termina fuera de la pantalla.

---

# Problemas que resuelve

## Golf

"No tengo con quién jugar."

↓

IKON encuentra jugadores compatibles.

---

## Pádel

"Nos falta una pareja."

↓

IKON completa el partido.

---

## Fútbol 7

"Solo somos diez."

↓

IKON encuentra cuatro jugadores disponibles.

---

## Restaurante

"Queremos compartir mesa."

↓

IKON conecta personas con intereses similares cuando el usuario lo permita.

---

## Eventos

"Me gustaría conocer gente."

↓

IKON facilita nuevas conexiones durante los eventos.

---

# Alcance

El Social Experience Engine incluye:

* Búsqueda de jugadores.
* Compatibilidad.
* Amigos.
* Grupos.
* Invitaciones.
* Partidas abiertas.
* Experiencias compartidas.
* Recomendaciones sociales.
* Historial de compañeros.
* Descubrimiento de personas.
* Actividad social.

---

# Filosofía de privacidad

La privacidad tendrá siempre prioridad.

El usuario decidirá:

* qué información comparte,
* con quién,
* cuándo,
* durante cuánto tiempo.

Nunca mostraremos información privada sin autorización.

---

# Actores

## Usuario registrado

Puede:

* buscar jugadores,
* crear grupos,
* aceptar invitaciones,
* descubrir nuevas personas.

---

## Socio

Además podrá acceder a funciones sociales exclusivas definidas por el club.

---

## Staff

No podrá acceder a información privada salvo cuando resulte necesario para prestar un servicio autorizado.

---

## Manager

Únicamente podrá acceder a métricas agregadas.

Nunca a conversaciones privadas ni información personal innecesaria.

---

# Compatibilidad

IKON podrá sugerir personas compatibles considerando, entre otros:

* deporte favorito,
* disponibilidad,
* idioma,
* frecuencia de asistencia,
* historial de partidas compartidas,
* preferencias configuradas,
* nivel deportivo (si el usuario desea compartirlo).

Las recomendaciones combinarán reglas de negocio con el Recommendation Engine.

---

# Amigos

Los usuarios podrán:

* seguir jugando con compañeros habituales,
* aceptar invitaciones,
* crear grupos frecuentes,
* eliminar conexiones.

IKON no pretende sustituir otras redes sociales.

Su objetivo es facilitar la organización de actividades dentro del club.

---

# Grupos

Los usuarios podrán crear grupos para:

* Golf.
* Pádel.
* Fútbol 7.
* Billar.
* Dardos.
* Restaurante.
* Eventos.

Ejemplos:

* Golf de los sábados.
* Pádel mixto.
* Afterwork.
* Seniors.
* Empresas.
* Familia.

---

# Partidas abiertas

Un usuario podrá crear una actividad indicando:

* plazas disponibles,
* nivel aproximado (opcional),
* descripción,
* si acepta jugadores desconocidos,
* requisitos.

El sistema ayudará a completar automáticamente la actividad.

---

# Invitaciones

Las invitaciones podrán enviarse mediante:

* usuarios del club,
* grupos,
* enlace compartido.

Cada invitación tendrá estados:

* Pendiente.
* Aceptada.
* Rechazada.
* Cancelada.
* Caducada.

---

# Descubrimiento

El sistema podrá mostrar:

* personas que juegan habitualmente,
* usuarios compatibles,
* nuevos socios,
* actividades cercanas.

Siempre respetando la privacidad.

---

# Actividad

El usuario podrá decidir qué mostrar.

Ejemplos:

* Próxima partida.
* Últimos eventos.
* Logros.
* Fotografías.
* Actividades recientes.

Todo será configurable.

---

# Integración con Golf

Ejemplos:

* Buscar un cuarto jugador.
* Repetir una partida anterior.
* Crear un grupo habitual.
* Invitar al restaurante después de jugar.

---

# Integración con Pádel

* Buscar pareja.
* Completar partidos.
* Organizar ligas.

---

# Integración con Fútbol 7

* Completar convocatorias.
* Crear equipos habituales.
* Encontrar rivales.

---

# Integración con Restaurante

El sistema podrá facilitar:

* comidas posteriores a una actividad,
* reservas grupales,
* experiencias gastronómicas compartidas.

---

# Integración con Eventos

Los asistentes podrán:

* descubrir personas con intereses similares,
* organizar nuevas actividades,
* mantener el contacto dentro del ecosistema IKON.

---

# Integración con Recommendation Engine

El Recommendation Engine utilizará este módulo para recomendar:

* compañeros,
* actividades,
* grupos,
* experiencias.

---

# Integración con Notification Engine

Se enviarán notificaciones como:

* alguien acepta tu invitación,
* falta un jugador,
* se ha creado una nueva actividad compatible,
* un amigo ha organizado una partida.

Siempre respetando las preferencias del usuario.

---

# Automatizaciones

Ejemplos:

* Buscar automáticamente jugadores cuando falten plazas.
* Recomendar compañeros habituales.
* Crear grupos frecuentes.
* Invitar automáticamente a participantes habituales.
* Sugerir una comida tras una partida.
* Recomendar el siguiente evento relacionado.

---

# Analítica

Se medirá:

* grupos creados,
* partidas completadas gracias al motor social,
* invitaciones aceptadas,
* actividades compartidas,
* recurrencia,
* participación,
* nuevas conexiones generadas.

Nunca se analizará el contenido privado de las interacciones.

---

# Casos límite

* Un usuario bloquea a otro.
* Invitaciones cruzadas.
* Actividad cancelada mientras se completa un grupo.
* Usuario que cambia su privacidad.
* Grupo sin organizador.
* Participante suspendido.
* Invitación caducada.

Todos estos escenarios deberán resolverse manteniendo la privacidad y la coherencia del sistema.

---

# Criterios de aceptación

El módulo se considerará completo cuando:

* encontrar compañeros resulte sencillo,
* organizar actividades requiera pocos pasos,
* las invitaciones funcionen correctamente,
* las recomendaciones sociales aporten valor,
* la privacidad pueda configurarse fácilmente,
* el sistema aumente la participación del club sin resultar intrusivo.

---

# Visión a largo plazo

El Social Experience Engine deberá convertirse en el principal diferenciador de IKON.

No gestionará instalaciones.

Gestionará relaciones.

Su éxito no se medirá por el número de usuarios registrados.

Se medirá por el número de experiencias que haya conseguido hacer posibles.

---

# Regla final

Las personas no vuelven únicamente por un campo de golf o un restaurante.

Vuelven por las personas con las que compartieron ese día.

IKON deberá facilitar que cada visita al club pueda convertirse en una nueva amistad, una nueva experiencia y un motivo para volver.
