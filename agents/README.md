# IKON_ECOSYSTEM — Engineering Agents Framework

## Qué son los agentes

Los agentes de ingeniería son **roles documentados** que guían implementación, revisión y evolución técnica de **IKON_ECOSYSTEM**.

No sustituyen la documentación de producto.

La documentación congelada **v1.0-docs** es la fuente de verdad.

Los agentes existen para que toda implementación futura sea coherente con esa verdad.

---

## Objetivo

Garantizar que el código, la infraestructura y las decisiones técnicas:

* respeten **v1.0-docs**,
* preserven la arquitectura aceptada (incl. `docs/project/DECISIONS.md`),
* no inventen dominio, estados, roles ni módulos fuera de lo documentado,
* mantengan la filosofía experience/community-first del producto.

---

## Filosofía del proyecto

* El único nombre oficial del proyecto es **IKON_ECOSYSTEM**.
* IKON no es “una app de reservas”: Booking es un motor al servicio de la experiencia.
* Documentación **v1.0-docs** congelada: no reinterpretar ni contradecir.
* Single-tenant v1 (DEC-001).
* Terminología canónica (DEC-002 / DEC-004).
* Estados canónicos: `docs/rules/state-machines.md`.
* Reglas de negocio: `docs/rules/business-rules.md`.

---

## Referencia a v1.0-docs

Ámbito documental oficial (congelado):

* `docs/00` … `docs/53`
* `docs/diagrams/`
* `docs/rules/`
* `docs/project/DECISIONS.md`

Cualquier agente que detecte conflicto entre una petición de implementación y **v1.0-docs** debe **detenerse y escalar** al Master Architect.

---

## Jerarquía

```text
00  MASTER ARCHITECT          ← autoridad máxima de ingeniería
 │
 ├── Capas técnicas
 │     01 Frontend · 02 Backend · 03 Database
 │     04 UI/UX · 05 Design System · 06 Components
 │     07 PWA · 08 Supabase · 09 Automation · 10 AI
 │
 ├── Calidad y operación
 │     11 Security · 12 Performance · 13 Testing
 │     14 Refactoring · 15 Code Review
 │     16 Deployment · 17 Debugging
 │
 └── Dominio de producto
       18 Booking · 19 Golf · 20 Restaurant
       21 Social · 22 Payment
```

Los agentes de dominio (**18–22**) no anulan a los de capa técnica (**01–17**).

Ambos quedan bajo el **Master Architect**.

---

## Orden de autoridad

1. **v1.0-docs** (documentación congelada)
2. **`00_MASTER_ARCHITECT.md`**
3. Agentes de capa técnica relevantes al cambio
4. Agentes de dominio relevantes al cambio
5. Preferencias ad hoc de una tarea puntual

Ante conflicto: gana el nivel superior. Nunca se “arregla” en silencio contradiciendo la documentación.

---

## Orden de invocación (recomendado)

1. **Master Architect** — encuadre, alcance, riesgos, agentes necesarios.
2. Agente(s) de **dominio** si el cambio toca Booking / Golf / Restaurant / Social / Payment.
3. Agente(s) de **capa** (Frontend, Backend, Database, UI, PWA, etc.).
4. **Security** y **Performance** cuando el cambio lo requiera.
5. **Testing** antes de dar por cerrado.
6. **Code Review** (y **Refactoring** solo si aporta claridad sin cambiar comportamiento documentado).
7. **Deployment** cuando proceda publicar.
8. **Debugging** solo ante fallos reproducibles.

No es obligatorio invocar a todos los agentes en cada tarea.

El Master decide el subconjunto mínimo.

---

## Responsabilidades generales

Cada agente (cuando esté rellenado) deberá:

* declarar su alcance y sus límites,
* citar documentos **v1.0-docs** aplicables,
* prohibir inventar entidades, estados o APIs no documentadas,
* colaborar con otros agentes sin usurpar su autoridad,
* escalar al Master ante ambigüedad o contradicción.

Hasta que un archivo de agente esté rellenado, **no** se considera operativo: solo existe como plaza reservada en el framework.

---

## Colaboración entre agentes

* Un agente propone dentro de su perímetro; no reescribe el de otro.
* Cambios cross-cutting (auth, datos, pagos, PWA) requieren acuerdo explícito entre agentes afectados + Master.
* Los agentes de dominio aportan reglas de negocio; los de capa aportan cómo implementarlas sin alterar el contrato documental.
* Code Review valida coherencia con **v1.0-docs** y con las decisiones del Master, no preferencias personales.

---

## Flujo de trabajo

```text
Petición de implementación
        │
        ▼
 Master Architect (alcance + agentes)
        │
        ▼
 Dominio (si aplica) ──► Capa técnica
        │
        ▼
 Security / Performance (si aplica)
        │
        ▼
 Testing ──► Code Review
        │
        ▼
 Deployment (si aplica)
        │
        ▼
 Entrega coherente con v1.0-docs
```

Si en cualquier paso aparece contradicción con la documentación congelada:

```text
STOP → Master Architect → no implementar hasta resolución documental explícita
```

(La resolución documental queda fuera de este framework mientras **v1.0-docs** permanezca congelada.)

---

## Inventario de agentes

| Archivo | Estado |
|---|---|
| `00_MASTER_ARCHITECT.md` | Definido |
| `01_FRONTEND_ARCHITECT.md` … `22_PAYMENT_ARCHITECT.md` | Plaza vacía (pendiente de definición individual) |

---

## Regla final

Los agentes no crean producto.

Los agentes **protegen** la coherencia de **IKON_ECOSYSTEM** respecto a **v1.0-docs**.
