const mongoose = require("mongoose");

const triageSchema = new mongoose.Schema(
  {
    healthWorker: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    patientAge: { type: Number, required: true },
    patientGender: { type: String, enum: ["male", "female", "other"], required: true },
    symptoms: { type: String, required: true }, // free text, comma separated
    durationHours: { type: Number, required: true },
    vitals: {
      temperatureF: Number,
      pulse: Number,
      systolicBP: Number,
      diastolicBP: Number,
      spo2: Number,
    },
    urgency: { type: String, enum: ["red", "yellow", "green"], required: true },
    recommendedAction: { type: String, required: true },
    reasoning: { type: String, required: true },
    source: { type: String, enum: ["ai", "offline_fallback"], default: "ai" },
    synced: { type: Boolean, default: true }, // false if it was created offline and queued
  },
  { timestamps: true }
);

module.exports = mongoose.model("Triage", triageSchema);
