# Navo — From Intent to Action (Prototype)

> **"Saved is not done."** Turn saved reels into things you actually do.

Navo is a follow-through app for saved content (starting with Instagram reels, YouTube Shorts, and web links). Instead of letting bookmarks pile up into an overwhelming backlog, Navo parses the reel, remembers your intent, extracts hard deadlines and application links, and brings it back at the right time with a single next action step.

---

## 🚀 Live Prototype Server

The prototype is running live locally on port **3000**:
- **Local URL:** `http://localhost:3000`
- **Network URL:** `http://10.59.27.226:3000`

---

## 🤖 Configuring Llama 70B (OpenInfra / OpenAI-Compatible)

The AI Understanding Engine is structured in [`src/lib/parser.ts`](file:///home/tonypanda/Projects/NAVO/navo-app/src/lib/parser.ts).

To connect your OpenInfra Llama 70B model API:
1. Create or edit `.env.local` in `navo-app/`:
```bash
LLM_API_URL=https://<your-openinfra-endpoint>/v1/chat/completions
LLM_API_KEY=<your_openinfra_api_key>
LLM_MODEL=meta-llama/llama-3.1-70b-instruct
```
2. When configured, any pasted URL is sent directly to Llama 70B with strict JSON structured extraction.
3. If no key is set yet, Navo runs on its **smart built-in fallback parser**, so the entire prototype works immediately for testing and demos!

---

## 📱 Implemented Features (Mapped to Product Doc)

### 1. Light-Themed, Editorial Craft UI
- Designed to feel like a high-end consumer tool (warm eggshell `#FBFBF9`, terracotta `#D9532F`, sage green `#2C6E49`, crisp subtle borders).
- Avoids generic AI gradients and dark purple tropes.

### 2. The Signature Feature: Intent Memory (Section 5.3)
- Remembers *why* you saved each item (`Apply`, `Visit`, `Cook`, `Learn`, `Get Inspired`, `Buy`, `Someday`).
- One-tap intent confirmation and switching with instant database persistence.

### 3. Single Next Action Step on Every Card (Section 5.5)
- Avoids walls of tasks by displaying the single next unfinished step directly on each card.
- Clickable checkboxes right on cards advance the plan without even opening the modal.

### 4. Time-Fit Suggestions: "Got 10 minutes?" (Section 5.6)
- Filter chips for 5 min, 15 min, 30 min, and 45+ min.
- Matches your current time gap with quick tasks, while prioritizing urgent deadlines.

### 5. Hard Deadline Tracking & Automatic Nudges (Sections 5.2, 5.4)
- Extracts dates from reels and marks their source (`caption`, `on_screen`, `spoken`).
- Schedules automatic nudges (1 week before, 3 days before, day before).
- Bell icon dropdown in header displays upcoming follow-ups with one-click **Done** or **Later** responses.

### 6. Opportunity Tracker — Student Beachhead (Section 5.10)
- 5-stage Kanban pipeline tailored for internships, scholarships, and hackathons:
  `Saved` → `Preparing` → `Applied` → `Waiting` → `Result`
- Direct external apply links.
- "Urgent Deadlines Only" filter.

### 7. Cleanup Space & Content Health (Section 5.8)
- Triage interface for expired opportunities (e.g. Amazon SDE whose deadline has passed), stale untouched saves, and archived items.
- "Archive All Expired" one-click action.

### 8. Full Instant Search & Filter Gallery
- Search across titles, companies, topics, and notes.
- Filter by Content Type (Opportunities, Recipes, Places, Tutorials, Events, Design) and Intent.

---

## 🗄️ Database Architecture (SQLite)

Located at `/home/tonypanda/Projects/NAVO/navo-app/navo.db`:
- **`saves`**: URL, title, content_type, intent, intent_confirmed, status, deadline, deadline_source, extracted_data JSON, estimated_minutes.
- **`action_steps`**: Ordered checklist (1-5 steps per save) with completion status and timestamps.
- **`reminders`**: Auto-generated notifications linked to deadlines with response tracking (`done` / `later`).
- Pre-seeded with 10 realistic demo saves (Google SWE Internship, YC Fellowship, Matcha Tiramisu recipe, Blue Tokai Koramangala cafe, Figma Auto Layout tutorial, Headspace hackathon, etc.).

---

## 🛠️ Tech Stack
- **Framework:** Next.js 16 (App Router + Turbopack)
- **Language:** TypeScript (strict mode, zero errors)
- **Styling:** Tailwind CSS v4 + custom tokens
- **Database:** SQLite (`better-sqlite3` with WAL mode & foreign keys)
- **Icons:** Lucide React
- **Animations:** CSS transitions + micro-interactions
