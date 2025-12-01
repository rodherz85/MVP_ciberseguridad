const express = require("express");
const router = express.Router();
const Escenario = require("../models/Escenario");

// GET /api/escenarios → obtiene un escenario desde MongoDB
router.get("/", async (req, res) => {
  try {
    const escenario = await Escenario.findOne(); // Trae el único escenario
    res.json(escenario);
  } catch (error) {
    console.error("Error al obtener escenario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

module.exports = router;
