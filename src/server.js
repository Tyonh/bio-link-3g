// src/server.js

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const trackingRoutes = require("./routes/tracking");

const app = express();
const PORT = process.env.PORT || 3001;

// 2. CONFIGURAÇÃO DO CORS - O PONTO CRÍTICO
const corsOptions = {
  origin: "https://grupo3giluminacao.com.br",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.set("trust proxy", true);

mongoose
  .connect(process.env.MONGO_URI, {
    /*...*/
  })
  .then(() => console.log("Conectado ao MongoDB com sucesso!"))
  .catch((err) => console.error("Falha ao conectar ao MongoDB:", err));

app.use("/api/track", trackingRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});
