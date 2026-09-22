> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**

> Vamos a realizar un sistema para gestionar un gimnasio vamos a empezar
> primero definiendo las US y luego vamos a refinarlas. Primero quiero que
> leas estos 2 archivos readme.md y prompts.md ... Luego quiero que leas este
> readme README_AI.md en base a esta especificacion vamos a armar nuestro
> proyecto. Las tecnologias que quiero trabajar son backend en node y
> frontend en react, base de datos en postgres. Cualquier duda o pregunta
> por favor formular antes de arrancar.

**Prompt 2:**

> La idea seria crear un mvp web donde por ahora un solo usuario tendria
> acceso para crear rutinas de gimnasio por cliente, gestionar pagos, cargar
> ficha medica de los clientes. La idea es automatizar ciertos procesos como
> el cargar rutinas para los clientes. Despues me gustaria saber si me
> sugeris que mas podemos meter en este mvp?

**Prompt 3:**

> lo unico que podriamos ir pensando es que esta todo en ingles, podria quedar
> para español/ingles se puede? (derivó en US-010: UI bilingüe con
> `react-i18next`, idioma por defecto según navegador con fallback a español,
> selector es/en, manteniendo el código y las claves en inglés).

**Prompt 4:**

> en que momento vamos a meter estilos css (...) si quiero volver atrás en la
> pantalla de clientes no puedo no tengo un botón de atrás (derivó en US-011:
> tema de marca MUI —verde hoja/negro/blanco con el logo del gimnasio—, app
> shell con `AppBar` persistente, navegación "atrás" consistente y cabecera de
> marca en las pantallas públicas; change OpenSpec `add-app-shell`).

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

> (Setup de entorno) Instalación de Node 20.19.0 vía nvm y del CLI de
> OpenSpec, `openspec init` apuntando `config.yaml` a `docs/` y `ai-specs/`,
> y `docker-compose.yml` para levantar PostgreSQL local.

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

> (Flujo `opsx-apply` para US-001) Implementación guiada por TDD con pasos
> obligatorios de verificación: tests unitarios con 90%+ de cobertura,
> pruebas manuales de endpoints con curl ejecutadas por el agente, y E2E con
> Playwright, cada uno con su reporte en la carpeta del change.

**Prompt 2:**

> Pero lo de reset password no está devolviendo ningún link, ¿podés
> chequear? (diagnóstico: la feature funcionaba; el link se loguea en la
> consola del backend por no haber proveedor de email aún; además se corrigió
> un mensaje de éxito que se mostraba aunque la petición fallara).

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**

> Repasemos una por una antes de realizar el enrich (revisión interactiva de
> las 9 historias del MVP una por una, definiendo campos, alcance y qué queda
> para Fase 2 antes de enriquecerlas con la skill `enrich-us`).

**Prompt 2:**

> ¿Pero estamos respetando lo que dice el README_AI.md sobre cómo correr el
> comando /enrich-us? ... ¿deberíamos haber instalado antes OpenSpec y seguir
> los pasos como indica el README? (derivó en customizar `docs/` para el
> dominio del gimnasio e inicializar OpenSpec antes de seguir enriqueciendo).

**Prompt 3:**

> Ok arranquemos / aplica el change (creación del change OpenSpec
> `add-admin-authentication` para US-001 con proposal, spec, diseño y tareas,
> y posterior implementación de las 49 tareas).

---

### 6. Tickets de Trabajo

**Prompt 1:**

> Sigamos con la US-002 (creación del change OpenSpec `add-client-management`
> e implementación completa de la gestión de clientes: modelo `Client` con
> DNI único y baja lógica, endpoints CRUD protegidos, y UI con listado
> filtrable, formulario y diálogo de baja).

**Prompt 2:**

> Avancemos con la US-003 (ficha médica): change OpenSpec `add-medical-record`,
> modelo `MedicalRecord` 1:1 opcional con `Client` (upsert, sin historial),
> endpoints anidados `GET`/`PUT /api/clients/:clientId/medical-record`
> protegidos, y pantalla propia de ficha médica accesible desde el listado
> (decisiones del usuario: pantalla aparte y límite de 1000 caracteres por
> campo).

