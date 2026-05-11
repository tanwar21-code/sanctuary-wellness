import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json({ error: 'Username and password required' }, { status: 400 });
    }

    const adminUsername = 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (username !== adminUsername || password !== adminPassword) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate a simple token (in production, use proper JWT)
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');

    return Response.json({ token, success: true });
  } catch (error) {
    console.error('Admin auth error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
