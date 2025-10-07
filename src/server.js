// src/server.js

// Carrega as variáveis de ambiente do arquivo .env
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const trackingRoutes = require("./routes/tracking");

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares ---
app.use(cors()); // Habilita CORS para permitir acesso do seu frontend
app.use(express.json()); // Habilita o servidor a entender requisições com corpo em JSON
app.set("trust proxy", true); // Necessário para obter o IP correto se estiver atrás de um proxy (ex: Heroku, Vercel)

// --- Conexão com o Banco de Dados ---
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conectado ao MongoDB com sucesso!"))
  .catch((err) => console.error("Falha ao conectar ao MongoDB:", err));

// --- Rotas da API ---
app.use("/api/track", trackingRoutes); // Centraliza todas as rotas de tracking em /api/track

// --- Inicia o Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});
