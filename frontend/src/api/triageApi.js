import api from "./axios";
import { getOfflineAssessment } from "../utils/offlineFallback";
import { queueOfflineRecord, getQueue, clearQueue } from "../utils/syncQueue";

// Tries the real AI-backed endpoint first. If the network request fails
// (no connectivity, timeout, backend unreachable), falls back to the local
// rules table and queues the record so it can be synced later.
export async function submitTriage(formData) {
  if (!navigator.onLine) {
    return runOffline(formData);
  }

  try {
    const res = await api.post("/triage", formData, { timeout: 8000 });
    return { ...res.data, isOffline: false };
  } catch (err) {
    return runOffline(formData);
  }
}

function runOffline(formData) {
  const assessment = getOfflineAssessment(formData.symptoms);
  const record = { ...formData, ...assessment, source: "offline_fallback" };
  queueOfflineRecord(record);
  return { ...record, isOffline: true };
}

export async function syncQueuedRecords() {
  const queue = getQueue();
  if (queue.length === 0) return { syncedCount: 0 };

  const res = await api.post("/triage/sync", { records: queue });
  clearQueue();
  return res.data;
}

export async function fetchHistory() {
  const res = await api.get("/triage/history");
  return res.data;
}
