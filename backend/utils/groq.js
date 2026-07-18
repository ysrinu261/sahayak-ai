const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a clinical triage support assistant helping a rural community health worker
who has no formal diagnostic training. You are NOT diagnosing a disease. You are estimating urgency
so the health worker knows what to do next.

Given a patient's age, gender, symptoms, symptom duration, and available vitals, respond with ONLY a
JSON object, no other text, in this exact shape:

{
  "urgency": "red" | "yellow" | "green",
  "recommendedAction": "short, plain-language next step for the health worker",
  "reasoning": "2-3 sentences explaining which symptoms/vitals drove this classification"
}

Guidance:
- "red" = needs emergency transport / cannot wait, immediate danger signs present
- "yellow" = should be referred to the nearest PHC/doctor within hours, not an emergency
- "green" = safe to manage locally with basic care and monitoring
When in doubt between two tiers, prefer the more cautious (higher urgency) one.`;

async function getTriageAssessment(patient) {
  const { age, gender, symptoms, durationHours, vitals } = patient;

  const userMessage = `Patient age: ${age}
Gender: ${gender}
Symptoms: ${symptoms}
Symptom duration: ${durationHours} hours
Vitals: ${JSON.stringify(vitals || {})}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content;
  const parsed = JSON.parse(raw);

  if (!["red", "yellow", "green"].includes(parsed.urgency)) {
    throw new Error("Model returned an invalid urgency value");
  }

  return parsed;
}

module.exports = { getTriageAssessment };
