'use client';

import React, { useState } from 'react';
import { 
  X, 
  Link2, 
  Sparkles, 
  Loader2, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  ListChecks,
  AlertCircle,
  Coins,
  Cpu,
  FileText
} from 'lucide-react';
import type { ParseResult, ContentType, Intent } from '@/types';
import { getContentTypeIcon, getContentTypeLabel, getIntentLabel } from '@/lib/utils';

interface AddSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCreated: () => void;
}

export default function AddSaveModal({
  isOpen,
  onClose,
  onSaveCreated
}: AddSaveModalProps) {
  const [url, setUrl] = useState('');
  const [context, setContext] = useState('');
  const [showContextInput, setShowContextInput] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const sampleUrls = [
    { 
      label: 'Google SWE Internship', 
      url: 'https://www.instagram.com/reel/google-swe-internship-summer-2027',
      context: 'Google SWE Summer 2027 Intern application opened! Eligibility: 2nd/3rd year CS. Deadline Nov 15 on careers.google.com'
    },
    { 
      label: 'Matcha Tiramisu Recipe', 
      url: 'https://www.instagram.com/reel/easy-matcha-tiramisu-recipe',
      context: '10 min prep, mascarpone, ladyfingers, matcha powder, chill 4 hours.'
    },
    { 
      label: 'Bangalore Cafe Guide', 
      url: 'https://www.instagram.com/reel/top-5-aesthetic-cafes-koramangala',
      context: 'Blue Tokai Koramangala best for cold brew & quiet work on weekend mornings.'
    },
    { 
      label: 'Stanford CS Tutorial', 
      url: 'https://www.youtube.com/watch?v=stanford-cs-deep-learning',
      context: 'Lecture 1: Machine Learning Foundations, supervised vs unsupervised, 45 mins.'
    }
  ];

  const handleParse = async (urlToParse: string, contextToParse?: string) => {
    if (!urlToParse.trim()) return;
    setIsParsing(true);
    setError(null);
    setParseResult(null);

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: urlToParse.trim(),
          context: (contextToParse !== undefined ? contextToParse : context).trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze reel with DeepInfra Llama 70B');
      }

      setParseResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please check the URL.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleCommitSave = async () => {
    if (!url.trim()) return;
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/saves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: url.trim(),
          context: context.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create save');
      }

      onSaveCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl border border-[#E5E3DC] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden text-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 pb-4 border-b border-[#EBEAE5] flex items-center justify-between bg-[#FBFBF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D9532F] text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1C1917]">
                Save Reel or Link
              </h3>
              <p className="text-xs text-[#78716C]">
                Analyzed with DeepInfra Llama 3.3 70B Turbo into structured follow-through steps.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#EFECE6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Input field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#78716C] block">
              Paste Instagram Reel, YouTube Short, or Web URL
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
                className="w-full bg-[#F7F6F2] focus:bg-white text-sm text-[#1C1917] placeholder-[#A8A29E] pl-9 pr-28 py-2.5 rounded-lg border border-[#E5E3DC] focus:border-[#D9532F] focus:outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleParse(url);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => handleParse(url)}
                disabled={!url.trim() || isParsing}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#D9532F] hover:bg-[#C24523] disabled:opacity-40 text-white rounded-md text-xs font-medium transition-all flex items-center gap-1 shadow-sm"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>Run Llama</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Optional Caption / Notes dropdown */}
          <div>
            {!showContextInput ? (
              <button
                type="button"
                onClick={() => setShowContextInput(true)}
                className="text-[11px] text-[#78716C] hover:text-[#D9532F] flex items-center gap-1 font-medium"
              >
                <FileText className="w-3 h-3" />
                <span>+ Add optional caption or reel text for better extraction</span>
              </button>
            ) : (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#78716C]">
                    Reel Caption / Text (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowContextInput(false)}
                    className="text-[10px] text-[#A8A29E] hover:text-[#78716C]"
                  >
                    Hide
                  </button>
                </div>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Paste any text from the reel caption, comments, or deadline info..."
                  rows={2}
                  className="w-full bg-[#F7F6F2] focus:bg-white text-xs text-[#1C1917] placeholder-[#A8A29E] p-2.5 rounded-lg border border-[#E5E3DC] focus:border-[#D9532F] focus:outline-none transition-all"
                />
              </div>
            )}
          </div>

          {/* Sample quick paste chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-[#A8A29E] block">
              Try a demo link with real Llama analysis:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleUrls.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUrl(s.url);
                    setContext(s.context);
                    setShowContextInput(true);
                    handleParse(s.url, s.context);
                  }}
                  className="px-2.5 py-1 rounded bg-[#F4F3EE] hover:bg-[#EAE8E1] text-[#57534E] text-[11px] font-medium border border-[#E7E5DF] transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Real-time Understanding Preview */}
          {parseResult && (
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#EBEAE5] space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-[#EAE8E1]">
                <span className="text-xs font-semibold text-[#1C1917] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D9532F]" />
                  Extracted via Llama 3.3 70B Turbo:
                </span>
                
                {/* Cost Per Reel Badge */}
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold bg-[#EBF4EE] text-[#2C6E49] px-2 py-0.5 rounded border border-[#CDE5D4]">
                  <Coins className="w-3 h-3 text-[#2C6E49]" />
                  <span>Cost: ${typeof parseResult.analysis_cost_usd === 'number' ? parseResult.analysis_cost_usd.toFixed(6) : '0.00003'}</span>
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-[#1C1917]">
                  {parseResult.title}
                </h4>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-white border border-[#E5E3DC] font-medium text-[#44403C]">
                    {getContentTypeIcon(parseResult.content_type)} {getContentTypeLabel(parseResult.content_type)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-[#FDF1ED] border border-[#FADCD3] font-bold text-[#D9532F]">
                    Intent: {getIntentLabel(parseResult.intent)}
                  </span>
                  {parseResult.deadline && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-[#FFFBEB] border border-[#FDE68A] font-semibold text-[#B45309]">
                      <Calendar className="w-3 h-3" /> Due {parseResult.deadline} ({parseResult.deadline_source || 'caption'})
                    </span>
                  )}
                </div>
              </div>

              {/* Action plan preview */}
              {parseResult.suggested_steps.length > 0 && (
                <div className="pt-2 border-t border-[#EAE8E1]">
                  <span className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <ListChecks className="w-3.5 h-3.5 text-[#D9532F]" />
                    Generated Action Steps ({parseResult.suggested_steps.length})
                  </span>
                  <div className="space-y-1.5">
                    {parseResult.suggested_steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#44403C]">
                        <span className="w-4 h-4 rounded-full bg-[#EAE8E1] text-[#78716C] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-medium text-[#1C1917]">{step.title}</span>
                          {step.description && (
                            <span className="text-[#78716C] block text-[11px]">{step.description}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Model & Token metadata strip */}
              <div className="pt-2 border-t border-[#EAE8E1] flex items-center justify-between text-[10px] text-[#A8A29E]">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-[#D9532F]" />
                  <span>{parseResult.model_name || 'meta-llama/Llama-3.3-70B-Instruct-Turbo'}</span>
                </span>
                {parseResult.tokens_used && (
                  <span>{parseResult.tokens_used} tokens</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-5 border-t border-[#EBEAE5] bg-[#FBFBF9] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-[#78716C] hover:text-[#1C1917]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCommitSave}
            disabled={!url.trim() || isSaving}
            className="px-4 py-2 bg-[#D9532F] hover:bg-[#C24523] disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to Navo...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm &amp; Add Follow-Through</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
