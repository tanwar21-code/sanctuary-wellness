import { NextRequest } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const counsellorId = searchParams.get('counsellorId');

    let requests;
    if (studentId) {
      requests = await sql`
        SELECT cr.*, u.name as counsellor_name, u.profile_image as counsellor_image
        FROM counsellor_requests cr
        JOIN users u ON cr.counsellor_id = u.id
        WHERE cr.student_id = ${studentId}
        ORDER BY cr.created_at DESC
      `;
    } else if (counsellorId) {
      requests = await sql`
        SELECT cr.*, u.name as student_name, u.profile_image as student_image
        FROM counsellor_requests cr
        JOIN users u ON cr.student_id = u.id
        WHERE cr.counsellor_id = ${counsellorId}
        ORDER BY cr.created_at DESC
      `;
    } else {
      return Response.json({ error: 'studentId or counsellorId required' }, { status: 400 });
    }

    return Response.json({ requests });
  } catch (error) {
    console.error('Requests GET error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { student_id, counsellor_id, message, contact_number } = await request.json();
    if (!student_id || !counsellor_id || !message || !contact_number) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    const req = await sql`
      INSERT INTO counsellor_requests (student_id, counsellor_id, message, contact_number)
      VALUES (${student_id}, ${counsellor_id}, ${message}, ${contact_number})
      RETURNING *
    `;

    // Create notification for counsellor
    await sql`
      INSERT INTO notifications (user_id, title, message)
      VALUES (${counsellor_id}, 'New Support Request', 'A student has requested your support.')
    `;

    return Response.json({ request: req[0] });
  } catch (error) {
    console.error('Requests POST error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
