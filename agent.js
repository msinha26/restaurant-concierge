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

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "interleaved-thinking-2025-05-14",
    },
    body: JSON.stringify({
      model: CONFIG.MODEL,
      max_tokens: CONFIG.MAX_TOKENS,
      temperature: CONFIG.TEMPERATURE,
      system: CONFIG.SYSTEM_PROMPT,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
        },
      ],
      messages: messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "API call failed");
  }

  const data = await response.json();

  // Extract text response from content blocks
  const textBlocks = data.content.filter((block) => block.type === "text");
  const fullText = textBlocks.map((block) => block.text).join("\n");

  // Parse restaurant recommendations from the response
  const restaurants = parseRestaurants(fullText);

  return {
    message: fullText,
    restaurants: restaurants,
    rawContent: data.content,
  };
}

function parseRestaurants(text) {
  const restaurants = [];
  const lines = text.split("\n");

  lines.forEach((line) => {
    // Look for numbered restaurant entries like "1. Restaurant Name"
    const match = line.match(/^\d+\.\s+\*?\*?([^*\n]+)\*?\*?/);
    if (match) {
      const name = match[1].trim();
      restaurants.push({
        name: name,
        swiggyUrl: `https://www.swiggy.com/search?query=${encodeURIComponent(name)}`,
      });
    }
  });

  return restaurants;
}
