require("dotenv").config();
const mongoose = require("mongoose");
const Escenario = require("./models/Escenario");
const escenariosData = require("./data/escenario1.json");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Conexión a MongoDB. Insertando datos...");
    await Escenario.deleteMany({});
    await Escenario.create(escenariosData);
    console.log("Datos insertados correctamente.");
    process.exit();
  })
  .catch((error) => {
    console.error("Error al conectar a MongoDB:", error);
    process.exit();
  });
