# 21 — SYSTEM_ARCHITECTURE

## Objetivo

Definir la arquitectura general de MotanOS.

Este documento establece cómo se organizan todos los sistemas, módulos, servicios y comunicaciones del producto.

Su propósito es garantizar una plataforma escalable, mantenible, segura y preparada para crecer sin necesidad de rehacer la arquitectura.

Toda decisión técnica deberá respetar este documento.

---

# Filosofía

La arquitectura debe servir al producto.

Nunca al revés.

No elegimos tecnologías porque estén de moda.

Elegimos tecnologías que permitan construir una experiencia excelente.

---

# Principios

## Modularidad

Cada dominio funcional deberá estar aislado.

Una modificación en un módulo no deberá afectar al resto del sistema.

---

## Escalabilidad

La arquitectura deberá soportar el crecimiento del producto.

Nuevos módulos.

Nuevos deportes.

Nuevos servicios.

Nuevos idiomas.

Nuevos clubes (si algún día se decide reutilizar la plataforma).

---

## Bajo acoplamiento

Los módulos deberán depender lo mínimo posible entre sí.

Las integraciones se realizarán mediante interfaces claras.

Nunca mediante dependencias ocultas.

---

## Alta cohesión

Cada módulo deberá tener una única responsabilidad bien definida.

---

## Reutilización

La lógica común deberá existir una única vez.

Nunca duplicaremos reglas de negocio.

---

## Seguridad

La seguridad forma parte de la arquitectura.

No será una capa añadida al final del proyecto.

---

## Rendimiento

Cada decisión deberá considerar:

* tiempos de respuesta,
* consumo de recursos,
* escalabilidad futura.

---

# Capas del sistema

La aplicación se divide en varias capas.

## Presentación

Responsable de la experiencia del usuario.

Incluye:

* PWA,
* interfaz,
* navegación,
* componentes,
* animaciones.

---

## Aplicación

Contiene los casos de uso.

Gestiona el comportamiento del producto.

No conoce detalles de infraestructura.

---

## Dominio

El núcleo del negocio.

Define:

* reservas,
* experiencias,
* comunidad,
* torneos,
* restaurante,
* usuarios.

Aquí viven las reglas más importantes.

---

## Infraestructura

Gestiona:

* base de datos,
* almacenamiento,
* autenticación,
* servicios externos,
* automatizaciones.

La infraestructura nunca debe contener reglas de negocio.

---

# Módulos principales

El sistema se divide en dominios independientes.

* Usuarios.
* Comunidad.
* Experiencias.
* Reservas.
* Restaurante.
* Carta digital.
* Eventos.
* Torneos.
* Golf.
* Pádel.
* Billar.
* Dardos.
* Pagos.
* Notificaciones.
* Recomendaciones.
* CMS.
* Administración.
* Analítica.

Cada módulo tendrá límites claros.

---

# Comunicación

Los módulos colaboran.

No dependen directamente unos de otros.

Toda comunicación deberá producirse mediante contratos definidos.

---

# Estado

El estado de la aplicación deberá estar organizado por dominios.

Evitaremos estados globales innecesarios.

Cada módulo gestionará únicamente la información que le corresponde.

---

# Persistencia

Los datos deberán almacenarse de forma consistente.

Las reglas de acceso estarán centralizadas.

Nunca existirán consultas duplicadas con comportamientos distintos.

---

# Integraciones

Las integraciones externas estarán completamente aisladas.

Ejemplos.

* Stripe.
* Email.
* Push.
* Mapas.
* Automatizaciones.

La lógica del producto nunca dependerá directamente de proveedores externos.

---

# Automatizaciones

Todas las automatizaciones deberán ejecutarse fuera del flujo principal de la aplicación siempre que sea posible.

El usuario nunca debe esperar por procesos secundarios.

---

# Observabilidad

El sistema deberá permitir conocer:

* errores,
* rendimiento,
* tiempos de respuesta,
* incidencias,
* uso de funcionalidades.

La arquitectura debe facilitar el diagnóstico.

---

# Configuración

Toda configuración deberá centralizarse.

No existirán valores repartidos por el código.

---

# Internacionalización

La arquitectura deberá admitir múltiples idiomas desde el principio.

Nunca deberán existir textos incrustados en componentes.

---

# Accesibilidad

La accesibilidad no pertenece únicamente a la interfaz.

También forma parte de la arquitectura.

---

# Testing

Cada capa deberá poder probarse de forma independiente.

La arquitectura facilitará:

* pruebas unitarias,
* integración,
* pruebas funcionales.

---

# Despliegue

El sistema deberá poder desplegarse sin interrumpir el servicio.

La arquitectura favorecerá despliegues pequeños y frecuentes.

---

# Evolución

Toda nueva funcionalidad deberá integrarse dentro de la arquitectura existente.

Nunca romperla.

Si un cambio importante obliga a modificar la arquitectura, deberá justificarse y documentarse previamente.

---

# Indicadores

Una buena arquitectura debe permitir:

* evolucionar rápidamente,
* reducir errores,
* simplificar mantenimiento,
* facilitar pruebas,
* incorporar nuevos módulos con bajo coste.

---

# Regla final

La arquitectura de MotanOS debe ser capaz de crecer durante años sin perder claridad.

Cada decisión técnica deberá preguntarse:

**¿Hará que el producto sea más fácil de mantener dentro de cinco años?**

Si la respuesta es no, esa decisión deberá replantearse.
