'use client';

import React, { useState } from 'react';
import { Search, Plus, Bell, X, ExternalLink, Check, Clock } from 'lucide-react';
import type { Reminder } from '@/types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddModal: () => void;
  reminders: Reminder[];
  onDismissReminder: (id: string, response?: 'done' | 'later') => void;
  onSelectSaveId?: (id: string) => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  reminders,
  onDismissReminder,
  onSelectSaveId
}: HeaderProps) {
  const [showBellDropdown, setShowBellDropdown] = useState(false);

  return (
    <header className="h-16 border-b border-[#EBEAE5] bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Bar */}
      <div className="relative w-96">
        <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search reels, intents, deadlines, companies..."
          className="w-full bg-[#F7F6F2] hover:bg-[#F0EEE8] focus:bg-white text-sm text-[#1C1917] placeholder-[#A8A29E] pl-9 pr-8 py-2 rounded-lg border border-[#E5E3DC] focus:border-[#D9532F] focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#1C1917]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center gap-3">
        {/* Scheduled Nudges Bell */}
        <div className="relative">
          <button
            onClick={() => setShowBellDropdown(!showBellDropdown)}
            className="p-2 rounded-lg border border-[#E5E3DC] hover:bg-[#F7F6F2] text-[#57534E] hover:text-[#1C1917] relative transition-colors"
            title="Scheduled Nudges"
          >
            <Bell className="w-4 h-4" />
            {reminders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D9532F] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {reminders.length}
              </span>
            )}
          </button>

          {/* Bell Dropdown popover */}
          {showBellDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E5E3DC] p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F0EEE8]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                  Active Follow-Up Nudges
                </span>
                <span className="text-xs text-[#A8A29E] font-medium">
                  {reminders.length} pending
                </span>
              </div>

              {reminders.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#A8A29E]">
                  No urgent nudges right now. All caught up!
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {reminders.map((r) => (
                    <div 
                      key={r.id} 
                      className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#EAE8E1] text-xs hover:border-[#D5D2C9] transition-all"
                    >
                      <p className="font-medium text-[#1C1917] leading-snug">
                        {r.message}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#F0EEE8]">
                        <span className="text-[10px] text-[#A8A29E] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(r.remind_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onDismissReminder(r.id, 'done')}
                            className="px-2 py-0.5 rounded bg-[#EBF4EE] hover:bg-[#DDF0E2] text-[#2C6E49] font-medium text-[11px] flex items-center gap-0.5"
                          >
                            <Check className="w-3 h-3" /> Done
                          </button>
                          <button
                            onClick={() => onDismissReminder(r.id, 'later')}
                            className="px-2 py-0.5 rounded bg-[#F2F0EB] hover:bg-[#E8E6E0] text-[#78716C] font-medium text-[11px]"
                          >
                            Later
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Primary "+ Save Reel / Link" Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 bg-[#D9532F] hover:bg-[#C24523] active:scale-[0.98] text-white px-3.5 py-2 rounded-lg text-sm font-medium shadow-[0_1px_2px_rgba(217,83,47,0.2)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Save Reel / Link</span>
        </button>
      </div>
    </header>
  );
}
