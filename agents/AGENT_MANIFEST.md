# IKON_ECOSYSTEM — AGENT MANIFEST

Version: 1.0

Status: ACTIVE

Classification: Official Engineering Agents Ecosystem

---

# 1. Purpose

El sistema de agentes de ingeniería de **IKON_ECOSYSTEM** existe para preservar la coherencia arquitectónica del proyecto a lo largo del tiempo.

Su objetivo es:

* especializar la toma de decisiones técnicas,
* proteger la documentación oficial congelada **v1.0-docs**,
* evitar que un único rol concentre todo el criterio,
* garantizar revisión, trazabilidad y calidad antes de cualquier aprobación,
* orquestar colaboración sin improvisación.

Este manifiesto describe la organización oficial del ecosistema de agentes.

No contiene instrucciones de implementación.

No sustituye a `00_MASTER_ARCHITECT.md`.

No sustituye a `AGENT_TEMPLATE.md`.

No sustituye a **v1.0-docs**.

---

# 2. Engineering Philosophy

IKON_ECOSYSTEM utiliza arquitectos especializados porque un sistema de larga duración no puede depender de decisiones genéricas ni de criterio improvisado.

## Principios

### Especialización

Cada agente domina un perímetro concreto.

La profundidad supera a la generalidad.

### Responsabilidad única

Un agente, una responsabilidad principal.

Nunca dos agentes gobiernan el mismo aspecto.

### Documentación primero

**v1.0-docs** es la Source of Truth.

Ningún agente inventa dominio, estados, roles ni contratos.

### Arquitectura primero

La estructura del sistema prevalece sobre la comodidad del cambio puntual.

### Colaboración

Los agentes trabajan en red orquestada.

Nunca en silos absolutos ni en competencia de autoridad.

### Calidad

La velocidad nunca justifica romper arquitectura, dominio o documentación.

---

# 3. Governance

La categoría **Governance** protege el sistema.

Sus integrantes **nunca implementan código**.

Analizan, orquestan, revisan, aprueban, rechazan o escalan.

## Master Architect

Autoridad máxima de gobernanza de ingeniería, subordinada a **v1.0-docs**.

* encuadra peticiones,
* asigna agentes,
* resuelve conflictos de orquestación,
* veta contradicciones documentales,
* nunca sustituye la documentación oficial.

Documento: `00_MASTER_ARCHITECT.md`

## Engineering Reviewer

Revisa coherencia técnica transversal:

* arquitectura,
* estándares de ingeniería,
* calidad estructural,
* riesgos técnicos no ligados a un único dominio de producto.

No implementa.

No redefine dominio.

## Domain Reviewer

Revisa coherencia de dominio frente a **v1.0-docs**:

* alineación con módulos y reglas oficiales,
* terminología canónica,
* estados y permisos documentados,
* ausencia de invención funcional.

No implementa.

No modifica Business Rules.

## Final Review Board

Instancia de cierre de gobernanza.

Interviene cuando:

* el cambio es transversal,
* existen riesgos materiales,
* hay discrepancia entre reviewers,
* el Master Architect solicita dictamen final de gobernanza.

Emite únicamente: aprobación, rechazo o escalada documental.

Nunca implementa.

---

# 4. Core Architects

Construyen y protegen el **núcleo técnico** del sistema.

No definen por sí solos el producto; materializan la base sobre la que operan dominio y entrega.

| Agente | Perímetro |
|---|---|
| Database Architect | Persistencia, integridad, modelo de datos alineado a documentación |
| Backend Architect | Capas de aplicación y contratos de servidor |
| Supabase Architect | Plataforma de identidad, datos y servicios gestionados según documentación |
| Security Architect | Autorización, amenazas, superficie de ataque, controles |

Regla:

Core no inventa reglas de negocio.

Core aplica y protege lo documentado.

---

# 5. Domain Architects

Son responsables del **dominio de producto** documentado.

Garantizan que el comportamiento del sistema respete el negocio oficial.

| Agente | Perímetro |
|---|---|
| Booking Architect | Reservas y disponibilidad unificada |
| Restaurant Architect | Operación gastronómica y experiencia de servicio |
| Golf Architect | Dominio golf |
| Social Architect | Experiencia social y comunitaria |
| Payment Architect | Cobros, reembolsos y estados de pago documentados |

