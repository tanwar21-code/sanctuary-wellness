import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getAIResponse } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { user_id, message } = await request.json();
    if (!user_id || !message) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Get recent chat history for context
    const history = await sql`
      SELECT user_message, ai_response FROM ai_chats
      WHERE user_id = ${user_id}
      ORDER BY created_at DESC LIMIT 5
    `;

    const chatHistory = [...history].reverse().flatMap(h => [
      { role: 'user', content: h.user_message as string },
      { role: 'model', content: h.ai_response as string },
    ]);

    const aiResponse = await getAIResponse(message, chatHistory);

    // Save to DB
    const saved = await sql`
      INSERT INTO ai_chats (user_id, user_message, ai_response)
      VALUES (${user_id}, ${message}, ${aiResponse})
      RETURNING *
    `;

    return Response.json({ chat: saved[0] });
  } catch (error) {
    console.error('AI Chat error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return Response.json({ error: 'userId required' }, { status: 400 });

    const chats = await sql`
      SELECT * FROM ai_chats WHERE user_id = ${userId}
      ORDER BY created_at ASC
    `;
    return Response.json({ chats });
  } catch (error) {
    console.error('AI Chat GET error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