**Prompt 3:**

> Vamos con la US-004 (catálogo de ejercicios): change OpenSpec
> `add-exercise-catalog`, modelo `Exercise` + enum `ExerciseCategory`
> (mobility/activation/main), endpoints `/api/exercises` (list con
> search+category, get, create, update) protegidos y **sin delete**, seed
> idempotente de un set base, y UI con catálogo filtrable (`DataGrid`) y
> formulario de alta/edición.

**Prompt 4:**

> Ajustes de pulido sobre US-004 (change OpenSpec `refine-exercise-catalog`):
> sembrar el catálogo base en español (nombres, grupos musculares,
> equipamiento) e impedir cargar series/repeticiones negativas en el
> formulario (min 0 + validación con mensaje claro, alineado con el rechazo
> del backend).

**Prompt 5:**

> Vamos con la US-005 (plantillas de rutina): change OpenSpec
> `add-routine-templates`, modelos anidados `RoutineTemplate` →
> `RoutineSession` → `RoutineExerciseEntry` (+ enums), 5 endpoints
> `/api/routine-templates` protegidos (list/get/create/update-reemplazo/
> duplicate deep-clone), y un builder de rutinas con selector de ejercicios
> del catálogo. Contenido de cara al usuario en español.

**Prompt 6:**

> Sigamos con la US-006 (asignar rutina a un cliente): change OpenSpec
> `assign-client-routine`. Asignar clona la plantilla en una rutina del cliente
> (cierra la anterior, una sola activa), con endpoints anidados
> `/api/clients/:clientId/routine` (+ `/routines/history`), vencimiento
> computado de fecha+duración, pantalla propia de rutina del cliente, e
> indicador en el listado de clientes de quién tiene rutina asignada
> (`hasActiveRoutine`). Contenido en español.

**Prompt 7:**

> Vamos con la US-007 (registro de pagos): change OpenSpec
> `add-payment-registration`. Modelo `Payment` + enum `PaymentMethod`
> (cash/bank_transfer/card), CRUD (registrar/editar/borrar) + listado, estado
> derivado (al día/vencido/sin pagos) computado del período más reciente vs.
> hoy (recalculado tras cada cambio), pantalla de pagos del cliente con diálogo
> de registro/edición, e indicador de estado de pago en el listado de clientes
> (`paymentStatus`). Contenido en español.

**Prompt 8:**

> Sigamos con la US-008 (historial de pagos + exportación a PDF): change
> OpenSpec `add-payment-history-export`. Reutiliza el `Payment` de US-007 (sin
> cambios de modelo); agrega un endpoint
> `GET /api/clients/:clientId/payments/export` que genera con `pdfkit` un PDF
> descargable del historial (nombre del cliente, estado derivado, pagos más
> recientes primero), botón "Exportar PDF" en la pantalla de pagos, PDF
> bilingüe (query `lang`, español por defecto), y casos cliente-sin-pagos /
> 404 / 401. Contenido en español.

**Prompt 9:**

> Cerremos el MVP con la US-009 (panel con alertas): change OpenSpec
> `add-dashboard-alerts`. Agregación de solo lectura (sin nueva entidad) sobre
> clientes/pagos/rutinas expuesta en `GET /api/dashboard`, con cuatro grupos:
> pagos vencidos, pagos por vencer (umbral `DASHBOARD_DUE_SOON_DAYS`, default 5),
> clientes sin pagos, y rutinas por vencer/vencidas. Reutiliza
> `computePaymentStatus` y `RoutineTemplate.endDate/isExpired`; reemplaza el
> panel placeholder por un `DashboardPage` (conserva el encabezado "Panel") con
> los cuatro grupos, conteos y enlaces a la pantalla de pagos/rutina de cada
> cliente. Contenido en español.

