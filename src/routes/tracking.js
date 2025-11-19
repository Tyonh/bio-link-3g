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

// const express = require("express");
// const router = express.Router();
// const TrackingEvent = require("../models/TrackingEvent");
// const geoip = require("geoip-lite");

// router.post("/", async (req, res) => {
//   try {
//     // Extraímos os dados do corpo da requisição
//     const { eventType, target, source, page } = req.body;

//     // Tratamento especial para página inicial
//     let normalizedPage = page;
//     // Verifica se a página corresponde à URL completa do site
//     if (
//       eventType === "visit" &&
//       (page === "https://grupo3giluminacao.com.br" ||
//         page === "https://www.grupo3giluminacao.com.br" ||
//         page === "http://grupo3giluminacao.com.br" ||
//         page === "https://grupo3giluminacao.com.br/" ||
//         page === "GRUPO 3G" ||
//         page === "/")
//     ) {
//       normalizedPage = "LandiPage"; // Define 'LandiPage' para a página inicial
//     }

//     // Validação para eventType "visit" - página será sempre preenchida agora
//     if (eventType === "visit" && !normalizedPage) {
//       return res.status(400).json({
//         message: "Para eventos do tipo 'visit', o campo 'page' é obrigatório.",
//       });
//     }

//     // Validação para eventType "click" - deve ter target
//     if (eventType === "click" && !target) {
//       return res.status(400).json({
//         message:
//           "Para eventos do tipo 'click', o campo 'target' é obrigatório.",
//       });
//     }

//     // Validação geral do eventType
//     if (!eventType || !["visit", "click"].includes(eventType)) {
//       return res.status(400).json({
//         message:
//           "O campo 'eventType' é obrigatório e deve ser 'visit' ou 'click'.",
//       });
//     }

//     const ipAddress = req.ip;
//     const userAgent = req.get("user-agent");

//     const geo = geoip.lookup(ipAddress);

//     const newEvent = new TrackingEvent({
//       eventType,
//       target,
//       source,
//       page: normalizedPage, // Usa a página normalizada
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

// src/routes/tracking.js 3.0
const express = require("express");
const router = express.Router();
const TrackingEvent = require("../models/TrackingEvent");
const geoip = require("geoip-lite");

// Middleware para extrair IP real (importante para proxies/Heroku)
const getClientIp = (req) => {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
    "127.0.0.1"
  );
};

router.post("/", async (req, res) => {
  try {
    // Extraímos os dados do corpo da requisição
    const { eventType, target, source, page } = req.body;

    console.log("Recebendo evento:", { eventType, target, source, page }); // DEBUG

    // Validação geral do eventType
    if (!eventType || !["visit", "click"].includes(eventType)) {
      return res.status(400).json({
        message:
          "O campo 'eventType' é obrigatório e deve ser 'visit' ou 'click'.",
      });
    }

    // Validação específica para cada tipo de evento
    if (eventType === "visit") {
      if (!page) {
        return res.status(400).json({
          message:
            "Para eventos do tipo 'visit', o campo 'page' é obrigatório.",
        });
      }
    }

    if (eventType === "click") {
      if (!target) {
        return res.status(400).json({
          message:
            "Para eventos do tipo 'click', o campo 'target' é obrigatório.",
        });
      }
    }

    // Tratamento especial para página inicial
    let normalizedPage = page;
    if (
      eventType === "visit" &&
      (page === "https://grupo3giluminacao.com.br" ||
        page === "https://www.grupo3giluminacao.com.br" ||
        page === "http://grupo3giluminacao.com.br" ||
        page === "https://grupo3giluminacao.com.br/" ||
        page === "GRUPO 3G" ||
        page === "/" ||
        !page) // Adicionado tratamento para page vazia
    ) {
      normalizedPage = "LandiPage";
    }

    // Para clicks sem página definida, usar uma padrão
    if (eventType === "click" && !normalizedPage) {
      normalizedPage = "Unknown Page";
    }

    const ipAddress = getClientIp(req);
    const userAgent = req.get("user-agent");

    console.log("IP detectado:", ipAddress); // DEBUG

    const geo = geoip.lookup(ipAddress);

    const eventData = {
      eventType,
      target: eventType === "click" ? target : undefined,
      source: source || undefined,
      page: normalizedPage,
      ipAddress,
      userAgent,
      geo: {
        country: geo ? geo.country : "Unknown",
        city: geo ? geo.city : "Unknown",
        region: geo ? geo.region : "Unknown",
      },
    };

    console.log("Salvando evento:", eventData); // DEBUG

    const newEvent = new TrackingEvent(eventData);
    await newEvent.save();

    console.log("Evento salvo com sucesso!"); // DEBUG

    res.status(201).json({
      message: "Evento registrado com sucesso!",
      eventId: newEvent._id,
    });
  } catch (error) {
    console.error("Erro ao registrar evento:", error);
    res.status(500).json({
      message: "Erro interno no servidor.",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const events = await TrackingEvent.find({}).sort({ timestamp: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

// Rota para estatísticas (útil para debug)
router.get("/stats", async (req, res) => {
  try {
    const totalEvents = await TrackingEvent.countDocuments();
    const visits = await TrackingEvent.countDocuments({ eventType: "visit" });
    const clicks = await TrackingEvent.countDocuments({ eventType: "click" });

    res.status(200).json({
      totalEvents,
      visits,
      clicks,
      clicksByTarget: await TrackingEvent.aggregate([
        { $match: { eventType: "click" } },
        { $group: { _id: "$target", count: { $sum: 1 } } },
      ]),
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

module.exports = router;
