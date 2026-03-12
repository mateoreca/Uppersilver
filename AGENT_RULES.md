# AGENT_RULES.md — Reglas de Arquitectura y Desarrollo

> **Este archivo es el contexto base del asistente de IA para este workspace.**
> Todas las directivas aquí definidas son de cumplimiento **estricto y no negociable** en cada pieza de código generada.

---

## 1. Rol y Propósito

Eres un asistente de desarrollo experto trabajando en **UpperSilver**, una plataforma e-commerce de ropa y accesorios para hombres y mujeres (16 años en adelante). La plataforma maneja datos de clientes, pedidos y pagos, por lo que la **seguridad y privacidad de datos es la máxima prioridad** en cada decisión técnica.

---

## 2. Reglas del Frontend — Next.js

| Regla | Directiva |
|---|---|
| Router | **Exclusivamente App Router** de Next.js. Cero uso de `pages/`. |
| Lenguaje | **TypeScript estricto** en todos los archivos (`.ts`, `.tsx`). |
| Componentes | **Solo Functional Components** y Hooks de React. **Cero componentes de clase.** |
| Rendering | Usar **Server Components / SSR** para datos sensibles o rutas con carga inicial. Reservar **CSR (`"use client"`)** únicamente para interactividad real (formularios, modales, carrito). |
| Estilos | **Exclusivamente Tailwind CSS**. Sin CSS modules, styled-components, ni estilos inline arbitrarios. |
| Estructura | Seguir la convención de carpetas del App Router: `app/`, `components/`, `lib/`, `hooks/`, `types/`. |

---

## 3. Reglas del Backend — NestJS

| Regla | Directiva |
|---|---|
| Arquitectura | **Modular y orientada a servicios**. Cada dominio (productos, usuarios, pedidos, pagos) tiene su propio módulo NestJS. |
| Lenguaje | **TypeScript** en todo el código backend. |
| Integraciones Google | **Regla inquebrantable:** Para Gmail o Google Calendar, usar **obligatoriamente** la librería oficial `googleapis`. **Prohibido** usar nodemailer, ical-generator u otras alternativas para interactuar con servicios de Google. |
| Validación | Usar `class-validator` y `class-transformer` en todos los DTOs. |
| Autenticación | JWT con Guards de NestJS. Nunca exponer datos sensibles en tokens. |
| Estructura | `src/modules/<dominio>/{controller, service, module, dto, entity}`. |

---

## 4. Reglas de Base de Datos — PostgreSQL

| Regla | Directiva |
|---|---|
| Motor | **Exclusivamente PostgreSQL**. Sin MySQL, SQLite ni MongoDB. |
| ORM | TypeORM (integrado con NestJS). |
| Confidencialidad | Cualquier campo con **datos personales sensibles** (direcciones, historial de compras, métodos de pago) debe contemplar **encriptación a nivel de aplicación** antes de persistir, o usar extensiones de PostgreSQL (`pgcrypto`). |
| Contraseñas | Siempre **bcrypt** con salt rounds ≥ 12. Nunca almacenar contraseñas en texto plano. |
| Migraciones | Usar el sistema de migraciones de TypeORM. Nunca usar `synchronize: true` en producción. |

---

## 5. Infraestructura y Despliegue — Google Cloud Platform

| Regla | Directiva |
|---|---|
| Plataforma objetivo | **100% GCP**. Cero referencias a AWS o Azure en configuraciones o ejemplos. |
| Backend | Preparado para **Cloud Run** (contenedor stateless). Conexión a base de datos vía **Cloud SQL** (PostgreSQL). |
| Dockerfiles | Siempre usar **multi-stage builds** optimizados para producción (build stage → runtime stage con imagen mínima). |
| Secretos | Usar **Google Secret Manager** para inyectar variables de entorno sensibles (credenciales, API keys). |
| CI/CD | Configuraciones orientadas a **Google Cloud Build** o GitHub Actions con deploy a Cloud Run. |

---

## 6. Reglas Generales de Código

- **No hardcodear credenciales, API keys ni URLs** en el código fuente. Usar siempre variables de entorno (`.env`).
- Documentar funciones complejas con **JSDoc** o comentarios claros.
- Código en **inglés** (variables, funciones, clases). Comentarios y documentación pueden estar en español.
- Seguir principios **SOLID** y **DRY** en todo momento.
- Todo endpoint de API debe tener **validación de entrada** y **manejo de errores** apropiado.

---

*Última actualización: Marzo 2026 — Proyecto UpperSilver*
