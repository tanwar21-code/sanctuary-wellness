import { NextRequest } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const counsellorId = searchParams.get('counsellorId');
    if (!counsellorId) return Response.json({ error: 'counsellorId required' }, { status: 400 });

    const schedules = await sql`
      SELECT * FROM schedules WHERE counsellor_id = ${counsellorId}
      ORDER BY CASE day
        WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7 END, start_time
    `;
    return Response.json({ schedules });
  } catch (error) {
    console.error('Schedules GET error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { counsellor_id, day, start_time, end_time } = await request.json();
    if (!counsellor_id || !day || !start_time || !end_time) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    const schedule = await sql`
      INSERT INTO schedules (counsellor_id, day, start_time, end_time)
      VALUES (${counsellor_id}, ${day}, ${start_time}, ${end_time})
      RETURNING *
    `;
    return Response.json({ schedule: schedule[0] });
  } catch (error) {
    console.error('Schedule POST error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'id required' }, { status: 400 });

    await sql`DELETE FROM schedules WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error('Schedule DELETE error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
