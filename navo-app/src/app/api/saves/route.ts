// Navo - Saves API (GET all, POST new save)
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { seedDatabase } from '@/db/seed';
import { parseUrl } from '@/lib/parser';
import { randomUUID } from 'crypto';

// Ensure seeded on first request
let seeded = false;

function ensureSeeded() {
  if (!seeded) {
    seedDatabase();
    seeded = true;
  }
}

export async function GET(request: NextRequest) {
  ensureSeeded();
  const db = getDb();
  const { searchParams } = new URL(request.url);
  
  const status = searchParams.get('status');
  const content_type = searchParams.get('content_type');
  const intent = searchParams.get('intent');
  const search = searchParams.get('search');

  let query = 'SELECT * FROM saves';
  const conditions: string[] = [];
  const params: string[] = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (content_type) {
    conditions.push('content_type = ?');
    params.push(content_type);
  }
  if (intent) {
    conditions.push('intent = ?');
    params.push(intent);
  }
  if (search) {
    conditions.push('(title LIKE ? OR extracted_data LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY created_at DESC';

  const saves = db.prepare(query).all(...params) as Record<string, unknown>[];

  // Fetch all action steps for these saves
  const allSteps = db.prepare('SELECT * FROM action_steps ORDER BY step_number ASC').all() as Record<string, unknown>[];
  const stepsBySaveId: Record<string, Record<string, unknown>[]> = {};
  for (const step of allSteps) {
    const sId = step.save_id as string;
    if (!stepsBySaveId[sId]) {
      stepsBySaveId[sId] = [];
    }
    stepsBySaveId[sId].push({
      ...step,
      is_completed: Boolean(step.is_completed)
    });
  }

  // Parse extracted_data JSON for each save
  const parsed = saves.map((save) => {
    const sId = save.id as string;
    return {
      ...save,
      extracted_data: typeof save.extracted_data === 'string' 
        ? JSON.parse(save.extracted_data as string) 
        : save.extracted_data,
      intent_confirmed: Boolean(save.intent_confirmed),
      deadline_confirmed: Boolean(save.deadline_confirmed),
      steps: stepsBySaveId[sId] || [],
    };
  });

  return NextResponse.json(parsed);
}

export async function POST(request: NextRequest) {
  ensureSeeded();
  const db = getDb();
  const body = await request.json();
  const { url } = body;

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Parse the URL using AI
  const parseResult = await parseUrl(url);
  
  const saveId = randomUUID();
  const now = new Date().toISOString();

  // Insert the save
  db.prepare(`
    INSERT INTO saves (id, url, title, thumbnail_url, content_type, intent, intent_confirmed, status, deadline, deadline_source, deadline_confirmed, source_platform, extracted_data, space, project, estimated_minutes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    saveId, url, parseResult.title, null,
    parseResult.content_type, parseResult.intent, 0, 'active',
    parseResult.deadline, parseResult.deadline_source, parseResult.deadline ? 0 : 0,
    parseResult.source_platform, JSON.stringify(parseResult.extracted_data),
    null, null, parseResult.estimated_minutes, now, now
  );

  // Insert action steps
  const insertStep = db.prepare(`
    INSERT INTO action_steps (id, save_id, step_number, title, description, is_completed, completed_at)
    VALUES (?, ?, ?, ?, ?, 0, NULL)
  `);

  parseResult.suggested_steps.forEach((step, index) => {
    insertStep.run(randomUUID(), saveId, index + 1, step.title, step.description || null);
  });

  // Generate reminders if deadline exists
  if (parseResult.deadline) {
    const deadline = new Date(parseResult.deadline);
    const insertReminder = db.prepare(`
      INSERT INTO reminders (id, save_id, remind_at, reason, message, is_dismissed, response)
      VALUES (?, ?, ?, ?, ?, 0, NULL)
    `);

    const reminderConfigs = [
      { daysBefore: 7, reason: 'deadline_week_before', template: `{title} deadline is in 1 week. You saved this to {intent}.` },
      { daysBefore: 3, reason: 'deadline_3_days', template: `{title} closes in 3 days. Have you started?` },
      { daysBefore: 1, reason: 'deadline_tomorrow', template: `Last day tomorrow! {title} deadline is {deadline}.` },
    ];

    reminderConfigs.forEach(config => {
      const reminderDate = new Date(deadline);
      reminderDate.setDate(reminderDate.getDate() - config.daysBefore);
      
      if (reminderDate > new Date()) {
        const message = config.template
          .replace('{title}', parseResult.title)
          .replace('{intent}', parseResult.intent)
          .replace('{deadline}', parseResult.deadline || '');
        
        insertReminder.run(
          randomUUID(), saveId, reminderDate.toISOString(),
          config.reason, message
        );
      }
    });
  }

  // Return the created save with steps
  const save = db.prepare('SELECT * FROM saves WHERE id = ?').get(saveId) as Record<string, unknown>;
  const steps = db.prepare('SELECT * FROM action_steps WHERE save_id = ? ORDER BY step_number').all(saveId);
  const reminders = db.prepare('SELECT * FROM reminders WHERE save_id = ? ORDER BY remind_at').all(saveId);

  return NextResponse.json({
    ...save,
    extracted_data: JSON.parse(save.extracted_data as string),
    intent_confirmed: Boolean(save.intent_confirmed),
    deadline_confirmed: Boolean(save.deadline_confirmed),
    steps,
    reminders
  }, { status: 201 });
}
