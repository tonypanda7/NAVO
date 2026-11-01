// Navo - Seed Data for Prototype Demo
import { getDb } from './index';
import { randomUUID } from 'crypto';

const SEED_DATA = [
  {
    id: randomUUID(),
    url: 'https://www.instagram.com/reel/google-swe-internship-2027',
    title: 'Google SWE Internship — Summer 2027',
    thumbnail_url: null,
    content_type: 'opportunity',
    intent: 'apply',
    intent_confirmed: 1,
    status: 'active',
    deadline: '2026-11-15',
    deadline_source: 'caption',
    deadline_confirmed: 1,
    source_platform: 'instagram',
    extracted_data: JSON.stringify({
      company: 'Google',
      role: 'Software Engineering Intern',
      eligibility: 'Currently enrolled in BS/MS in Computer Science or related field',
      application_link: 'https://careers.google.com/students',
      documents_needed: ['Resume', 'Transcript', 'Cover Letter'],
      stage: 'saved'
    }),
    space: null,
    project: 'Summer Internships',
    estimated_minutes: 45,
    steps: [
      { title: 'Check eligibility requirements', description: 'BS/MS in CS, graduating 2027-2028' },
      { title: 'Update resume with latest projects', description: 'Add hackathon wins and coursework' },
      { title: 'Write cover letter', description: 'Tailor to Google SWE role' },
      { title: 'Submit application', description: 'Apply at careers.google.com/students' },
      { title: 'Prepare for coding interview', description: 'LeetCode medium/hard, system design basics' }
    ],
    reminders: [
      { remind_at: '2026-11-08T09:00:00', reason: 'deadline_week_before', message: 'Google SWE Internship deadline is in 1 week. You saved this to apply — start your application today.' },
      { remind_at: '2026-11-12T09:00:00', reason: 'deadline_3_days', message: 'Google SWE Internship closes in 3 days. Have you submitted your resume?' },
      { remind_at: '2026-11-14T09:00:00', reason: 'deadline_tomorrow', message: 'Last day tomorrow! Google SWE Internship application closes Nov 15.' }
    ]
  },
  {
    id: randomUUID(),
    url: 'https://www.instagram.com/reel/yc-fellowship-winter-2027',
    title: 'Y Combinator Fellowship — Winter 2027 Batch',
    thumbnail_url: null,
    content_type: 'opportunity',
    intent: 'apply',
    intent_confirmed: 0,
    status: 'active',
    deadline: '2026-12-01',
    deadline_source: 'on_screen',
    deadline_confirmed: 1,
    source_platform: 'instagram',
    extracted_data: JSON.stringify({
      company: 'Y Combinator',
      role: 'Fellowship',
      eligibility: 'Early-stage founders with a prototype or idea',
      application_link: 'https://apply.ycombinator.com',
      documents_needed: ['Application form', '1-minute video'],
      stage: 'saved'
    }),
    space: null,
    project: 'Startup',
    estimated_minutes: 120,
    steps: [
      { title: 'Review YC application questions', description: 'Read through the full application form' },
      { title: 'Draft answers to key questions', description: 'What are you building? Why now? Why you?' },
      { title: 'Record 1-minute video', description: 'Founders introducing themselves and the idea' },
      { title: 'Submit application', description: 'Apply at apply.ycombinator.com before Dec 1' }
    ],
    reminders: [
      { remind_at: '2026-11-15T09:00:00', reason: 'deadline_week_before', message: 'YC Fellowship deadline is in 2 weeks. Start drafting your application.' },
      { remind_at: '2026-11-28T09:00:00', reason: 'deadline_3_days', message: 'YC Fellowship closes in 3 days. Time to finalize and submit.' }
    ]
  },
  {
    id: randomUUID(),
    url: 'https://www.instagram.com/reel/overnight-oats-recipe',
    title: 'Creamy Overnight Oats — 5 Flavors',
    thumbnail_url: null,
    content_type: 'recipe',
    intent: 'cook',
    intent_confirmed: 1,
    status: 'active',
    deadline: null,
    deadline_source: null,
    deadline_confirmed: 0,
    source_platform: 'instagram',
    extracted_data: JSON.stringify({
      ingredients: [
        { name: 'Rolled oats', quantity: '1/2 cup' },
        { name: 'Milk (or oat milk)', quantity: '1/2 cup' },
        { name: 'Greek yogurt', quantity: '1/4 cup' },
        { name: 'Chia seeds', quantity: '1 tbsp' },
        { name: 'Honey or maple syrup', quantity: '1 tbsp' },
        { name: 'Vanilla extract', quantity: '1/2 tsp' }
      ],
      steps: [
        'Mix oats, milk, yogurt, chia seeds, sweetener, and vanilla in a jar',
        'Stir well and seal the jar',
        'Refrigerate overnight (at least 4 hours)',
        'Top with fresh fruits, nuts, or granola in the morning',
        'Enjoy cold or microwave for 1-2 minutes'
      ],
      cooking_time_minutes: 10
    }),
    space: null,
    project: null,
    estimated_minutes: 10,
    steps: [
      { title: 'Check pantry for ingredients', description: 'Oats, milk, yogurt, chia seeds, honey, vanilla' },
      { title: 'Pick up missing ingredients', description: 'Quick grocery run if needed' },
      { title: 'Prepare the night before', description: 'Mix everything in a jar, refrigerate overnight' },
      { title: 'Enjoy in the morning', description: 'Add toppings and eat!' }
    ],
    reminders: [
      { remind_at: '2026-11-02T17:00:00', reason: 'weekend_suggestion', message: 'Weekend idea: try the overnight oats recipe you saved. Prep tonight, enjoy tomorrow morning!' }
    ]
  },
  {
    id: randomUUID(),
    url: 'https://www.instagram.com/reel/blue-tokai-koramangala',
    title: 'Blue Tokai Coffee — Koramangala, Bangalore',
    thumbnail_url: null,
    content_type: 'place',
    intent: 'visit',
    intent_confirmed: 1,
    status: 'active',
    deadline: null,
    deadline_source: null,
    deadline_confirmed: 0,
    source_platform: 'instagram',
    extracted_data: JSON.stringify({
      name: 'Blue Tokai Coffee Roasters',
      area: 'Koramangala 5th Block, Bangalore',
      what_to_try: 'Vienna cold brew, banana bread, filter coffee flight',
      best_time: 'Weekend mornings, 8-11 AM for a quiet vibe'
    }),
    space: null,
    project: null,
    estimated_minutes: 60,
    steps: [
      { title: 'Plan a visit this weekend', description: 'Best on Saturday/Sunday morning' },
      { title: 'Try the Vienna cold brew', description: 'Their signature drink mentioned in the reel' }
    ],
    reminders: [
      { remind_at: '2026-11-01T18:00:00', reason: 'weekend_suggestion', message: 'Weekend plan: visit Blue Tokai in Koramangala? You saved it for the Vienna cold brew.' }
    ]
  },
  {
    id: randomUUID(),
    url: 'https://www.instagram.com/reel/figma-auto-layout-masterclass',
    title: 'Figma Auto Layout — Complete Guide 2026',
    thumbnail_url: null,
    content_type: 'tutorial',
    intent: 'learn',
    intent_confirmed: 1,
    status: 'active',
    deadline: null,
    deadline_source: null,
    deadline_confirmed: 0,
    source_platform: 'instagram',
    extracted_data: JSON.stringify({
      topic: 'Figma Auto Layout',
      length_minutes: 20,
      level: 'intermediate',
      steps_or_resources: ['Auto Layout basics', 'Padding & spacing', 'Nested frames', 'Responsive components', 'figma.com/community']
    }),
    space: null,
    project: null,
    estimated_minutes: 20,
    steps: [
      { title: 'Watch the full tutorial', description: '20-minute guide on Figma Auto Layout' },
      { title: 'Practice with a sample project', description: 'Create a responsive card component' },
      { title: 'Apply to your current design', description: 'Refactor one existing frame to use auto layout' }
    ],
    reminders: [
      { remind_at: '2026-11-03T10:00:00', reason: 'time_fit', message: 'Got 20 minutes? Watch the Figma Auto Layout tutorial you saved.' }
    ]
  },
  {
    id: randomUUID(),
    url: 'https://www.instagram.com/reel/headspace-hackathon-2026',
    title: 'Headspace Hackathon — Mental Health x Tech',
    thumbnail_url: null,
    content_type: 'event',
    intent: 'apply',
    intent_confirmed: 1,
    status: 'active',
    deadline: '2026-11-10',
    deadline_source: 'caption',
    deadline_confirmed: 1,
    source_platform: 'instagram',
    extracted_data: JSON.stringify({
      date: '2026-11-16',
      time: '9:00 AM - 9:00 PM',
      venue: 'Online + Bangalore Hub',
      registration_link: 'https://headspace-hack.devpost.com'
    }),
    space: null,
    project: null,
    estimated_minutes: 30,
    steps: [
      { title: 'Register before Nov 10', description: 'Sign up at headspace-hack.devpost.com' },
      { title: 'Form a team or go solo', description: 'Teams of up to 4 allowed' },
      { title: 'Brainstorm project ideas', description: 'Mental health x technology theme' },
      { title: 'Attend on Nov 16', description: 'Full-day hackathon, online + Bangalore hub' }
    ],
    reminders: [
      { remind_at: '2026-11-03T09:00:00', reason: 'deadline_week_before', message: 'Headspace Hackathon registration closes Nov 10. Register now and form your team!' },
      { remind_at: '2026-11-09T09:00:00', reason: 'deadline_tomorrow', message: 'Last day to register for Headspace Hackathon tomorrow! Don\'t miss it.' }
    ]
  },
  {
    id: randomUUID(),
    url: 'https://www.instagram.com/reel/vintage-poster-design',
    title: 'Retro Poster Design — 70s Typography Inspo',
    thumbnail_url: null,
    content_type: 'design',
    intent: 'get_inspired',
    intent_confirmed: 1,
    status: 'active',
    deadline: null,
    deadline_source: null,
    deadline_confirmed: 0,
    source_platform: 'instagram',
    extracted_data: JSON.stringify({
      style: 'Retro 70s, psychedelic, warm earth tones',
      tools: ['Adobe Illustrator', 'Procreate'],
      fonts: ['Cooper Black', 'ITC Benguiat', 'Bookmania'],
      resources: ['fontsinuse.com', 'typewolf.com']
    }),
    space: 'Design Board',
    project: null,
    estimated_minutes: 5,
    steps: [
      { title: 'Save fonts for later', description: 'Cooper Black, ITC Benguiat, Bookmania' },
      { title: 'Try a retro composition', description: 'Use warm earth tones and bold typography' }
    ],
    reminders: []
  },
  {
    id: randomUUID(),
    url: 'https://www.instagram.com/reel/budget-goa-backpacking',
    title: 'Budget Backpacking Goa — ₹5000 for 3 Days',
    thumbnail_url: null,
    content_type: 'place',
    intent: 'visit',
    intent_confirmed: 0,
    status: 'active',
    deadline: null,
    deadline_source: null,
    deadline_confirmed: 0,
    source_platform: 'instagram',
    extracted_data: JSON.stringify({
      name: 'Goa Budget Trip',
      area: 'North Goa — Anjuna, Vagator, Arambol',
      what_to_try: 'Arambol beach, Saturday Night Market, Chapora Fort sunrise',
      best_time: 'November to February'
    }),
    space: null,
    project: 'Travel Plans',
    estimated_minutes: 15,
    steps: [
      { title: 'Check train/bus tickets', description: 'Book early for best prices' },
      { title: 'Find hostels in Anjuna/Arambol', description: 'Budget ₹500-800/night' },
      { title: 'Plan 3-day itinerary', description: 'Beaches, markets, forts' }
    ],
    reminders: [
      { remind_at: '2026-11-08T18:00:00', reason: 'weekend_suggestion', message: 'Planning a Goa trip? You saved a budget backpacking guide. Perfect time to go — November is ideal!' }
    ]
  },
  {
    id: randomUUID(),
    url: 'https://www.instagram.com/reel/stanford-cs229-lecture',
    title: 'Stanford CS229 — Machine Learning Lecture 1',
    thumbnail_url: null,
    content_type: 'tutorial',
    intent: 'learn',
    intent_confirmed: 1,
    status: 'active',
    deadline: null,
    deadline_source: null,
    deadline_confirmed: 0,
    source_platform: 'youtube',
    extracted_data: JSON.stringify({
      topic: 'Machine Learning Fundamentals — Supervised Learning',
      length_minutes: 45,
      level: 'intermediate',
      steps_or_resources: ['Linear regression', 'Gradient descent', 'Normal equations', 'cs229.stanford.edu']
    }),
    space: null,
    project: 'ML Learning',
    estimated_minutes: 45,
    steps: [
      { title: 'Watch lecture 1', description: '45-minute intro to supervised learning' },
      { title: 'Take notes on key concepts', description: 'Linear regression, gradient descent' },
      { title: 'Complete Problem Set 1', description: 'Available on cs229.stanford.edu' }
    ],
    reminders: [
      { remind_at: '2026-11-04T20:00:00', reason: 'time_fit', message: 'Got 45 minutes tonight? Watch the Stanford CS229 lecture you saved on machine learning.' }
    ]
  },
  {
    id: randomUUID(),
    url: 'https://www.instagram.com/reel/amazon-sde-internship',
    title: 'Amazon SDE Internship — Summer 2027',
    thumbnail_url: null,
    content_type: 'opportunity',
    intent: 'apply',
    intent_confirmed: 1,
    status: 'expired',
    deadline: '2026-10-15',
    deadline_source: 'caption',
    deadline_confirmed: 1,
    source_platform: 'instagram',
    extracted_data: JSON.stringify({
      company: 'Amazon',
      role: 'SDE Intern',
      eligibility: 'Enrolled in BS/MS/PhD in CS or related field',
      application_link: 'https://amazon.jobs/students',
      documents_needed: ['Resume'],
      stage: 'saved'
    }),
    space: null,
    project: 'Summer Internships',
    estimated_minutes: 30,
    steps: [
      { title: 'Check eligibility', description: 'CS or related field enrollment' },
      { title: 'Update resume', description: 'Tailor to Amazon leadership principles' },
      { title: 'Submit application', description: 'Apply at amazon.jobs/students' }
    ],
    reminders: []
  }
];