**Prompt 10:**

> Preparemos infra y despliegue (artefacto del curso): change OpenSpec
> `add-deployment-infra` (solo configuración commiteada, sin desplegar nada ni
> pagar suscripciones). Despliegue **single-origin**: el backend sirve el build
> del frontend (flag `SERVE_FRONTEND`, `trust proxy`, `GET /api/health`) para
> conservar la cookie `sameSite=strict`. Agregá `Dockerfile` multi-stage +
> `docker-compose.prod.yml`, URL pública gratis con **Cloudflare Tunnel**,
> `render.yaml` como opción cloud free tier, CI con **GitHub Actions**
> (tests backend/frontend + build de la imagen), y documentá todo (readme
> §2.4/2.5/2.6 + `docs/deployment.md`) sin secretos en el repo. Contenido en
> español.

**Prompt 11:**

> Arranquemos la Fase 2 con la US-012 (refresh de UI/UX): change OpenSpec
> `refresh-ui-design`, **solo frontend en MUI** (sin migrar a Tailwind/shadcn),
> con `skip_specs`. Tema refinado con **Inter** auto-alojada + tokens + overrides
> de MUI; **barra lateral** de navegación (Panel/Clientes/Ejercicios/Rutinas) que
> colapsa en mobile; **dashboard con tarjetas** (icono + conteo + color);
> primitivas reutilizables `PageHeader`, `SnackbarProvider`/`useSnackbar` y
> `LoadingSkeleton`; adopción por página preservando los roles/nombres que usan
> los tests. Sin dark mode/gráficos/cambios funcionales. Mantener unit y E2E en
> verde. Contenido en español.

**Prompt 12:**

> Sigamos con la US-013 (campanita de notificaciones): change OpenSpec
> `add-notification-bell`, **frontend-only** con `skip_specs`, reutilizando
> `GET /api/dashboard` (sin cambio de backend). Hook `useDashboardAlerts` (fetch
> en montaje + cambio de ruta), componente `NotificationBell` (Badge sobre un
> IconButton de campana + Menú con las alertas agrupadas enlazando a
> pagos/rutina + estado vacío), integrado en la barra superior del `AppLayout`.
> Tests unitarios del hook y del componente; E2E que verifique el badge. Mantener
> todo en verde. Contenido en español.

**Prompt 13:**

> Sigamos con la US-014 (filtrar clientes por estado de pago): change OpenSpec
> `filter-clients-by-payment`, **frontend-only** con `skip_specs`, sin cambio de
> backend (el listado ya devuelve `paymentStatus`, US-007). En
> `ClientsListPage` agregar un `Select` "Estado de pago" (Todos / Al día /
> Vencido / Sin pagos) que filtra las filas **del lado del cliente** y combina
> con la búsqueda por nombre y el filtro activo/inactivo; claves i18n. Test
> unitario que verifique que el filtro acota las filas sin re-consultar; extender
> el E2E de clientes. Mantener unit y E2E en verde. Contenido en español.

**Prompt 14:**

> Mejoremos la columna de acciones del listado de clientes (US-028): change
> OpenSpec `compact-client-action-icons`, **frontend-only** con `skip_specs`, sin
> cambio de backend. Reemplazar los 5 botones de texto (Editar, Ficha médica,
> Rutina, Pagos, Desactivar/Reactivar) por `IconButton` + `Tooltip` con iconos de
> MUI, achicando la columna de ~560px a ~220px. Preservar el `aria-label` con los
> mismos textos para no romper los tests unitarios ni el E2E. Test unitario que
> verifique que las acciones son botones de solo icono con nombre accesible y que
> Reactivar aparece para clientes inactivos. Mantener todo en verde. Contenido en
> español.

**Prompt 15:**

