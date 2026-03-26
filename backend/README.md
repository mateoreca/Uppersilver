<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

# UpperSilver Backend 🚀

[![Framework](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Database](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=flat&logo=google-cloud&logoColor=white)](#)

Este es el backend principal de la plataforma e-commerce **UpperSilver**, desarrollado bajo una arquitectura modular estricta usando NestJS y TypeScript. El proyecto provee servicios completos que incluyen **Pasarelas de Pago** (MercadoPago y Wompi), **Inteligencia Artificial** (RAG con OpenAI), **Logística**, y un potente sistema de **Notificaciones Omnicanal**.

---

## 💻 Requisitos Previos e Instalación

Para cualquier desarrollador que descargue de este repositorio, asegúrense de tener instalado:
- **Node.js** (v20 o superior).
- **NPM** o Yarn.

1. Clona el repositorio e ingresa a la carpeta `backend`:
```bash
git clone <url-de-tu-repo>
cd uppersilver-main/backend
```

2. Instala todas las dependencias del proyecto:
```bash
npm install
```

3. Levanta el servidor localmente:
```bash
npm run start:dev
```
*(El servidor correrá en `http://localhost:8080/` o el que definan en su `.env`)*

---

## 🧪 Pruebas y Validación de la API

Tenemos dos formas excelentes y listas para usar que permiten a cualquier miembro del equipo validar la correcta programación y respuestas (Éxitos 200 y Errores 400 controlados) de los endpoints sin necesidad de escribir código:

### 1. Documentación Visual Interactiva (Swagger)
El proyecto cuenta con Swagger nativamente integrado. Simplemente levanta tu servidor localmente (o ingresa a la URL de producción de Cloud Run) y agrega `/api` al final, por ejemplo:
👉 **`http://localhost:8080/api`**

Desde esta interfaz podrás ver **cada uno de los Controladores / Módulos**, leer exactamente qué datos de entrada exige cada JSON, e incluso enviarlos mediante el botón **"Try it out"**.

### 2. Colección Maestra de Postman
En la raíz de este directorio Backend existe un archivo llamado:
`UpperSilver_Postman_Collection.json`

Si deseas probar flujos complejos:
1. Abre tu aplicación de **Postman**.
2. Dale a **Import** y selecciona este archivo.
3. Se desplegará una colección con **4 carpetas distintas** (Productos, IA, Pasarelas de Pago, Notificaciones).
4. Dentro de cada carpeta, hay peticiones guardadas para simular el **Éxito (HTTP 200/201)** y el **Error Validado (HTTP 400/500)** contra la plataforma real.

*(Recuerda modificar la variable interna `baseUrl` del Postman si quieres correrlo en Local o Producción).*

---

## ☁️ Despliegue Oficial en GCP Cloud Run

Este proyecto ya está containerizado y optimizado (Multi-stage `Dockerfile` + `.dockerignore`) para despliegues Serverless. Si necesitas subir una nueva versión a Google Cloud:

1. **Construye y almacena** la imagen en Artifact Registry:
```bash
gcloud builds submit --tag us-central1-docker.pkg.dev/[ID-PROYECTO]/uppersilver-repo/backend .
```

2. **Lanza** en Cloud Run asignándole la Service Account `uppersilver-backend-sa`:
```bash
gcloud run deploy uppersilver-backend --image us-central1-docker.pkg.dev/[ID-PROYECTO]/uppersilver-repo/backend --region us-central1 --service-account uppersilver-backend-sa@[ID-PROYECTO].iam.gserviceaccount.com --allow-unauthenticated --port 8080
```
> **Nota:** La gestión de las variables reales (Bases de datos, llaves de OpenAI, Wompi o MercadoPago) se realiza estrictamente e inyecta directo desde el gestor web "Variables & Secrets" de Google Cloud Run para proteger las credenciales *(No subimos nunca el `env` real aquí)*.

---
*UpperSilver Backend Team* ⚡
