# 26 — AUTHENTICATION

## Objetivo

Definir cómo se identifican y acceden las personas a MotanOS.

Este documento establece los métodos de autenticación, los ciclos de sesión, la recuperación de acceso y las reglas fundamentales de seguridad relacionadas con la identidad.

La autenticación debe ser segura sin convertir el acceso en una barrera.

---

# Filosofía

Entrar en IKON debe resultar rápido, natural y confiable.

El usuario no debe sentir que está completando un proceso administrativo.

Debe sentir que está entrando en su club.

La seguridad debe ser sólida, pero la complejidad debe permanecer oculta.

---

# Principios

## Fricción mínima

Solo solicitaremos los datos imprescindibles.

Nunca obligaremos al usuario a completar un registro largo antes de poder descubrir IKON.

---

## Seguridad por defecto

Toda sesión, credencial y operación sensible deberá protegerse desde su diseño inicial.

La seguridad no se añadirá al final.

---

## Identidad única

Cada persona deberá disponer de una única identidad dentro de MotanOS.

Se evitarán cuentas duplicadas asociadas al mismo usuario.

---

## Recuperación sencilla

Perder el acceso nunca deberá significar perder reservas, historial, membresía o actividad.

---

## Privacidad

La información utilizada para autenticar nunca se mostrará públicamente.

---

# Proveedor de autenticación

MotanOS utilizará Supabase Auth como proveedor principal de identidad.

Supabase Auth gestionará:

* creación de cuentas,
* inicio de sesión,
* cierre de sesión,
* sesiones,
* tokens,
* recuperación de acceso,
* verificación de identidad,
* proveedores externos cuando proceda.

---

# Métodos de acceso iniciales

## Correo electrónico y contraseña

Será el método estándar de acceso.

La contraseña deberá cumplir una política mínima de seguridad.

---

## Enlace mágico por correo

Permitirá acceder sin recordar una contraseña.

Será especialmente útil para usuarios ocasionales o invitados.

---

## Código de un solo uso

Podrá utilizarse para procesos rápidos de acceso o confirmación.

Su implementación dependerá de la disponibilidad y coste del canal utilizado.

---

# Métodos futuros

Podrán añadirse cuando aporten valor real:

* Google.
* Apple.
* Microsoft.
* Teléfono móvil.

No se incorporarán proveedores externos únicamente por aparentar modernidad.

---

# Acceso como visitante

El usuario podrá explorar parte del ecosistema sin iniciar sesión.

Por ejemplo:

* página pública,
* instalaciones,
* carta,
* horarios,
* eventos públicos,
* información del club.

La autenticación será necesaria cuando la acción implique:

* reservar,
* pagar,
* participar,
* crear experiencias,
* guardar preferencias,
* interactuar con otras personas.

---

# Registro progresivo

IKON no obligará a completar todo el perfil durante el registro.

El alta inicial solicitará únicamente lo necesario.

El resto de información podrá completarse progresivamente según el contexto.

Ejemplo:

El nivel de pádel se solicitará cuando el usuario quiera participar en un partido de pádel.

No durante el primer acceso si todavía no resulta relevante.

---

# Flujo de alta

El proceso inicial será:

1. El usuario introduce su correo.
2. Confirma su identidad.
3. Acepta las condiciones necesarias.
4. Crea o confirma sus credenciales.
5. Accede a IKON.
6. Completa progresivamente su perfil.

El objetivo es permitir el acceso con el mínimo número de pasos.

---

# Vinculación con socios existentes

Una persona puede ser socia del club antes de crear su cuenta digital.

IKON deberá permitir vincular una nueva cuenta con una membresía existente.

La vinculación podrá realizarse mediante:

* correo verificado,
* código de socio,
* invitación enviada por el club,
* validación manual del personal,
* código temporal seguro.

Nunca se vinculará una membresía utilizando únicamente información pública.

---

# Invitados

Los socios podrán invitar personas a determinadas experiencias.

El invitado podrá recibir un enlace seguro que le permita:

* consultar la invitación,
* aceptar o rechazar,
* completar los datos necesarios,
* crear una cuenta si decide continuar usando IKON.

No se le obligará a realizar un registro completo antes de comprender la invitación.

---

# Sesiones

Las sesiones deberán:

* expirar de forma segura,
* renovarse cuando proceda,
* invalidarse al cerrar sesión,
* revocarse ante actividad sospechosa,
* protegerse contra accesos no autorizados.

El usuario podrá cerrar sesiones abiertas en otros dispositivos.

---

# Dispositivos

IKON deberá funcionar correctamente en:

* móvil,
* tablet,
* ordenador,
* PWA instalada.

La sesión podrá mantenerse entre visitas cuando resulte seguro.

---

# Verificación de correo

El correo deberá verificarse antes de permitir determinadas acciones sensibles.

Por ejemplo:

* cambiar credenciales,
* realizar ciertas reservas,
* acceder a información privada,
* vincular una membresía,
* crear contenido comunitario.

---

# Recuperación de acceso

El sistema permitirá recuperar el acceso mediante un enlace temporal seguro.

El proceso deberá:

* confirmar la identidad,
* tener una duración limitada,
* invalidarse después de utilizarse,
* evitar revelar si una cuenta existe cuando pueda representar un riesgo.

---

