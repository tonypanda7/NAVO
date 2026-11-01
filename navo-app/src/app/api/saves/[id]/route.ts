// Navo - Single Save API (GET, PATCH, DELETE)
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const save = db.prepare('SELECT * FROM saves WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  
  if (!save) {
    return NextResponse.json({ error: 'Save not found' }, { status: 404 });
  }

  const steps = db.prepare('SELECT * FROM action_steps WHERE save_id = ? ORDER BY step_number').all(id);
  const reminders = db.prepare('SELECT * FROM reminders WHERE save_id = ? ORDER BY remind_at').all(id);

  return NextResponse.json({
    ...save,
    extracted_data: typeof save.extracted_data === 'string'
      ? JSON.parse(save.extracted_data as string)
      : save.extracted_data,
    intent_confirmed: Boolean(save.intent_confirmed),
    deadline_confirmed: Boolean(save.deadline_confirmed),
    steps,
    reminders
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();

  const allowedFields = [
    'title', 'content_type', 'intent', 'intent_confirmed', 
    'status', 'deadline', 'deadline_source', 'deadline_confirmed',
    'space', 'project', 'estimated_minutes'
  ];

  const updates: string[] = [];
  const values: unknown[] = [];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`);
      if (field === 'extracted_data') {
        values.push(JSON.stringify(body[field]));
      } else {
        values.push(body[field]);
      }
    }
  }

  if (body.extracted_data !== undefined) {
    updates.push('extracted_data = ?');
    values.push(JSON.stringify(body.extracted_data));
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  updates.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  db.prepare(`UPDATE saves SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const save = db.prepare('SELECT * FROM saves WHERE id = ?').get(id) as Record<string, unknown>;
  return NextResponse.json({
    ...save,
    extracted_data: typeof save.extracted_data === 'string'
      ? JSON.parse(save.extracted_data as string)
      : save.extracted_data,
    intent_confirmed: Boolean(save.intent_confirmed),
    deadline_confirmed: Boolean(save.deadline_confirmed),
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  db.prepare('DELETE FROM saves WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
