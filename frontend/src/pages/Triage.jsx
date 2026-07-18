import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { submitTriage, syncQueuedRecords } from "../api/triageApi";
import { queueLength } from "../utils/syncQueue";

const URGENCY_LABEL = {
  red: "RED — Emergency",
  yellow: "YELLOW — Refer soon",
  green: "GREEN — Manage locally",
};

export default function Triage() {
  const [form, setForm] = useState({
    patientAge: "",
    patientGender: "female",
    symptoms: "",
    durationHours: "",
    vitals: { temperatureF: "", pulse: "", systolicBP: "", diastolicBP: "", spo2: "" },
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingSync, setPendingSync] = useState(queueLength());

  useEffect(() => {
    function handleOnline() {
      if (queueLength() > 0) {
        syncQueuedRecords().then(() => setPendingSync(queueLength()));
      }
    }
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateVital(field, value) {
    setForm((f) => ({ ...f, vitals: { ...f.vitals, [field]: value } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        ...form,
        patientAge: Number(form.patientAge),
        durationHours: Number(form.durationHours),
      };
      const res = await submitTriage(payload);
      setResult(res);
      setPendingSync(queueLength());
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="triage-page">
      <header className="top-bar">
        <h1>SahayakAI</h1>
        <nav>
          <Link to="/history">History</Link>
          {pendingSync > 0 && <span className="badge">{pendingSync} pending sync</span>}
        </nav>
      </header>

      <form onSubmit={handleSubmit} className="triage-form">
        <div className="row">
          <input type="number" placeholder="Patient age" value={form.patientAge} onChange={(e) => update("patientAge", e.target.value)} required min="0" />
          <select value={form.patientGender} onChange={(e) => update("patientGender", e.target.value)}>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
          <input type="number" placeholder="Duration (hours)" value={form.durationHours} onChange={(e) => update("durationHours", e.target.value)} required min="0" />
        </div>

        <textarea
          placeholder="Symptoms (e.g. high fever, cough, difficulty breathing)"
          value={form.symptoms}
          onChange={(e) => update("symptoms", e.target.value)}
          required
          rows={3}
        />

        <div className="row vitals">
          <input type="number" placeholder="Temp (°F)" value={form.vitals.temperatureF} onChange={(e) => updateVital("temperatureF", e.target.value)} />
          <input type="number" placeholder="Pulse" value={form.vitals.pulse} onChange={(e) => updateVital("pulse", e.target.value)} />
          <input type="number" placeholder="SpO2 (%)" value={form.vitals.spo2} onChange={(e) => updateVital("spo2", e.target.value)} />
          <input type="number" placeholder="Systolic BP" value={form.vitals.systolicBP} onChange={(e) => updateVital("systolicBP", e.target.value)} />
          <input type="number" placeholder="Diastolic BP" value={form.vitals.diastolicBP} onChange={(e) => updateVital("diastolicBP", e.target.value)} />
        </div>

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? "Assessing..." : "Get Triage Assessment"}</button>
      </form>

      {result && (
        <div className={`result-card urgency-${result.urgency}`}>
          <h2>{URGENCY_LABEL[result.urgency]}</h2>
          {result.isOffline && <p className="offline-tag">Offline estimate — will sync when connection returns</p>}
          <p><strong>Recommended action:</strong> {result.recommendedAction}</p>
          <p><strong>Why:</strong> {result.reasoning}</p>
        </div>
      )}
    </div>
  );
}
