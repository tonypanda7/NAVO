'use client';

import React, { useState } from 'react';
import { 
  Briefcase, 
  ExternalLink, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  CheckCircle2, 
  Clock,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import type { Save, OpportunityStage } from '@/types';
import { formatRelativeDate, daysUntil, formatDate } from '@/lib/utils';

interface KanbanBoardProps {
  saves: Save[];
  onSelectSave: (save: Save) => void;
  onUpdateStage: (saveId: string, newStage: OpportunityStage) => void;
}

const STAGES: { id: OpportunityStage; label: string; desc: string; color: string }[] = [
  { id: 'saved', label: '1. Saved', desc: 'Discovered from reel', color: 'bg-stone-100 text-stone-700' },
  { id: 'preparing', label: '2. Preparing', desc: 'CV & materials in progress', color: 'bg-blue-50 text-blue-700' },
  { id: 'applied', label: '3. Applied', desc: 'Application submitted', color: 'bg-amber-50 text-amber-800' },
  { id: 'waiting', label: '4. Waiting', desc: 'Under review / interview', color: 'bg-purple-50 text-purple-700' },
  { id: 'result', label: '5. Result', desc: 'Outcome & follow-up', color: 'bg-emerald-50 text-emerald-800' },
];

export default function KanbanBoard({
  saves,
  onSelectSave,
  onUpdateStage
}: KanbanBoardProps) {
  const [filterUrgentOnly, setFilterUrgentOnly] = useState(false);

  // Filter for opportunities (internships, fellowships, hackathons, scholarships, events)
  const opps = saves.filter((s) => {
    const isOpp = s.content_type === 'opportunity' || s.content_type === 'event' || s.intent === 'apply';
    if (!isOpp) return false;
    if (filterUrgentOnly) {
      const d = daysUntil(s.deadline);
      return d !== null && d >= 0 && d <= 7;
    }
    return true;
  });

  const getStageForSave = (s: Save): OpportunityStage => {
    const data = s.extracted_data as Record<string, unknown>;
    if (data && typeof data.stage === 'string') {
      return data.stage as OpportunityStage;
    }
    if (s.status === 'completed') return 'result';
    return 'saved';
  };

  const stageOrder: OpportunityStage[] = ['saved', 'preparing', 'applied', 'waiting', 'result'];

  const moveStage = (save: Save, direction: 'prev' | 'next') => {
    const current = getStageForSave(save);
    const currentIndex = stageOrder.indexOf(current);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < stageOrder.length) {
      onUpdateStage(save.id, stageOrder[newIndex]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining the Student Wedge */}
      <div className="bg-white rounded-xl border border-[#EBEAE5] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#FDF1ED] text-[#D9532F]">
              <Briefcase className="w-4 h-4" />
            </span>
            <h2 className="font-bold text-lg text-[#1C1917]">
              Opportunity Tracker
            </h2>
            <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-[#EBF4EE] text-[#2C6E49]">
              Student Wedge
            </span>
          </div>
          <p className="text-xs text-[#78716C] mt-1 ml-7">
            Turn saved internship &amp; fellowship reels into submitted applications before deadlines expire.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setFilterUrgentOnly(!filterUrgentOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filterUrgentOnly
                ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                : 'bg-[#F7F6F2] hover:bg-[#EFECE6] text-[#57534E] border border-[#E5E3DC]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Urgent Deadlines (Next 7 Days)</span>
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
        {STAGES.map((stage) => {
          const itemsInStage = opps.filter((s) => getStageForSave(s) === stage.id);

          return (
            <div 
              key={stage.id}
              className="bg-[#F8F7F3] rounded-xl border border-[#EBEAE5] p-3 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="pb-2.5 mb-2.5 border-b border-[#E8E6DF] flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-xs text-[#1C1917]">
                    {stage.label}
                  </h3>
                  <p className="text-[10px] text-[#A8A29E] mt-0.5">
                    {stage.desc}
                  </p>
                </div>
                <span className="text-xs font-bold text-[#78716C] bg-white border border-[#E5E3DC] w-5 h-5 rounded-full flex items-center justify-center">
                  {itemsInStage.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {itemsInStage.map((save) => {
                  const data = save.extracted_data as Record<string, unknown>;
                  const days = daysUntil(save.deadline);
                  const isUrgent = days !== null && days <= 3 && days >= 0;

                  return (
                    <div
                      key={save.id}
                      className="bg-white rounded-lg border border-[#E8E6E0] p-3 shadow-sm hover:shadow-md hover:border-[#D5D2C9] transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Company & Role */}
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="text-[11px] font-bold text-[#D9532F] uppercase tracking-wide">
                            {String(data.company || 'Opportunity')}
                          </span>
                          {data.application_link ? (
                            <a
                              href={String(data.application_link)}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[#A8A29E] hover:text-[#D9532F]"
                              title="Direct Apply Link"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : null}
                        </div>

                        <h4 
                          onClick={() => onSelectSave(save)}
                          className="font-medium text-xs text-[#1C1917] group-hover:text-[#D9532F] cursor-pointer line-clamp-2 leading-snug"
                        >
                          {save.title}
                        </h4>

                        {/* Deadline indicator */}
                        {save.deadline && (
                          <div className={`mt-2 flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded ${
                            isUrgent 
                              ? 'bg-red-50 text-red-700 font-semibold animate-pulse'
                              : 'bg-[#FFFBEB] text-[#92400E]'
                          }`}>
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span>{formatRelativeDate(save.deadline)}</span>
                          </div>
                        )}
                      </div>

                      {/* Pipeline Stage Movers */}
                      <div className="mt-3 pt-2 border-t border-[#F0EEE8] flex items-center justify-between text-[11px]">
                        <button
                          onClick={() => moveStage(save, 'prev')}
                          disabled={stage.id === 'saved'}
                          className="p-1 text-[#A8A29E] hover:text-[#1C1917] disabled:opacity-20 transition-colors"
                          title="Move to previous stage"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onSelectSave(save)}
                          className="text-[#78716C] hover:text-[#D9532F] font-medium text-[10px]"
                        >
                          View Plan
                        </button>

                        <button
                          onClick={() => moveStage(save, 'next')}
                          disabled={stage.id === 'result'}
                          className="p-1 text-[#A8A29E] hover:text-[#1C1917] disabled:opacity-20 transition-colors"
                          title="Move to next stage"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {itemsInStage.length === 0 && (
                  <div className="py-8 text-center text-[11px] text-[#A8A29E] italic">
                    No items here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
