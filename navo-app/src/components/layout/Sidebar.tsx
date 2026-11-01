'use client';

import React from 'react';
import { 
  Sparkles, 
  Bookmark, 
  Briefcase, 
  Archive, 
  CheckCircle2, 
  Clock, 
  Flame,
  Layers,
  Cpu
} from 'lucide-react';
import type { ViewType } from '@/types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  stats?: {
    totalSaves: number;
    activeSaves: number;
    completedSaves: number;
    actionRate: number;
  };
  hasLlmConfigured: boolean;
}

export default function Sidebar({
  currentView,
  onViewChange,
  stats,
  hasLlmConfigured
}: SidebarProps) {
  const navItems = [
    {
      id: 'home' as ViewType,
      label: 'Home & Nudges',
      icon: Sparkles,
      count: stats?.activeSaves,
      badge: 'Today'
    },
    {
      id: 'saves' as ViewType,
      label: 'All Saved Items',
      icon: Bookmark,
      count: stats?.totalSaves
    },
    {
      id: 'tracker' as ViewType,
      label: 'Opportunity Tracker',
      icon: Briefcase,
      badge: 'Beachhead'
    },
    {
      id: 'cleanup' as ViewType,
      label: 'Cleanup & Health',
      icon: Archive,
      badge: 'Tidy'
    }
  ];

  return (
    <aside className="w-64 border-r border-[#EBEAE5] bg-[#F7F6F2] flex flex-col justify-between shrink-0 select-none h-screen sticky top-0">
      {/* Brand & Tagline */}
      <div>
        <div className="p-5 pb-4 border-b border-[#EBEAE5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D9532F] text-white flex items-center justify-center font-bold text-base tracking-tighter shadow-sm">
              N
            </div>
            <div>
              <span className="font-semibold text-lg text-[#1C1917] tracking-tight">Navo</span>
              <span className="ml-2 px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-[#EBEAE5] text-[#57534E]">
                v1.0
              </span>
            </div>
          </div>
          <p className="text-xs font-serif italic text-[#78716C] mt-2 tracking-wide">
            &ldquo;Saved is not done.&rdquo;
          </p>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#A8A29E]">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-[#D9532F] shadow-[0_1px_2px_rgba(0,0,0,0.06)] border border-[#E5E3DC]'
                    : 'text-[#44403C] hover:bg-[#EFECE6] hover:text-[#1C1917]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D9532F]' : 'text-[#78716C]'}`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      isActive 
                        ? 'bg-[#FDF1ED] text-[#D9532F]' 
                        : 'bg-[#EAE8E1] text-[#78716C]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === 'number' && (
                    <span className="text-xs font-medium text-[#A8A29E] tabular-nums">
                      {item.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Follow-through meter & Engine info */}
      <div className="p-4 border-t border-[#EBEAE5] space-y-3">
        {/* Follow through rate card */}
        <div className="p-3 rounded-lg bg-white border border-[#E8E6E0] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#57534E] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2C6E49]" />
              Follow-through
            </span>
            <span className="font-bold text-[#1C1917] tabular-nums">
              {stats?.actionRate ?? 0}%
            </span>
          </div>
          <div className="w-full bg-[#EFECE6] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#2C6E49] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(stats?.actionRate ?? 0, 100)}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-[#78716C] flex justify-between">
            <span>{stats?.completedSaves ?? 0} finished</span>
            <span>{stats?.activeSaves ?? 0} active</span>
          </div>
        </div>

        {/* AI Engine Status & Cost Per Reel */}
        <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E8E6E0] space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#D9532F]" />
              <span className="font-semibold text-[#1C1917]">Llama 3.3 70B</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] text-[#2C6E49] font-semibold bg-[#EBF4EE] px-1.5 py-0.2 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2C6E49] animate-pulse" />
              DeepInfra
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#78716C]">
            <span>Cost per reel:</span>
            <span className="font-mono font-medium text-[#2C6E49]">~$0.00003</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
