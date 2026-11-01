// Navo - Stats API for dashboard
import { NextResponse } from 'next/server';
import { getDb } from '@/db';

export async function GET() {
  const db = getDb();

  const totalSaves = (db.prepare('SELECT COUNT(*) as count FROM saves').get() as { count: number }).count;
  const activeSaves = (db.prepare("SELECT COUNT(*) as count FROM saves WHERE status = 'active'").get() as { count: number }).count;
  const completedSaves = (db.prepare("SELECT COUNT(*) as count FROM saves WHERE status = 'completed'").get() as { count: number }).count;
  const expiredSaves = (db.prepare("SELECT COUNT(*) as count FROM saves WHERE status = 'expired'").get() as { count: number }).count;
  
  const totalSteps = (db.prepare('SELECT COUNT(*) as count FROM action_steps').get() as { count: number }).count;
  const completedSteps = (db.prepare('SELECT COUNT(*) as count FROM action_steps WHERE is_completed = 1').get() as { count: number }).count;

  const rawUpcoming = db.prepare(`
    SELECT * FROM saves 
    WHERE deadline IS NOT NULL 
    AND status = 'active' 
    AND deadline >= date('now')
    ORDER BY deadline ASC 
    LIMIT 5
  `).all() as Record<string, unknown>[];

  const upcomingDeadlines = rawUpcoming.map((s) => ({
    ...s,
    extracted_data: typeof s.extracted_data === 'string' ? JSON.parse(s.extracted_data as string) : s.extracted_data,
    intent_confirmed: Boolean(s.intent_confirmed),
    deadline_confirmed: Boolean(s.deadline_confirmed),
  }));

  const actionRate = totalSaves > 0 ? Math.round((completedSaves / totalSaves) * 100) : 0;

  return NextResponse.json({
    totalSaves,
    activeSaves,
    completedSaves,
    expiredSaves,
    totalSteps,
    completedSteps,
    actionRate,
    upcomingDeadlines
  });
}
