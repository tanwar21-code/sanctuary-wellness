import { NextRequest } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token (simple check - in production use proper JWT validation)
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const students = await sql`
      SELECT id, name, email, profile_image, created_at
      FROM users
      WHERE role = 'student'
      ORDER BY created_at DESC
    `;

    return Response.json({ students });
  } catch (error) {
    console.error('Admin students GET error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
