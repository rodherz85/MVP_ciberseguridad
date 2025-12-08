const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const engine = require("ejs-mate");
require("dotenv").config();

const Usuario = require("./models/Usuario"); //Modelo base de datos

const app = express();
const port = 3000;

// --- CONFIGURACIÓN DEL MOTOR DE VISTAS ---
app.engine("ejs", engine);
app.locals._layoutFile = 'simulador_layout';
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --- SERVIR ARCHIVOS ESTÁTICOS (CSS, JS, IMÁGENES) ---
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- CONEXIÓN A LA BASE DE DATOS ---


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Conectado a la base de datos MongoDB");
  })
  .catch((error) => {
    console.error("Error al conectar a la base de datos MongoDB:", error);
  });

// --- RUTAS DEL BACKEND ---

app.get("/", (req, res) => {
  res.send("bienvenida", { title: "Bienvenida" });
});

// Crear usuario

app.post("/comenzar", async (req, res) => {
  try {
    const nuevoUsuario = new Usuario({
      edad: req.body.edad,
      consentimiento: req.body.consentimiento === 'on'
    });
    await nuevoUsuario.save();
    res.redirect(`/pretest?uid=${nuevoUsuario._id}`);
  } catch (error) {
    console.error(error);
    res.send("Error al crear el usuario");
  } 
});

  // RUTA DEL PRETEST
app.get("/pretest", (req, res) => {
  const userId = req.query.uid;
  if (!userId) return res.redirect("/");
  // AGREGAMOS bodyClass: "pretest" AQUÍ
  res.render("pretest", { 
      title: "Test Conocimientos Iniciales", 
      bodyClass: "pretest",
      userId: userId
  });
});

app.post("/pretest", async (req, res) => {
  const { userId, ...respuestas } = req.body;
  try {
    await Usuario.findByIdAndUpdate(userId, {
      pretest: { respuestas: respuestas }
    });
    res.redirect(`/correo?uid=${userId}`);
  } catch (error) {
    console.error(error);
    res.send("Error al guardar las respuestas del pretest");
  }
});

app.get("/correo", (req, res) => {

  const userId = req.query.uid;
  // AGREGAMOS bodyClass: "simulador" AQUÍ
  res.render("correo", { 
      title: "Simulador", 
      bodyClass: "simulador",
      userId: userId
  });
});

//Ruta intermedia
app.post("/guardar-simulacion", async (req, res) => {
  const { userId, datosSimulacion } = req.body;
  try {
    const resultados = JSON.parse(datosSimulacion);
    let contadorAciertos = 0;
    Object.values(resultados).forEach(valor => {
      if (valor === "acierto") contadorAciertos++;
    });
    await Usuario.findByIdAndUpdate(userId, {
      "simulador.estadoAsunto": resultados.asunto,
      "simulador.estadoRemitente": resultados.remitente,
      "simulador.estadoSoporte": resultados.soporte,
      "simulador.estadoSaludo": resultados.saludo,
      "simulador.estadoOrtografia": resultados.ortografia,
      "simulador.estadoUrgencia": resultados.urgencia,
      "simulador.estadoBoton": resultados.boton, 
      "simulador.estadoFooter": resultados.footer,
      "simulador.puntajeTotal": contadorAciertos
    });
    res.redirect(`/posttest?uid=${userId}`); 
  } catch (error) {
    console.error(error);
    res.send("Error al guardar los resultados de la simulación");
  }
});

// RUTA DEL POSTTEST + ENCUESTA
app.get("/posttest", (req, res) => {
  const userId = req.query.uid;
  res.render("posttest", { 
      title: "Test Final", 
      bodyClass: "posttest",// <--- Esto activará el CSS de arriba
      userId: userId
  });
});

app.post("/posttest", async (req, res) => {
  const { userId, s1, s2, s3, s4, ...respuestasTest } = req.body;

  try {
    await Usuario.findByIdAndUpdate(userId, {
      "posttest.respuestas": respuestasTest,
      "encuestaSatisfaccion.interes": s1,
      "encuestaSatisfaccion.utilidad": s2,
      "encuestaSatisfaccion.claridadRetro": s3,
      "encuestaSatisfaccion.satisfaccion": s4,
      fechaFin: Date.now()
    });
    res.redirect("/resultados");
  } catch (error) {
    console.error(error);
    res.send("Error al guardar las respuestas del posttest y la encuesta");
  }
});















