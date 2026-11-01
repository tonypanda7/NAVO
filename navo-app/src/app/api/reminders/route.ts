// Navo - Reminders API
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const upcoming = searchParams.get('upcoming');

  let query = `
    SELECT r.*, s.title as save_title, s.content_type, s.intent, s.deadline
    FROM reminders r
    JOIN saves s ON r.save_id = s.id
    WHERE r.is_dismissed = 0
  `;

  if (upcoming === 'true') {
    query += ` AND r.remind_at >= datetime('now') AND r.remind_at <= datetime('now', '+7 days')`;
  }

  query += ' ORDER BY r.remind_at ASC';

  const reminders = db.prepare(query).all();

  return NextResponse.json(reminders);
}
