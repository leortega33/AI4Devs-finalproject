## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

### **0.2. Nombre del proyecto:**

### **0.3. Descripción breve del proyecto:**

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

Aplicación web para que un entrenador/dueño de gimnasio (usuario único) gestione
su operación diaria desde un solo lugar: clientes, fichas médicas, rutinas y
pagos. Resuelve la dispersión de esta información en planillas/papel y
automatiza la parte más repetitiva del día a día: armar rutinas para cada
cliente.

### **1.2. Características y funcionalidades principales:**

**MVP (Fase 1):**
- Login básico de usuario único (administrador/entrenador)
- Gestión de clientes (alta, edición, baja lógica, listado/búsqueda)
- Ficha médica por cliente (condiciones, lesiones, restricciones, contacto de emergencia)
- Catálogo de ejercicios reutilizable
- Plantillas de rutina (creación y duplicación) a partir del catálogo de ejercicios
- Asignación de rutina a cliente con vigencia
- Registro de pagos por cliente e historial completo de pagos
- Dashboard con alertas de pagos vencidos/por vencer y rutinas por vencer
- Interfaz bilingüe (español por defecto / inglés) con selector de idioma

**Backlog futuro (Fase 2, fuera del MVP):** recordatorios automáticos
(email/WhatsApp), pasarela de pago online, registro de asistencia/check-in,
seguimiento de progreso físico, planes de nutrición, soporte multi-tenant
(varios gimnasios).

Ver detalle de historias de usuario en [planning/user-stories-backlog.md](planning/user-stories-backlog.md).

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

**Sistema de diseño (US-011).** La app usa una identidad visual de marca
inspirada en el material del gimnasio (negro + verde hoja + blanco), centralizada
en un tema MUI (`frontend/src/theme/theme.ts`): verde hoja como color primario
para acciones y marca, superficies claras y tipografía consistente. Todas las
pantallas comparten un *app shell* (`components/AppLayout.tsx`) con una barra
superior persistente que incluye el logo/marca "SPORT – FITNESS", el selector de
idioma y el botón de cerrar sesión.

**Recorrido del usuario:**

1. **Acceso** — El usuario aterriza en una pantalla de login con la cabecera de
   marca (logo + nombre + lema) y el selector de idioma. Puede recuperar su
   contraseña desde el enlace correspondiente.
2. **Panel** — Tras autenticarse llega al panel, dentro del shell con la barra
   superior de marca. Desde allí navega a la gestión de clientes.
3. **Clientes** — Lista con búsqueda por nombre y filtro por estado (`DataGrid`),
   alta/edición mediante formularios, y baja lógica con diálogo de confirmación.
   Cada pantalla interna ofrece un botón "Atrás" consistente para volver.
4. **Ficha médica** — Desde el listado, la acción "Ficha médica" abre una
   pantalla propia por cliente con condiciones, lesiones, medicación, alergias,
   grupo sanguíneo y notas. Muestra un estado vacío cuando aún no hay ficha y
   guarda mediante upsert.
5. **Ejercicios** — Desde el panel, "Ejercicios" abre el catálogo (`DataGrid`
   con búsqueda por nombre y filtro por categoría). Alta/edición mediante
   formulario; sin borrado. Trae un set base sembrado al iniciar.
6. **Idioma** — En cualquier momento el usuario cambia entre español e inglés
   desde la barra superior; la preferencia persiste entre recargas.

> _Capturas / videotutorial: pendientes de incorporar._

### **1.4. Instrucciones de instalación:**

**Requisitos previos:** Node.js `20.19.0`+ (recomendado gestionarlo con `nvm`),
npm `10`+, Docker + Docker Compose, y Git.

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd AI4Devs-finalproject

# 2. Levantar la base de datos PostgreSQL (Docker)
docker compose up -d

# 3. Backend
cd backend
cp .env.example .env          # completar JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npx prisma migrate deploy     # aplicar migraciones
npx prisma db seed            # crear el usuario admin desde el .env
npm run dev                   # API en http://localhost:3000

