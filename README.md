# UpperSilver — Plataforma e-commerce

![NestJS](https://nestjs.com/img/logo-small.svg)  
Lenguajes principales: TypeScript, Next.js (React)

Qué es
- UpperSilver es una plataforma e‑commerce modular compuesta por un backend en NestJS (TypeScript) y un frontend en Next.js (React). Está pensada para servir productos, gestionar pedidos, pagos y notificaciones, y cuenta con integración de IA y pasarelas de pago para flujos de compra completos.

Stack
- Lenguajes: TypeScript (backend y frontend), JavaScript, CSS
- Backend: NestJS (TypeScript)
- Frontend: Next.js (React)
- Base de datos: PostgreSQL (usada por el backend)
- Notables librerías/servicios:
  - Next.js + React (frontend)
  - NestJS (backend)
  - Integraciones de pago (MercadoPago / PayPal / Wompi)
  - Firebase (cliente/frontend)
  - Socket.IO (realtime)
  - Integraciones/SDKs para AI (menciones en frontend/backend)

Índice rápido
- Descripción
- Estructura del repositorio
- Requisitos previos
- Configuración local (backend + frontend)
- Ejecución y pruebas
- Documentación de la API y colecciones Postman
- Docker / Despliegue en GCP Cloud Run
- Buenas prácticas y contribución
- Contacto

## Estructura principal (top-level)
```
AGENT_RULES.md                -- reglas / notas del agente (documentación interna)
init_frontend.bat            -- script de ayuda para inicializar frontend (Windows)
backend/                     -- backend NestJS (TypeScript)
  Dockerfile                 -- Dockerfile multi-stage para backend
  .env.example               -- ejemplo de variables de entorno
  README.md                  -- instrucciones específicas del backend
  package.json               -- dependencias y scripts (Nest)
  src/
    main.ts                  -- punto de entrada (arranca Nest)
    app.module.ts            -- módulo raíz
    app.controller.ts        -- controlador de ejemplo
    modules/                 -- módulos: products, users, auth, payments, orders, shipping, notifications, ai, gcp, ...
      products/
        products.controller.ts
        products.service.ts
        products.module.ts
  test/                      -- pruebas unitarias / e2e
  scripts/                   -- utilidades y scripts del proyecto
frontend/                    -- frontend Next.js (React + Tailwind/etc.)
  package.json               -- dependencias y scripts (next dev/build/start, lint)
  next.config.ts             -- configuración Next.js
  app/                       -- rutas y páginas (Next App Router o similar)
  components/                -- componentes UI
  context/                   -- contextos / providers
  lib/                       -- utilidades compartidas
  public/                    -- activos estáticos
  types/                     -- tipos TypeScript
```

Cómo encajan las piezas (resumen)
- El backend es una API REST (con Swagger) diseñada como una aplicación NestJS modular. `main.ts` arranca la aplicación y registra módulos (por ejemplo, `products`, `users`, `payments`, `notifications`, `ai`). Los controladores exponen endpoints; los services contienen la lógica de negocio y acceso a DB.
- El frontend es una aplicación Next.js que consume la API del backend, gestiona la UI y las interacciones de pago. Usa SDKs clientes para pasarelas de pago y Firebase; también hay websockets (Socket.IO) para eventos en tiempo real.

## Requisitos previos
- Node.js v20+ recomendado
- Npm o Yarn
- PostgreSQL accesible para el backend (puede ser local o gestionada)
- Cuentas/credenciales para los servicios que se integren:
  - Google Cloud (para despliegue en Cloud Run y secret manager/service account)
  - OpenAI u otro proveedor IA (si se usan integraciones AI)
  - Credenciales de pasarelas de pago (MercadoPago, PayPal, Wompi, etc.)
  - Firebase (si se usa en frontend)
- gcloud CLI configurado para despliegues (si se usa despliegue GCP)

## Configuración local — Backend
1. Clonar y entrar en carpeta:
   ```bash
   git clone <repo-url>
   cd Uppersilver/backend
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Copiar y rellenar variables de entorno:
   - Hay un `backend/.env.example`. Duplica como `.env` y rellena valores para la conexión a PostgreSQL, claves de pago, claves de IA y cualquier otro secreto.
   - Variables importantes a proveer (según integraciones presentes): credenciales DB, URL base, claves de pasarelas de pago, claves OpenAI/AI, credenciales GCP si se requiere.
4. Ejecutar en modo desarrollo:
   ```bash
   npm run start:dev
   ```
   - Por defecto el README del backend indica que el servidor corre en `http://localhost:8080/` (o el puerto que definas en `.env`).

Archivos clave en backend
- `src/main.ts` — arranque y configuración global (CORS, pipes, Swagger quizá)
- `src/app.module.ts` — registro de módulos
- `src/modules/products/*` — ejemplo de módulo (controller, service, module)
- `backend/Dockerfile` — imagen multi-stage preparada para despliegue

## Configuración local — Frontend
1. Entrar en carpeta frontend:
   ```bash
   cd ../frontend
   npm install
   ```
2. Scripts disponibles (según package.json):
   - Desarrollo:
     ```bash
     npm run dev
     ```
     Esto lanza Next.js en modo desarrollo (por defecto puerto 3000).
   - Construir:
     ```bash
     npm run build
     npm run start
     ```
   - Lint:
     ```bash
     npm run lint
     ```
3. Variables:
   - Configurar variables necesarias (URL del backend, claves públicas de pago, Firebase config, etc.). Revisa `frontend/.env` o las guías internas del frontend (si existen) para nombres concretos.

Dependencias relevantes detectadas (frontend)
- Next.js, React, React DOM
- TailwindCSS / PostCSS
- Firebase (cliente)
- Socket.IO client
- SDKs de pago: MercadoPago, PayPal, PayPal React SDK
- Librerías/SDKs de IA (menciones en package.json)

## Documentación de la API & pruebas
- Swagger (OpenAPI): arranca el backend y abre `http://localhost:8080/api` para ver la documentación interactiva (según README del backend).
- Colecciones Postman: en `backend/UpperSilver_Postman_Collection.json` está la colección con carpetas para Productos, IA, Pasarelas de Pago y Notificaciones. Importa en Postman y ajusta la variable `baseUrl` para apuntar a local/producción.

## Docker y despliegue en GCP Cloud Run (instrucciones conocidas)
- El backend está containerizado y listo para subir a Artifact Registry y desplegar en Cloud Run.
- Ejemplo (extraído del README del backend):
  1. Construir y subir imagen:
     ```bash
     gcloud builds submit --tag us-central1-docker.pkg.dev/[ID-PROYECTO]/uppersilver-repo/backend .
     ```
  2. Desplegar en Cloud Run:
     ```bash
     gcloud run deploy uppersilver-backend \
       --image us-central1-docker.pkg.dev/[ID-PROYECTO]/uppersilver-repo/backend \
       --region us-central1 \
       --service-account uppersilver-backend-sa@[ID-PROYECTO].iam.gserviceaccount.com
     ```
  - Nota: gestione variables/secretos (DB, claves de pagos, OpenAI) desde Secret Manager o desde la interfaz Cloud Run en "Variables & Secrets".

## Tests, lint y calidad
- Backend: hay carpetas `test/` y archivos `.spec.ts` — ejecutar las pruebas con el comando de test que defina `package.json` (revisa scripts en `backend/package.json`).
- Frontend: usa ESLint y configuración propia; ejecutar `npm run lint`.
- Se recomienda usar pre-commit hooks para formateo (Prettier) y lint automático.

## Checklist para puesta en marcha (rápido)
- [ ] Rellenar `backend/.env` con credenciales
- [ ] Tener PostgreSQL accesible y migraciones aplicadas (si aplica)
- [ ] Configurar credenciales de pago y APIs de terceros
- [ ] Levantar backend `npm run start:dev`
- [ ] Levantar frontend `npm run dev`
- [ ] Probar endpoints con Swagger o Postman collection

## Buenas prácticas y contribuciones
- Revisa `AGENT_RULES.md` para notas / reglas internas antes de automatizar tareas con agentes.
- Abrir issues claros y PRs pequeños. En el PR describe el problema, la solución y los pasos para probar.
- Si vas a tocar integraciones externas (pagos, GCP, OpenAI), pon cuidado en no subir secrets al repo.

## Notas finales / pendientes detectadas
- El backend README ya incluye instrucciones de despliegue y uso de Postman/Swagger.
- Si buscas documentación de arquitecturas específicas (migrations, esquema de DB, flujo de pagos), puedo extraer y documentar los ficheros de migración, entidades y controladores concretos (por ejemplo: `backend/src/modules/products/entities/*`) en una sección adicional del README.

---

Si quieres, genero automáticamente:
- Un README.md raíz (este documento) y/o
- Un archivo CONTRIBUTING.md con plantillas de PR/Issue,
- Un apartado "Variables de entorno" con los nombres exactos extraídos desde `backend/.env.example`.

Indica cuál prefieres y lo creo aquí (o lo commitamos al repo si quieres).  