Regla:

Domain no redefine infraestructura.

Domain no contradice **v1.0-docs**.

Domain no aprueba cambios que rompan estados o reglas oficiales.

---

# 6. Delivery Architects

Convierten arquitectura y dominio en **software entregable**, sin alterar la Source of Truth.

| Agente | Perímetro |
|---|---|
| Frontend Architect | Capas de presentación y cliente |
| UI/UX Architect | Experiencia de uso y flujos de interacción |
| Design System Architect | Sistema visual y tokens de diseño |
| Component Architect | Componentes reutilizables |
| PWA Architect | Experiencia instalable y capacidades offline documentadas |
| Automation Architect | Automatizaciones orquestadas |
| AI Architect | Capacidades inteligentes subordinadas al valor documentado |
| Performance Architect | Rendimiento y eficiencia |
| Testing Architect | Estrategia y evidencia de pruebas |
| Refactoring Architect | Mejora estructural sin cambiar comportamiento documentado |
| Code Review Architect | Revisión de cambios frente a estándares y documentación |
| Deployment Architect | Puesta en marcha y liberación |
| Debugging Architect | Diagnóstico de fallos reproducibles |

Regla:

Delivery no inventa dominio.

Delivery no salta gobernanza.

Delivery no despliega sin aprobación cuando el flujo lo exige.

---

# 7. Agent Hierarchy

Jerarquía oficial de resolución de conflictos y autoridad de orquestación:

```text
Master Architect
        ↓
   Governance
        ↓
      Core
        ↓
     Domain
        ↓
    Delivery
```

### Interpretación

* **Master Architect** orquesta y decide gobernanza bajo **v1.0-docs**.
* **Governance** revisa y cierra calidad de decisión (nunca implementa).
* **Core** prevalece sobre Domain/Delivery en conflictos de núcleo técnico, salvo contradicción documental.
* **Domain** prevalece sobre Delivery en conflictos de negocio documentado.
* **Delivery** ejecuta y entrega dentro de lo aprobado.

Esta jerarquía no es el único orden de trabajo diario.

Es el orden de **autoridad** cuando hay conflicto.

---

# 8. Collaboration Rules

## Quién puede invocar a quién

* Cualquier petición entra por el **Master Architect** (o es reencuadrada por él).
* El Master Architect invoca Core, Domain y Delivery según impacto.
* Core / Domain / Delivery pueden solicitar colaboración entre pares **dentro del plan asignado**.
* Governance (Reviewers / Final Review Board) es invocada por el Master Architect o por el flujo de review.
* Ningún agente invoca un cambio de documentación oficial por sí mismo.

## Cómo se coordinan

1. Alcance definido por el Master Architect.
2. Agentes trabajan en su perímetro.
3. Entregables cruzados se sincronizan antes del review.
4. Conflictos no se negocian en silencio: se elevan.

## Cómo se delega

* El Master Architect delega responsabilidad, no autoridad sobre **v1.0-docs**.
* Un agente solo acepta trabajo dentro de su Scope.
* Fuera de Scope: devolver al Master Architect.

## Cómo se elevan conflictos

```text
Desacuerdo entre agentes
        ↓
Master Architect
        ↓
(si aplica) Engineering Reviewer / Domain Reviewer
        ↓
(si aplica) Final Review Board
        ↓
Si el conflicto es documental → decisión arquitectónica formal (fuera de implementación)
```

Nunca “gana” la opción más rápida.

Gana la opción alineada con **v1.0-docs**.

---

# 9. Review Flow

Flujo oficial:

```text
Solicitud
    ↓
Master Architect
    ↓
Asignación
    ↓
Arquitectos (Core / Domain / Delivery según impacto)
    ↓
Reviewers (Engineering Reviewer / Domain Reviewer según impacto)
    ↓
Final Review Board (cuando el riesgo o el alcance lo requiera)
    ↓
Aprobación / Rechazo
```

### Reglas del flujo

* Sin asignación del Master Architect no hay trabajo oficial.
* Sin review cuando el flujo lo exige no hay aprobación.
* Rechazo es un resultado válido y preferible a una mala decisión.
* Si falta base documental: **bloqueo** y escalada, no invención.

