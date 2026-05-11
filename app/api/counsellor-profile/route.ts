import { NextRequest } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return Response.json({ error: 'userId required' }, { status: 400 });

    const profile = await sql`
      SELECT * FROM counsellor_profiles WHERE user_id = ${userId}
    `;
    return Response.json({ profile: profile[0] || null });
  } catch (error) {
    console.error('Counsellor profile GET error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user_id, specialization, bio, experience, availability } = await request.json();
    if (!user_id) return Response.json({ error: 'user_id required' }, { status: 400 });

    // Upsert counsellor profile
    const existing = await sql`SELECT * FROM counsellor_profiles WHERE user_id = ${user_id}`;
    
    if (existing.length > 0) {
      const updated = await sql`
        UPDATE counsellor_profiles SET
          specialization = COALESCE(${specialization}, specialization),
          bio = COALESCE(${bio}, bio),
          experience = COALESCE(${experience}, experience),
          availability = COALESCE(${availability}, availability)
        WHERE user_id = ${user_id}
        RETURNING *
      `;
      return Response.json({ profile: updated[0] });
    } else {
      const created = await sql`
        INSERT INTO counsellor_profiles (user_id, specialization, bio, experience, availability)
        VALUES (${user_id}, ${specialization}, ${bio}, ${experience || 0}, ${availability})
        RETURNING *
      `;
      return Response.json({ profile: created[0] });
    }
  } catch (error) {
    console.error('Counsellor profile PUT error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
