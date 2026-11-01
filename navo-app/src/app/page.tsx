'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  Bookmark, 
  Briefcase, 
  Archive, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Layers,
  ArrowRight,
  Filter,
  Check,
  TrendingUp,
  FileCheck2,
  Calendar
} from 'lucide-react';
import type { Save, ActionStep, Reminder, ViewType, ContentType, Intent, OpportunityStage } from '@/types';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import TimeFitCard from '@/components/home/TimeFitCard';
import UpcomingDeadlines from '@/components/home/UpcomingDeadlines';
import SaveCard from '@/components/saves/SaveCard';
import SaveDetailModal from '@/components/saves/SaveDetailModal';
import AddSaveModal from '@/components/saves/AddSaveModal';
import KanbanBoard from '@/components/tracker/KanbanBoard';
import CleanupView from '@/components/cleanup/CleanupView';
import { getContentTypeIcon, getContentTypeLabel, getIntentLabel } from '@/lib/utils';

export default function NavoApp() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [saves, setSaves] = useState<Save[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState<{
    totalSaves: number;
    activeSaves: number;
    completedSaves: number;
    expiredSaves: number;
    actionRate: number;
    totalSteps: number;
    completedSteps: number;
    upcomingDeadlines: Save[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [intentFilter, setIntentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'completed' | 'all'>('active');

  // Modals state
  const [selectedSave, setSelectedSave] = useState<Save | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [heroInputUrl, setHeroInputUrl] = useState('');

  // Fetch all core data
  const fetchData = useCallback(async () => {
    try {
      const [savesRes, statsRes, remindersRes] = await Promise.all([
        fetch('/api/saves'),
        fetch('/api/stats'),
        fetch('/api/reminders')
      ]);

      if (savesRes.ok) {
        const savesData = await savesRes.json();
        setSaves(savesData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (remindersRes.ok) {
        const remindersData = await remindersRes.json();
        setReminders(remindersData);
      }
    } catch (err) {
      console.error('Error fetching Navo data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Keep selectedSave updated if saves array changes
  useEffect(() => {
    if (selectedSave) {
      const updated = saves.find((s) => s.id === selectedSave.id);
      if (updated) setSelectedSave(updated);
    }
  }, [saves, selectedSave]);

  // Handler: Toggle action step completion
  const handleToggleStep = async (stepId: string, currentCompleted: boolean) => {
    try {
      const res = await fetch(`/api/steps/${stepId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: !currentCompleted })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to toggle step:', err);
    }
  };

  // Handler: Add custom step
  const handleAddStep = async (saveId: string, title: string) => {
    try {
      const res = await fetch('/api/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ save_id: saveId, title })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to add step:', err);
    }
  };

  // Handler: Update Intent
  const handleUpdateIntent = async (saveId: string, intent: Intent) => {
    try {
      const res = await fetch(`/api/saves/${saveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent, intent_confirmed: 1 })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update intent:', err);
    }
  };

  // Handler: Change Save Status
  const handleStatusChange = async (saveId: string, status: 'active' | 'completed' | 'archived') => {
    try {
      const res = await fetch(`/api/saves/${saveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Handler: Move Kanban Stage for Opportunities
  const handleUpdateStage = async (saveId: string, newStage: OpportunityStage) => {
    const target = saves.find((s) => s.id === saveId);
    if (!target) return;

    const updatedData = {
      ...(target.extracted_data as Record<string, unknown>),
      stage: newStage
    };

    try {
      const res = await fetch(`/api/saves/${saveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extracted_data: updatedData,
          status: newStage === 'result' ? 'completed' : 'active'
        })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  // Handler: Dismiss / respond to reminder
  const handleDismissReminder = async (id: string, response?: 'done' | 'later') => {
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_dismissed: 1, response })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to dismiss reminder:', err);
    }
  };

  // Bulk Archive Expired
  const handleBulkArchiveExpired = async () => {
    const expired = saves.filter((s) => {
      if (s.status === 'archived') return false;
      const d = s.deadline ? new Date(s.deadline) : null;
      return (d && d < new Date()) || s.status === 'expired';
    });

    await Promise.all(
      expired.map((s) =>
        fetch(`/api/saves/${s.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'archived' })
        })
      )
    );
    fetchData();
  };

  // Fast direct paste from hero
  const handleHeroPasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroInputUrl.trim()) return;
    setIsAddModalOpen(true);
  };

  // Filtered saves for "All Saves" view
  const filteredSaves = useMemo(() => {
    return saves.filter((s) => {
      // Status filter
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;

      // Type filter
      if (typeFilter !== 'all' && s.content_type !== typeFilter) return false;

      // Intent filter
      if (intentFilter !== 'all' && s.intent !== intentFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = s.title.toLowerCase().includes(q);
        const dataStr = JSON.stringify(s.extracted_data).toLowerCase();
        const dataMatch = dataStr.includes(q);
        const projectMatch = s.project ? s.project.toLowerCase().includes(q) : false;
        return titleMatch || dataMatch || projectMatch;
      }

      return true;
    });
  }, [saves, statusFilter, typeFilter, intentFilter, searchQuery]);

  const activeDeadlines = useMemo(() => {
    return saves
      .filter((s) => s.deadline && s.status === 'active' && new Date(s.deadline) >= new Date())
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 4);
  }, [saves]);

  return (
    <div className="flex min-h-screen bg-[#FBFBF9] text-[#1C1917]">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        stats={stats ? {
          totalSaves: stats.totalSaves,
          activeSaves: stats.activeSaves,
          completedSaves: stats.completedSaves,
          actionRate: stats.actionRate
        } : undefined}
        hasLlmConfigured={true}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (q.trim() && currentView !== 'saves') {
              setCurrentView('saves');
            }
          }}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          reminders={reminders}
          onDismissReminder={handleDismissReminder}
          onSelectSaveId={(id) => {
            const found = saves.find((s) => s.id === id);
            if (found) setSelectedSave(found);
          }}
        />

        {/* View Switcher Container */}
        <main className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
          {/* ======================================================== */}
          {/* VIEW 1: HOME & NUDGES                                    */}
          {/* ======================================================== */}
          {currentView === 'home' && (
            <div className="space-y-6">
              {/* Editorial Hero Banner */}
              <div className="bg-white rounded-2xl border border-[#EBEAE5] p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden">
                <div className="max-w-2xl relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FDF1ED] text-[#D9532F] text-xs font-semibold mb-3 border border-[#FADCD3]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Follow-through for saved reels</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917] leading-tight">
                    Turn saved reels into things you actually do.
                  </h1>
                  <p className="text-sm text-[#78716C] mt-2 leading-relaxed">
                    Instagram&apos;s Saved tab is a graveyard of good intentions. Navo extracts the why, pulls deadlines and links, and brings them back when you have time to act.
                  </p>

                  {/* Quick paste bar */}
                  <div className="mt-5 flex items-center gap-2">
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-4 py-2.5 bg-[#D9532F] hover:bg-[#C24523] text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-[0_1px_3px_rgba(217,83,47,0.3)] transition-all active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Paste Reel or Link to Start</span>
                    </button>
                    <button
                      onClick={() => setCurrentView('tracker')}
                      className="px-4 py-2.5 bg-[#FAF9F5] hover:bg-[#F2F0EB] text-[#44403C] border border-[#E5E3DC] rounded-xl text-sm font-medium transition-all"
                    >
                      Explore Opportunity Tracker
                    </button>
                  </div>
                </div>

                {/* Subtle decorative watermark */}
                <div className="absolute right-6 -bottom-6 text-[120px] font-serif font-black text-[#F4F3EE] select-none pointer-events-none opacity-40">
                  NAVO
                </div>
              </div>

              {/* Stats Overview Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-xl border border-[#EBEAE5] shadow-sm">
                  <span className="text-xs font-medium text-[#78716C] block">Total Saves</span>
                  <span className="text-2xl font-bold text-[#1C1917] mt-1 block tabular-nums">
                    {stats?.totalSaves ?? 0}
                  </span>
                  <span className="text-[11px] text-[#A8A29E] mt-0.5 block">Across all categories</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#EBEAE5] shadow-sm">
                  <span className="text-xs font-medium text-[#78716C] block">Action Rate</span>
                  <span className="text-2xl font-bold text-[#2C6E49] mt-1 block tabular-nums">
                    {stats?.actionRate ?? 0}%
                  </span>
                  <span className="text-[11px] text-[#78716C] mt-0.5 block">Saves turned to finished tasks</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#EBEAE5] shadow-sm">
                  <span className="text-xs font-medium text-[#78716C] block">Active Action Steps</span>
                  <span className="text-2xl font-bold text-[#D9532F] mt-1 block tabular-nums">
                    {(stats?.totalSteps ?? 0) - (stats?.completedSteps ?? 0)}
                  </span>
                  <span className="text-[11px] text-[#A8A29E] mt-0.5 block">Ready to execute</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#EBEAE5] shadow-sm">
                  <span className="text-xs font-medium text-[#78716C] block">Automatic Nudges</span>
                  <span className="text-2xl font-bold text-[#B45309] mt-1 block tabular-nums">
                    {reminders.length}
                  </span>
                  <span className="text-[11px] text-[#A8A29E] mt-0.5 block">Scheduled by deadline</span>
                </div>
              </div>

              {/* Signature Feature: Time-Fit ("Got 10 minutes?") */}
              <TimeFitCard
                saves={saves}
                onSelectSave={(save) => setSelectedSave(save)}
              />

              {/* Hard Deadlines Strip */}
              <UpcomingDeadlines
                deadlines={activeDeadlines}
                onSelectSave={(save) => setSelectedSave(save)}
              />

              {/* Recent Active Saves */}
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div>
                    <h3 className="font-bold text-base text-[#1C1917]">
                      Recent Follow-Throughs
                    </h3>
                    <p className="text-xs text-[#78716C]">
                      Each card highlights the next single step to advance.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentView('saves')}
                    className="text-xs font-semibold text-[#D9532F] hover:underline flex items-center gap-1"
                  >
                    View All ({saves.length}) <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {saves
                    .filter((s) => s.status === 'active')
                    .slice(0, 6)
                    .map((save) => (
                      <SaveCard
                        key={save.id}
                        save={save}
                        steps={save.steps}
                        onSelect={(s) => setSelectedSave(s)}
                        onToggleStep={handleToggleStep}
                        onArchive={(id) => handleStatusChange(id, 'archived')}
                        onMarkDone={(id) => handleStatusChange(id, 'completed')}
                      />
                    ))}

                  {saves.filter((s) => s.status === 'active').length === 0 && (
                    <div className="col-span-full p-8 text-center bg-white rounded-xl border border-[#EBEAE5] text-xs text-[#78716C]">
                      <Sparkles className="w-8 h-8 text-[#D9532F] mx-auto mb-2" />
                      <p className="font-semibold text-sm text-[#1C1917]">Your workspace is completely clean</p>
                      <p className="mt-1">No placeholder data. Paste any reel or link to run Llama 3.3 70B and start follow-through.</p>
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D9532F] text-white font-medium text-xs shadow-sm hover:bg-[#C24523] transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Save Your First Reel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 2: ALL SAVES (FILTERABLE GALLERY)                    */}
          {/* ======================================================== */}
          {currentView === 'saves' && (
            <div className="space-y-5">
              {/* Filter Controls Header */}
              <div className="bg-white rounded-xl border border-[#EBEAE5] p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-lg text-[#1C1917]">
                      All Saved Content
                    </h2>
                    <p className="text-xs text-[#78716C]">
                      {filteredSaves.length} saves matching your filters
                    </p>
                  </div>

                  {/* Status tabs: Active vs Completed vs All */}
                  <div className="flex items-center gap-1 bg-[#F7F6F2] p-1 rounded-lg border border-[#EBEAE5]">
                    {(['active', 'completed', 'all'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                          statusFilter === st
                            ? 'bg-white text-[#1C1917] shadow-sm'
                            : 'text-[#78716C] hover:text-[#1C1917]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Type Filter Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#F2F0EB]">
                  <span className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mr-1">
                    Type:
                  </span>
                  {[
                    { id: 'all', label: 'All Types' },
                    { id: 'opportunity', label: 'Opportunities 💼' },
                    { id: 'recipe', label: 'Recipes 🍳' },
                    { id: 'place', label: 'Places 📍' },
                    { id: 'tutorial', label: 'Tutorials 📚' },
                    { id: 'event', label: 'Events 📅' },
                    { id: 'design', label: 'Design 🎨' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTypeFilter(t.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        typeFilter === t.id
                          ? 'bg-[#1C1917] text-white'
                          : 'bg-[#F7F6F2] hover:bg-[#EFECE6] text-[#57534E] border border-[#E5E3DC]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Intent Filter Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mr-1">
                    Intent:
                  </span>
                  {[
                    { id: 'all', label: 'Any Intent' },
                    { id: 'apply', label: 'Apply' },
                    { id: 'visit', label: 'Visit' },
                    { id: 'cook', label: 'Cook' },
                    { id: 'learn', label: 'Learn' },
                    { id: 'get_inspired', label: 'Get Inspired' }
                  ].map((intent) => (
                    <button
                      key={intent.id}
                      onClick={() => setIntentFilter(intent.id)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
                        intentFilter === intent.id
                          ? 'bg-[#D9532F] text-white'
                          : 'bg-[#FAF8F5] hover:bg-[#F2EFE8] text-[#78716C] border border-[#EBEAE5]'
                      }`}
                    >
                      {intent.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of saves */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSaves.map((save) => (
                  <SaveCard
                    key={save.id}
                    save={save}
                    steps={save.steps}
                    onSelect={(s) => setSelectedSave(s)}
                    onToggleStep={handleToggleStep}
                    onArchive={(id) => handleStatusChange(id, 'archived')}
                    onMarkDone={(id) => handleStatusChange(id, 'completed')}
                  />
                ))}

                {filteredSaves.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-white rounded-xl border border-[#EBEAE5] text-xs text-[#78716C]">
                    <Layers className="w-8 h-8 text-[#A8A29E] mx-auto mb-2" />
                    <p className="font-semibold text-sm text-[#1C1917]">No saves match your criteria</p>
                    <p className="mt-1">Try clearing some filters or searching for something else.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 3: OPPORTUNITY TRACKER (STUDENT BEACHHEAD)           */}
          {/* ======================================================== */}
          {currentView === 'tracker' && (
            <KanbanBoard
              saves={saves}
              onSelectSave={(s) => setSelectedSave(s)}
              onUpdateStage={handleUpdateStage}
            />
          )}

          {/* ======================================================== */}
          {/* VIEW 4: CLEANUP SPACE & HEALTH                           */}
          {/* ======================================================== */}
          {currentView === 'cleanup' && (
            <CleanupView
              saves={saves}
              onStatusChange={handleStatusChange}
              onBulkArchiveExpired={handleBulkArchiveExpired}
            />
          )}
        </main>
      </div>

      {/* Save Detail Modal / Slide-Over */}
      {selectedSave && (
        <SaveDetailModal
          save={selectedSave}
          steps={selectedSave.steps || []}
          reminders={selectedSave.reminders || []}
          onClose={() => setSelectedSave(null)}
          onToggleStep={handleToggleStep}
          onAddStep={handleAddStep}
          onUpdateIntent={handleUpdateIntent}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Add Save Modal */}
      <AddSaveModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveCreated={() => {
          fetchData();
        }}
      />
    </div>
  );
}
