import { NextRequest } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const counsellors = await sql`
      SELECT u.id, u.name, u.email, u.profile_image, u.created_at,
             cp.specialization, cp.bio, cp.experience, cp.verified
      FROM users u
      LEFT JOIN counsellor_profiles cp ON u.id = cp.user_id
      WHERE u.role = 'counsellor'
      ORDER BY u.created_at DESC
    `;

    return Response.json({ counsellors });
  } catch (error) {
    console.error('Admin counsellors GET error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, specialization, experience, bio } = await request.json();

    if (!name || !email || !specialization) {
      return Response.json({ error: 'Name, email, and specialization are required' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return Response.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Create user with counsellor role
    const newUser = await sql`
      INSERT INTO users (name, email, role, firebase_uid)
      VALUES (${name}, ${email}, 'counsellor', ${email})
      RETURNING *
    `;

    // Create counsellor profile
    const experienceYears = experience ? parseInt(experience) : 0;
    const profile = await sql`
      INSERT INTO counsellor_profiles (user_id, specialization, bio, experience, verified)
      VALUES (${newUser[0].id}, ${specialization}, ${bio || null}, ${experienceYears}, true)
      RETURNING *
    `;

    return Response.json({ 
      user: newUser[0], 
      profile: profile[0],
      success: true 
    });
  } catch (error) {
    console.error('Admin counsellor POST error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
