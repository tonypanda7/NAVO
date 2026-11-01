// Navo - Action Steps Collection API (POST new step)
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { save_id, title, description } = body;

  if (!save_id || !title) {
    return NextResponse.json({ error: 'save_id and title are required' }, { status: 400 });
  }

  // Get current max step number
  const maxStep = db.prepare('SELECT MAX(step_number) as max_step FROM action_steps WHERE save_id = ?').get(save_id) as { max_step: number | null };
  const nextStepNum = (maxStep?.max_step ?? 0) + 1;

  const stepId = randomUUID();
  db.prepare(`
    INSERT INTO action_steps (id, save_id, step_number, title, description, is_completed, completed_at)
    VALUES (?, ?, ?, ?, ?, 0, NULL)
  `).run(stepId, save_id, nextStepNum, title, description || null);

  const step = db.prepare('SELECT * FROM action_steps WHERE id = ?').get(stepId) as Record<string, unknown>;

  return NextResponse.json({
    ...step,
    is_completed: Boolean(step.is_completed)
  }, { status: 201 });
}
