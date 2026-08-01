# 23 — DATA_MODEL

## Objetivo

Definir el modelo de dominio de IKON_ECOSYSTEM.

Este documento identifica todas las entidades principales del ecosistema y las relaciones entre ellas.

No describe tablas de base de datos.

Describe el negocio.

El esquema físico de PostgreSQL se define en `24_DATABASE_SCHEMA.md`.

**Terminología canónica:** `docs/project/DECISIONS.md` DEC-004.  
Los nombres oficiales en inglés (Booking, Resource, Event, Tournament, Digital Menu, etc.) prevalecen en reglas, estados y esquemas.  
Esquema físico: `24_DATABASE_SCHEMA.md` + `docs/diagrams/database.mmd`.

---

# Entity Map (dominio ↔ persistencia)

| Nombre oficial (DEC-004) | Narrativa ES (no canónica) | Persistencia (`database.mmd`) |
|---|---|---|
| User | Usuario | `USER` / `users` |
| Profile | Perfil | `PROFILE` / `profiles` |
| Guest / Member / Socio / Organizer / Staff / Manager / Club Admin / Platform Admin | roles | `ROLE` + `USER_ROLE` |
| Membership / Membership Plan | Membresía / plan | `MEMBERSHIP` / `MEMBERSHIP_PLAN` |
| Experience | Experiencia | `EXPERIENCE` |
| Booking | Reserva | `BOOKING` |
| Resource | Recurso reservable | `RESOURCE` |
| Facility | Instalación | `FACILITY` |
| Restaurant | Restaurante | `RESTAURANT` |
| Digital Menu / Menu / Menu Item | Carta / producto | `MENU` / `MENU_ITEM` |
| Order | Pedido | `ORDER` |
| Event | Evento | `EVENT` |
| Tournament | Torneo | `TOURNAMENT` |
| Notification | Notificación | `NOTIFICATION` |
| Recommendation | Recomendación | `RECOMMENDATION` |
| Payment | Pago | `PAYMENT` |
| Content | Contenido (CMS) | `CONTENT` |

Sinónimos ambiguos de rol o agregado están prohibidos fuera de esta columna narrativa (DEC-002 / DEC-004).

---

# Filosofía

La base de datos debe adaptarse al negocio.

Nunca el negocio a la base de datos.

Cada entidad representa un concepto real del ecosistema IKON_ECOSYSTEM.

---

# Entidad: User

Representa cualquier persona con identidad en IKON_ECOSYSTEM (`USER`).

Roles oficiales posibles (DEC-002):

* Guest
* Member
* Socio
* Organizer
* Staff
* Manager
* Club Admin
* Platform Admin

## Responsabilidades

* Autenticación.
* Perfil.
* Preferencias.
* Historial.
* Participación.

---

# Entidad: Perfil

Información pública y privada del usuario.

Incluye:

* nombre,
* fotografía,
* idioma,
* preferencias,
* deportes favoritos,
* biografía,
* configuración.

Un usuario tiene un único perfil.

---

# Entidad: Socio

Representa la relación del usuario con el club.

Puede contener:

* tipo de membresía,
* estado,
* beneficios,
* fecha de alta,
* renovación,
* descuentos.

Un usuario puede no ser socio.

---

# Entidad: Experiencia

Es la entidad central del producto.

Una experiencia puede combinar varias actividades.

Ejemplos:

* Golf + comida.
* Torneo + cena.
* Pádel + música.
* Cata de vinos.

Toda experiencia tiene:

* creador,
* participantes,
* fecha,
* estado,
* capacidad.

---

# Entidad: Reserva

Representa cualquier reserva realizada.

Puede estar asociada a:

* restaurante,
* golf,
* pádel,
* evento,
* experiencia,
* instalación.

Una experiencia puede contener varias reservas.

---

# Entidad: Instalación

Representa cualquier recurso físico del club.

Ejemplos:

