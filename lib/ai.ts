const SYSTEM_PROMPT = `You are a calm and supportive mental health assistant for students.`;

export async function getAIResponse(userMessage: string, chatHistory: Array<{ role: string; content: string }> = []): Promise<string> {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-large",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `
${SYSTEM_PROMPT}

Student: ${userMessage}

Respond supportively in a short and caring way.
          `,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API Error:', response.status, errorText);
      return "I'm having trouble connecting right now. Please try again in a moment.";
    }

    const data = await response.json();

    return data[0]?.generated_text || "I'm here for you.";
  } catch (error) {
    console.error('Hugging Face AI Error:', error);
    return "Something went wrong. Please try again.";
  }
}
