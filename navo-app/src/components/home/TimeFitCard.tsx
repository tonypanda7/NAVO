'use client';

import React, { useState } from 'react';
import { Clock, Zap, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Save } from '@/types';
import { getContentTypeIcon, getIntentLabel } from '@/lib/utils';

interface TimeFitCardProps {
  saves: Save[];
  onSelectSave: (save: Save) => void;
}

export default function TimeFitCard({ saves, onSelectSave }: TimeFitCardProps) {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(15);

  const timeOptions = [
    { label: '5 min', value: 5, desc: 'Quick check' },
    { label: '15 min', value: 15, desc: 'Short review' },
    { label: '30 min', value: 30, desc: 'Focused task' },
    { label: '45+ min', value: 45, desc: 'Deep work' },
  ];

  // Filter saves matching the selected time frame (or estimated within range)
  const matchingSaves = saves.filter((s) => {
    if (s.status !== 'active') return false;
    const est = s.estimated_minutes || 15;
    if (selectedMinutes === 5) return est <= 10;
    if (selectedMinutes === 15) return est > 10 && est <= 25;
    if (selectedMinutes === 30) return est > 25 && est <= 40;
    return est > 40;
  });

  // Check if there are urgent saves (deadline within 3 days)
  const urgentSaves = saves.filter((s) => {
    if (!s.deadline || s.status !== 'active') return false;
    const diffDays = Math.ceil(
      (new Date(s.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays >= 0 && diffDays <= 7;
  });

  return (
    <div className="bg-white rounded-xl border border-[#EBEAE5] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F2F0EB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#FDF1ED] text-[#D9532F]">
              <Clock className="w-4 h-4" />
            </span>
            <h3 className="font-semibold text-base text-[#1C1917]">
              Time-Fit: &ldquo;Got a few minutes?&rdquo;
            </h3>
          </div>
          <p className="text-xs text-[#78716C] mt-0.5 ml-7">
            Navo matches your free time with saves you can actually finish right now.
          </p>
        </div>

        {/* Time gap selector buttons */}
        <div className="flex items-center gap-1.5 bg-[#F7F6F2] p-1 rounded-lg border border-[#EBEAE5] self-start sm:self-auto">
          {timeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedMinutes(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                selectedMinutes === opt.value
                  ? 'bg-white text-[#D9532F] font-semibold shadow-sm border border-[#E2DFD7]'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Urgent override banner if deadline is coming up */}
      {urgentSaves.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
            <span className="text-xs font-medium text-[#92400E]">
              <strong>Priority:</strong> {urgentSaves[0].title} has a deadline coming up soon!
            </span>
          </div>
          <button
            onClick={() => onSelectSave(urgentSaves[0])}
            className="text-xs font-semibold text-[#B45309] hover:underline flex items-center gap-1 shrink-0"
          >
            Act Now <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Suggested items list */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {matchingSaves.slice(0, 3).map((save) => (
          <div
            key={save.id}
            onClick={() => onSelectSave(save)}
            className="p-3.5 rounded-lg border border-[#EBEAE5] bg-[#FAF9F5] hover:bg-white hover:border-[#D5D2C9] hover:shadow-sm cursor-pointer transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[#78716C] mb-1.5">
                <span className="flex items-center gap-1 font-medium">
                  <span>{getContentTypeIcon(save.content_type)}</span>
                  <span>{getIntentLabel(save.intent)}</span>
                </span>
                <span className="text-[11px] text-[#A8A29E] bg-[#EFECE6] px-1.5 py-0.5 rounded">
                  ~{save.estimated_minutes ?? 15} min
                </span>
              </div>
              <h4 className="font-medium text-sm text-[#1C1917] group-hover:text-[#D9532F] transition-colors line-clamp-1">
                {save.title}
              </h4>
              <p className="text-xs text-[#78716C] mt-1 line-clamp-2">
                {save.project ? `Goal: ${save.project}` : `From ${save.source_platform}`}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-[#EAE8E1] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#57534E]">
                {save.deadline ? `Due ${save.deadline}` : 'Ready for next step'}
              </span>
              <span className="text-[#D9532F] font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-[11px]">
                Start <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}

        {matchingSaves.length === 0 && (
          <div className="col-span-full py-6 text-center text-xs text-[#A8A29E]">
            No items queued for this exact time gap. Select another duration or paste a new link!
          </div>
        )}
      </div>
    </div>
  );
}
