// // // src/routes/tracking.js 1.0

// const express = require("express");
// const router = express.Router();
// const TrackingEvent = require("../models/TrackingEvent");
// const geoip = require("geoip-lite");

// router.post("/", async (req, res) => {
//   try {
//     // NOVO: Extraímos 'source' do corpo da requisição
//     const { eventType, target, source, page } = req.body;

//     if (!eventType || (eventType === "click" && !target)) {
//       return res.status(400).json({ message: "Dados insuficientes." });
//     }

//     const ipAddress = req.ip;
//     const userAgent = req.get("user-agent");

//     const geo = geoip.lookup(ipAddress);

//     const newEvent = new TrackingEvent({
//       eventType,
//       target,
//       source,
//       page,
//       ipAddress,
//       userAgent,
//       geo: {
//         country: geo ? geo.country : "Unknown", // Ex: 'BR'
//         city: geo ? geo.city : "Unknown", // Ex: 'Fortaleza'
//       },
//     });

//     await newEvent.save();

//     res.status(201).json({ message: "Evento registrado com sucesso!" });
//   } catch (error) {
//     console.error("Erro ao registrar evento:", error);
//     res.status(500).json({ message: "Erro interno no servidor." });
//   }
// });

// router.get("/", async (req, res) => {
//   try {
//     // Busca todos os eventos no banco de dados e ordena pelos mais recentes
//     const events = await TrackingEvent.find({}).sort({ timestamp: -1 });
//     res.status(200).json(events);
//   } catch (error) {
//     console.error("Erro ao buscar eventos:", error);
//     res.status(500).json({ message: "Erro interno no servidor." });
//   }
// });

// module.exports = router;

// // src/routes/tracking.js 2.0

const express = require("express");
const router = express.Router();
const TrackingEvent = require("../models/TrackingEvent");
const geoip = require("geoip-lite");

router.post("/", async (req, res) => {
  try {
    // Extraímos os dados do corpo da requisição
    const { eventType, target, source, page } = req.body;

    // Tratamento especial para página inicial
    let normalizedPage = page;
    if (!page || page === "/" || page === "") {
      normalizedPage = "LandiPage"; // Define 'home' como valor padrão para a página inicial
    }

    // Validação para eventType "visit" - página será sempre preenchida agora
    if (eventType === "visit" && !normalizedPage) {
      return res.status(400).json({
        message: "Para eventos do tipo 'visit', o campo 'page' é obrigatório.",
      });
    }

    // Validação para eventType "click" - deve ter target
    if (eventType === "click" && !target) {
      return res.status(400).json({
        message:
          "Para eventos do tipo 'click', o campo 'target' é obrigatório.",
      });
    }

    // Validação geral do eventType
    if (!eventType || !["visit", "click"].includes(eventType)) {
      return res.status(400).json({
        message:
          "O campo 'eventType' é obrigatório e deve ser 'visit' ou 'click'.",
      });
    }

    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");

    const geo = geoip.lookup(ipAddress);

    const newEvent = new TrackingEvent({
      eventType,
      target,
      source,
      page: normalizedPage, // Usa a página normalizada
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
