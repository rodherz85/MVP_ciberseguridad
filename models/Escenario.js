//importar mongoose
const mongoose = require("mongoose");

const pistaSchema = new mongoose.Schema({
  id: String,
  tipo: String,
  texto: String,
});

const escenarioSchema = new mongoose.Schema({
  id: Number,
  nombre: String,
  sender: String,
  subject: String,
  cuerpo: String,
  pistas: [pistaSchema],
  decisionCorrecta: String,
  feedback: {
    exito: String,
    fallo: String,
  },
});

module.exports = mongoose.model("Escenario", escenarioSchema);
