// Navo - Action Steps API (PATCH step completion)
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();

  if (body.is_completed !== undefined) {
    const completedAt = body.is_completed ? new Date().toISOString() : null;
    db.prepare('UPDATE action_steps SET is_completed = ?, completed_at = ? WHERE id = ?')
      .run(body.is_completed ? 1 : 0, completedAt, id);
  }

  const step = db.prepare('SELECT * FROM action_steps WHERE id = ?').get(id) as Record<string, unknown>;
  
  if (!step) {
    return NextResponse.json({ error: 'Step not found' }, { status: 404 });
  }

  // Check if all steps for the save are completed
  const saveId = step.save_id as string;
  const totalSteps = db.prepare('SELECT COUNT(*) as count FROM action_steps WHERE save_id = ?').get(saveId) as { count: number };
  const completedSteps = db.prepare('SELECT COUNT(*) as count FROM action_steps WHERE save_id = ? AND is_completed = 1').get(saveId) as { count: number };

  if (totalSteps.count === completedSteps.count && totalSteps.count > 0) {
    db.prepare("UPDATE saves SET status = 'completed', updated_at = ? WHERE id = ?")
      .run(new Date().toISOString(), saveId);
  } else {
    // If unchecking a step, reactivate the save
    db.prepare("UPDATE saves SET status = 'active', updated_at = ? WHERE id = ? AND status = 'completed'")
      .run(new Date().toISOString(), saveId);
  }

  return NextResponse.json({
    ...step,
    is_completed: Boolean(step.is_completed),
    allCompleted: totalSteps.count === completedSteps.count,
    completedCount: completedSteps.count,
    totalCount: totalSteps.count
  });
}
