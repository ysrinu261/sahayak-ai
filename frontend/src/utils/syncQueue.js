const QUEUE_KEY = "sahayak_offline_queue";

export function queueOfflineRecord(record) {
  const queue = getQueue();
  queue.push({ ...record, createdAt: new Date().toISOString() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function getQueue() {
  const raw = localStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

export function queueLength() {
  return getQueue().length;
}
