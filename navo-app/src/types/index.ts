// Navo - Type Definitions

export type ContentType = 
  | 'opportunity' 
  | 'recipe' 
  | 'place' 
  | 'tutorial' 
  | 'product' 
  | 'design' 
  | 'event' 
  | 'other';

export type Intent = 
  | 'apply' 
  | 'visit' 
  | 'cook' 
  | 'learn' 
  | 'get_inspired' 
  | 'buy' 
  | 'someday';

export type SaveStatus = 'active' | 'completed' | 'archived' | 'expired';

export type DeadlineSource = 'caption' | 'spoken' | 'on_screen' | 'manual';

export type SourcePlatform = 'instagram' | 'youtube' | 'tiktok' | 'web';

export type OpportunityStage = 'saved' | 'preparing' | 'applied' | 'waiting' | 'result';

export type ReminderReason = 
  | 'deadline_week_before' 
  | 'deadline_3_days' 
  | 'deadline_tomorrow' 
  | 'deadline_day' 
  | 'weekend_suggestion' 
  | 'time_fit';

export type ReminderResponse = 'done' | 'later' | 'not_interested';

// Extracted data structures by content type
export interface OpportunityData {
  company: string;
  role: string;
  eligibility?: string;
  application_link?: string;
  documents_needed?: string[];
  stage?: OpportunityStage;
}

export interface RecipeData {
  ingredients: { name: string; quantity: string }[];
  steps: string[];
  cooking_time_minutes?: number;
}

export interface PlaceData {
  name: string;
  area: string;
  map_location?: string;
  what_to_try?: string;
  best_time?: string;
}

export interface TutorialData {
  topic: string;
  length_minutes?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  steps_or_resources?: string[];
}

export interface ProductData {
  name: string;
  price?: string;
  where_to_buy?: string;
}

export interface DesignData {
  style?: string;
  tools?: string[];
  fonts?: string[];
  resources?: string[];
}

export interface EventData {
  date: string;
  time?: string;
  venue?: string;
  registration_link?: string;
}

export type ExtractedData = 
  | OpportunityData 
  | RecipeData 
  | PlaceData 
  | TutorialData 
  | ProductData 
  | DesignData 
  | EventData 
  | Record<string, unknown>;

export interface Save {
  id: string;
  url: string;
  title: string;
  thumbnail_url: string | null;
  content_type: ContentType;
  intent: Intent;
  intent_confirmed: boolean;
  status: SaveStatus;
  deadline: string | null;
  deadline_source: DeadlineSource | null;
  deadline_confirmed: boolean;
  source_platform: SourcePlatform;
  extracted_data: ExtractedData;
  space: string | null;
  project: string | null;
  estimated_minutes: number | null;
  created_at: string;
  updated_at: string;
  steps?: ActionStep[];
  reminders?: Reminder[];
}

export interface ActionStep {
  id: string;
  save_id: string;
  step_number: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  completed_at: string | null;
}

export interface Reminder {
  id: string;
  save_id: string;
  remind_at: string;
  reason: ReminderReason;
  message: string;
  is_dismissed: boolean;
  response: ReminderResponse | null;
}

export interface ParseResult {
  title: string;
  content_type: ContentType;
  intent: Intent;
  deadline: string | null;
  deadline_source: DeadlineSource | null;
  source_platform: SourcePlatform;
  extracted_data: ExtractedData;
  estimated_minutes: number | null;
  suggested_steps: { title: string; description?: string }[];
}

// UI State types
export interface TimeFitSuggestion {
  minutes: number;
  saves: Save[];
  urgent: Save[];
}

export type ViewType = 'home' | 'saves' | 'tracker' | 'cleanup';
