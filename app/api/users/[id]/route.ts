import { NextRequest } from 'next/server';
import sql from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, profile_image } = await request.json();

    const updated = await sql`
      UPDATE users 
      SET name = COALESCE(${name}, name),
          profile_image = COALESCE(${profile_image}, profile_image)
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ user: updated[0] });
  } catch (error) {
    console.error('Update user error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
