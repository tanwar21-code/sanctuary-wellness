import { NextRequest } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');

    let resources;
    if (type && category) {
      resources = await sql`SELECT * FROM resources WHERE type = ${type} AND category = ${category} ORDER BY created_at DESC`;
    } else if (type) {
      resources = await sql`SELECT * FROM resources WHERE type = ${type} ORDER BY created_at DESC`;
    } else if (category) {
      resources = await sql`SELECT * FROM resources WHERE category = ${category} ORDER BY created_at DESC`;
    } else {
      resources = await sql`SELECT * FROM resources ORDER BY created_at DESC`;
    }
    return Response.json({ resources });
  } catch (error) {
    console.error('Resources GET error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, type, category, content, youtube_url, thumbnail_url, created_by } = await request.json();
    if (!title || !type) return Response.json({ error: 'Missing fields' }, { status: 400 });

    const resource = await sql`
      INSERT INTO resources (title, description, type, category, content, youtube_url, thumbnail_url, created_by)
      VALUES (${title}, ${description || null}, ${type}, ${category || null}, ${content || null}, ${youtube_url || null}, ${thumbnail_url || null}, ${created_by || null})
      RETURNING *
    `;
    return Response.json({ resource: resource[0] });
  } catch (error) {
    console.error('Resources POST error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
