const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const engine = require("ejs-mate");
require("dotenv").config();

const Usuario = require("./models/Usuario"); //Modelo base de datos
const e = require("express");

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
  res.render("bienvenida", { 
    title: "Bienvenida",
    bodyClass: "bienvenida"
  });
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
    let sumaPuntos = 0;
    Object.values(resultados).forEach(estado => {
      if (estado === "acierto") {
        sumaPuntos += 6;
      }else if (estado === "fallo") {
        sumaPuntos += 3;
      }
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
      
      "simulador.puntajeTotal": sumaPuntos
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
    res.redirect(`/resultados?uid=${userId}`);
  } catch (error) {
    console.error(error);
    res.send("Error al guardar las respuestas del posttest y la encuesta");
  }
});

app.get("/resultados", async(req, res) => {
  const userId = req.query.uid;
  if (!userId) return res.redirect("/");

  try {
    const usuario = await Usuario.findById(userId);
    const sim = usuario.simulador || {};

    const listaPistas = [
      {
        key: 'estadoAsunto',
        nombre: 'Asunto alarmista',
        mensajes: {
          acierto: "Excelente, identificaste el asunto alarmista, buscaba asustarte.",
          fallo: "Casi lo logras, identicaste la pista pero recuerda que los bancos nunca ponen amenazas en el asunto.",
          no_visto: "Se te pasó! Desconfía siempre de los asuntos que digan URGENTE o BLOQUEO."
        }
      },
      {
        key: 'estadoRemitente', 
        nombre: 'Remitente falso',
        mensajes: {
          acierto: "Muy bien, viste que el remitente del correo no provenía del sitio oficial del banco.",
          fallo: "Ojo, lo viste pero no lo consideraste un riesgo. Siempre verifica el remitente del correo, debe ser del sitio oficial",
          no_visto: "Se te pasó! Siempre debes estar atento a quien envía el correo."
        }
      },
      {
        key: 'estadoSoporte', 
        nombre: 'Teléfono de soporte',
        mensajes: {
          acierto: "Correcto, identificaste que el número de soporte no era el oficial del banco.",
          fallo: "Casi lo logras, viste el número pero no lo consideraste un riesgo. Recuerda que los bancos nunca incluyen números personales.",
          no_visto: "Se te pasó! Los bancos nunca incluyen números de contacto en sus correos."
        }
      },  
      {
        key: 'estadoSaludo', 
        nombre: 'Saludo genérico',
        mensajes: {
          acierto: "Bien hecho, notaste que el saludo no era personalizado, no incluía tu nombre.",
          fallo: "Casi lo logras, viste el saludo genérico pero no lo consideraste un riesgo. Recuerda que los bancos siempre te saludan por tu nombre (o por tu rut).",
          no_visto: "Se te pasó! Los bancos siempre te saludan por tu nombre (o por tu rut).Desconfía de los saludos genéricos."
        },
      },
      {
        key: 'estadoOrtografia', 
        nombre: 'Errores ortográficos',
        mensajes: {
          acierto: "Excelente, notaste los errores ortográficos en el correo.",
          fallo: "Casi lo logras, viste el error pero no los consideraste un riesgo. Recuerda que los correos oficiales suelen estar bien escritos.",
          no_visto: "Se te pasó! Desconfía siempre de los correos que contienen errores ortográficos, lee cuidadosamente"
        }
      },
      {
        key: 'estadoUrgencia', 
        nombre: 'Solicitud de urgencia',
        mensajes: {
          acierto: "Muy bien, identificaste que el sentido de urgencia en el mensaje era sospechoso.",
          fallo: "Casi lo logras, encontraste la pista pero no lo consideraste un riesgo. Recuerda que los bancos nunca te presionan para actuar rápido.",
          no_visto: "Cuidado. Los estafadores usan el miedo para que actúes sin pensar."
        }
      },
      {
        key: 'estadoBoton', 
        nombre: 'Botón falso',
        mensajes: {
          acierto: "Correcto, viste que el botón era fraudulento y no dirigía al sitio oficial del banco.",
          fallo: "Casi lo logras, viste el botón pero no lo consideraste un riesgo. Recuerda siempre verificar los enlaces antes de hacer clic.",
          no_visto: "Se te pasó! Los bancos nunca incluyen botones de verificación en sus correos."
        }
        },
      {
        key: 'estadoFooter', 
        nombre: 'Pie de página falso',
        mensajes: {
          acierto: "Correcto, notaste que el pie de página no era el oficial del banco y estaba en otro idioma.",
          fallo: "Casi lo logras, viste el pie de página pero no lo consideraste un riesgo. Recuerda que los bancos siempre incluyen información oficial y actual en el pie de página.",
          no_visto: "Se te pasó! Desconfía siempre de los pies de página que no contienen información oficial o están en otro idioma."
        }
      }
    ];
    let puntajeTotal = 0;
    const puntajeMax = 48; // 8 pistas x 6 puntos cada una

    const evidencias = listaPistas.map(pista => {
      const estado = sim[pista.key];
      let puntos = 0;
      let icono = '❌';
      let claseColor = 'texto rojo';

      let feedbackTexto = pista.mensajes[estado];

      if (estado === 'acierto') {
        puntos = 6;
        icono = '✅';
        claseColor = 'texto verde';
      } else if (estado === 'fallo') {
        puntos = 3;
        icono = '⚠️';
        claseColor = 'texto amarillo';
      }
      puntajeTotal += puntos;
      return {
        nombre: pista.nombre,
        puntos: puntos,
        icono: icono,
        claseColor: claseColor,
        feedback: feedbackTexto
      };
    });

    res.render("resultados", {
      title: "Informe de Resultados",
      bodyClass: "resultados",
      puntajeObtenido: puntajeTotal,
      puntajeMax: puntajeMax,
      evidencias: evidencias
    });
  } catch (error) {
    console.error(error);
    res.send("Error al obtener los resultados del usuario");
  }
});

