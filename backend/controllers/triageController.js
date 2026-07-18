const Triage = require("../models/Triage");
const { getTriageAssessment } = require("../utils/groq");

// Called when the health worker's device is online. Runs the real AI assessment.
exports.createTriage = async (req, res) => {
  try {
    const { patientAge, patientGender, symptoms, durationHours, vitals } = req.body;

    if (!patientAge || !patientGender || !symptoms || !durationHours) {
      return res.status(400).json({ message: "Missing required patient fields" });
    }

    const assessment = await getTriageAssessment({
      age: patientAge,
      gender: patientGender,
      symptoms,
      durationHours,
      vitals,
    });

    const record = await Triage.create({
      healthWorker: req.userId,
      patientAge,
      patientGender,
      symptoms,
      durationHours,
      vitals,
      urgency: assessment.urgency,
      recommendedAction: assessment.recommendedAction,
      reasoning: assessment.reasoning,
      source: "ai",
      synced: true,
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: "Triage assessment failed", error: err.message });
  }
};

// Used to push records that were created offline (via the local fallback table)
// once the device reconnects. Skips re-running the AI, just persists what was
// already shown to the health worker.
exports.syncOfflineTriage = async (req, res) => {
  try {
    const records = req.body.records || [];
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "No records to sync" });
    }

    const saved = await Triage.insertMany(
      records.map((r) => ({
        healthWorker: req.userId,
        patientAge: r.patientAge,
        patientGender: r.patientGender,
        symptoms: r.symptoms,
        durationHours: r.durationHours,
        vitals: r.vitals,
        urgency: r.urgency,
        recommendedAction: r.recommendedAction,
        reasoning: r.reasoning,
        source: "offline_fallback",
        synced: true,
        createdAt: r.createdAt || new Date(),
      }))
    );

    res.status(201).json({ syncedCount: saved.length });
  } catch (err) {
    res.status(500).json({ message: "Sync failed", error: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const records = await Triage.find({ healthWorker: req.userId }).sort({ createdAt: -1 }).limit(100);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch history", error: err.message });
  }
};