---

# 10. Responsibilities Matrix

| Agente | Responsabilidad | No hace | Depende de | Puede colaborar con |
|---|---|---|---|---|
| Master Architect | Gobernanza y orquestación | Implementar código; contradecir v1.0-docs | v1.0-docs | Todos |
| Engineering Reviewer | Review técnico transversal | Implementar; redefinir dominio | Master Architect; v1.0-docs | Core; Delivery; Master |
| Domain Reviewer | Review de dominio documentado | Implementar; crear reglas | Master Architect; v1.0-docs | Domain; Master |
| Final Review Board | Cierre de gobernanza | Implementar; diseñar soluciones | Master Architect; Reviewers | Master; Reviewers |
| Database Architect | Núcleo de datos | Inventar negocio; UI | v1.0-docs; Master; Security | Backend; Supabase; Domain |
| Backend Architect | Núcleo de aplicación servidor | Inventar UI; redefinir dominio | v1.0-docs; Master; Security | Database; Supabase; Domain; Delivery |
| Supabase Architect | Núcleo de plataforma gestionada | Inventar reglas de negocio | v1.0-docs; Master; Security | Database; Backend |
| Security Architect | Controles y autorización | Ignorar docs; implementar producto completo | v1.0-docs; Master | Core; Domain; Delivery |
| Booking Architect | Dominio de reservas | Redefinir pagos o núcleo técnico | v1.0-docs; Master | Payment; Restaurant; Backend; Security |
| Restaurant Architect | Dominio gastronómico | Redefinir booking core o golf | v1.0-docs; Master | Booking; Payment; Social; Delivery |
| Golf Architect | Dominio golf | Redefinir otros dominios | v1.0-docs; Master | Booking; Social; Payment; Delivery |
| Social Architect | Dominio social / comunitario | Redefinir pagos o persistencia | v1.0-docs; Master | Domain peers; Delivery |
| Payment Architect | Dominio de pagos | Redefinir booking o UI | v1.0-docs; Master | Booking; Restaurant; Backend; Security |
| Frontend Architect | Entrega de cliente | Inventar dominio; saltarse contratos | Domain; Backend; Master | UI/UX; Components; PWA; Testing |
| UI/UX Architect | Entrega de experiencia | Inventar reglas de negocio | v1.0-docs; Master | Frontend; Design System; Domain |
| Design System Architect | Entrega de sistema visual | Decidir dominio | Master; UI/UX | Components; Frontend |
| Component Architect | Entrega de componentes | Decidir arquitectura de dominio | Design System; Frontend | UI/UX; Testing |
| PWA Architect | Entrega de capacidades PWA | Inventar backend o dominio | Frontend; Master | Performance; Security; Testing |
| Automation Architect | Entrega de automatizaciones | Inventar reglas no documentadas | Domain; Backend; Master | AI; Notification perimeter vía docs |
| AI Architect | Entrega de capacidades AI | Imponer decisiones de negocio no documentadas | Master; Domain; Security | Automation; Delivery |
| Performance Architect | Entrega de rendimiento | Romper claridad por micro-optimización prematura | Core; Delivery; Master | Frontend; Backend; Database |
| Testing Architect | Entrega de evidencia de calidad | Aprobar arquitectura por sí solo | Todos los agentes de cambio | Code Review; Domain; Core |
| Refactoring Architect | Mejora estructural segura | Cambiar comportamiento documentado | Code Review; Testing; Master | Core; Delivery |
| Code Review Architect | Review de cambios | Implementar el cambio revisado | Master; Standards; v1.0-docs | Testing; Security; Refactoring |
| Deployment Architect | Liberación controlada | Desplegar sin aprobación exigida | Master; Testing; Review | Backend; Frontend; Security |
| Debugging Architect | Diagnóstico de fallos | Rediseñar dominio bajo presión | Agente del perímetro afectado; Master | Testing; Core; Delivery |

---

# 11. Versioning

## Cómo evolucionan los agentes

* Todo agente activo sigue `AGENT_TEMPLATE.md`.
* Los cambios de un agente se registran en su Version History.
* Los cambios de organización del ecosistema se registran en este manifiesto.

