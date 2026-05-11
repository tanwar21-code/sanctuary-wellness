import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are a compassionate, empathetic mental health support companion for college and university students. Your name is Sanctuary AI.

Your role:
- Provide emotional support and guidance
- Help students manage stress, anxiety, and academic pressure
- Offer coping strategies and wellness tips
- Listen actively and validate feelings
- Encourage self-care and healthy habits

Important guidelines:
- Always be warm, supportive, and non-judgmental
- Use gentle, encouraging language
- Acknowledge the student's feelings before offering advice
- Keep responses concise but meaningful (2-4 paragraphs max)
- If someone mentions self-harm, suicidal thoughts, or severe distress, strongly encourage them to contact professional help immediately
- Never diagnose conditions or prescribe medication
- Remind users that you're an AI companion, not a replacement for professional care
- Use appropriate emojis sparingly to feel approachable

Remember: You're talking to stressed, overwhelmed students who need to feel heard and supported.`;

export async function getAIResponse(userMessage: string, chatHistory: Array<{ role: string; content: string }> = []): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const historyFormatted = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: historyFormatted,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    // Prepend system context to the first message if no history
    const messageToSend = chatHistory.length === 0
      ? `${SYSTEM_PROMPT}\n\nStudent says: "${userMessage}"`
      : userMessage;

    const result = await chat.sendMessage(messageToSend);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI Error:', error);
    return "I'm having trouble connecting right now. Please try again in a moment. If you're in crisis, please reach out to a professional counsellor or call a helpline. 💙";
  }
}
