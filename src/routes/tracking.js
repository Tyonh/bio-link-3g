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

router.get("/", async (req, res) => {
  try {
    const eventsRaw = await TrackingEvent.find({}).sort({ timestamp: -1 });

    // Define o fuso horário do Brasil
    const timeZone = "America/Sao_Paulo";

    // Transforma os dados antes de enviar
    const eventsFormatted = eventsRaw.map((event) => {
      // Converte a data UTC do banco para o fuso horário de São Paulo
      const zonedDate = utcToZonedTime(event.timestamp, timeZone);
      // Formata a data convertida para o padrão brasileiro
      const formattedTimestamp = format(zonedDate, "dd/MM/yyyy HH:mm:ss", {
        timeZone,
      });

      // Retorna um novo objeto com a data formatada
      return {
        _id: event._id,
        eventType: event.eventType,
        source: event.source,
        target: event.target,
        ipAddress: event.ipAddress,
        timestamp: formattedTimestamp, // <-- A data agora está formatada
        geo: event.geo,
        device: event.device,
      };
    });

    res.status(200).json(eventsFormatted);
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

module.exports = router;
