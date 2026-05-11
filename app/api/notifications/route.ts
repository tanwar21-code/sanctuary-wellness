import { NextRequest } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return Response.json({ error: 'userId required' }, { status: 400 });

    const notifications = await sql`
      SELECT * FROM notifications WHERE user_id = ${userId}
      ORDER BY created_at DESC LIMIT 50
    `;
    return Response.json({ notifications });
  } catch (error) {
    console.error('Notifications GET error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { ids } = await request.json();
    if (!ids || !Array.isArray(ids)) return Response.json({ error: 'ids array required' }, { status: 400 });

    for (const id of ids) {
      await sql`UPDATE notifications SET is_read = true WHERE id = ${id}`;
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error('Notifications PUT error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