> Apliquemos el patrón de acciones-icono (US-028) a todas las tablas del sistema
> (US-029): change OpenSpec `unify-table-action-icons`, **frontend-only** con
> `skip_specs`, sin cambio de backend. Convertir a `IconButton` + `Tooltip` las
> acciones del catálogo de ejercicios (Editar) y de las plantillas de rutinas
> (Editar/Duplicar), y envolver en `Tooltip` los iconos editar/eliminar ya
> existentes de la tabla de pagos. Preservar el `aria-label` con los mismos
> textos para no romper tests ni E2E (incluido el test de "Duplicar"). Tests
> unitarios de las acciones-icono de ejercicios y rutinas. Mantener todo en
> verde. Contenido en español.

**Prompt 16:**

> Mejoremos el ingreso de período de pago (US-015): change OpenSpec
> `smarter-payment-period`, **frontend-only** con `skip_specs`, sin cambio de
> backend. En "Registrar pago" pre-completar el **período** con el próximo mes
> adeudado (último período cubierto + 1, o mes actual si no hay pagos / está al
> día) y la **fecha** con hoy; el campo sigue editable. Agregar una **advertencia
> no bloqueante** si el período es claramente incoherente con la fecha. Nueva
> helper `utils/paymentPeriod.ts` (`nextOwedPeriod`, `isIncoherentPeriod`) con
> tests; extender los tests del `PaymentFormDialog`. La lógica de estado derivado
> (US-007) no cambia. Mantener todo en verde. Contenido en español.

**Prompt 17:**

> Agreguemos un resumen del historial de pagos (US-016): change OpenSpec
> `payment-history-summary`, **frontend-only** con `skip_specs`, sin cambio de
> backend. Sobre el historial del cliente mostrar un **panel resumen** (total
> pagado, cantidad de pagos, rango de períodos cubiertos y estado derivado)
> calculado **client-side** desde los pagos ya cargados. Nueva helper
> `utils/paymentSummary.ts` (`summarizePayments`, `formatPeriod`) con tests;
> extender el test de `ClientPaymentsPage` (panel visible con pagos, oculto en
> vacío). Sin cambio de la regla de estado (US-007) ni del PDF. Mantener unit y
> E2E en verde. Contenido en español.

**Prompt 18:**

> Exportemos rutinas a PDF y Excel (US-017): change OpenSpec `export-routines`
> **con spec delta** (agrega endpoints de backend). Dos endpoints autenticados
> `GET /api/routine-templates/:id/export.pdf` y `.xlsx` que sirven tanto
> plantillas de biblioteca como rutinas de cliente. Backend: builder
> `infrastructure/pdf/routinePdf.ts` (reusar el patrón `pdfkit` de US-008) y
> `infrastructure/xlsx/routineXlsx.ts` con **`exceljs`** (una hoja por sesión),
> `getExportData` + acciones de controlador + rutas, labels bilingües, smoke
> tests. Frontend: `routineTemplateService.exportPdf/exportExcel` (descarga
> blob), botones-icono de export en la lista de rutinas y en la rutina activa del
> cliente, claves i18n. Prueba con curl (headers, firmas `%PDF-`/`PK`, 404, 401)
> y E2E de descarga. Actualizar `api-spec.yml` y `backend-standards.md`. Mantener
> todo en verde. Contenido en español.

**Prompt 19:**

> Agreguemos progresión semanal a las rutinas (US-018): change OpenSpec
> `add-weekly-progression` **con spec delta** y **migración de BD**. Nueva tabla
> `RoutineExerciseWeek` (`entryId` FK cascade, `week`, `kg`, `reps`, `series`,
> único `(entryId, week)`); las columnas existentes no se tocan (retrocompatible).
> Backend: modelo de dominio + mapeo del repositorio
> (`nestedInclude`/`sessionsCreate`/`toDomain` + helper compartido para
> duplicate/assign), validador que rechaza semanas duplicadas/`<1`. Frontend:
> editor "Progresión semanal (opcional)" por ejercicio en el builder
> (agregar/quitar semanas) y vista por semana en la rutina del cliente; tipos de
> servicio + i18n. Las entradas sin semanas siguen usando el valor único. El
> export (US-017) no cambia. Migración `prisma migrate dev`, curl del round-trip,
> E2E. Actualizar `data-model.md`. Mantener todo en verde. Contenido en español.

