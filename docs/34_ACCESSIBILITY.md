# 34 — ACCESSIBILITY

## Objetivo

Definir la estrategia oficial de accesibilidad del ecosistema IKON.

La accesibilidad será un requisito transversal del producto y afectará a todas las funcionalidades, componentes y experiencias.

Toda nueva pantalla deberá cumplir estas directrices desde su diseño inicial.

---

# Filosofía

IKON debe poder ser utilizado por cualquier persona.

La accesibilidad no será un añadido.

Formará parte del diseño, del desarrollo y de la experiencia.

Un producto excelente es aquel que no obliga al usuario a adaptarse.

Es el producto quien debe adaptarse al usuario.

---

# Principios

## Inclusión

Diseñaremos pensando en la mayor diversidad posible de usuarios.

---

## Claridad

La interfaz deberá ser fácil de comprender.

---

## Consistencia

Las mismas acciones deberán comportarse siempre igual.

---

## Simplicidad

Reduciremos la carga cognitiva.

Nunca añadiremos complejidad innecesaria.

---

## Compatibilidad

La aplicación deberá funcionar correctamente con tecnologías de asistencia.

---

# Navegación

Toda la aplicación deberá poder utilizarse mediante:

* teclado,
* ratón,
* pantalla táctil.

Ninguna funcionalidad dependerá exclusivamente de un gesto complejo.

---

# Focus

El foco deberá ser siempre visible.

El usuario deberá saber en qué elemento se encuentra.

---

# Lectores de pantalla

Todos los componentes deberán disponer de:

* etiquetas accesibles,
* nombres comprensibles,
* relaciones correctas,
* estructura semántica.

---

# HTML semántico

Se utilizarán siempre que sea posible elementos HTML adecuados.

Ejemplos:

* header,
* nav,
* main,
* section,
* article,
* button,
* form.

No se utilizarán elementos genéricos cuando exista una alternativa semántica.

---

# Contraste

Los colores deberán mantener un contraste suficiente para garantizar la legibilidad.

El color nunca será el único medio para transmitir información.

---

# Tipografía

La tipografía deberá:

* ser legible,
* escalar correctamente,
* mantener suficiente separación entre líneas,
* evitar tamaños excesivamente pequeños.

---

# Iconografía

Todo icono con significado deberá disponer de una descripción accesible.

Los iconos decorativos deberán ocultarse a los lectores de pantalla.

---

# Formularios

Todos los campos deberán incluir:

* etiqueta,
* ayuda cuando sea necesaria,
* mensajes de error claros,
* asociación correcta entre etiqueta y control.

---

# Mensajes de error

Los errores deberán explicar:

* qué ha ocurrido,
* cómo solucionarlo.

Nunca utilizaremos mensajes técnicos.

---

# Animaciones

El sistema respetará las preferencias del dispositivo.

Si el usuario solicita reducir movimiento,

IKON reducirá automáticamente las animaciones.

---

# Tiempo

Nunca obligaremos al usuario a completar una acción en un tiempo excesivamente corto.

Cuando exista un límite de tiempo,

deberá informarse adecuadamente.

---

# Multimedia

Los vídeos deberán permitir subtítulos cuando resulte necesario.

El contenido sonoro importante deberá disponer de alternativa textual.

---

# Imágenes

Toda imagen con significado deberá disponer de texto alternativo.

Las imágenes decorativas no deberán interferir con la navegación asistida.

---

# Gestos

Toda acción disponible mediante gestos deberá disponer también de una alternativa visible.

---

# Responsive

La accesibilidad deberá mantenerse en:

* móvil,
* tablet,
* escritorio,
* PWA instalada.

---

# Idiomas

La aplicación deberá indicar correctamente el idioma del contenido.

La internacionalización deberá respetar las normas de accesibilidad.

---

# Estados

Todos los componentes deberán comunicar correctamente:

* carga,
* error,
* éxito,
* deshabilitado,
* seleccionado.

Nunca dependeremos únicamente del color.

---

# Componentes

Todos los componentes definidos en:

18_UI_COMPONENT_SYSTEM.md

deberán cumplir estas normas.

La accesibilidad forma parte del componente.

No se añade posteriormente.

---

# Testing

La accesibilidad deberá comprobarse periódicamente mediante:

* herramientas automáticas,
* navegación por teclado,
* lectores de pantalla,
* pruebas manuales.

---

# Objetivo técnico

El proyecto deberá aspirar al cumplimiento de las recomendaciones **WCAG 2.2 nivel AA** como estándar general.

Las excepciones deberán documentarse y justificarse.

---

# Integración

La accesibilidad afecta a:

* Design System.
* Motion System.
* Componentes.
* Copywriting.
* PWA.
* Backend.
* CMS.

No pertenece únicamente al diseño.

---

# Lo que nunca haremos

* Utilizar únicamente color para comunicar.
* Ocultar el foco del teclado.
* Crear componentes inaccesibles.
* Utilizar textos demasiado pequeños.
* Crear formularios sin etiquetas.
* Añadir animaciones obligatorias.
* Ignorar lectores de pantalla.
* Sacrificar accesibilidad por estética.

---

# Criterios de aceptación

El sistema será accesible cuando:

* toda la aplicación pueda utilizarse mediante teclado,
* los lectores de pantalla interpreten correctamente la interfaz,
* el contraste sea suficiente,
* las imágenes importantes tengan texto alternativo,
* los formularios sean comprensibles,
* las animaciones respeten las preferencias del usuario,
* los componentes mantengan una experiencia coherente en todos los dispositivos.

---

# Regla final

La accesibilidad no es un modo especial de IKON.

Es IKON.

Si una persona no puede utilizar una funcionalidad importante debido a una decisión de diseño o desarrollo,

esa funcionalidad todavía no está terminada.

La verdadera calidad consiste en crear experiencias excelentes para el mayor número posible de personas.
