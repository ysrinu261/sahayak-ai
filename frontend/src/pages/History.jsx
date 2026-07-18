import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchHistory } from "../api/triageApi";

export default function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory()
      .then(setRecords)
      .catch(() => setError("Could not load history. Check your connection."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="history-page">
      <header className="top-bar">
        <h1>SahayakAI</h1>
        <nav><Link to="/triage">New Triage</Link></nav>
      </header>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="history-list">
        {records.map((r) => (
          <div key={r._id} className={`history-item urgency-${r.urgency}`}>
            <div className="history-item-header">
              <span className="tier">{r.urgency.toUpperCase()}</span>
              <span className="date">{new Date(r.createdAt).toLocaleString()}</span>
            </div>
            <p>Age {r.patientAge}, {r.patientGender} — {r.symptoms}</p>
            <p className="action">{r.recommendedAction}</p>
            {r.source === "offline_fallback" && <span className="offline-tag">Synced from offline record</span>}
          </div>
        ))}
        {!loading && records.length === 0 && <p>No triage records yet.</p>}
      </div>
    </div>
  );
}
