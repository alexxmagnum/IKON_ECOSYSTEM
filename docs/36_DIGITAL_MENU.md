# 36 — DIGITAL_MENU

## Objetivo

Definir el funcionamiento completo del **Digital Menu** de MotanOS.

El Digital Menu será una experiencia interactiva integrada con el ecosistema del club.

No será un PDF digitalizado.

No será únicamente una lista de platos.

Será una herramienta para descubrir, decidir y disfrutar.

SoT de reglas: `docs/rules/business-rules.md` (BR-0082–0089, BR-0161–0164).  
Persistencia: `MENU` / `MENU_ITEM` en `docs/diagrams/database.mmd` y `24_DATABASE_SCHEMA.md`.  
Módulo Restaurant: `35_RESTAURANT_MODULE.md`.

---

# Visión

El Digital Menu representa la personalidad gastronómica del club.

Debe transmitir la misma sensación de calidad que el restaurante.

Cada fotografía.

Cada descripción.

Cada animación.

Cada interacción.

Todo debe abrir el apetito.

---

# Alcance

La carta permitirá:

* explorar categorías,
* descubrir platos,
* consultar bebidas,
* visualizar imágenes,
* consultar alérgenos,
* consultar ingredientes,
* ver disponibilidad,
* guardar favoritos,
* compartir platos,
* crear pedidos (cuando esté habilitado),
* descubrir recomendaciones.

---

# Actores

Roles oficiales (DEC-002):

## Guest

Puede consultar el Digital Menu completo.

No necesita registrarse.

---

## Member

Puede:

* guardar favoritos,
* valorar platos,
* compartir,
* recibir recomendaciones,
* realizar pedidos si el Restaurant lo permite.

---

## Staff

Puede:

* activar o desactivar Menu Item (disponibilidad),
* modificar disponibilidad operativa,
* actualizar estados operativos de disponibilidad.

---

## Manager

Puede:

* gestionar Menu Category,
* precios,
* temporadas (Menu activo),
* fotografías,
* promociones,
* analítica.

---

# Estructura

La carta estará organizada mediante:

* Categorías.
* Subcategorías.
* Productos.
* Variantes.
* Complementos.

---

# Producto

Cada producto podrá contener:

* nombre,
* descripción,
* fotografías,
* precio,
* ingredientes,
* alérgenos,
* información nutricional (opcional),
* disponibilidad,
* tiempo estimado,
* etiquetas.

---

# Etiquetas

Ejemplos:

* Nuevo.
* Recomendado.
* Más vendido.
* Temporada.
* Picante.
* Vegetariano.
* Vegano.
* Sin gluten.
* Premium.

---

# Fotografía

Toda fotografía deberá seguir la identidad visual definida en:

16_VISUAL_IDENTITY.md

Las imágenes serán uno de los principales elementos de conversión.

Nunca utilizaremos fotografías de baja calidad.

---

# Disponibilidad

Cada producto podrá encontrarse en:

* Disponible.
* Últimas unidades.
* Temporalmente agotado.
* Solo por encargo.
* Próximamente.

La disponibilidad deberá actualizarse en tiempo real cuando sea posible.

---

# Estacionalidad

La carta podrá cambiar según:

* estación del año,
* eventos,
* torneos,
* festividades,
* promociones,
* disponibilidad.

No será una carta estática.

---

# Recomendaciones

El sistema podrá sugerir:

* platos relacionados,
* bebidas,
* postres,
* menús,
* maridajes,
* experiencias gastronómicas.

Las recomendaciones deberán combinar reglas de negocio y preferencias del usuario.

---

# Búsqueda

La carta permitirá buscar por:

* nombre,
* ingrediente,
* categoría,
* etiqueta,
* alérgeno,
* tipo de cocina.

---

# Favoritos

El usuario podrá guardar platos favoritos.

Estos datos podrán utilizarse para mejorar futuras recomendaciones.

---

# Compartir

Cada plato podrá compartirse mediante un enlace.

El enlace mostrará una vista pública optimizada.

---

# Integración con QR

La carta podrá abrirse mediante un código QR situado en:

* mesas,
* terraza,
* barra,
* eventos,
* instalaciones.

El QR podrá identificar automáticamente la mesa cuando sea necesario.

---

# Integración con reservas

Si el usuario tiene una reserva activa,

la carta podrá mostrar información contextual.

Ejemplos:

* bienvenida,
* sugerencias del día,
* promociones asociadas.

---

# Integración con experiencias

Una experiencia podrá incluir recomendaciones gastronómicas específicas.

Ejemplo:

Experiencia:

Golf + Brunch.

La carta destacará automáticamente el brunch disponible.

---

# Integración con eventos

Durante un evento podrán mostrarse:

* menús especiales,
* bebidas exclusivas,
* promociones.

---

# Integración con pedidos

Cuando el módulo de pedidos esté habilitado,

la carta permitirá añadir productos directamente al pedido.

---

# Accesibilidad

La carta deberá cumplir todas las normas definidas en:

34_ACCESSIBILITY.md

Especial atención a:

* contraste,
* tamaño de texto,
* imágenes,
* navegación táctil.

---

# Rendimiento

Las imágenes deberán cargarse progresivamente.

Las categorías deberán mostrarse de forma inmediata.

La navegación nunca deberá sentirse lenta.

---

# Automatizaciones

Ejemplos:

* destacar productos del día,
* ocultar productos agotados,
* activar carta de temporada,
* mostrar promociones según horario.

---

# Analítica

Se registrarán métricas como:

* productos más vistos,
* productos más vendidos,
* búsquedas,
* favoritos,
* tiempo de exploración,
* conversión a pedido.

---

# Casos límite

* Producto agotado mientras el usuario navega.
* Cambio de precio antes de confirmar un pedido.
* Producto retirado temporalmente.
* Fotografía no disponible.
* Alérgeno añadido por actualización.
* Carta especial durante un evento.

Todos estos escenarios deberán resolverse sin generar confusión.

---

# Criterios de aceptación

La Carta Digital se considerará completa cuando:

* cualquier visitante pueda explorarla sin registrarse,
* la navegación resulte rápida y agradable,
* los productos muestren información clara,
* la disponibilidad sea fiable,
* las recomendaciones aporten valor,
* las fotografías mantengan un nivel premium,
* la integración con reservas y experiencias sea transparente.

---

# Visión a largo plazo

La Carta Digital deberá convertirse en una parte esencial de la experiencia IKON.

No será únicamente un lugar donde consultar precios.

Será un espacio donde descubrir nuevos platos, inspirarse antes de una visita y complementar cualquier experiencia del club.

---

# Regla final

La mejor carta digital no es la que muestra más platos.

Es la que consigue que el usuario encuentre fácilmente aquello que realmente desea disfrutar.

Cada interacción debe abrir el apetito.

Cada plato debe invitar a vivir una experiencia.

La carta forma parte del recuerdo que el usuario tendrá de IKON.
