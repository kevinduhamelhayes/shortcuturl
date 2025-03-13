vamos a hacer un acortador de urls con stack mern  dame codigo sistema de carpetas y pasoa a seguir para hacerlo
ChatGPT dijo:
Vamos a desarrollar un acortador de URLs usando el stack MERN (MongoDB, Express.js, React.js y Node.js). A continuación, te proporcionaré:

✅ Estructura de carpetas 📂
✅ Código para el backend (Node.js + Express + MongoDB) ⚙️
✅ Código para el frontend (React.js + Tailwind CSS) 🎨
✅ Pasos detallados para la instalación y ejecución 🚀

📁 1. Estructura de Carpetas
bash
Copiar
Editar
url-shortener/
│── backend/  (API con Express.js y MongoDB)
│   ├── config/
│   │   ├── db.js         # Conexión a MongoDB
│   ├── models/
│   │   ├── Url.js        # Modelo de datos
│   ├── routes/
│   │   ├── urlRoutes.js  # Rutas de la API
│   ├── controllers/
│   │   ├── urlController.js  # Lógica de negocio
│   ├── index.js         # Servidor Express.js
│   ├── .env             # Variables de entorno
│   ├── package.json
│── frontend/  (React.js para la UI)
│   ├── src/
│   │   ├── components/
│   │   │   ├── UrlForm.js      # Formulario para acortar URLs
│   │   │   ├── UrlList.js      # Lista de URLs acortadas
│   │   ├── App.js              # Estructura principal
│   │   ├── index.js            # Punto de entrada
│   ├── package.json
│── .gitignore
│── README.md
⚙️ 2. Backend - API con Node.js y Express.js
🛠️ Paso 1: Configurar el backend
bash
Copiar
Editar
mkdir url-shortener && cd url-shortener
mkdir backend && cd backend
npm init -y
npm install express mongoose dotenv cors nanoid
📌 Explicación de paquetes:

express: Framework web para Node.js
mongoose: ORM para MongoDB
dotenv: Para manejar variables de entorno
cors: Para permitir peticiones entre frontend y backend
nanoid: Para generar los códigos únicos de las URLs
📝 Paso 2: Configurar MongoDB
Crea un archivo config/db.js para conectar MongoDB:

javascript
Copiar
Editar
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("🔥 MongoDB conectado");
    } catch (error) {
        console.error("Error conectando a MongoDB:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
Crea un archivo .env para definir la conexión:

ini
Copiar
Editar
MONGO_URI=mongodb://localhost:27017/urlshortener
PORT=5000
📌 Paso 3: Crear el modelo URL
Crea el archivo models/Url.js:

javascript
Copiar
Editar
const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortUrl: { type: String, unique: true },
    clicks: { type: Number, default: 0 },
});

module.exports = mongoose.model("Url", UrlSchema);
📌 Paso 4: Controlador para manejar URLs
Crea el archivo controllers/urlController.js:

javascript
Copiar
Editar
const Url = require("../models/Url");
const { nanoid } = require("nanoid");

exports.createShortUrl = async (req, res) => {
    const { originalUrl } = req.body;
    if (!originalUrl) return res.status(400).json({ error: "URL requerida" });

    try {
        const shortUrl = nanoid(7);
        const newUrl = await Url.create({ originalUrl, shortUrl });
        res.json(newUrl);
    } catch (error) {
        res.status(500).json({ error: "Error acortando URL" });
    }
};

exports.getUrl = async (req, res) => {
    try {
        const url = await Url.findOne({ shortUrl: req.params.shortUrl });
        if (!url) return res.status(404).json({ error: "URL no encontrada" });

        url.clicks += 1;
        await url.save();
        res.redirect(url.originalUrl);
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo URL" });
    }
};
📌 Paso 5: Definir las rutas
Crea el archivo routes/urlRoutes.js:

javascript
Copiar
Editar
const express = require("express");
const { createShortUrl, getUrl } = require("../controllers/urlController");
const router = express.Router();

router.post("/shorten", createShortUrl);
router.get("/:shortUrl", getUrl);

module.exports = router;
📌 Paso 6: Configurar el Servidor Express
Crea el archivo index.js:

javascript
Copiar
Editar
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const urlRoutes = require("./routes/urlRoutes");
require("dotenv").config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api", urlRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
Corre el servidor:

bash
Copiar
Editar
node index.js
🎨 3. Frontend - React.js + Tailwind CSS
🛠️ Paso 1: Crear Proyecto React
bash
Copiar
Editar
cd ..
npx create-react-app frontend
cd frontend
npm install axios tailwindcss
npx tailwindcss init
Configura Tailwind CSS en tailwind.config.js:

js
Copiar
Editar
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
📌 Paso 2: Crear el formulario en React
Edita src/components/UrlForm.js:

javascript
Copiar
Editar
import { useState } from "react";
import axios from "axios";

const UrlForm = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post("http://localhost:5000/api/shorten", { originalUrl });
    setShortUrl(`http://localhost:5000/${res.data.shortUrl}`);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="url" value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} required />
        <button type="submit">Acortar</button>
      </form>
      {shortUrl && <p>URL Acortada: <a href={shortUrl}>{shortUrl}</a></p>}
    </div>
  );
};

export default UrlForm;
📌 Paso 3: Integrarlo en App.js
javascript
Copiar
Editar
import UrlForm from "./components/UrlForm";

function App() {
  return (
    <div>
      <h1>Acortador de URLs</h1>
      <UrlForm />
    </div>
  );
}

export default App;
🚀 4. Correr Todo el Proyecto
1️⃣ Iniciar el backend

bash
Copiar
Editar
cd backend
node index.js
2️⃣ Iniciar el frontend

bash
Copiar
Editar
cd frontend
npm start