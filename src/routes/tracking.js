// // src/routes/tracking.js 1.0

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

// src/routes/tracking.js - Versão 2.0 com Validação Robusta
//Versão 2.0
const express = require("express");
const router = express.Router();
const TrackingEvent = require("../models/TrackingEvent");
const geoip = require("geoip-lite");

router.post("/", async (req, res) => {
  try {
    const { eventType, target, source, page } = req.body;

    // --- INÍCIO DA NOVA LÓGICA DE VALIDAÇÃO ---

    // Primeiro, checamos se o tipo de evento existe
    if (!eventType) {
      return res
        .status(400)
        .json({ message: "O campo 'eventType' é obrigatório." });
    }

    // Agora, validamos cada tipo de evento especificamente
    switch (eventType) {
      case "visit":
        // Para uma visita, o campo 'page' é essencial.
        if (!page) {
          return res
            .status(400)
            .json({
              message: "Eventos do tipo 'visit' devem conter o campo 'page'.",
            });
        }
        break; // Se for válido, continua

      case "click":
        // Para um clique, tanto 'target' quanto 'page' são essenciais.
        if (!target || !page) {
          return res
            .status(400)
            .json({
              message:
                "Eventos do tipo 'click' devem conter os campos 'target' e 'page'.",
            });
        }
        break; // Se for válido, continua

      default:
        // Se for um eventType desconhecido, podemos rejeitá-lo.
        return res
          .status(400)
          .json({ message: `Tipo de evento desconhecido: '${eventType}'` });
    }

    // --- FIM DA NOVA LÓGICA DE VALIDAÇÃO ---

    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");
    const geo = geoip.lookup(ipAddress);

    const newEvent = new TrackingEvent({
      eventType,
      target,
      source,
      page,
      ipAddress,
      userAgent,
      geo: {
        country: geo ? geo.country : "Unknown",
        city: geo ? geo.city : "Unknown",
      },
    });

    await newEvent.save();

    res.status(201).json({ message: "Evento registrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao registrar evento:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

// A rota GET continua a mesma...
router.get("/", async (req, res) => {
  try {
    const events = await TrackingEvent.find({}).sort({ timestamp: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

module.exports = router;
