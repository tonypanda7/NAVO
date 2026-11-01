'use client';

import React, { useState } from 'react';
import { 
  Archive, 
  Trash2, 
  RotateCcw, 
  AlertOctagon, 
  Clock, 
  CheckCircle, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import type { Save } from '@/types';
import { daysUntil, formatDate, formatRelativeDate } from '@/lib/utils';

interface CleanupViewProps {
  saves: Save[];
  onStatusChange: (saveId: string, status: 'active' | 'completed' | 'archived') => void;
  onBulkArchiveExpired: () => void;
}

export default function CleanupView({
  saves,
  onStatusChange,
  onBulkArchiveExpired
}: CleanupViewProps) {
  const [activeTab, setActiveTab] = useState<'expired' | 'archived' | 'stale'>('expired');

  // Categorize saves
  const expiredSaves = saves.filter((s) => {
    if (s.status === 'archived') return false;
    const days = daysUntil(s.deadline);
    return (days !== null && days < 0) || s.status === 'expired';
  });

  const archivedSaves = saves.filter((s) => s.status === 'archived');

  const staleSaves = saves.filter((s) => {
    if (s.status !== 'active') return false;
    // untouched or saved > 7 days ago with 0 steps done
    const createdDaysAgo = Math.ceil(
      (new Date().getTime() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    return createdDaysAgo >= 5 && !s.deadline;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-[#EBEAE5] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#FDF1ED] text-[#D9532F]">
              <Archive className="w-4 h-4" />
            </span>
            <h2 className="font-bold text-lg text-[#1C1917]">
              Cleanup Space &amp; Content Health
            </h2>
          </div>
          <p className="text-xs text-[#78716C] mt-1 ml-7">
            Instagram saves pile up and go stale. Navo verifies deadlines and keeps your mental backlog lightweight.
          </p>
        </div>

        {/* Bulk Action */}
        {expiredSaves.length > 0 && (
          <button
            onClick={onBulkArchiveExpired}
            className="px-4 py-2 bg-[#1C1917] hover:bg-[#292524] text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all shrink-0 self-start md:self-auto"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archive All Expired ({expiredSaves.length})</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EBEAE5] pb-1">
        <button
          onClick={() => setActiveTab('expired')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'expired'
              ? 'bg-[#1C1917] text-white'
              : 'text-[#78716C] hover:bg-[#F2F0EB] hover:text-[#1C1917]'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Expired Deadlines</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            activeTab === 'expired' ? 'bg-stone-700 text-white' : 'bg-[#EAE8E1] text-[#78716C]'
          }`}>
            {expiredSaves.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('stale')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'stale'
              ? 'bg-[#1C1917] text-white'
              : 'text-[#78716C] hover:bg-[#F2F0EB] hover:text-[#1C1917]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Stale / Untouched</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            activeTab === 'stale' ? 'bg-stone-700 text-white' : 'bg-[#EAE8E1] text-[#78716C]'
          }`}>
            {staleSaves.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('archived')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'archived'
              ? 'bg-[#1C1917] text-white'
              : 'text-[#78716C] hover:bg-[#F2F0EB] hover:text-[#1C1917]'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Archived Items</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            activeTab === 'archived' ? 'bg-stone-700 text-white' : 'bg-[#EAE8E1] text-[#78716C]'
          }`}>
            {archivedSaves.length}
          </span>
        </button>
      </div>

      {/* Content List */}
      <div className="space-y-3">
        {activeTab === 'expired' && (
          <div className="space-y-2.5">
            {expiredSaves.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-[#EBEAE5] text-xs text-[#78716C]">
                <ShieldCheck className="w-8 h-8 text-[#2C6E49] mx-auto mb-2" />
                <p className="font-semibold text-sm text-[#1C1917]">No expired deadlines</p>
                <p className="mt-1">All your active opportunities have upcoming dates or are up to date.</p>
              </div>
            ) : (
              expiredSaves.map((save) => (
                <div
                  key={save.id}
                  className="bg-white p-4 rounded-xl border border-[#EBEAE5] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        Expired {save.deadline ? formatDate(save.deadline) : 'Date passed'}
                      </span>
                      <span className="text-[11px] text-[#A8A29E] uppercase font-semibold">
                        {save.source_platform}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-[#1C1917]">
                      {save.title}
                    </h4>
                    <p className="text-xs text-[#78716C]">
                      Source reel had deadline on {save.deadline}. Application has closed.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onStatusChange(save.id, 'archived')}
                      className="px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#EFECE6] text-[#1C1917] border border-[#E5E3DC] rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'stale' && (
          <div className="space-y-2.5">
            {staleSaves.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-[#EBEAE5] text-xs text-[#78716C]">
                <CheckCircle className="w-8 h-8 text-[#2C6E49] mx-auto mb-2" />
                <p className="font-semibold text-sm text-[#1C1917]">Backlog is fresh</p>
                <p className="mt-1">You do not have any dormant saves sitting unattended.</p>
              </div>
            ) : (
              staleSaves.map((save) => (
                <div
                  key={save.id}
                  className="bg-white p-4 rounded-xl border border-[#EBEAE5] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#78716C] bg-[#F4F3EE] px-2 py-0.5 rounded border border-[#E7E5DF]">
                        Saved {formatRelativeDate(save.created_at)}
                      </span>
                      <span className="text-[11px] font-semibold text-[#D9532F]">
                        Intent: {save.intent}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-[#1C1917]">
                      {save.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onStatusChange(save.id, 'completed')}
                      className="px-3 py-1.5 bg-[#EBF4EE] hover:bg-[#DDF0E2] text-[#2C6E49] rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </button>
                    <button
                      onClick={() => onStatusChange(save.id, 'archived')}
                      className="px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#EFECE6] text-[#78716C] border border-[#E5E3DC] rounded-lg text-xs font-medium transition-all"
                    >
                      Let Go
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'archived' && (
          <div className="space-y-2.5">
            {archivedSaves.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-[#EBEAE5] text-xs text-[#A8A29E]">
                No archived items yet.
              </div>
            ) : (
              archivedSaves.map((save) => (
                <div
                  key={save.id}
                  className="bg-white/60 p-4 rounded-xl border border-[#EBEAE5] flex items-center justify-between gap-4 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div>
                    <h4 className="font-medium text-sm text-[#57534E]">
                      {save.title}
                    </h4>
                    <span className="text-xs text-[#A8A29E]">
                      Archived • Original intent was {save.intent}
                    </span>
                  </div>

                  <button
                    onClick={() => onStatusChange(save.id, 'active')}
                    className="px-3 py-1.5 text-xs font-medium text-[#1C1917] hover:bg-white border border-[#E5E3DC] rounded-lg flex items-center gap-1 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
