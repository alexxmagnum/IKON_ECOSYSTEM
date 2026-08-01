# 25 — API CONTRACTS

## Objetivo

Definir las reglas de comunicación entre el frontend, el backend y los servicios internos de IKON.

Este documento establece cómo se intercambia la información en todo el ecosistema.

No describe endpoints concretos.

Define los principios y contratos que deberán respetarse.

---

# Filosofía

La API es un contrato.

Una vez publicada, cualquier cambio incompatible debe evitarse o gestionarse mediante versionado.

El frontend nunca debe depender de implementaciones internas.

Solo de contratos estables.

---

# Principios

## Consistencia

Todas las respuestas seguirán una estructura común.

---

## Predictibilidad

Una misma operación devolverá siempre el mismo formato.

---

## Tipado

Todos los datos estarán tipados mediante TypeScript y validados con Zod.

---

## Seguridad

Nunca se expondrán datos innecesarios.

Cada respuesta contendrá únicamente la información que el usuario tiene permiso para consultar.

---

## Versionado

Las APIs deberán poder evolucionar sin romper clientes existentes.

Cuando un cambio sea incompatible, se utilizará una nueva versión.

---

# Recursos principales

La API gestionará, entre otros, los siguientes recursos:

* Usuarios
* Perfiles
* Socios
* Experiencias
* Reservas
* Instalaciones
* Restaurante
* Carta
* Productos
* Pedidos
* Eventos
* Torneos
* Comunidad
* Grupos
* Notificaciones
* Recomendaciones
* Recompensas
* Pagos
* Contenido

---

# Operaciones

Cada recurso podrá ofrecer operaciones coherentes con el negocio, como:

* Consultar
* Crear
* Actualizar
* Cancelar o eliminar (cuando proceda)
* Buscar
* Filtrar
* Paginar

No todos los recursos deberán permitir todas las operaciones.

---

# Errores

Las respuestas de error deberán ser:

* claras,
* coherentes,
* accionables.

Nunca se expondrá información interna del servidor.

---

# Paginación

Las colecciones deberán soportar paginación para garantizar el rendimiento.

---

# Filtros

Los recursos deberán permitir filtros cuando tenga sentido.

Ejemplos:

* Fecha
* Estado
* Categoría
* Disponibilidad
* Tipo de experiencia

---

# Ordenación

Siempre que sea útil, los resultados podrán ordenarse por criterios definidos.

Nunca dependerán del orden de almacenamiento.

---

# Integraciones

Los servicios externos (Stripe, Resend, n8n, etc.) nunca serán consumidos directamente por el frontend.

Toda integración pasará por la capa de aplicación correspondiente.

---

# Observabilidad

Las operaciones relevantes deberán poder registrarse para auditoría y diagnóstico.

---

# Regla final

La API no existe para reflejar la base de datos.

Existe para ofrecer una interfaz estable, segura y coherente al resto del sistema.
