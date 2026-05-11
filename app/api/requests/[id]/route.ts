import { NextRequest } from 'next/server';
import sql from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await sql`
      UPDATE counsellor_requests SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    // Notify the student
    const statusMessages: Record<string, string> = {
      accepted: 'Your support request has been accepted by a counsellor.',
      rejected: 'Your support request could not be fulfilled at this time.',
      completed: 'Your support session has been marked as completed.',
    };

    await sql`
      INSERT INTO notifications (user_id, title, message)
      VALUES (${updated[0].student_id}, 'Request ${status}', ${statusMessages[status]})
    `;

    return Response.json({ request: updated[0] });
  } catch (error) {
    console.error('Request update error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
