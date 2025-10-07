// src/routes/tracking.js

const express = require("express");
const router = express.Router();
const TrackingEvent = require("../models/TrackingEvent");
const { utcToZonedTime, format } = require("date-fns-tz");
const geoip = require("geoip-lite"); // <-- NÃO ESQUEÇA DE IMPORTAR

// ROTA POST CORRIGIDA
router.post("/", async (req, res) => {
  try {
    // 1. Extraia o 'device' também
    const { eventType, target, source, device } = req.body;

    if (!eventType || (eventType === "click" && !target)) {
      return res.status(400).json({ message: "Dados insuficientes." });
    }

    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");

    // 2. Calcule a geolocalização
    const geo = geoip.lookup(ipAddress);

    const newEvent = new TrackingEvent({
      eventType,
      target,
      source,
      ipAddress,
      userAgent,
      // 3. Adicione os campos que estavam faltando
      geo: {
        country: geo ? geo.country : "Unknown",
        city: geo ? geo.city : "Unknown",
      },
      device: device,
    });

    await newEvent.save();

    res.status(201).json({ message: "Evento registrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao registrar evento:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

// Sua rota GET está correta, não precisa de alterações.
router.get("/", async (req, res) => {
  // ... seu código GET está OK ...
});

module.exports = router;