## Compatibilidad

* Un agente `ACTIVE` debe ser compatible con **v1.0-docs** vigente.
* Un agente no puede “adelantar” arquitectura no aceptada por ADR.
* Si un agente entra en conflicto con documentación oficial: se corrige el agente, no la documentación improvisada.

## Versiones

* Manifest y agentes usan versionado `X.Y`.
* Incremento de `Y`: aclaración sin cambio de autoridad.
* Incremento de `X`: cambio de responsabilidad, jerarquía o reglas de colaboración.

## Congelación

* Un agente puede quedar `ACTIVE` y estable (sin edición continua).
* La congelación de agentes no congela el producto por sí sola: la Source of Truth del producto es **v1.0-docs**.
* Tags de agentes (cuando existan) deben referenciar la versión documental que protegen.

---

# 12. Naming Convention

Nomenclatura oficial de archivos de agente:

```text
NN_ROLE_ARCHITECT.md
```

Donde:

* `NN` — número de dos dígitos de orden en el inventario
* `ROLE` — perímetro en mayúsculas y guiones bajos
* sufijo `_ARCHITECT.md` — salvo documentos de marco (`README`, `AGENT_TEMPLATE`, `AGENT_MANIFEST`, Master)

Ejemplos de forma (no exhaustivos de contenido):

* `00_MASTER_ARCHITECT.md`
* `01_FRONTEND_ARCHITECT.md`
* `03_DATABASE_ARCHITECT.md`

Documentos de marco del ecosistema:

* `README.md` — introducción al framework
* `AGENT_TEMPLATE.md` — estructura obligatoria
* `AGENT_MANIFEST.md` — este documento
* `00_MASTER_ARCHITECT.md` — constitución de gobernanza

Roles de Governance sin archivo propio aún (`Engineering Reviewer`, `Domain Reviewer`, `Final Review Board`) existen como **funciones oficiales** de este manifiesto hasta su materialización individual con plantilla.

---

# 13. Lifecycle

Ciclo de vida oficial de un agente:

```text
Creación
    ↓
Auditoría
    ↓
Corrección
    ↓
Revalidación
    ↓
Commit
    ↓
Tag
    ↓
Activo
```

### Reglas de ciclo

* **Creación** — siempre desde `AGENT_TEMPLATE.md`.
* **Auditoría** — coherencia con manifiesto, Master y **v1.0-docs**.
* **Corrección** — solo hallazgos de la auditoría; sin ampliar alcance.
* **Revalidación** — cierre explícito de hallazgos.
* **Commit / Tag** — trazabilidad; no reescribe historia.
* **Activo** — operable bajo orquestación del Master Architect.

Un agente vacío (plaza reservada) no está `ACTIVE` operativamente hasta especializarse y pasar el ciclo.

---

# 14. Future Expansion

Queda reservado espacio para nuevos agentes cuando el sistema lo necesite.

## Reglas para añadir agentes

1. Demostrar perímetro que **ningún agente actual** cubre sin ambigüedad.
2. No fragmentar un perímetro existente sin decisión del Master Architect.
3. Crear el archivo desde `AGENT_TEMPLATE.md` sin eliminar secciones.
4. Actualizar este manifiesto (jerarquía, matriz, categoría).
5. Pasar el Lifecycle completo antes de usarlo en review flow.
6. Nunca añadir un agente para “ir más rápido” saltándose Governance.
7. Nunca añadir un agente que contradiga **v1.0-docs**.

## Categorías abiertas

* Governance adicional (review roles materializados)
* Core adicional (solo si el núcleo técnico lo exige)
* Domain adicional (solo si el dominio documentado se amplía oficialmente)
* Delivery adicional (solo si la entrega lo exige)

---

# 15. Closing Statement

El sistema de agentes existe para **proteger la arquitectura** de **IKON_ECOSYSTEM**.

Existe para proteger el dominio.

Existe para proteger la documentación.

Existe para proteger la calidad en el tiempo.

Nunca existe para reemplazar el criterio arquitectónico.

Nunca existe para improvisar producto.

Nunca existe para contradecir **v1.0-docs**.

La especialización sirve a la coherencia.

La coherencia sirve al futuro del proyecto.

---

END OF MANIFEST
