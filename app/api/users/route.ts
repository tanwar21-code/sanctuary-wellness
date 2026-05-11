import { NextRequest } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const firebaseUid = request.headers.get('x-firebase-uid');
    if (!firebaseUid) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await sql`SELECT * FROM users WHERE firebase_uid = ${firebaseUid}`;
    if (users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ user: users[0] });
  } catch (error) {
    console.error('Users API Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
