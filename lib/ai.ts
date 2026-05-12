const SYSTEM_PROMPT = `You are a calm, empathetic, and supportive mental health assistant for college students on the Sanctuary platform. 
Your role is to listen actively, validate feelings, and offer gentle guidance. 
Keep responses concise (2-4 sentences), warm, and caring. 
Never diagnose or prescribe — always encourage seeking professional help for serious concerns.
Use a supportive and non-judgmental tone.`;

const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const MODEL = "inclusionAI/Ling-2.6-1T:novita";

export async function getAIResponse(
  userMessage: string,
  chatHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
  try {
    // Build messages array with system prompt, history, and current message
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...chatHistory.map(msg => ({
        role: msg.role === "model" ? "assistant" : msg.role,
        content: msg.content,
      })),
      { role: "user", content: userMessage },
    ];

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API Error:", response.status, errorText);
      return "I'm having trouble connecting right now. Please try again in a moment. 💙";
    }

    const data = await response.json();

    return (
      data.choices?.[0]?.message?.content?.trim() ||
      "I'm here for you. Could you tell me a bit more about how you're feeling? 💙"
    );
  } catch (error) {
    console.error("DeepSeek AI Error:", error);
    return "Something went wrong. Please try again. 💙";
  }
}
