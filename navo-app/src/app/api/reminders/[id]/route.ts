// Navo - Single Reminder API (PATCH to dismiss/respond)
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.is_dismissed !== undefined) {
    updates.push('is_dismissed = ?');
    values.push(body.is_dismissed ? 1 : 0);
  }
  if (body.response !== undefined) {
    updates.push('response = ?');
    values.push(body.response);
    updates.push('is_dismissed = 1');
  }

  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE reminders SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  const reminder = db.prepare('SELECT * FROM reminders WHERE id = ?').get(id);
  return NextResponse.json(reminder);
}
