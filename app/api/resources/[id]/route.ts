import { NextRequest } from 'next/server';
import sql from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const resource = await sql`SELECT * FROM resources WHERE id = ${id}`;
    if (resource.length === 0) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ resource: resource[0] });
  } catch (error) {
    console.error('Resource GET error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { title, description, category, content, youtube_url, thumbnail_url } = await request.json();

    const updated = await sql`
      UPDATE resources SET
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        category = COALESCE(${category}, category),
        content = COALESCE(${content}, content),
        youtube_url = COALESCE(${youtube_url}, youtube_url),
        thumbnail_url = COALESCE(${thumbnail_url}, thumbnail_url)
      WHERE id = ${id}
      RETURNING *
    `;
    if (updated.length === 0) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ resource: updated[0] });
  } catch (error) {
    console.error('Resource PUT error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM resources WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error('Resource DELETE error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
