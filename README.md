# SahayakAI — AI Symptom Triage Assistant for Low-Connectivity Rural Clinics

Built for Idea2Impact Online Hackathon 2026, Theme 3: Crisis Management, HealthTech & Emergency Response.

A rural health worker enters a patient's age, symptoms, duration, and basic vitals. The app returns
a Red / Yellow / Green urgency tier, a plain-language recommended action, and the reasoning behind it —
so a worker with no formal diagnostic training can make a faster, more consistent triage decision.

## Why it's different

Most symptom checkers assume a smartphone user researching their own symptoms with a stable connection.
This assumes the opposite: a health worker triaging someone else, on a low-end device, in a place where
the network may drop mid-shift. If the AI call fails, the app falls back to a small local rules table,
clearly labels the result as an offline estimate, and queues it to sync with the backend the moment
connectivity returns — instead of just failing.

## Tech stack

- **Frontend:** React + Vite, React Router, Axios
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth
- **AI:** Groq API (Llama 3.3 70B) with structured JSON output for urgency classification
- **Deployment:** Vercel (frontend) + Render (backend)

## Project structure

```
sahayak-ai/
├── backend/
│   ├── config/db.js
│   ├── models/User.js, Triage.js
│   ├── controllers/authController.js, triageController.js
│   ├── routes/authRoutes.js, triageRoutes.js
│   ├── middleware/auth.js
│   ├── utils/groq.js
│   └── server.js
└── frontend/
    └── src/
        ├── pages/Login.jsx, Register.jsx, Triage.jsx, History.jsx
        ├── api/axios.js, triageApi.js
        ├── utils/offlineFallback.js, syncQueue.js
        └── context/AuthContext.jsx
```

## How the AI triage works

1. Health worker submits patient details through the form.
2. Backend sends a structured prompt to Groq, requiring a JSON response with `urgency`, `recommendedAction`,
   and `reasoning`.
3. Result is shown immediately and saved to MongoDB against the health worker's account.
4. If the request fails (offline, timeout), the frontend runs a local keyword-based fallback, shows the
   result tagged as an offline estimate, and stores it in a local queue.
5. When the browser detects it's back online, queued records are pushed to `/api/triage/sync` and persisted.

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, GROQ_API_KEY
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev
```

## API reference

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create a health worker account |
| POST | `/api/auth/login` | — | Log in, returns JWT |
| POST | `/api/triage` | Bearer token | Run AI triage assessment on a patient |
| POST | `/api/triage/sync` | Bearer token | Push queued offline records |
| GET | `/api/triage/history` | Bearer token | List past triage records |

## Deployment notes

- Backend on Render: set `MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`, `CLIENT_ORIGIN` as environment variables.
- Frontend on Vercel: set `VITE_API_URL` to the deployed backend URL, e.g. `https://sahayak-ai-backend.onrender.com/api`.
- Test the deployed link from a phone on mobile data, not just localhost — that's the actual use case.

## Disclaimer

This is a triage support tool for a hackathon prototype, not a certified medical device. It does not
diagnose conditions — it estimates urgency to support (not replace) a health worker's judgment.
