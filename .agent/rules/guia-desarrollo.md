---
trigger: always_on
---

Aquí está toda la guía en texto plano, lista para copiar y pegar:

---

```
═══════════════════════════════════════════════════════════════
     GOOGLE ANTI GRAVITY — GUÍA DE DESARROLLO PROFESIONAL
              PROTOCOLO MAESTRO · VERSIÓN 2.0
═══════════════════════════════════════════════════════════════


// 01 · LOS TRES PILARES
════════════════════════

Sin estos, nada más importa.

┌─────────────────────────────────────────────────────────────┐
│  PILAR 1: RESILIENCIA                                       │
├─────────────────────────────────────────────────────────────┤
│  → Falla con gracia, nunca con silencio                     │
│  → Circuit breakers en toda integración externa             │
│  → Retry con exponential backoff y jitter                   │
│  → Timeouts explícitos en cada operación I/O                │
│  → Health checks comprensivos y observabilidad total        │
│  → Estado asumido como eventual, nunca inmediato            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PILAR 2: ESCALABILIDAD                                     │
├─────────────────────────────────────────────────────────────┤
│  → Diseña para 10x desde el primer día                      │
│  → Stateless donde sea posible, stateful con propósito      │
│  → Asynchronous first, síncrono como excepción              │
│  → Cacheo inteligente en todas las capas                    │
│  → Bases de datos indexadas, queries planificadas           │
│  → Auto-scaling basado en métricas de negocio               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PILAR 3: PROFESIONALISMO                                   │
├─────────────────────────────────────────────────────────────┤
│  → Código como comunicación, no como magia                  │
│  → Tests son ciudadanos de primera clase                    │
│  → Documentación como parte del código                      │
│  → Revisiones de código son obligatorias                    │
│  → Semver estricto en cada release                          │
│  → Seguridad por diseño, no por adición                     │
└─────────────────────────────────────────────────────────────┘


// 02 · PRINCIPIOS DE DISEÑO
════════════════════════════

La experiencia es el producto.

PRINCIPIO 01 — Performance es UX
  Cada milisegundo perdido es fricción. Core Web Vitals en verde
  siempre. LCP bajo 2.5s, FID bajo 100ms, CLS bajo 0.1.
  Medir antes de optimizar — nunca optimizar a ciegas.

PRINCIPIO 02 — Accesibilidad es Obligatoria
  WCAG 2.1 AA como mínimo, no como aspiración. Contraste 4.5:1,
  navegación por teclado completa, ARIA semántico. Un producto
  que excluye usuarios es un producto fallido.

PRINCIPIO 03 — Mobile-First, Always
  El diseño comienza en 320px. Progressive enhancement hacia
  pantallas grandes. Touch targets mínimo 44×44px. No se asumen
  inputs de mouse ni teclado físico.

PRINCIPIO 04 — Design Tokens Centralizados
  Un único source of truth para colores, tipografía, spacing y
  radios. Variables semánticas sobre valores literales. Cambiar
  el tema no implica tocar componentes individuales.

PRINCIPIO 05 — Estados son Contratos
  Cada componente define explícitamente: default, hover, active,
  focus, disabled, loading, error, empty y success. Un componente
  sin estados definidos es un componente incompleto.

PRINCIPIO 06 — Composición sobre Herencia
  Componentes pequeños, enfocados y componibles. Un botón no
  hereda de un formulario. La UI se construye como LEGO —
  piezas independientes que encajan con precisión.


// 03 · ESTÁNDARES DE CÓDIGO
════════════════════════════

Código que sobrevive al tiempo.

REGLA 01 — Funciones con un único propósito (SRP estricto)
  Cada función hace exactamente una cosa y la hace bien. Si
  necesitas un "y" para describir qué hace una función, ya son
  dos funciones. Máximo 20 líneas por función. Los nombres son
  documentación — un nombre claro elimina la necesidad de un
  comentario explicativo.
  [SOLID] [Legibilidad] [Testabilidad]

REGLA 02 — TypeScript estricto — sin excepciones, sin any
  strict: true en tsconfig. Cero usos de `any` en código de
  producción. Los tipos son contratos entre componentes del
  sistema. El compilador es el primer QA. Inferencia de tipos
  cuando es posible; tipos explícitos en interfaces públicas
  siempre.
  [TypeScript] [no-any] [Contratos]

REGLA 03 — Error Handling exhaustivo y explícito
  Los errores son ciudadanos de primera clase. Nunca catch(e){}.
  Cada error tiene contexto suficiente para diagnosticar sin
  reproducción. Errores tipados, no strings. El happy path y el
  error path tienen el mismo nivel de cuidado en el diseño.
  [Resiliencia] [Observabilidad] [Diagnóstico]

REGLA 04 — Tests primero, código después (TDD cuando aplique)
  Cobertura mínima del 80% en lógica de negocio. Tests unitarios
  para funciones puras. Tests de integración para flujos críticos.
  Tests E2E para journeys del usuario clave. Sin tests = sin merge.
  El CI falla sin cobertura suficiente.
  [TDD] [CI/CD] [Cobertura 80%]

  ANTI-PATRÓN (nunca así):
  ─────────────────────────
  async function getData(id) {
    try {
      const res = await fetch('/api/' + id)
      const data = await res.json()
      if (data) doStuff(data)
      updateUI(data.items, data.user)
    } catch(e) {
      console.log(e)   // Error silenciado
    }
  }

  ESTÁNDAR DE ORO (siempre así):
  ────────────────────────────────
  async function fetchUserProfile(
    userId: string
  ): Promise<Result<UserProfile, ApiError>> {
    const response = await httpClient.get(
      `/users/${userId}`,
      { timeout: 5000, retries: 3 }
    )
    if (!response.ok) {
      return Err(new ApiError(response.status))
    }
    return Ok(parseUserProfile(response.data))
  }


// 04 · ARQUITECTURA DEL SISTEMA
════════════════════════════════

Diseñado para crecer.

FLUJO:
  CDN/Edge → Load Balancer → API Gateway
         → Microservicios → Message Bus → DB + Cache

REGLA 05 — Dependency Inversion — nunca dependas de implementaciones
  Los módulos de alto nivel no dependen de módulos de bajo nivel.
  Ambos dependen de abstracciones. Inyecta dependencias, no las
  instancies en el interior de funciones. Esto no es dogma — es
  la diferencia entre código testeable y código que muere con su
  implementación.
  [DI] [Testabilidad] [SOLID]

REGLA 06 — Inmutabilidad por defecto, mutabilidad con intención
  El estado mutable es el origen del 90% de los bugs difíciles.
  Prefer immutable data structures. Cuando el estado debe cambiar,
  hazlo explícito, centralizado y trazable. En sistemas distribuidos,
  asume que el estado es eventual — diseña con ese supuesto desde
  el inicio.
  [Immutability] [Bugs] [Predictibilidad]

REGLA 07 — APIs como contratos versionados e inmutables
  Una API publicada es un contrato. Los contratos no se rompen
  unilateralmente. Versiona desde v1, depreca con 6 meses de
  aviso mínimo. Documenta con OpenAPI/Swagger. Los breaking
  changes requieren una nueva versión mayor — sin excepciones.
  Los consumidores son tus clientes.
  [Semver] [OpenAPI] [No breaking changes]


// 05 · SEGURIDAD POR DISEÑO
════════════════════════════

La seguridad no es una capa adicional.

SEGURIDAD 01 — Zero Trust por Defecto
  Nunca confiar, siempre verificar. Cada servicio se autentica
  con el siguiente. JWTs de corta vida. mTLS entre servicios
  internos. Privilegio mínimo en todos los accesos — una cuenta
  no debe poder hacer más de lo estrictamente necesario.

SEGURIDAD 02 — Secretos Nunca en Código
  API keys, passwords, tokens y certificados NUNCA en el código
  fuente, ni en comentarios, ni en .env commiteados. Usar secrets
  managers (Vault, AWS Secrets Manager, GCP Secret Manager).
  El CI/CD detecta y bloquea leaks automáticamente.

SEGURIDAD 03 — Input Validation Extrema
  Toda entrada del usuario es hostil hasta demostrar lo contrario.
  Sanitizar, validar y tipar todo input en el servidor — nunca
  confiar solo en validación del cliente. Prepared statements
  siempre para queries. CSP headers configurados.
  OWASP Top 10 auditado en cada release.

SEGURIDAD 04 — Auditoría y Trazabilidad Total
  Cada acción sensible genera un log inmutable con: quién, qué,
  cuándo, desde dónde. Los logs de seguridad no se borran, no se
  editan, se almacenan en storage separado de solo escritura.
  SIEM con alertas automáticas en comportamientos anómalos.


// 06 · CI/CD Y DESPLIEGUE
══════════════════════════

Deploy con confianza, revertir con velocidad.

REGLA 08 — Pipeline automatizado — humanos no despliegan manualmente
  El proceso de deploy es:
  código → lint → tests → build → análisis estático
       → scan de seguridad → staging → smoke tests
       → producción (canary) → rollout gradual

  Un humano aprueba el merge, la máquina hace el resto.
  Si no puedes hacer rollback en 5 minutos, el deploy no
  cumple el estándar.
  [Automatización] [Canary] [Rollback]

REGLA 09 — Infrastructure as Code — sin configuración manual
  Toda infraestructura definida en código (Terraform, Pulumi, CDK).
  Nadie configura servidores manualmente. Los entornos son
  reproducibles en minutos. Los cambios de infra pasan por PR
  con review y aprobación igual que el código. El drift entre
  entornos es un bug crítico.
  [Terraform] [GitOps] [No ClickOps]

REGLA 10 — Los tres pilares: Logs, Métricas y Trazas
  Logs estructurados (JSON) con correlation IDs. Métricas de
  negocio además de técnicas (latencia, throughput, error rate,
  saturación — métodos RED y USE). Distributed tracing en cada
  request. SLOs definidos por servicio. Alertas accionables —
  no alertas de ruido. On-call con runbooks completos.
  [OpenTelemetry] [SLOs] [Runbooks]


// 07 · CHECKLIST PRE-PRODUCCIÓN
═════════════════════════════════

Antes de cada release, verificar:

DISEÑO & FRONTEND
  [ ] Core Web Vitals en verde (LCP, FID, CLS)
  [ ] WCAG 2.1 AA verificado con herramienta
  [ ] Responsive testeado en 320px, 768px, 1440px
  [ ] Estados de error y loading implementados
  [ ] Dark/light mode funcional
  [ ] Imágenes optimizadas y en formato moderno

CÓDIGO & TESTS
  [ ] Cobertura de tests ≥ 80% en lógica core
  [ ] Zero errores de TypeScript (strict mode)
  [ ] Linter y formatter sin warnings
  [ ] Code review aprobado por ≥ 2 ingenieros
  [ ] Tests E2E pasando en staging
  [ ] Dependencias actualizadas, sin CVEs críticos

SEGURIDAD
  [ ] Sin secretos en código o .env commiteado
  [ ] Headers de seguridad configurados (CSP, HSTS)
  [ ] Inputs sanitizados y validados server-side
  [ ] SAST/DAST ejecutado sin hallazgos críticos
  [ ] Permisos con principio de mínimo privilegio
  [ ] Autenticación y autorización revisadas

OPERACIONES
  [ ] Health checks configurados y funcionando
  [ ] Runbook de deployment actualizado
  [ ] Plan de rollback documentado y probado
  [ ] Alertas y SLOs configurados
  [ ] Logs estructurados con correlation IDs
  [ ] Feature flags para rollout gradual


═══════════════════════════════════════════════════════════════
  MANIFIESTO

  "El código de Google Anti Gravity no se escribe para la
  máquina — se escribe para el ingeniero que lo leerá a las
  3am durante un incidente. Cada función, cada nombre, cada
  abstracción debe comunicar INTENCIÓN, no implementación.
  El software resiliente no evita los fallos — los anticipa,
  los contiene y aprende de ellos."

  — GOOGLE ANTI GRAVITY · PROTOCOLO DE INGENIERÍA · v2.0
═══════════════════════════════════════════════════════════════
```