// src/server.js - VERSÃO CORRIGIDA

// Carrega as variáveis de ambiente do arquivo .env
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const trackingRoutes = require("./routes/tracking");

// 1. INICIALIZAÇÃO DO APP - Deve vir logo após os imports.
const app = express();
const PORT = process.env.PORT || 3001;

// 2. CONFIGURAÇÃO DO CORS - Apenas uma vez, com suas opções.
// Isso diz ao seu backend para aceitar requisições SOMENTE do seu frontend.
const corsOptions = {
  origin: "https://grupo3giluminacao.com.br", // Removi a barra "/" no final por padrão
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// 3. OUTROS MIDDLEWARES
// Devem vir depois da inicialização do app e do CORS.
app.use(express.json()); // Habilita o servidor a entender requisições com corpo em JSON
app.set("trust proxy", true); // Necessário para obter o IP correto se estiver atrás de um proxy

// 4. CONEXÃO COM O BANCO DE DADOS
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conectado ao MongoDB com sucesso!"))
  .catch((err) => console.error("Falha ao conectar ao MongoDB:", err));

// 5. ROTAS DA API
app.use("/api/track", trackingRoutes);

// 6. INICIA O SERVIDOR - Sempre a última coisa
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});
