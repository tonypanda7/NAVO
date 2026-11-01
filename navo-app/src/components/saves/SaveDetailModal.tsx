'use client';

import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowRight,
  Check,
  Tag,
  AlertCircle
} from 'lucide-react';
import type { Save, ActionStep, Reminder, Intent } from '@/types';
import { 
  getContentTypeIcon, 
  getContentTypeLabel, 
  getIntentLabel, 
  formatDate, 
  formatRelativeDate,
  daysUntil 
} from '@/lib/utils';

interface SaveDetailModalProps {
  save: Save;
  steps: ActionStep[];
  reminders: Reminder[];
  onClose: () => void;
  onToggleStep: (stepId: string, currentCompleted: boolean) => void;
  onAddStep: (saveId: string, title: string) => void;
  onUpdateIntent: (saveId: string, intent: Intent) => void;
  onStatusChange: (saveId: string, status: 'active' | 'completed' | 'archived') => void;
}

export default function SaveDetailModal({
  save,
  steps,
  reminders,
  onClose,
  onToggleStep,
  onAddStep,
  onUpdateIntent,
  onStatusChange
}: SaveDetailModalProps) {
  const [newStepTitle, setNewStepTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'plan' | 'extracted' | 'reminders'>('plan');

  const intentOptions: Intent[] = [
    'apply',
    'visit',
    'cook',
    'learn',
    'get_inspired',
    'buy',
    'someday'
  ];

  const handleAddStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim()) return;
    onAddStep(save.id, newStepTitle.trim());
    setNewStepTitle('');
  };

  const days = daysUntil(save.deadline);
  const data = save.extracted_data as Record<string, unknown>;
  const completedSteps = steps.filter((s) => s.is_completed).length;
  const progressPercent = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl border border-[#E5E3DC] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-5 pb-4 border-b border-[#EBEAE5] flex items-start justify-between gap-4 bg-[#FBFBF9]">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-[#F4F3EE] text-[#44403C] border border-[#E7E5DF]">
                {getContentTypeIcon(save.content_type)} {getContentTypeLabel(save.content_type)}
              </span>
              <span className="text-[11px] text-[#A8A29E] uppercase tracking-wider font-semibold bg-[#EAE8E1] px-1.5 py-0.5 rounded">
                {save.source_platform}
              </span>
              {save.project && (
                <span className="text-xs text-[#78716C] bg-white border border-[#E5E3DC] px-2 py-0.5 rounded-full">
                  📁 {save.project}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-[#1C1917] tracking-tight leading-snug">
              {save.title}
            </h2>

            <div className="flex items-center gap-3 text-xs text-[#78716C] pt-0.5">
              <a
                href={save.url}
                target="_blank"
                rel="noreferrer"
                className="text-[#D9532F] hover:underline flex items-center gap-1 font-medium"
              >
                Open Original Reel <ExternalLink className="w-3 h-3" />
              </a>
              <span>•</span>
              <span>Saved {formatDate(save.created_at)}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#EFECE6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intent Memory Bar (The Signature Feature) */}
        <div className="px-5 py-3 bg-[#FAF8F5] border-b border-[#EBEAE5]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-[#1C1917] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D9532F]" />
                Intent Memory:
              </span>
              <span className="text-xs text-[#78716C] ml-5">
                Why you saved this:
              </span>
            </div>

            {/* One-tap intent selector pills */}
            <div className="flex items-center gap-1 flex-wrap">
              {intentOptions.map((intent) => {
                const isSelected = save.intent === intent;
                return (
                  <button
                    key={intent}
                    onClick={() => onUpdateIntent(save.id, intent)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#D9532F] text-white shadow-sm'
                        : 'bg-white text-[#57534E] border border-[#E5E3DC] hover:border-[#D9532F]'
                    }`}
                  >
                    {getIntentLabel(intent)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Deadline Alert Banner if present */}
        {save.deadline && (
          <div className="px-5 py-2.5 bg-[#FFFBEB] border-b border-[#FDE68A] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#92400E]">
              <Calendar className="w-4 h-4 text-[#D97706]" />
              <span>
                <strong>Deadline:</strong> {formatDate(save.deadline)} ({formatRelativeDate(save.deadline)})
              </span>
              <span className="text-[11px] text-[#B45309]">
                via {save.deadline_source || 'caption text'}
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#D97706] uppercase tracking-wider">
              {days !== null && days <= 3 ? 'Urgent' : 'Tracked'}
            </span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#EBEAE5] px-5 bg-white">
          <button
            onClick={() => setActiveTab('plan')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'plan'
                ? 'border-[#D9532F] text-[#D9532F]'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <span>Action Plan</span>
            <span className="text-[10px] bg-[#F4F3EE] px-1.5 py-0.2 rounded-full font-medium">
              {completedSteps}/{steps.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('extracted')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'extracted'
                ? 'border-[#D9532F] text-[#D9532F]'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <span>Extracted Reel Details</span>
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'reminders'
                ? 'border-[#D9532F] text-[#D9532F]'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <span>Auto Nudges</span>
            {reminders.length > 0 && (
              <span className="text-[10px] bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.2 rounded-full font-bold">
                {reminders.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: Action Plan */}
          {activeTab === 'plan' && (
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="p-3 bg-[#FAF9F5] rounded-lg border border-[#EAE8E1]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-[#44403C]">Execution Progress</span>
                  <span className="font-bold text-[#1C1917]">{Math.round(progressPercent)}% completed</span>
                </div>
                <div className="w-full bg-[#E5E3DC] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#2C6E49] h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Steps Checklist */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#A8A29E] mb-1">
                  Steps to Follow-Through
                </div>

                {steps.map((step) => (
                  <div
                    key={step.id}
                    onClick={() => onToggleStep(step.id, step.is_completed)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                      step.is_completed
                        ? 'bg-[#F7FBF8] border-[#D4EAD9] text-[#78716C]'
                        : 'bg-white border-[#E8E6E0] hover:border-[#D5D2C9] text-[#1C1917] shadow-sm'
                    }`}
                  >
                    <button className="mt-0.5 text-[#A8A29E] shrink-0">
                      {step.is_completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2C6E49]" />
                      ) : (
                        <Circle className="w-4 h-4 hover:text-[#2C6E49]" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${step.is_completed ? 'line-through text-[#78716C]' : 'text-[#1C1917]'}`}>
                        {step.title}
                      </p>
                      {step.description && (
                        <p className="text-xs text-[#78716C] mt-0.5 leading-relaxed">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Step input */}
              <form onSubmit={handleAddStepSubmit} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  placeholder="Add another step to this plan..."
                  className="flex-1 bg-[#F7F6F2] text-sm text-[#1C1917] placeholder-[#A8A29E] px-3 py-2 rounded-lg border border-[#E5E3DC] focus:border-[#D9532F] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newStepTitle.trim()}
                  className="px-3.5 py-2 bg-[#1C1917] hover:bg-[#292524] disabled:opacity-40 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Step</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Extracted Data */}
          {activeTab === 'extracted' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#EBEAE5] text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#EAE8E1]">
                  <span className="font-semibold text-[#1C1917]">Understanding Engine Extraction</span>
                  <span className="text-[11px] text-[#2C6E49] bg-[#EBF4EE] px-2 py-0.5 rounded font-medium">
                    Verified Structured Data
                  </span>
                </div>

                {save.content_type === 'opportunity' && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#A8A29E] block">Company</span>
                      <span className="font-semibold text-[#1C1917]">{String(data.company || 'Not specified')}</span>
                    </div>
                    <div>
                      <span className="text-[#A8A29E] block">Role</span>
                      <span className="font-semibold text-[#1C1917]">{String(data.role || 'Not specified')}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#A8A29E] block">Eligibility</span>
                      <span className="text-[#44403C]">{String(data.eligibility || 'Check reel')}</span>
                    </div>
                    {Boolean(data.application_link) && (
                      <div className="col-span-2">
                        <span className="text-[#A8A29E] block">Direct Apply Link</span>
                        <a 
                          href={String(data.application_link)} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[#D9532F] hover:underline flex items-center gap-1"
                        >
                          {String(data.application_link)} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {Array.isArray(data.documents_needed) && (
                      <div className="col-span-2">
                        <span className="text-[#A8A29E] block">Documents Required</span>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {data.documents_needed.map((doc, idx) => (
                            <span key={idx} className="bg-white border border-[#E5E3DC] px-2 py-0.5 rounded text-[11px]">
                              📄 {String(doc)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {save.content_type === 'recipe' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[#A8A29E] block mb-1">Ingredients Pulled from Reel</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {Array.isArray(data.ingredients) && data.ingredients.map((ing, idx) => (
                          <div key={idx} className="p-1.5 bg-white border border-[#E5E3DC] rounded flex justify-between">
                            <span className="font-medium text-[#1C1917]">{String(ing.name)}</span>
                            <span className="text-[#78716C]">{String(ing.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {Array.isArray(data.steps) && (
                      <div>
                        <span className="text-[#A8A29E] block mb-1">Cooking Sequence</span>
                        <ol className="list-decimal pl-4 space-y-1 text-[#44403C]">
                          {data.steps.map((st, idx) => (
                            <li key={idx}>{String(st)}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                {save.content_type === 'place' && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[#A8A29E] block">Area / Neighborhood</span>
                      <span className="font-semibold text-[#1C1917]">{String(data.area || data.name)}</span>
                    </div>
                    <div>
                      <span className="text-[#A8A29E] block">What to Try (Highlighted in Reel)</span>
                      <span className="text-[#44403C]">{String(data.what_to_try || 'Specialty item')}</span>
                    </div>
                    <div>
                      <span className="text-[#A8A29E] block">Best Time to Visit</span>
                      <span className="text-[#44403C]">{String(data.best_time || 'Weekend')}</span>
                    </div>
                  </div>
                )}

                {save.content_type === 'tutorial' && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[#A8A29E] block">Topic</span>
                      <span className="font-semibold text-[#1C1917]">{String(data.topic)}</span>
                    </div>
                    {Array.isArray(data.steps_or_resources) && (
                      <div>
                        <span className="text-[#A8A29E] block mb-1">Resources & Concepts</span>
                        <div className="flex gap-1.5 flex-wrap">
                          {data.steps_or_resources.map((res, idx) => (
                            <span key={idx} className="bg-white border border-[#E5E3DC] px-2 py-0.5 rounded text-[11px]">
                              {String(res)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Auto Nudges */}
          {activeTab === 'reminders' && (
            <div className="space-y-3">
              <p className="text-xs text-[#78716C]">
                Navo schedules these nudges automatically without manual setup, based on the extracted deadline.
              </p>

              {reminders.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#A8A29E]">
                  No reminders scheduled for this item.
                </div>
              ) : (
                reminders.map((rem) => (
                  <div 
                    key={rem.id}
                    className="p-3 rounded-lg border border-[#EBEAE5] bg-[#FAF9F5] text-xs flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1C1917]">
                          {formatDate(rem.remind_at)}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-[#B45309] bg-[#FEF3C7] px-1.5 py-0.2 rounded">
                          {rem.reason.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-[#44403C]">
                        {rem.message}
                      </p>
                    </div>

                    <span className="text-[11px] text-[#A8A29E] shrink-0 font-medium">
                      {rem.is_dismissed ? 'Dismissed' : 'Scheduled'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Bottom Status & Triage Actions */}
        <div className="p-4 px-5 border-t border-[#EBEAE5] bg-[#FBFBF9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onStatusChange(save.id, save.status === 'completed' ? 'active' : 'completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                save.status === 'completed'
                  ? 'bg-[#EBF4EE] text-[#2C6E49] border border-[#C5E3CE]'
                  : 'bg-white hover:bg-[#FAF9F5] text-[#1C1917] border border-[#E5E3DC]'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{save.status === 'completed' ? 'Completed' : 'Mark as Done'}</span>
            </button>

            <button
              onClick={() => onStatusChange(save.id, 'archived')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#78716C] hover:text-[#1C1917] hover:bg-[#EFECE6] transition-all"
            >
              Archive
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
