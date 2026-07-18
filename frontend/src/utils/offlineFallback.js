// This table is a compact, human-curated distillation of common symptom
// patterns and the urgency tier they usually map to. It exists ONLY as a
// fallback for when the health worker's device has no connectivity at all,
// so the AI call in triageApi.js can't reach Groq. It is intentionally
// small and conservative — when a pattern doesn't clearly match, it defaults
// to "yellow" rather than guessing "green", since under-triaging offline is
// riskier than an unnecessary referral.

const RULES = [
  {
    match: ["chest pain", "difficulty breathing", "unconscious", "seizure", "severe bleeding", "not breathing"],
    urgency: "red",
    recommendedAction: "Arrange emergency transport immediately. Do not wait for connectivity.",
    reasoning: "Offline estimate: symptoms described match patterns typically classified as an immediate danger sign.",
  },
  {
    match: ["high fever", "persistent vomiting", "severe pain", "dehydration", "confusion"],
    urgency: "yellow",
    recommendedAction: "Refer to the nearest PHC within a few hours. Monitor closely in the meantime.",
    reasoning: "Offline estimate: symptoms suggest the patient should be seen by a doctor soon, though not a life-threatening emergency.",
  },
  {
    match: ["mild fever", "cough", "cold", "headache", "body ache", "minor cut"],
    urgency: "green",
    recommendedAction: "Manage locally with rest, fluids and basic care. Re-check if symptoms worsen.",
    reasoning: "Offline estimate: symptoms match patterns generally safe to manage without immediate referral.",
  },
];

const DEFAULT_RESULT = {
  urgency: "yellow",
  recommendedAction: "No clear match offline — refer to the nearest PHC to be safe once possible.",
  reasoning: "Offline estimate: the described symptoms didn't clearly match a known pattern, so a cautious default was used.",
};

export function getOfflineAssessment(symptomsText) {
  const text = symptomsText.toLowerCase();

  for (const rule of RULES) {
    if (rule.match.some((keyword) => text.includes(keyword))) {
      return {
        urgency: rule.urgency,
        recommendedAction: rule.recommendedAction,
        reasoning: rule.reasoning,
      };
    }
  }

  return DEFAULT_RESULT;
}
