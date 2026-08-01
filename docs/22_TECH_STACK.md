# 22 — TECH STACK

## Objetivo

Definir la pila tecnológica oficial de MotanOS.

Este documento establece las tecnologías permitidas para el desarrollo del ecosistema.

El objetivo es mantener una arquitectura consistente, reducir la complejidad y evitar decisiones improvisadas durante el desarrollo.

---

# Filosofía

Elegimos tecnologías por:

* estabilidad,
* rendimiento,
* escalabilidad,
* comunidad,
* coste reducido,
* compatibilidad con TypeScript,
* facilidad de mantenimiento.

No elegimos tecnologías por tendencias.

---

# Frontend

## Framework

Next.js

Motivo:

* App Router
* Server Components
* SEO
* PWA
* Excelente rendimiento
* Gran ecosistema

---

## Lenguaje

TypeScript

Todo el proyecto utilizará TypeScript.

No se permitirá JavaScript en producción.

---

## UI

React

Toda la interfaz se desarrollará mediante componentes React.

---

## Estilos

Tailwind CSS

No se utilizará CSS tradicional salvo casos excepcionales.

---

## Componentes

shadcn/ui

Todos los componentes base partirán de shadcn.

Nunca modificaremos directamente la librería.

Crearemos componentes propios sobre ella.

---

## Iconos

Lucide Icons

Única librería oficial.

---

## Animaciones

Framer Motion

Toda animación deberá seguir el documento:

17_MOTION_SYSTEM.md

---

# Backend

## Runtime

Node.js

---

## Base de datos

PostgreSQL

Base de datos principal del proyecto.

---

## Backend as a Service

Supabase

Se utilizará para:

* PostgreSQL
* Auth
* Storage
* Realtime
* Edge Functions (cuando proceda)

---

## ORM

Drizzle ORM

ORM oficial del proyecto.

Toda la capa de acceso a datos deberá utilizar Drizzle.

---

# Estado

## Datos remotos

TanStack Query

Gestionará:

* caché,
* sincronización,
* refetch,
* invalidación.

---

## Estado global

Zustand

Solo para estado de interfaz.

Nunca para datos persistentes.

---

# Formularios

React Hook Form

---

# Validación

Zod

Toda validación deberá compartir esquemas entre frontend y backend cuando sea posible.

---

# Automatizaciones

n8n

Instancia autohospedada.

Gestionará:

* emails,
* recordatorios,
* integraciones,
* webhooks,
* procesos automáticos.

---

# Emails

Resend

Proveedor oficial de correo.

---

# Pagos

Stripe

Toda la gestión económica utilizará Stripe.

---

# Mapas

OpenStreetMap

Leaflet

No utilizaremos Google Maps salvo necesidad justificada.

---

# PWA

next-pwa

IKON será una Progressive Web App.

No existirá aplicación nativa en la primera etapa del proyecto.

---

# Testing

## Unitarios

Vitest

---

## End-to-End

Playwright

---

# Calidad

ESLint

Prettier

Husky

lint-staged

---

# Documentación

Markdown

Toda la documentación oficial permanecerá dentro de /docs.

---

# Control de versiones

Git

GitHub

---

# Hosting

Desarrollo:

Vercel Hobby.

Producción:

Vercel.

La arquitectura deberá permitir migrar a otra plataforma sin cambios importantes.

---

# Variables de entorno

Toda configuración sensible utilizará variables de entorno.

Nunca existirán claves privadas dentro del código.

---

# Internacionalización

El sistema deberá estar preparado para múltiples idiomas desde el inicio.

---

# Dependencias

Antes de incorporar una nueva librería deberán responderse estas preguntas:

* ¿Resuelve un problema real?
* ¿Está mantenida activamente?
* ¿Existe una alternativa ya instalada?
* ¿Aumenta la complejidad?
* ¿Podemos resolverlo con herramientas existentes?

Si la respuesta no está clara, la dependencia no se añadirá.

---

# Lo que evitaremos

* Dependencias duplicadas.
* Librerías sin mantenimiento.
* Frameworks innecesarios.
* Soluciones propietarias cuando exista una alternativa open source equivalente.
* Cambios frecuentes de tecnología.

---

# Regla final

La mejor pila tecnológica no es la que tiene más herramientas.

Es la que permite desarrollar durante años con estabilidad, simplicidad y un coste controlado.

Toda nueva tecnología deberá mejorar realmente el producto antes de formar parte de IKON.
