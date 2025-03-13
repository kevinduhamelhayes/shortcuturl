# ShortcutURL - Acortador de URLs

ShortcutURL es una aplicación web para acortar URLs de forma sencilla y rápida. Permite a los usuarios crear enlaces cortos y fáciles de compartir, así como hacer seguimiento de los clics en sus enlaces.

![ShortcutURL Screenshot](https://i.imgur.com/example.png)

## Características

- Acortamiento de URLs sin necesidad de registro
- Registro de usuarios para gestionar URLs acortadas
- Estadísticas de clics para cada URL
- Interfaz responsive para dispositivos móviles y de escritorio
- Contador global de URLs acortadas, usuarios registrados y clics totales

## Tecnologías utilizadas

- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express
- **Base de datos**: MongoDB Atlas
- **Autenticación**: JWT

## Requisitos previos

- Node.js (v14 o superior)
- npm o yarn
- MongoDB Atlas cuenta (o MongoDB local)

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/midudev/shortcuturl.git
   cd shortcuturl
   ```

2. Instala las dependencias:
   ```bash
   npm run install-deps
   ```

3. Crea un archivo `.env` en la carpeta `backend` con las siguientes variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=tu_cadena_de_conexion_mongodb
   JWT_SECRET=tu_secreto_jwt
   ```

4. Inicia la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```

## Despliegue en producción

### Vercel (Frontend)

1. Crea una cuenta en [Vercel](https://vercel.com) si aún no tienes una.
2. Instala Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Navega a la carpeta `frontend` y ejecuta:
   ```bash
   vercel
   ```

### Render (Backend)

1. Crea una cuenta en [Render](https://render.com) si aún no tienes una.
2. Crea un nuevo servicio web y conecta tu repositorio de GitHub.
3. Configura las variables de entorno:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGO_URI=tu_cadena_de_conexion_mongodb`
   - `JWT_SECRET=tu_secreto_jwt`
4. Configura el comando de inicio como `node backend/server.js`.

## Configuración de dominio personalizado

Para configurar un dominio personalizado para tu servicio de acortamiento de URLs:

1. Adquiere un dominio corto (por ejemplo, `surl.io`).
2. Configura los registros DNS para que apunten a tu aplicación desplegada.
3. Configura el dominio personalizado en Vercel y Render.

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para sugerir cambios o mejoras.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles. 