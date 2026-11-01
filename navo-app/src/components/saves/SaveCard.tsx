'use client';

import React from 'react';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  MoreVertical,
  ChevronRight,
  Sparkles,
  Archive,
  Check
} from 'lucide-react';
import type { Save, ActionStep } from '@/types';
import { 
  getContentTypeIcon, 
  getContentTypeLabel, 
  getIntentLabel, 
  formatRelativeDate, 
  daysUntil, 
  getDeadlineColor 
} from '@/lib/utils';

interface SaveCardProps {
  save: Save;
  steps?: ActionStep[];
  onSelect: (save: Save) => void;
  onToggleStep?: (stepId: string, currentCompleted: boolean) => void;
  onArchive?: (saveId: string) => void;
  onMarkDone?: (saveId: string) => void;
}

export default function SaveCard({
  save,
  steps = [],
  onSelect,
  onToggleStep,
  onArchive,
  onMarkDone
}: SaveCardProps) {
  const days = daysUntil(save.deadline);
  const isUrgent = days !== null && days <= 3 && days >= 0;
  const isExpired = days !== null && days < 0;

  // Find next unfinished action step
  const nextStep = steps.find((s) => !s.is_completed);
  const completedSteps = steps.filter((s) => s.is_completed).length;
  const totalSteps = steps.length;
  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const data = save.extracted_data as Record<string, unknown>;

  return (
    <div className="bg-white rounded-xl border border-[#EBEAE5] hover:border-[#D5D2C9] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between overflow-hidden group">
      {/* Top Header strip */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Content Type Pill */}
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#F4F3EE] text-[#44403C] border border-[#E7E5DF]">
              <span>{getContentTypeIcon(save.content_type)}</span>
              <span>{getContentTypeLabel(save.content_type)}</span>
            </span>

            {/* Inferred Intent Pill */}
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#FDF1ED] text-[#D9532F] border border-[#FADCD3]">
              <span>Intent: {getIntentLabel(save.intent)}</span>
            </span>
          </div>

          {/* Platform Badge */}
          <span className="text-[10px] text-[#A8A29E] font-medium uppercase tracking-wider bg-[#F9F8F5] px-1.5 py-0.5 rounded">
            {save.source_platform}
          </span>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onSelect(save)}
          className="font-semibold text-base text-[#1C1917] group-hover:text-[#D9532F] transition-colors cursor-pointer line-clamp-2 leading-snug"
        >
          {save.title}
        </h3>

        {/* Extracted context details */}
        <div className="mt-2 text-xs text-[#78716C] space-y-1">
          {save.content_type === 'opportunity' && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {Boolean(data.company) && (
                <span className="font-medium text-[#44403C]">🏢 {String(data.company)}</span>
              )}
              {Boolean(data.role) && (
                <span className="text-[#57534E]">💼 {String(data.role)}</span>
              )}
            </div>
          )}

          {save.content_type === 'recipe' && (
            <div className="flex items-center gap-2">
              <span>⏱️ {data.cooking_time_minutes ? `${String(data.cooking_time_minutes)} min` : 'Quick recipe'}</span>
              <span>•</span>
              <span>🥘 {Array.isArray(data.ingredients) ? `${data.ingredients.length} ingredients` : 'Recipe steps'}</span>
            </div>
          )}

          {save.content_type === 'place' && (
            <div className="flex items-center gap-1.5 text-[#57534E]">
              <span>📍 {String(data.area || data.name || 'Location')}</span>
              {Boolean(data.what_to_try) && (
                <span className="text-[#A8A29E] truncate max-w-[200px]">• Try: {String(data.what_to_try)}</span>
              )}
            </div>
          )}

          {save.content_type === 'tutorial' && (
            <div className="flex items-center gap-1.5 text-[#57534E]">
              <span>📚 {String(data.topic || 'Skill')}</span>
              {Boolean(data.length_minutes) && <span>• {String(data.length_minutes)} min</span>}
            </div>
          )}
        </div>

        {/* Deadline pill if present */}
        {save.deadline && (
          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
              isExpired
                ? 'bg-red-50 text-red-700 border-red-200'
                : isUrgent
                ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              <Calendar className="w-3 h-3" />
              <span>{isExpired ? 'Expired' : 'Deadline'}: {formatRelativeDate(save.deadline)}</span>
            </span>
            <span className="text-[10px] text-[#A8A29E]">
              ({save.deadline_source || 'caption'})
            </span>
          </div>
        )}
      </div>

      {/* Signature feature: Single Next Action Step */}
      <div className="px-4 py-2.5 bg-[#FAF9F5] border-t border-[#EBEAE5]">
        <div className="flex items-center justify-between text-[11px] font-medium text-[#78716C] mb-1.5">
          <span>Next Action Step</span>
          {totalSteps > 0 && (
            <span className="text-[#A8A29E]">
              {completedSteps}/{totalSteps} done
            </span>
          )}
        </div>

        {nextStep ? (
          <div className="flex items-start gap-2 text-xs text-[#292524]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleStep) onToggleStep(nextStep.id, nextStep.is_completed);
              }}
              className="mt-0.5 text-[#A8A29E] hover:text-[#2C6E49] transition-colors shrink-0"
              title="Click to complete step"
            >
              <Circle className="w-3.5 h-3.5" />
            </button>
            <span 
              onClick={() => onSelect(save)}
              className="hover:text-[#D9532F] cursor-pointer line-clamp-1 font-medium"
            >
              {nextStep.title}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-[#2C6E49] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All action steps completed!</span>
          </div>
        )}

        {/* Mini progress bar */}
        {totalSteps > 0 && (
          <div className="w-full bg-[#EAE8E1] h-1 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-[#2C6E49] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="p-3 px-4 border-t border-[#EBEAE5] bg-white flex items-center justify-between text-xs">
        <button
          onClick={() => onSelect(save)}
          className="text-[#D9532F] hover:text-[#B8401F] font-medium flex items-center gap-1 group/btn"
        >
          <span>View Action Plan</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>

        <div className="flex items-center gap-2 text-[#78716C]">
          {save.status !== 'completed' && onMarkDone && (
            <button
              onClick={() => onMarkDone(save.id)}
              className="p-1 hover:text-[#2C6E49] hover:bg-[#EBF4EE] rounded transition-colors"
              title="Mark Finished"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          {onArchive && (
            <button
              onClick={() => onArchive(save.id)}
              className="p-1 hover:text-[#D9532F] hover:bg-[#FDF1ED] rounded transition-colors"
              title="Archive Save"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
