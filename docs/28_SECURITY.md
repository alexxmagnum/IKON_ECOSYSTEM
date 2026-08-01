# 28 — SECURITY

## Objetivo

Definir la estrategia de seguridad de MotanOS.

Este documento establece las normas, principios y mecanismos que protegerán a los usuarios, los datos y la infraestructura del sistema.

La seguridad deberá estar integrada desde el inicio del desarrollo.

Nunca se añadirá como una fase posterior.

---

# Filosofía

La mejor seguridad es aquella que protege al usuario sin que este tenga que pensar en ella.

IKON debe transmitir confianza.

La seguridad nunca debe convertirse en una barrera innecesaria para una buena experiencia.

---

# Principios

## Security by Design

Toda funcionalidad nueva deberá diseñarse considerando la seguridad desde el primer momento.

---

## Privacy by Design

Solo almacenaremos los datos necesarios para prestar el servicio.

Nunca recopilaremos información porque "quizá sea útil en el futuro".

---

## Mínimo privilegio

Cada usuario, proceso y servicio tendrá únicamente los permisos imprescindibles para realizar su trabajo.

---

## Defensa en profundidad

La protección nunca dependerá de una única medida.

La seguridad se aplicará en varias capas:

* Cliente.
* Servidor.
* Base de datos.
* Infraestructura.
* Proveedores externos.

---

# Protección de datos

Toda información sensible deberá almacenarse de forma segura.

Las contraseñas nunca se almacenarán directamente.

La autenticación será gestionada por Supabase Auth.

---

# Transporte

Toda comunicación utilizará HTTPS.

No se permitirá tráfico inseguro.

---

# Base de datos

PostgreSQL será protegido mediante:

* autenticación,
* cifrado,
* copias de seguridad,
* Row Level Security,
* políticas de acceso.

---

# Row Level Security

RLS será obligatorio.

Todas las tablas con información de usuarios deberán disponer de políticas de acceso explícitas.

Nunca dependeremos únicamente del frontend para proteger datos.

---

# Validación

Toda entrada de datos deberá validarse.

Cliente.

↓

Servidor.

↓

Base de datos.

La validación en el cliente mejora la experiencia.

La validación en el servidor garantiza la seguridad.

---

# Variables sensibles

Nunca se almacenarán:

* claves privadas,
* secretos,
* tokens,
* credenciales,

dentro del código fuente.

Toda configuración sensible utilizará variables de entorno.

---

# Archivos

Los archivos subidos por los usuarios deberán:

* validarse,
* limitar su tamaño,
* comprobar su tipo,
* almacenarse de forma segura.

Nunca se ejecutará contenido subido por usuarios.

---

# Integraciones

Toda integración externa deberá estar aislada.

Ejemplos:

* Stripe.
* Resend.
* n8n.

Las credenciales nunca llegarán al navegador.

---

# Auditoría

Las acciones críticas deberán registrarse.

Ejemplos:

* cambios de permisos,
* modificaciones de contenido,
* accesos administrativos,
* operaciones económicas,
* cambios de configuración.

---

# Monitorización

El sistema deberá detectar:

* errores repetitivos,
* intentos de acceso sospechosos,
* comportamientos anómalos,
* caídas de servicios.

---

# Copias de seguridad

La información crítica deberá disponer de un plan de respaldo.

Las copias deberán verificarse periódicamente.

Una copia que no puede restaurarse no puede considerarse una copia válida.

---

# Disponibilidad

La arquitectura deberá minimizar interrupciones.

Los fallos de un servicio no deberán afectar innecesariamente al resto del ecosistema.

---

# Protección frente a ataques

El sistema deberá protegerse frente a:

* fuerza bruta,
* robo de sesión,
* CSRF,
* XSS,
* inyección SQL,
* abuso de APIs,
* automatización maliciosa.

Siempre utilizando mecanismos estándar y bien mantenidos.

---

# Pagos

Toda la información de tarjetas será gestionada por Stripe.

MotanOS nunca almacenará números completos de tarjeta.

---

# Privacidad

Los usuarios podrán conocer:

* qué datos almacenamos,
* por qué los almacenamos,
* cómo solicitar su eliminación,
* cómo exportarlos cuando proceda.

---

# Eliminación de datos

Cuando un usuario elimine su cuenta:

* se eliminarán los datos que legalmente puedan eliminarse,
* se conservarán únicamente los registros obligatorios por ley,
* el resto podrá anonimizarse.

---

# Personal del club

Cada empleado dispondrá de su propia cuenta.

Nunca se utilizarán credenciales compartidas.

---

# Desarrollo

Durante el desarrollo:

* nunca se utilizarán datos reales innecesariamente,
* nunca se subirán secretos al repositorio,
* nunca se desactivarán mecanismos de seguridad para ahorrar tiempo.

---

# Dependencias

Toda nueva librería deberá evaluarse antes de incorporarse.

Se evitarán dependencias sin mantenimiento o con vulnerabilidades conocidas.

---

# Actualizaciones

El proyecto deberá mantenerse actualizado.

Las actualizaciones críticas de seguridad tendrán prioridad.

---

# Gestión de incidentes

Ante un incidente de seguridad deberán existir procedimientos para:

* detectar,
* contener,
* analizar,
* corregir,
* documentar,
* prevenir recurrencias.

---

# Lo que nunca haremos

* Desactivar RLS en producción.
* Compartir credenciales.
* Guardar secretos en el repositorio.
* Confiar únicamente en validaciones del frontend.
* Exponer información interna en mensajes de error.
* Almacenar datos bancarios directamente.
* Crear sistemas criptográficos propios.
* Ignorar vulnerabilidades conocidas.

---

# Criterios de aceptación

La estrategia de seguridad se considerará correcta cuando:

* todas las tablas sensibles utilicen RLS,
* todas las operaciones críticas requieran autorización,
* las credenciales permanezcan protegidas,
* los accesos administrativos estén auditados,
* los pagos dependan de Stripe,
* los datos personales puedan gestionarse conforme a la legislación,
* las copias de seguridad sean restaurables,
* las dependencias críticas se mantengan actualizadas.

---

# Regla final

La confianza es uno de los activos más valiosos de IKON.

Cada decisión técnica deberá preguntarse:

**¿Protege mejor a nuestros usuarios sin complicar su experiencia?**

Si la respuesta es sí, probablemente estamos tomando la decisión correcta.