// --- RUTA DEMO (BORRAR DESPUÉS DE LA TESIS) ---
// Úsala entrando a: http://localhost:3000/demo-resultados
// --- RUTA DEMO (Para probar diseño visual con 3 columnas) ---
app.get("/demo-resultados", (req, res) => {
    
    // 1. Datos falsos completos con el feedback incluido
    const evidenciasFalsas = [
        { 
            nombre: 'Asunto Alarmista',    
            puntos: 6, 
            icono: '✅', 
            clase: 'texto-verde',
            feedback: '¡Bien! Detectaste que la urgencia en el asunto buscaba asustarte.'
        },
        { 
            nombre: 'Remitente Falso',     
            puntos: 3, 
            icono: '⚠️', 
            clase: 'texto-amarillo',
            feedback: 'Ojo, lo viste pero lo aceptaste. Siempre verifica el dominio.'
        },
        { 
            nombre: 'Teléfono Soporte',    
            puntos: 0, 
            icono: '❌', 
            clase: 'texto-rojo',
            feedback: 'No lo viste. Si tienes dudas, nunca llames al número del correo.'
        },
        { 
            nombre: 'Saludo Genérico',     
            puntos: 6, 
            icono: '✅', 
            clase: 'texto-verde',
            feedback: 'Muy bien. Un banco real se dirige a ti por tu nombre.'
        },
        { 
            nombre: 'Ortografía',          
            puntos: 6, 
            icono: '✅', 
            clase: 'texto-verde',
            feedback: '¡Ojo de águila! "Suspención" con "c" delató el fraude.'
        },
        { 
            nombre: 'Sentido de Urgencia', 
            puntos: 3, 
            icono: '⚠️', 
            clase: 'texto-amarillo',
            feedback: 'Sentiste la presión, pero cediste. Ningún banco da plazos fatales.'
        },
        { 
            nombre: 'Botón Falso',         
            puntos: 0, 
            icono: '❌', 
            clase: 'texto-rojo',
            feedback: 'Peligroso. El botón es la trampa final, no debiste confiar.'
        },
        { 
            nombre: 'Pie de Página',       
            puntos: 6, 
            icono: '✅', 
            clase: 'texto-verde',
            feedback: 'Buen detalle. El copyright y el año estaban desactualizados.'
        }
    ];

    // 2. Renderizamos la vista con estos datos inventados
    res.render("resultados", { 
        title: "Informe Demo",
        bodyClass: "resultados",
        puntajeObtenido: 30,
        puntajeMaximo: 48,
        evidencias: evidenciasFalsas 
    });
});




// --- INICIO DEL SERVIDOR ---
app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
});