* Campo de golf.
* Hoyo de Pitch & Putt.
* Pista de pádel.
* Mesa del restaurante.
* Sala privada.
* Zona de billar.
* Zona de dardos.

---

# Entidad: Restaurante

Representa la operación gastronómica.

Gestiona:

* carta,
* mesas,
* horarios,
* reservas,
* pedidos.

---

# Entidad: Carta

Contiene categorías y productos.

Puede cambiar por temporada.

---

# Entidad: Producto

Representa un plato o bebida.

Puede contener:

* precio,
* imágenes,
* descripción,
* alérgenos,
* disponibilidad.

---

# Entidad: Pedido

Representa un pedido realizado por un usuario.

Puede estar asociado a:

* una mesa,
* una reserva,
* una experiencia.

---

# Entidad: Evento

Actividad organizada por el club.

Ejemplos:

* concierto,
* música en directo,
* cata,
* campeonato,
* brunch.

---

# Entidad: Torneo

Competición organizada.

Puede pertenecer a:

* golf,
* pádel,
* billar,
* dardos.

Incluye:

* participantes,
* fases,
* resultados,
* clasificación.

---

# Entidad: Comunidad

Representa las relaciones entre usuarios.

Gestiona:

* amistades,
* grupos,
* invitaciones,
* actividad.

---

# Entidad: Grupo

Conjunto de usuarios con un interés común.

Ejemplos:

* Liga de golf.
* Amigos.
* Empresa.
* Familia.

---

# Entidad: Notificación

Mensaje enviado al usuario.

Puede ser:

* operativa,
* informativa,
* comunitaria,
* recomendación.

---

# Entidad: Recomendación

Propuesta personalizada generada por IKON.

Siempre estará asociada a un usuario.

---

# Entidad: Recompensa

Beneficio obtenido mediante participación.

Puede representar:

* descuentos,
* invitaciones,
* ventajas,
* experiencias.

---

# Entidad: Logro

Reconocimiento obtenido por el usuario.

No implica necesariamente una recompensa.

---

# Entidad: Pago

Representa cualquier transacción económica.

Gestiona:

* reservas,
* eventos,
* pedidos,
* membresías.

---

# Entidad: Automatización

Proceso ejecutado automáticamente.

Ejemplos:

* recordatorios,
* confirmaciones,
* campañas,
* sincronizaciones.

---

# Entidad: Contenido

Elemento gestionado por el CMS.

Puede representar:

* noticia,
* promoción,
* fotografía,
* vídeo,
* historia.

---

# Relaciones principales

* Un Usuario tiene un Perfil.
* Un Usuario puede ser Socio.
* Un Usuario puede crear muchas Experiencias.
* Una Experiencia puede tener muchos Participantes.
* Una Experiencia puede generar varias Reservas.
* Una Reserva utiliza una Instalación.
* Un Restaurante contiene una Carta.
* Una Carta contiene muchos Productos.
* Un Pedido pertenece a un Usuario.
* Un Evento puede formar parte de una Experiencia.
* Un Torneo puede generar varias Experiencias.
* Un Usuario puede pertenecer a varios Grupos.
* Un Usuario recibe muchas Notificaciones.
* Un Usuario recibe muchas Recomendaciones.
* Un Usuario obtiene muchos Logros.
* Un Usuario puede recibir muchas Recompensas.
* Un Pago puede estar asociado a una Reserva, un Pedido, un Evento o una Membresía.

---

# Principios del modelo

Cada entidad debe tener una única responsabilidad.

Las relaciones deben ser explícitas.

Nunca duplicaremos información.

El modelo debe poder crecer sin romper las relaciones existentes.

---

# Evolución

Las futuras entidades deberán integrarse respetando este modelo.

No se crearán conceptos duplicados para resolver necesidades puntuales.

---

# Regla final

El modelo de datos debe representar fielmente el funcionamiento real del club.

Si una entidad no representa un concepto del negocio,

probablemente no deba existir.
