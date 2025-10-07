// src/models/TrackingEvent.js - VERSÃO ATUALIZADA

const mongoose = require("mongoose");

const trackingEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ["visit", "click"],
  },
  // NOVO: Campo para armazenar a origem do tráfego
  source: {
    type: String,
    // Se nenhuma origem for informada, o padrão será 'direct'
    default: "direct",
  },
  target: {
    type: String,
    required: function () {
      return this.eventType === "click";
    },
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  geo: {
    country: { type: String },
    city: { type: String },
  },
});

module.exports = mongoose.model("TrackingEvent", trackingEventSchema);
