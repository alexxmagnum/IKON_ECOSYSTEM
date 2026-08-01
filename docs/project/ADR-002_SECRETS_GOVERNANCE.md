# ADR-002 — Secrets Governance

Status: Accepted

Date: 2026-08-02

---

## Context

MotanOS será una plataforma con integraciones externas,
servicios internos y futuras implementaciones sobre distintos dominios.

Los secretos y credenciales externas son elementos críticos
de seguridad y no deben pertenecer a dominios funcionales.

---

## Decision

MotanOS seguirá una política centralizada de gestión de secretos.

Los secretos serán responsabilidad de Core Security / Infrastructure.

No existirá un Secrets Architect independiente.

---

## Ownership

### Security

Responsable de:

- políticas de seguridad
- clasificación de secretos
- reglas de acceso
- auditoría

### Backend / Infrastructure

Responsable de:

- almacenamiento seguro
- carga en runtime
- integración con proveedores

### Domain

Los dominios:

- Golf
- Restaurant
- Events
- etc.

Nunca almacenan ni gestionan secretos propios.

---

## Secret classification

### Platform secrets

Ejemplos:

- Database credentials
- Encryption keys
- Authentication secrets
- Internal service keys

### Integration credentials

Ejemplos:

- Stripe
- WhatsApp
- Email providers
- External APIs

Las credenciales de integraciones futuras deberán poder asociarse
a una implementación concreta sin acoplar el core.

---

## Rules

Nunca:

- guardar secretos en Git
- incluir claves en código fuente
- almacenar claves en documentación
- exponer secretos al frontend

---

## Environment separation

Los secretos deben estar separados por entorno:

- Development
- Staging
- Production

---

## Future SaaS consideration

La arquitectura deberá permitir que futuras implementaciones
gestionen sus propias integraciones sin compartir secretos globales.

---

## Principle

MotanOS puede utilizar servicios externos.

Pero ningún proveedor externo debe convertirse
en propietario de la arquitectura de secretos.