# Cambio de correo

Cambiar el correo deberá requerir:

* sesión válida,
* confirmación de la nueva dirección,
* notificación a la dirección anterior cuando sea posible.

---

# Cambio de contraseña

El usuario podrá cambiar su contraseña desde su cuenta.

Las operaciones sensibles podrán requerir una autenticación reciente.

---

# Autenticación reforzada

La autenticación multifactor podrá utilizarse para perfiles con acceso sensible.

Será especialmente recomendable para:

* administradores,
* managers,
* personal con acceso económico,
* personal con acceso a datos privados,
* usuarios con capacidad de modificar configuración crítica.

---

# Roles y autenticación

Autenticarse responde a:

> ¿Quién eres?

Los permisos responden a:

> ¿Qué puedes hacer?

Ambos conceptos deberán permanecer separados.

Iniciar sesión no concede automáticamente acceso a funciones internas.

Los permisos se definirán en `27_PERMISSIONS.md`.

---

# Cuentas del personal

Las cuentas del staff deberán ser individuales.

Nunca se utilizarán cuentas compartidas como:

* recepción@...
* restaurante@...
* admin@...

Cada acción sensible deberá poder asociarse a una persona concreta.

---

# Acceso administrativo

El acceso a administración deberá:

* requerir autenticación reforzada cuando proceda,
* registrar acciones relevantes,
* limitarse por rol,
* aplicar expiraciones de sesión más estrictas,
* impedir acceso desde cuentas no autorizadas.

---

# Suspensión de cuentas

Una cuenta podrá encontrarse en alguno de estos estados:

* activa,
* pendiente de verificación,
* restringida,
* suspendida,
* desactivada,
* eliminada.

Cada estado tendrá consecuencias claras.

Una suspensión no deberá eliminar automáticamente el historial del usuario.

---

# Eliminación de cuenta

El usuario podrá solicitar la eliminación de su cuenta conforme a la legislación aplicable.

El proceso deberá distinguir entre:

* datos que pueden eliminarse,
* datos que deben conservarse por obligaciones legales,
* datos que pueden anonimizarse,
* registros económicos o de seguridad que requieren retención.

---

# Prevención de abuso

El sistema deberá protegerse frente a:

* intentos repetidos de acceso,
* creación masiva de cuentas,
* enlaces de acceso reutilizados,
* robo de sesión,
* suplantación,
* abuso de recuperación de contraseñas.

Las medidas deberán aplicarse sin perjudicar innecesariamente a usuarios legítimos.

---

# Mensajes de error

Los mensajes deberán ser claros y seguros.

Nunca revelarán información sensible.

Ejemplo adecuado:

> No hemos podido iniciar sesión con esos datos.

Ejemplo inadecuado:

> El correo existe, pero la contraseña es incorrecta.

La segunda opción revela información sobre cuentas existentes.

---

# Auditoría

Deberán registrarse, cuando proceda:

* inicios de sesión,
* cierres de sesión,
* recuperación de acceso,
* cambios de credenciales,
* vinculación de membresías,
* accesos administrativos,
* revocación de sesiones,
* intentos sospechosos.

Los registros de auditoría no deberán contener contraseñas ni tokens secretos.

---

# Integración con la base de datos

Supabase Auth gestionará la identidad autenticada.

La información de negocio se almacenará en las entidades propias de la implementación correspondiente.

La cuenta de autenticación no deberá convertirse en el perfil completo del usuario.

La relación conceptual será:

```text
Auth User
   ↓
IKON User
   ↓
Profile
   ↓
Memberships, bookings, experiences and activity
```

---

# Experiencia premium

Incluso el acceso deberá respetar la identidad de IKON.

El proceso deberá incluir:

* carga rápida,
* textos humanos,
* errores elegantes,
* recuperación clara,
* transiciones discretas,
* ausencia de formularios innecesarios.

La pantalla de acceso no será una plantilla genérica.

Será la entrada digital al club.

---

# Lo que nunca haremos

* Guardar contraseñas directamente.
* Crear sistemas propios de criptografía.
* Exponer tokens en el cliente.
* Utilizar cuentas compartidas para el personal.
* Conceder permisos por atributos enviados desde el navegador.
* Obligar a registrarse para consultar información pública.
* Pedir información que todavía no es necesaria.
* Vincular socios sin verificar su identidad.
* Mantener sesiones indefinidas en áreas administrativas.
* Mostrar errores que revelen datos sobre otras cuentas.

---

# Criterios de aceptación

El sistema de autenticación se considerará correctamente diseñado cuando:

* un visitante pueda explorar contenido público sin registrarse,
* un usuario pueda crear una cuenta con pocos pasos,
* un socio existente pueda vincular su membresía de forma segura,
* una persona pueda recuperar el acceso sin intervención del club,
* las sesiones puedan revocarse,
* las funciones administrativas estén protegidas,
* cada cuenta del personal sea individual,
* las operaciones sensibles queden auditadas,
* el proceso sea comprensible desde móvil,
* la seguridad no degrade innecesariamente la experiencia.

---

# Regla final

La autenticación debe proteger la identidad sin dificultar la entrada.

IKON debe reconocer a la persona de forma segura y permitirle continuar con su experiencia lo antes posible.

La puerta digital del club debe ser elegante, sencilla y fiable.
