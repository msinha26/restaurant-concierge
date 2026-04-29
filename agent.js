async function runAgent(userMessage, userLocation, conversationHistory, apiKey) {
  const locationContext = userLocation
    ? `User is located at latitude ${userLocation.lat}, longitude ${userLocation.lng}.`
    : "User location is not available.";

  const messages = [
    ...conversationHistory,
    {
      role: "user",
      content: `${locationContext}\n\nUser says: ${userMessage}`,
    },
  ];

  const response = await fetch("https://restaurant-concierge.meha-a-sinha.workers.dev", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CONFIG.MODEL,
      max_tokens: CONFIG.MAX_TOKENS,
      temperature: CONFIG.TEMPERATURE,
      system: CONFIG.SYSTEM_PROMPT,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "API call failed");
  }

  const data = await response.json();

  const textBlocks = data.content.filter((block) => block.type === "text");
  const fullText = textBlocks.map((block) => block.text).join("\n");

  const restaurants = hasCollectedPreferences(conversationHistory)
    ? parseRestaurants(fullText)
    : [];

  return {
    message: fullText,
    restaurants: restaurants,
    rawContent: data.content,
  };
}

function hasCollectedPreferences(history) {
  const budgetKeywords = /budget|price|rupees|₹|under|below|700|500|300|1000|k|rs/i;
  const deliveryKeywords = /minutes|hour|soon|time|delivery|fast|quick|min|mins|30|45|hr|asap|flexible/i;
  const recentMessages = history.slice(-6);
  const text = recentMessages.map((m) => m.content).join(" ");
  return budgetKeywords.test(text) && deliveryKeywords.test(text);
}

function parseRestaurants(text) {
  const restaurants = [];
  const lines = text.split("\n");
  lines.forEach((line) => {
    const match = line.match(/^\d+\.\s+\*?\*?([^*\n]+)\*?\*?/);
    if (match) {
      const name = match[1].trim();
      if (!name.endsWith("?") && name.length > 3) {
        restaurants.push({
          name: name,
          swiggyUrl: `https://www.swiggy.com/search?query=${encodeURIComponent(name)}`,
        });
      }
    }
  });
  return restaurants;
}