# 4. Frontend (en otra terminal, desde la raíz)
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:3000
npm install
npm run dev                   # App en http://localhost:5173
```

Credenciales por defecto del admin (definidas en `backend/.env`):
`admin@example.com` / `ChangeMe123!`.

> Detalle ampliado en [docs/development_guide.md](docs/development_guide.md).

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
> Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.


### **2.2. Descripción de componentes principales:**

> Describe los componentes más importantes, incluyendo la tecnología utilizada

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

Monorepo con el backend y el frontend como carpetas separadas en la raíz, más
la documentación técnica y los artefactos de spec-driven development.

```
.
├── backend/            # API Node.js + Express + TypeScript (arquitectura DDD por capas)
│   ├── src/
│   │   ├── domain/         # entidades y contratos de repositorio
│   │   ├── application/     # servicios (lógica de negocio) y validación
│   │   ├── infrastructure/  # implementaciones Prisma, email, logger
│   │   ├── presentation/    # controllers HTTP
│   │   ├── routes/ middleware/
│   │   └── index.ts
│   └── prisma/          # schema, migraciones y seed
├── frontend/           # SPA React + TypeScript + Vite + MUI
│   ├── src/
│   │   ├── pages/ components/ context/ services/
│   └── e2e/             # tests end-to-end (Playwright)
├── docs/               # estándares y documentación técnica (fuente de verdad)
├── ai-specs/           # agentes y skills reutilizables para asistentes de IA
├── openspec/           # changes (spec-driven) y specs consolidados
├── planning/           # backlog de historias de usuario
└── docker-compose.yml  # PostgreSQL local
```

El backend sigue **Domain-Driven Design (DDD)** con capas (dominio, aplicación,
infraestructura, presentación). El flujo de desarrollo usa **OpenSpec**
(spec-driven): cada funcionalidad se define como un *change* (propuesta, spec,
diseño y tareas) antes de implementarse, y al terminar se archiva promoviendo
su spec a `openspec/specs/`.

### **2.4. Infraestructura y despliegue**

> Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.


### **3.2. Descripción de entidades principales:**

> Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1 — US-001: Autenticación del administrador (single admin)**

> Como dueño/entrenador del gimnasio (usuario administrador único), quiero
> loguearme con email/contraseña y poder recuperar mi contraseña si la olvido,
> para que solo yo pueda acceder a los datos de clientes, fichas médicas y pagos.

- **Criterios de aceptación:** login con credenciales válidas inicia sesión
  persistente; credenciales inválidas se rechazan; todas las demás rutas quedan
  protegidas; recuperación de contraseña por email que responde igual exista o
  no la cuenta (no revela su existencia); token de reset de un solo uso y con
  expiración; rate limiting en login y forgot-password.
- **Estado:** Implementada y archivada (ver
  [detalle completo](planning/user-stories-backlog.md) y el spec en
  `openspec/specs/admin-authentication/spec.md`).

**Historia de Usuario 2 — US-002: Gestión de clientes (CRUD)**

> Como dueño/entrenador, quiero crear, ver, editar y dar de baja perfiles de
> clientes, para tener un solo lugar con los datos básicos de mis clientes.

- **Criterios de aceptación:** alta con campos obligatorios (nombre, apellido,
  DNI único de 7-8 dígitos, teléfono, email, fecha de nacimiento) y opcionales
  (dirección, objetivo, contacto de emergencia); validación de formato; baja
  lógica (no borrado) con posibilidad de reactivar; listado con búsqueda por
  nombre y filtro por estado; DNI duplicado rechazado; todo protegido por
  autenticación.
- **Estado:** Implementada (ver
  [detalle completo](planning/user-stories-backlog.md) y el spec en el change
  `openspec/changes/add-client-management/`).

**Historia de Usuario 3 — US-010: Interfaz bilingüe (español/inglés)**

> Como dueño/entrenador, quiero la interfaz disponible en español e inglés con
> un selector de idioma, para poder usar la app en mi propio idioma.

- **Criterios de aceptación:** la app arranca en el idioma del navegador (o
  español por defecto); un selector permite cambiar entre español e inglés y
  la preferencia persiste entre recargas; todas las pantallas y los mensajes
  de error están traducidos. El código (claves de traducción, identificadores,
  comentarios) se mantiene en inglés según los estándares; solo se traducen
  los textos visibles.
- **Estado:** Implementada (`react-i18next`; ver
  [detalle completo](planning/user-stories-backlog.md) y el change
  `openspec/changes/add-bilingual-ui/`).

**Historia de Usuario 4 — US-011: Shell de aplicación, navegación y tema visual**

> Como dueño/entrenador, quiero una identidad visual coherente (colores y logo
> del gimnasio) y una navegación consistente con barra superior y botón de
> "atrás", para moverme por la app con comodidad y que se sienta como un
> producto terminado.

- **Criterios de aceptación:** un tema de marca central (MUI `createTheme`:
  verde hoja como color primario, negro y blanco) aplicado a toda la app; una
  barra superior persistente (`AppBar`) con el logo/marca "SPORT – FITNESS", el
  selector de idioma y el botón de cerrar sesión, presente en todas las
  pantallas autenticadas; navegación "atrás" consistente en las pantallas
  internas mediante un componente `BackButton`; una cabecera de marca en las
  pantallas públicas (login, recuperación); el logo actúa como enlace al inicio.
- **Estado:** Implementada (ver
  [detalle completo](planning/user-stories-backlog.md) y el change
  `openspec/changes/add-app-shell/`).

**Historia de Usuario 5 — US-003: Ficha médica del cliente**

> Como dueño/entrenador, quiero cargar y actualizar la ficha médica de cada
> cliente, para diseñar rutinas seguras y reaccionar correctamente ante una
> emergencia.

- **Criterios de aceptación:** ficha médica opcional y única por cliente
  (relación 1:1), con condiciones preexistentes, lesiones, cirugías/prótesis,
  restricciones físicas, medicación, alergias, grupo sanguíneo y notas (texto
  libre, máximo 1000 caracteres por campo); no obligatoria al alta y editable
  después desde una pantalla propia (`/clients/:id/medical-record`) accesible
  desde el listado de clientes; estado vacío claro cuando el cliente aún no
  tiene ficha; se guarda mediante upsert (crea o actualiza, siempre un solo
  registro); solo se guarda el estado actual (sin historial en el MVP); todo
  protegido por autenticación.
- **Estado:** Implementada (ver
  [detalle completo](planning/user-stories-backlog.md) y el change
  `openspec/changes/add-medical-record/`).

**Historia de Usuario 6 — US-004: Catálogo de ejercicios**

> Como dueño/entrenador, quiero un catálogo reutilizable de ejercicios, para
> armar rutinas más rápido sin volver a tipear los ejercicios cada vez.

- **Criterios de aceptación:** catálogo de solo alta/edición (sin borrado
  físico, para no romper rutinas que referencien un ejercicio); cada ejercicio
  tiene nombre, grupo muscular y categoría (`mobility`/`activation`/`main`,
  para separar entrada en calor de trabajo principal), y opcionalmente series
  y repeticiones por defecto, técnica y equipamiento; listado con búsqueda por
  nombre y filtro por categoría; formulario de alta/edición (las series y
  repeticiones no admiten valores negativos); un set base de ejercicios en
  español se siembra al iniciar (idempotente, sin duplicar al re-sembrar);
  todo protegido por autenticación.
- **Estado:** Implementada (ver
  [detalle completo](planning/user-stories-backlog.md) y el change
  `openspec/changes/add-exercise-catalog/`).

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

**Ticket 1 — Backend: endpoints y servicio de autenticación (US-001)**

- **Descripción:** implementar los 5 endpoints de auth (`login`, `logout`,
  `me`, `forgot-password`, `reset-password`) sobre arquitectura DDD, con
  `authService` (bcrypt + JWT en cookie httpOnly), validación con zod,
  middleware que protege el resto de las rutas y rate limiting.
- **Definición de terminado:** endpoints implementados y protegidos, tests
  unitarios/integración (90%+ cobertura), `docs/api-spec.yml` actualizado.
- **Referencia:** `openspec/changes/archive/2026-09-13-add-admin-authentication/tasks.md` (secciones 3-6).

**Ticket 2 — Frontend: pantallas de acceso y guarda de rutas (US-001)**

- **Descripción:** implementar `AuthContext`, `ProtectedRoute` y las páginas
  de login, recuperación y reseteo de contraseña con MUI, incluyendo validación
  de formularios y persistencia de sesión entre recargas.
- **Definición de terminado:** flujo de login/logout/reset funcional, rutas
  protegidas redirigen a `/login`, tests unitarios (Vitest) y E2E (Playwright).
- **Referencia:** `openspec/changes/archive/2026-09-13-add-admin-authentication/tasks.md` (sección 7).

**Ticket 3 — Base de datos: modelo `User`, migración y seed (US-001)**

- **Descripción:** definir el modelo `User` en Prisma (email único, hash de
  contraseña, token de reset hasheado y expiración), crear la migración inicial
  y un script de seed que crea el admin único desde variables de entorno.
- **Definición de terminado:** `npx prisma migrate dev` aplica la tabla `User`;
  `npx prisma db seed` crea exactamente una fila admin; documentado en
  `docs/data-model.md` y `docs/development_guide.md`.
- **Referencia:** `openspec/changes/archive/2026-09-13-add-admin-authentication/tasks.md` (secciones 3.1 y 6).

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

