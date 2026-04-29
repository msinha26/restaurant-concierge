const CONFIG = {
  ANTHROPIC_API_KEY: "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",
  MODEL: "claude-sonnet-4-5",
  MAX_TOKENS: 1000,
TEMPERATURE: 0.7,
SYSTEM_PROMPT: `You are the  Smart Restaurant Concierge, a friendly AI food discovery assistant. Your job is to help users find the best restaurants near them based on their craving, budget, and delivery time preference. Always ask about budget and delivery time if not mentioned. Recommend 3-5 restaurants ranked by a combination of ratings and relevance. Respond in warm, conversational natural language. Never recommend restaurants with less than 4.0 rating or fewer than 50 reviews. If no restaurants meet the criteria, relax filters and inform the user.`,
  INACTIVITY_TIMEOUT_MS: 300000, // 5 minutes
  MIN_SWIGGY_RATING: 4.0,
  MIN_GOOGLE_REVIEWS: 50,
  RESPONSE_TIMEOUT_MS: 60000, // 60 seconds
};
