import { NextRequest } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { firebase_uid, name, email, profile_image } = await request.json();

    if (!firebase_uid || !email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user exists
    const existing = await sql`SELECT * FROM users WHERE firebase_uid = ${firebase_uid}`;

    if (existing.length > 0) {
      return Response.json({ user: existing[0] });
    }

    // Create new user (default role: student)
    const newUser = await sql`
      INSERT INTO users (firebase_uid, name, email, profile_image, role)
      VALUES (${firebase_uid}, ${name}, ${email}, ${profile_image}, 'student')
      RETURNING *
    `;

    return Response.json({ user: newUser[0], isNew: true });
  } catch (error) {
    console.error('Auth API Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