**Prompt 20:**

> Agreguemos media de referencia a los ejercicios (US-019): change OpenSpec
> `add-exercise-media` **con spec delta** y **migración**. Añadir `videoUrl` e
> `imageUrl` opcionales a `Exercise` (columnas nullable; existentes intactos).
> Backend: modelo + input, validador de URL (vacío → null, no-vacío malformado
> → 400; helper `optionalUrl`; hacer `parseOrThrow` transform-safe). La lectura
> anidada de rutinas lleva el `videoUrl` del ejercicio a la entry
> (`exerciseVideoUrl`). Frontend: campos de video/imagen en el form, columna
> "Media" con icon-links en el catálogo, link ▶ video en la rutina del cliente,
> tipos + i18n. URL-only (sin upload). Migración `prisma migrate dev`, curl del
> round-trip/validación, E2E. Actualizar `data-model.md`. Mantener todo en verde.
> Contenido en español.

---

**Prompt 21:**

> Agreguemos KPIs al panel (US-020): change OpenSpec `add-dashboard-kpis` **con
> spec delta**, sin migración (todo derivado en consulta). Backend: añadir
> `getMonthlyIncome(now)` al `DashboardRepository` (suma de `Payment.amount` del
> mes en curso) y extender el `Dashboard` con un objeto `kpis`
> (`activeClients`, `upToDate`, `overdue`, `noPayments`, `monthlyIncome`)
> calculado en `DashboardService` (conteos por estado de pago derivado + ingreso
> del mes). El mismo `GET /api/dashboard` devuelve `kpis`. Frontend: fila de
> **tarjetas KPI** sobre las alertas (clientes activos, al día, vencidos, ingreso
> del mes con `toLocaleString`), tipos + i18n (es/en). TDD backend y frontend,
> curl del endpoint (401 sin auth), verificación visual + E2E (hacer exactas las
> aserciones `heading "Clientes"` para evitar colisión con la KPI "Clientes
> activos"). Actualizar `api-spec.yml` y `readme.md`. Mantener todo en verde.
> Contenido en español.

---

**Prompt 22:**

> Agreguemos historial de cambios a la ficha médica (US-021): change OpenSpec
> `add-medical-record-history` **con spec delta** y **migración**. Nueva tabla
> `MedicalRecordVersion` (snapshot completo de los campos + `createdAt`, FK a
> `Client` con cascade, índice `[clientId, createdAt]`). Backend: modelo/repo de
> versión; el servicio de ficha médica graba una versión tras cada `upsert`
> (snapshot del estado guardado) y expone `getHistory`; nueva acción de controller
> + ruta `GET /api/clients/:clientId/medical-record/history` (protegida). El
> upsert y la lectura del estado actual no cambian. Frontend: `getHistory` en el
> servicio; sección de **historial** (más reciente primero, timestamps
> localizados, estado vacío) que se refresca tras guardar; tipos + i18n (es/en).
> TDD backend y frontend, migración `prisma migrate dev`, curl (guardar 2 veces →
> 2 versiones newest-first, historial vacío, 404, 401), verificación visual + E2E.
> Actualizar `api-spec.yml` y `data-model.md`. Snapshots completos (no diffs), sin
> restore. Mantener todo en verde. Contenido en español.

---

**Prompt 23:**

> Agreguemos avisos de ejercicios según la ficha médica (US-022): change OpenSpec
> `add-medical-aware-exercise-warnings` **con spec deltas** (exercise-catalog,
> medical-record, client-routine) y **migración**. Diseño advisory (no juzga
> clínicamente): etiquetar cada ejercicio con **zonas corporales**
> (`Exercise.bodyRegions String[]`, vocabulario controlado) y derivar las zonas
> marcadas de la ficha médica con un **diccionario curado** (es/en, insensible a
> mayúsculas/acentos, match por palabra). Backend: constante `REGION_CODES`,
> validador con `z.enum`, `MedicalFlagsService` + endpoint
> `GET /api/clients/:clientId/medical-flags`, y denormalizar `exerciseBodyRegions`
> en las entries de la rutina. Frontend: multi-select de zonas en el form de
> ejercicio; en la rutina del cliente, un **aviso advisory** (icono + tooltip) en
> los ejercicios cuya zona coincide con una marcada; nunca bloquea. Seed etiqueta
> los 11 ejercicios base. TDD backend y frontend, migración, curl (round-trip,
> flags con snippets, 400/401/404), verificación visual + E2E. Actualizar
> `api-spec.yml` y `data-model.md`. Mantener todo en verde. Contenido en español.

---

**Prompt 24:**

> Agreguemos sugerencias de calentamiento según la ficha médica (US-023): change
> OpenSpec `add-warmup-suggestions` **con spec delta** (client-routine), **sin
> migración** (reutiliza US-022: medical-flags + `Exercise.bodyRegions`). Backend:
> `WarmupSuggestionService` (compone `MedicalFlagsService` + `ExerciseRepository`)
> que devuelve, por cada zona marcada, los ejercicios de categoría
> `mobility`/`activation` cuya zona coincide (excluye `main`), agrupados por zona;
> endpoint `GET /api/clients/:clientId/warmup-suggestions` (protegido). Frontend:
> `warmupSuggestionService` + panel **"Calentamiento sugerido"** en la rutina del
> cliente, agrupado por zona (reutiliza labels `exercises.regions.*`), estado
> vacío; guidance-only, nunca fuerza nada. TDD backend y frontend, curl
> (agrupación, exclusión de `main`, vacío, 401/404), verificación visual + E2E.
> Actualizar `api-spec.yml`. Mantener todo en verde. Contenido en español.

---

**Prompt 25:**

> Agreguemos recordatorios automáticos por email (US-024): change OpenSpec
> `add-automated-reminders` **con spec delta** (notifications) y **migración**.
> Nueva tabla `NotificationLog` (`clientId`, `type`, `referenceKey`, `sentAt`,
> único por `[clientId,type,referenceKey]`) + enum `NotificationType`. Backend:
> extender `EmailService` con `sendEmail`; `ResendEmailService` (fetch a Resend);
> `ReminderService` que reutiliza `DashboardService`, resuelve el email del
> cliente, deduplica vía el log, compone mensajes en español y devuelve
> `{ sent, skippedNoEmail, skippedDuplicate }`; scheduler node-cron opt-in
> (`REMINDERS_ENABLED`, `REMINDER_CRON`); trigger manual `POST /api/reminders/run`
> (auth). Selección de provider por `RESEND_API_KEY` (sin clave → Console/no-op).
> Clientes sin email se saltan. TDD backend, migración, curl (enviado, dedupe,
> skip sin email, 401). Actualizar `.env.example`, `api-spec.yml`, `data-model.md`.
> `RESEND_API_KEY` solo por env (nunca commiteado). Mantener todo en verde.
> Contenido de emails en español.

---

**Prompt 26:**

> Agreguemos registro de asistencia/check-in (US-025): change OpenSpec
> `add-attendance-tracking` **con spec delta** (nueva capability attendance) y
> **migración**. Nueva tabla `Attendance` (`clientId` FK cascade, `checkInAt`,
> `note?`, `createdAt`, índice `[clientId, checkInAt]`). Backend: modelo/repo,
> `attendanceSchema` (checkInAt opcional coerce, note max 500), `AttendanceService`
> (record con default now, list newest-first + resumen total/mes/30d/última,
> remove con 404), controller + ruta anidada
> `/api/clients/:clientId/attendance` (`POST`/`GET`/`DELETE /:id`). Frontend:
> `attendanceService` + `ClientAttendancePage` (panel resumen + tabla + diálogo de
> registro con fecha por defecto hoy + nota + borrado con confirmación) + acción-
> icono en el listado + ruta + i18n (es/en). Check-in manual (sin QR); múltiples
> por día permitidos; sin integración con dashboard. TDD backend y frontend,
> migración, curl (registrar default/elegida, 400 nota larga, 404, list+resumen,
> delete 204/404, 401), verificación visual + E2E. Actualizar `api-spec.yml` y
> `data-model.md`. Mantener todo en verde. Contenido en español.

---

**Prompt 27:**

> Agreguemos seguimiento de progreso físico (US-026, solo mediciones): change
> OpenSpec `add-progress-tracking` **con spec delta** (nueva capability progress) y
> **migración**. Nueva tabla `ProgressEntry` (`clientId` FK cascade, `date`,
> métricas opcionales `weightKg`/`bodyFatPercent`/`chestCm`/`waistCm`/`hipsCm`/
> `armCm`/`thighCm` Float?, `note?`, `createdAt`, índice `[clientId, date]`).
> Backend: modelo/repo, `progressSchema` (date opcional coerce, métricas no
> negativas, note max 500, al menos una métrica requerida), `ProgressService`
> (record con default now, list newest-first + resumen peso actual/cambio de
> peso/número de mediciones, remove con 404), controller + ruta anidada
> `/api/clients/:clientId/progress` (`POST`/`GET`/`DELETE /:id`). Frontend:
> `progressService` + `ClientProgressPage` (panel resumen + tabla + diálogo de
> registro con fecha por defecto hoy + campos de métricas + nota, guardar
> deshabilitado hasta cargar ≥1 métrica, borrado con confirmación) + acción-icono
> en el listado + ruta + i18n (es/en). Fotos/videos de progreso diferidos a
> US-026b (cero infraestructura de storage en esta iteración). TDD backend y
> frontend, migración, curl (registrar subconjunto/default, 400 vacío/negativo,
> 404, list+resumen, delete 204/404, 401), verificación visual + E2E. Actualizar
> `api-spec.yml` y `data-model.md`. Mantener todo en verde. Contenido en español.

---

**Prompt 28:**

> Agreguemos fotos de progreso físico (US-026b): change OpenSpec
> `add-progress-photos` **con spec delta** (nueva capability progress-photos +
> modificar progress) y **migración**. Nueva tabla `ProgressPhoto`
> (`progressEntryId` FK cascade, `storageKey`, `contentType`, `createdAt`, índice
> `[progressEntryId]`). Abstracción **`PhotoStorage` pluggable** con
> `LocalDiskPhotoStorage` (volumen Docker nombrado, keys uuid, sin path
> traversal) por defecto; S3 diferido. `sharp` para strip EXIF + re-encode a
> `webp`; `multer` (memoria, 5 MB, allow-list `jpeg/png/webp`). Backend: modelo/
> repo de foto, helper de imagen, `ProgressService` extendido (create multipart
> atómico con rollback, ≥1 métrica **o** ≥1 foto, addPhotos, getPhoto, removePhoto,
> delete de entrada limpia archivos), controller + rutas anidadas (`POST /` multipart,
> `POST /:entryId/photos`, `GET /:entryId/photos/:photoId` stream autenticado,
> `DELETE /:entryId/photos/:photoId`). Frontend: `progressService` con FormData +
> addPhotos/deletePhoto/photoUrl; `ClientProgressPage` con input de fotos en el
> diálogo (guardar habilitado con métrica o foto), thumbnails autenticados por
> entrada, agregar y eliminar con confirmación; i18n (es/en). Infra: volumen
> `gym_prod_uploads` + `PHOTO_STORAGE_DIR` en compose, `.env.example`, `.gitignore`,
> `deployment.md` (backup junto al volumen de DB). TDD backend y frontend, migración,
> curl (create solo-foto, add, stream 200/401, delete 204/404, 400 tipo/tamaño, 404),
> verificación visual + E2E con fixture. Actualizar `api-spec.yml` y `data-model.md`.
> Mantener todo en verde. Contenido en español.

---

**Prompt 29:**

> Agreguemos planes de nutrición (US-027): change OpenSpec `add-nutrition-plans`
> **con spec delta** (nueva capability nutrition) y **migración**. Nuevas tablas
> `NutritionPlan` (1:1 con Client, `clientId` unique, `dailyCalories?`,
> `proteinTargetG?`, `generalNotes?`), `NutritionMeal` (FK cascade, `name`,
> `note?`, `order`), `NutritionFoodItem` (FK cascade, `description`, `quantity?`,
> `order`) y `NutritionPlanVersion` (FK cascade a Client, `snapshot Json`,
> `createdAt`). Estructura completa (plan → comidas → ítems), objetivos diarios
> opcionales, y **historial por snapshot JSON** (una versión por guardado);
> plantillas diferidas a US-027b. Backend: modelos/repo con **upsert transaccional
> que reemplaza hijos y agrega versión**, `nutritionPlanSchema` (targets no
> negativos, nombre de comida y descripción de alimento requeridos, topes de
> arrays), `NutritionService` (getPlan devuelve payload vacío si no hay plan,
> savePlan upsert, getVersions), controller + ruta anidada
> `/api/clients/:clientId/nutrition-plan` (`GET`, `PUT`, `GET /versions`).
> Frontend: `nutritionService` + `ClientNutritionPage` (objetivos + nota + editor
> de comidas con agregar/quitar/reordenar y alimentos por comida + guardar +
> vista de historial) + acción-icono en el listado + ruta + i18n (es/en). Plan
> ausente = payload vacío (no 404). TDD backend y frontend, migración, curl (get
> vacío, put create/replace, versions newest-first, 400 target negativo/comida sin
> nombre, 401, 404), verificación visual + E2E. Actualizar `api-spec.yml` y
> `data-model.md`. Mantener todo en verde. Contenido en español.

---

**Prompt 30:**

> Rediseñemos el export de rutinas (US-030) para que el PDF/Excel repliquen la
> planilla real del entrenador ("SPORT – FITNESS"). Change OpenSpec
> `polish-routine-export` **presentation-only** (`skip_specs: true`, sin endpoint
> ni modelo nuevos). Muestrear los colores del PDF de referencia
> (`planning/reference/trainer-plan.pdf`): barra de sesión `#C5DFB4`, acento lima
> `#6FAC46`, headers negro. Layout A4 **landscape**: banda de marca (PF · SPORT –
> FITNESS / ENTRENAMIENTO FÍSICO INTEGRAL · CEL) + logo del oso, `PLAN DE
> ENTRENAMIENTO` + cliente + fecha; por sesión: barra verde `SESIÓN`, fila
> `SEMANA 1..N`, `PREPARACIÓN PARA EL MOVIMIENTO` + prescripción, dos columnas
> MOVILIDAD/ACTIVACIÓN, tabla con `KG/REPS/SERIES` por semana con **SERIES
> fusionada por bloque**, sección `EJERCICIOS BLOQUE FINAL` + `OBSERVACIONES`, y
> página de consideraciones. Incluir la **progresión semanal (US-018)** en el
> export. Exponer `exerciseCategory` en la entry (select de Prisma) para separar
> movilidad/activación; convención bloque final = label `final`. Un **view-model
> compartido** que consumen `routinePdf.ts` (PDFKit) y `routineXlsx.ts` (ExcelJS).
> Copiar el logo a `backend/src/infrastructure/pdf/assets/` (reducido) + copy-assets
> en el build. Marca en inglés tal cual, solo labels genéricos traducidos. TDD del
> helper + smoke tests PDF/XLSX extendidos, verificación de export real (render a
> PNG comparado con la referencia), E2E de descarga sin regresiones. Actualizar
> readme/prompts (sin cambios de API/modelo). Mantener todo en verde. Contenido en
> español.

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
