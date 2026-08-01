# 27 — PERMISSIONS

## Objetivo

Definir el modelo oficial de permisos del ecosistema IKON.

Este documento establece qué puede ver, crear, modificar o administrar cada tipo de usuario.

Toda autorización del sistema deberá basarse en estas reglas.

Los permisos nunca deberán implementarse directamente dentro de la interfaz.

Siempre deberán validarse también en el servidor.

---

# Filosofía

La autenticación responde a:

**¿Quién eres?**

Los permisos responden a:

**¿Qué puedes hacer?**

Nunca deben confundirse.

---

# Principios

## Mínimo privilegio

Cada usuario dispondrá únicamente de los permisos necesarios.

Nunca más.

---

## Seguridad

Ocultar un botón no significa proteger una acción.

Todas las operaciones deberán validarse en el servidor.

---

## Escalabilidad

El sistema permitirá crear nuevos roles sin modificar toda la aplicación.

---

## Auditoría

Las acciones importantes deberán poder asociarse a un usuario concreto.

---

# Modelo RBAC

MotanOS utilizará un modelo basado en roles (Role Based Access Control).

Cada usuario podrá tener uno o varios roles.

Cada rol concederá un conjunto de permisos.

---

# Nombres oficiales de roles (DEC-002)

Únicos nombres permitidos:

* Guest
* Member
* Socio
* Organizer
* Staff
* Manager
* Club Admin
* Platform Admin

Sinónimos prohibidos: Visitante, Usuario registrado, Organizador, Administrador, Miembro.

Fuente: `docs/project/DECISIONS.md` DEC-002.

---

# Roles principales

## Guest

Usuario no autenticado.

Puede:

* ver información pública,
* consultar instalaciones,
* consultar eventos públicos,
* consultar carta,
* explorar el club.

No puede:

* reservar,
* comentar,
* participar,
* crear experiencias,
* pagar.

---

## Member

Puede:

* editar su perfil,
* reservar,
* pagar,
* participar en experiencias,
* recibir recomendaciones,
* gestionar sus reservas,
* guardar favoritos.

No puede administrar contenido del club.

---

## Socio

Dispone de todos los permisos del Member.

Además puede:

* acceder a ventajas exclusivas,
* participar en actividades para socios,
* utilizar beneficios de membresía,
* crear determinadas experiencias comunitarias.

---

## Organizer

Puede:

* crear experiencias,
* gestionar participantes,
* cerrar inscripciones,
* modificar información de sus propias actividades,
* cancelar actividades creadas por él.

Nunca podrá modificar experiencias ajenas.

---

## Staff

Personal del club.

Dependiendo del área podrá:

* gestionar reservas,
* registrar asistencia,
* actualizar estados,
* consultar información necesaria para su trabajo.

Nunca accederá a información que no necesite.

---

## Manager

Responsable operativo.

Puede:

* administrar contenidos,
* gestionar promociones,
* gestionar eventos,
* administrar reservas,
* consultar analítica,
* gestionar personal autorizado.

No podrá modificar configuración crítica del sistema.

---

## Club Admin

Control total del club del despliegue (single-tenant v1).

Puede:

* gestionar usuarios,
* asignar roles,
* configurar el sistema del club,
* administrar módulos,
* consultar auditorías,
* gestionar integraciones.

---

## Platform Admin

Operaciones de plataforma (infraestructura y configuración transversal).

En v1 (DEC-001) no implica acceso multi-club; el despliegue es single-tenant.

---

# Permisos por dominio

## Usuarios

* Crear perfil.
* Editar perfil propio.
* Consultar perfil.
* Suspender usuario.
* Eliminar usuario.

---

## Comunidad

* Crear experiencia.
* Participar.
* Invitar.
* Comentar.
* Moderar contenido.

---

## Restaurante

* Consultar carta.
* Reservar mesa.
* Crear pedido.
* Modificar carta.
* Gestionar reservas.

---

## Golf

* Reservar recorrido.
* Gestionar horarios.
* Crear torneo.
* Registrar resultados.

---

## Pádel

* Reservar pista.
* Crear partido.
* Gestionar pistas.

---

## Billar

* Reservar.
* Gestionar ligas.

---

## Dardos

* Reservar.
* Gestionar ligas.

---

## Eventos

* Crear.
* Editar.
* Publicar.
* Cancelar.

---

## Torneos

* Crear.
* Modificar.
* Cerrar inscripciones.
* Publicar resultados.

---

## Contenido

* Crear.
* Editar.
* Publicar.
* Archivar.

---

## Pagos

* Crear pago.
* Consultar pagos propios.
* Gestionar devoluciones.
* Consultar facturación.

---

## Administración

* Configuración.
* Roles.
* Permisos.
* Auditoría.
* Automatizaciones.
* Integraciones.

---

# Propiedad

Existen acciones que dependen del propietario.

Ejemplo.

Un Organizer puede modificar únicamente las experiencias que ha creado.

No todas las experiencias del club.

---

# Visibilidad

La información podrá tener distintos niveles de acceso.

Pública.

↓

Solo usuarios registrados.

↓

Solo socios.

↓

Solo staff.

↓

Solo administración.

---

# Auditoría

Toda acción sensible deberá registrar:

* usuario,
* fecha,
* acción,
* recurso afectado,
* resultado.

---

# Revocación

Los permisos deberán actualizarse inmediatamente cuando cambie un rol.

No será necesario volver a crear la cuenta.

---

# Integración con Supabase

Los permisos se implementarán mediante:

* Supabase Auth.
* Row Level Security (RLS).
* Políticas de acceso.
* Validaciones en backend.

La interfaz nunca será la única protección.

---

# Acceso por dispositivo

Los permisos pertenecen al usuario.

No al dispositivo.

---

# Delegación

En el futuro podrán existir permisos temporales.

Ejemplo.

Un manager delega la gestión de un torneo durante un fin de semana.

Finalizado el periodo,

el permiso desaparece automáticamente.

---

# Lo que nunca haremos

Nunca utilizaremos:

* comprobaciones únicamente en el frontend,
* roles codificados directamente en componentes,
* permisos implícitos,
* cuentas compartidas,
* acceso total por comodidad.

---

# Criterios de aceptación

El sistema de permisos será correcto cuando:

* un Guest solo vea contenido público,
* un Member solo pueda modificar sus propios datos y reservas,
* un Organizer solo gestione sus experiencias,
* un miembro del Staff solo acceda a la información necesaria para su trabajo,
* un Manager no pueda realizar tareas reservadas a Club Admin,
* todas las operaciones sensibles estén protegidas por RLS y validación en servidor.

---

# Regla final

Los permisos no existen para limitar a las personas.

Existen para proteger la información, mantener la confianza y garantizar que cada usuario solo pueda realizar las acciones que realmente le corresponden.

Un sistema seguro es aquel donde cada persona puede hacer exactamente lo que necesita…

…y nada más.
