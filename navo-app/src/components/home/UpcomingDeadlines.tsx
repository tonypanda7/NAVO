'use client';

import React from 'react';
import { Calendar, AlertCircle, ArrowUpRight, CheckCircle } from 'lucide-react';
import type { Save } from '@/types';
import { formatRelativeDate, daysUntil, getDeadlineColor } from '@/lib/utils';

interface UpcomingDeadlinesProps {
  deadlines: Save[];
  onSelectSave: (save: Save) => void;
}

export default function UpcomingDeadlines({
  deadlines,
  onSelectSave
}: UpcomingDeadlinesProps) {
  if (deadlines.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-[#EBEAE5] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-6">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F2F0EB]">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-[#FEF3C7] text-[#B45309]">
            <Calendar className="w-4 h-4" />
          </span>
          <h3 className="font-semibold text-base text-[#1C1917]">
            Upcoming Hard Deadlines
          </h3>
        </div>
        <span className="text-xs text-[#78716C]">
          Extracted directly from saved reels
        </span>
      </div>

      <div className="space-y-2.5">
        {deadlines.map((save) => {
          const days = daysUntil(save.deadline);
          const isUrgent = days !== null && days <= 3 && days >= 0;

          return (
            <div
              key={save.id}
              onClick={() => onSelectSave(save)}
              className="flex items-center justify-between p-3 rounded-lg border border-[#EAE8E1] bg-[#FAF9F5] hover:bg-white hover:border-[#D5D2C9] cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  isUrgent ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                }`} />
                <div>
                  <h4 className="text-sm font-medium text-[#1C1917] group-hover:text-[#D9532F] transition-colors">
                    {save.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-[#78716C] mt-0.5">
                    {save.project && (
                      <span className="text-[#A8A29E] font-medium">
                        [{save.project}]
                      </span>
                    )}
                    <span>Source: {save.deadline_source || 'caption'}</span>
                    <span>•</span>
                    <span className="capitalize">{save.content_type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    isUrgent 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {formatRelativeDate(save.deadline)}
                  </span>
                  <div className="text-[11px] text-[#A8A29E] mt-0.5">
                    {save.deadline}
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#A8A29E] group-hover:text-[#D9532F] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
