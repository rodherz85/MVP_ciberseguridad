const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const engine = require("ejs-mate");
require("dotenv").config();

const app = express();
const port = 3000;

// --- CONFIGURACIÓN DEL MOTOR DE VISTAS ---
app.engine("ejs", engine);
app.locals._layoutFile = 'simulador_layout';
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --- SERVIR ARCHIVOS ESTÁTICOS (CSS, JS, IMÁGENES) ---
app.use(express.static(path.join(__dirname, "public")));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Conectado a la base de datos MongoDB");
  })
  .catch((error) => {
    console.error("Error al conectar a la base de datos MongoDB:", error);
  });

// --- RUTAS DEL BACKEND ---
const escenariosRouter = require("./routes/escenarios");
app.use(express.json());
app.use("/escenarios", escenariosRouter);

// --- RUTA PRINCIPAL ---
app.get("/", (req, res) => {
  res.send("Servidor de ciberseguridad funcionando y conectado a MongoDB");
});

// --- RUTA DE PRUEBA ---
app.get("/prueba", (req, res) => {
  res.render("prueba", { title: "Página de Prueba EJS" });
});

// --- RUTA DE LA SIMULACIÓN (PANTALLA DEL CORREO) ---
const Escenario = require("./models/Escenario");

app.get("/correo", async (req, res) => {
  const escenario = await Escenario.findOne();
  // AGREGAMOS bodyClass: "simulador" AQUÍ
  res.render("correo", { 
      title: "Simulador", 
      escenario, 
      bodyClass: "simulador" 
  });
});

// RUTA DEL PRETEST
app.get("/pretest", async(req, res) => {
  // AGREGAMOS bodyClass: "pretest" AQUÍ
  res.render("pretest", { 
      title: "Test Conocimientos Iniciales", 
      bodyClass: "pretest" 
  });
});

// RUTA DEL POSTTEST
app.get("/posttest", (req, res) => {
  res.render("posttest", { 
      title: "Test Final", 
      bodyClass: "posttest" // <--- Esto activará el CSS de arriba
  });
});


// --- INICIO DEL SERVIDOR ---
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
