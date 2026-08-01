# 18 — UI_COMPONENT_SYSTEM

## Objetivo

Definir todos los componentes reutilizables del ecosistema IKON y las reglas para su construcción.

El objetivo es garantizar una interfaz consistente, escalable y mantenible.

Todo componente nuevo deberá seguir este documento.

---

# Filosofía

No diseñamos pantallas.

Diseñamos componentes.

Las pantallas son únicamente composiciones de componentes reutilizables.

---

# Principios

## Reutilización

Un componente debe utilizarse en múltiples lugares.

Si un componente solo sirve para una pantalla, probablemente no sea un componente.

---

## Consistencia

El mismo problema tendrá siempre el mismo componente.

Nunca existirán dos botones distintos para hacer la misma acción.

---

## Modularidad

Los componentes deben ser independientes.

No depender de una pantalla concreta.

---

## Accesibilidad

Todos los componentes deberán ser accesibles desde su primera versión.

---

## Rendimiento

Los componentes deberán ser ligeros.

Evitaremos renderizados innecesarios.

---

# Design Tokens

Todos los componentes utilizarán exclusivamente los tokens definidos por el sistema.

Nunca se permitirán valores arbitrarios.

## Colores

* Color primario
* Color secundario
* Fondo principal
* Fondo secundario
* Superficie
* Texto principal
* Texto secundario
* Éxito
* Advertencia
* Error
* Información

---

## Espaciado

Todo el sistema utilizará una escala fija.

No se utilizarán márgenes o paddings improvisados.

---

## Radios

Los radios de borde pertenecerán a una escala común.

No existirán componentes con esquinas inconsistentes.

---

## Sombras

Todas las elevaciones utilizarán una colección limitada de sombras.

Nunca se crearán sombras específicas para un componente.

---

## Tipografía

Todos los tamaños pertenecerán a la escala tipográfica definida.

No existirán tamaños personalizados.

---

## Duraciones

Las animaciones utilizarán únicamente duraciones definidas por el Motion System.

---

## Breakpoints

Todo componente deberá adaptarse correctamente a:

* móvil,
* tablet,
* escritorio.

---

# Componentes básicos

## Button

Variantes:

* Primary
* Secondary
* Ghost
* Outline
* Destructive
* Icon

Estados:

* Normal
* Hover
* Active
* Focus
* Disabled
* Loading

---

## Icon Button

Botón únicamente con icono.

Siempre acompañado de accesibilidad.

---

## Input

Tipos:

* Texto
* Email
* Password
* Número
* Teléfono
* Búsqueda

Estados completos.

---

## Textarea

Consistente con Input.

---

## Select

Selector accesible.

---

## Checkbox

---

## Radio

---

## Switch

---

## Slider

---

## Badge

Para estados y categorías.

---

## Chip

Para filtros rápidos.

---

## Tag

Para etiquetas.

---

## Tooltip

Información contextual.

Nunca obligatoria.

---

## Popover

Contenido contextual enriquecido.

---

## Modal

Acciones importantes.

No abusar.

---

## Drawer

Especialmente en móvil.

---

## Dialog

Confirmaciones críticas.

---

## Toast

Confirmaciones temporales.

Nunca sustituye errores importantes.

---

## Alert

Mensajes persistentes.

---

## Card

Uno de los componentes principales del producto.

Todas las cards compartirán la misma filosofía visual.

---

## List

---

## Avatar

Con variantes.

---

## Skeleton

Utilizado durante cargas.

Nunca spinner como solución principal.

---

## Tabs

---

## Accordion

---

## Carousel

Para destacar experiencias.

No abusar.

---

## Calendar

Elemento fundamental del ecosistema.

---

## Date Picker

---

## Time Picker

---

## Search Bar

Integrada con Search Engine.

---

## Navigation

Top Navigation.

Bottom Navigation.

Sidebar.

Breadcrumbs.

---

## Menu

---

## Dropdown

---

## Pagination

Solo cuando sea realmente necesaria.

---

## Table

Principalmente para administración.

---

## Empty State

Toda pantalla vacía deberá ayudar al usuario.

Nunca mostrar únicamente:

"No hay datos."

---

## Error State

Siempre ofrecer solución.

---

## Loading State

Coherente con Motion System.

---

# Componentes específicos IKON

## Experience Card

Elemento principal del producto.

Debe mostrar:

* imagen,
* categoría,
* fecha,
* participantes,
* disponibilidad,
* acción principal.

---

## Event Card

---

## Restaurant Card

---

## Dish Card

---

## Tournament Card

---

## Golf Booking Card

---

## Paddle Match Card

---

## Community Card

---

## Member Card

---

## Notification Card

---

## Recommendation Card

---

## Profile Card

---

## Reward Card

---

## Achievement Card

---

## Leaderboard

---

## Timeline

---

## Activity Feed

---

## Reservation Summary

---

## Payment Summary

---

## KPI Card

Principalmente para Backoffice.

---

# Estados

Todos los componentes deberán contemplar:

* vacío,
* carga,
* éxito,
* error,
* sin conexión,
* deshabilitado.

---

# Documentación

Cada componente deberá incluir:

* propósito,
* propiedades,
* variantes,
* estados,
* accesibilidad,
* comportamiento,
* ejemplos.

---

# Regla final

Nunca construiremos una pantalla desde cero.

Construiremos componentes.

Las pantallas serán únicamente la combinación inteligente de esos componentes.

Cuantos menos componentes necesite IKON para construir todas sus pantallas, más sólido será el sistema.