export function seedDatabase() {
  const db = getDb();
  
  // Check if already seeded
  const count = db.prepare('SELECT COUNT(*) as count FROM saves').get() as { count: number };
  if (count.count > 0) {
    return; // Already seeded
  }

  const insertSave = db.prepare(`
    INSERT INTO saves (id, url, title, thumbnail_url, content_type, intent, intent_confirmed, status, deadline, deadline_source, deadline_confirmed, source_platform, extracted_data, space, project, estimated_minutes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'), datetime('now', '-' || ? || ' days'))
  `);

  const insertStep = db.prepare(`
    INSERT INTO action_steps (id, save_id, step_number, title, description, is_completed, completed_at)
    VALUES (?, ?, ?, ?, ?, 0, NULL)
  `);

  const insertReminder = db.prepare(`
    INSERT INTO reminders (id, save_id, remind_at, reason, message, is_dismissed, response)
    VALUES (?, ?, ?, ?, ?, 0, NULL)
  `);

  const transaction = db.transaction(() => {
    SEED_DATA.forEach((item, index) => {
      const daysAgo = SEED_DATA.length - index; // Stagger creation dates
      insertSave.run(
        item.id, item.url, item.title, item.thumbnail_url,
        item.content_type, item.intent, item.intent_confirmed,
        item.status, item.deadline, item.deadline_source,
        item.deadline_confirmed, item.source_platform,
        item.extracted_data, item.space, item.project,
        item.estimated_minutes, daysAgo, daysAgo
      );

      item.steps.forEach((step, stepIndex) => {
        insertStep.run(
          randomUUID(), item.id, stepIndex + 1,
          step.title, step.description
        );
      });

      item.reminders.forEach((reminder) => {
        insertReminder.run(
          randomUUID(), item.id, reminder.remind_at,
          reminder.reason, reminder.message
        );
      });
    });
  });

  transaction();
}
