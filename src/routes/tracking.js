// src/routes/tracking.js 0.1
// Testando as funcionalidades da estrutura do codigo
const express = require("express");
const router = express.Router();
const TrackingEvent = require("../models/TrackingEvent");
const geoip = require("geoip-lite");

router.post("/", async (req, res) => {
  try {
    // NOVO: Extraímos 'source' do corpo da requisição
    const { eventType, target, source } = req.body;

    if (!eventType || (eventType === "click" && !target)) {
      return res.status(400).json({ message: "Dados insuficientes." });
    }

    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");

    const geo = geoip.lookup(ipAddress);

    const newEvent = new TrackingEvent({
      eventType,
      target,
      source, // NOVO: Adicionamos o source ao objeto que será salvo
      ipAddress,
      userAgent,
      geo: {
        country: geo ? geo.country : "Unknown", // Ex: 'BR'
        city: geo ? geo.city : "Unknown", // Ex: 'Fortaleza'
      },
    });

    await newEvent.save();

    res.status(201).json({ message: "Evento registrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao registrar evento:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

router.get("/", async (req, res) => {
  try {
    // Busca todos os eventos no banco de dados e ordena pelos mais recentes
    const events = await TrackingEvent.find({}).sort({ timestamp: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

module.exports = router;
