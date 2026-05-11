import { NextRequest } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return Response.json({ error: 'userId required' }, { status: 400 });

    const entries = await sql`
      SELECT * FROM mood_entries WHERE user_id = ${userId}
      ORDER BY created_at DESC LIMIT 30
    `;
    return Response.json({ entries });
  } catch (error) {
    console.error('Mood GET error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, mood, note } = await request.json();
    if (!user_id || !mood) return Response.json({ error: 'Missing fields' }, { status: 400 });

    const entry = await sql`
      INSERT INTO mood_entries (user_id, mood, note)
      VALUES (${user_id}, ${mood}, ${note || null})
      RETURNING *
    `;
    return Response.json({ entry: entry[0] });
  } catch (error) {
    console.error('Mood POST error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
