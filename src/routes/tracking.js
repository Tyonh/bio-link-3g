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
    // Adiciona um pequeno delay para garantir que o evento seja processado (100ms)
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Extraímos os dados do corpo da requisição com valores padrão
    const {
      eventType = "visit",
      target = null,
      source = "direct",
      page = "/",
      userAgentData = req.get("user-agent") || "unknown",
    } = req.body;

    // Tratamento especial para página inicial com verificação mais robusta
    let normalizedPage = page || "/";
    // Verifica se a página corresponde à URL completa do site
    if (
      eventType === "visit" &&
      (page === "https://grupo3giluminacao.com.br" ||
        page === "https://www.grupo3giluminacao.com.br" ||
        page === "http://grupo3giluminacao.com.br" ||
        page === "https://grupo3giluminacao.com.br/" ||
        page === "GRUPO 3G" ||
        page === "/")
    ) {
      normalizedPage = "LandiPage"; // Define 'LandiPage' para a página inicial
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

    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
    const userAgent = req.get("user-agent") || userAgentData || "unknown";

    // Tenta obter informações geográficas com retry
    let geo = null;
    try {
      geo = geoip.lookup(ipAddress);
      if (!geo && ipAddress !== "unknown") {
        // Segunda tentativa após 50ms
        await new Promise((resolve) => setTimeout(resolve, 50));
        geo = geoip.lookup(ipAddress);
      }
    } catch (geoError) {
      console.error("Erro ao obter localização:", geoError);
    }

    // Cria o evento com validações extras
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

    // Tenta salvar com retry em caso de falha
    let savedEvent = null;
    let retryCount = 0;
    const maxRetries = 3;

    while (!savedEvent && retryCount < maxRetries) {
      try {
        savedEvent = await newEvent.save();
        break;
      } catch (saveError) {
        retryCount++;
        console.error(`Tentativa ${retryCount} falhou:`, saveError);
        if (retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 100 * retryCount));
        }
      }
    }

    if (savedEvent) {
      res.status(201).json({
        message: "Evento registrado com sucesso!",
        eventId: savedEvent._id,
      });
    } else {
      throw new Error("Falha ao salvar após várias tentativas");
    }
  } catch (error) {
    console.error("Erro ao registrar evento:", error);
    // Garante que o cliente receba uma resposta mesmo em caso de erro
    res.status(500).json({
      message: "Erro interno no servidor.",
      error: error.message,
    });
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
