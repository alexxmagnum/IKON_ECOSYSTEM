# 29 — PWA_STRATEGY

## Objetivo

Definir la estrategia oficial de Progressive Web App de IKON.

La PWA será la única aplicación oficial del ecosistema.

No existirá una aplicación nativa durante la primera etapa del proyecto.

La experiencia deberá ser comparable a una aplicación nativa en velocidad, fluidez y calidad.

---

# Filosofía

El usuario no debe preguntarse si IKON es una web o una aplicación.

Debe sentirse simplemente como una gran experiencia.

La tecnología utilizada para conseguirlo es secundaria.

---

# Objetivos

La PWA deberá:

* instalarse fácilmente,
* abrirse rápidamente,
* funcionar con fluidez,
* soportar conexiones inestables,
* reducir tiempos de espera,
* ofrecer una experiencia consistente en cualquier dispositivo.

---

# Instalación

El usuario podrá instalar IKON desde el navegador.

No dependeremos de App Store ni Google Play.

La invitación para instalar la PWA deberá aparecer únicamente cuando resulte oportuna.

Nunca al primer segundo de uso.

Ejemplos de buenos momentos:

* después de la segunda visita,
* tras completar una reserva,
* después de iniciar sesión,
* cuando el usuario demuestra interés recurrente.

---

# Funcionamiento offline

La aplicación deberá continuar funcionando parcialmente sin conexión.

El usuario podrá consultar, cuando sea posible:

* reservas recientes,
* perfil,
* historial,
* carta descargada,
* información básica del club,
* eventos sincronizados.

Las operaciones que requieran conexión deberán gestionarse de forma elegante.

---

# Sincronización

Cuando la conexión vuelva a estar disponible:

* los cambios pendientes deberán sincronizarse automáticamente,
* evitando conflictos siempre que sea posible.

El usuario no deberá realizar acciones manuales.

---

# Caché inteligente

No todo el contenido deberá almacenarse.

Se priorizará:

* recursos estáticos,
* imágenes optimizadas,
* información consultada frecuentemente,
* configuración del usuario.

El contenido dinámico deberá actualizarse cuando resulte necesario.

---

# Actualizaciones

Las nuevas versiones deberán instalarse de forma transparente.

Cuando una actualización importante afecte a la experiencia, el usuario podrá recibir una notificación discreta para recargar la aplicación.

Nunca interrumpiremos una acción crítica.

---

# Rendimiento

Objetivos:

* apertura casi instantánea,
* navegación fluida,
* carga progresiva,
* imágenes optimizadas,
* mínimo consumo de datos.

La percepción de velocidad forma parte del producto.

---

# Push Notifications

Las notificaciones push estarán disponibles únicamente tras el consentimiento explícito del usuario.

Nunca se solicitarán permisos nada más abrir la aplicación.

Primero debemos demostrar valor.

Después solicitar permiso.

---

# Iconos

La PWA deberá disponer de iconos optimizados para:

* Android,
* iOS,
* Windows,
* macOS,
* ChromeOS.

Todos los tamaños deberán derivarse de una única identidad visual.

---

# Splash Screen

La pantalla de carga inicial deberá:

* abrir rápidamente,
* respetar la identidad de IKON,
* evitar tiempos muertos,
* desaparecer en cuanto el contenido esté listo.

No será una animación larga.

---

# Navegación

La navegación deberá sentirse completamente nativa.

Gestos.

Desplazamientos.

Transiciones.

Todo deberá resultar natural.

---

# Compatibilidad

La PWA deberá ofrecer una experiencia excelente en:

* Chrome,
* Edge,
* Safari,
* Firefox.

Se adaptará a las capacidades disponibles de cada navegador.

---

# Acceso desde el escritorio

La PWA deberá comportarse correctamente como aplicación de escritorio cuando el usuario la instale.

No deberá parecer una página web abierta en un navegador.

---

# Almacenamiento local

Solo se almacenará información necesaria para mejorar la experiencia.

Nunca datos sensibles sin protección.

---

# Compartir

IKON aprovechará las capacidades del dispositivo para compartir:

* eventos,
* reservas,
* experiencias,
* invitaciones,
* promociones.

Siempre utilizando las APIs estándar del navegador cuando estén disponibles.

---

# Integración con el dispositivo

Siempre que el navegador lo permita, la PWA podrá integrarse con funciones del sistema como:

* compartir contenido,
* acceso a cámara para QR,
* calendario,
* notificaciones,
* ubicación (con permiso),
* archivos (cuando sea necesario).

Nunca solicitaremos permisos sin una razón clara.

---

# Experiencia móvil

El diseño será mobile-first en interacción, pero no limitado al móvil.

Los componentes deberán adaptarse de forma elegante a:

* teléfonos,
* tablets,
* ordenadores.

---

# Accesibilidad

La experiencia instalada deberá respetar todas las normas de accesibilidad definidas por IKON.

La instalación nunca debe reducir la accesibilidad del producto.

---

# Seguridad

La PWA deberá funcionar exclusivamente mediante HTTPS.

Todas las comunicaciones seguirán las políticas definidas en `28_SECURITY.md`.

---

# Integración

La PWA trabajará junto con:

* Notification Engine.
* Search Engine.
* Recommendation Engine.
* Social Experience Engine (`48_SOCIAL_EXPERIENCE_ENGINE.md`).
* Recommendation Engine (`50_RECOMMENDATION_ENGINE.md`).

Toda la plataforma deberá sentirse como una única aplicación.

---

# Métricas

Evaluaremos:

* instalaciones,
* frecuencia de uso,
* tiempo de apertura,
* rendimiento,
* uso offline,
* tasa de retorno,
* estabilidad,
* satisfacción.

Nunca mediremos únicamente el número de instalaciones.

---

# Lo que nunca haremos

* Obligar a instalar la PWA.
* Solicitar permisos nada más entrar.
* Mostrar banners invasivos.
* Depender de conexión para tareas básicas.
* Convertir la PWA en una simple copia de la web.

---

# Criterios de aceptación

La estrategia PWA será correcta cuando:

* el usuario pueda instalar IKON fácilmente,
* la aplicación abra con rapidez,
* funcione correctamente con conexiones lentas,
* sincronice cambios automáticamente cuando recupere conexión,
* las actualizaciones sean discretas,
* los permisos se soliciten en el momento adecuado,
* la experiencia instalada resulte indistinguible, en la práctica, de una aplicación moderna.

---

# Regla final

La PWA no será una alternativa económica a una app nativa.

Será la estrategia principal de IKON.

Si un usuario olvida que está utilizando una tecnología web,

habremos alcanzado nuestro objetivo.
