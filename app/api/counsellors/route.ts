import sql from '@/lib/db';

export async function GET() {
  try {
    const counsellors = await sql`
      SELECT u.id, u.name, u.email, u.profile_image, 
             cp.specialization, cp.bio, cp.experience, cp.availability, cp.verified
      FROM users u
      JOIN counsellor_profiles cp ON u.id = cp.user_id
      WHERE u.role = 'counsellor' AND cp.verified = true
      ORDER BY cp.experience DESC
    `;
    return Response.json({ counsellors });
  } catch (error) {
    console.error('Counsellors GET error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
