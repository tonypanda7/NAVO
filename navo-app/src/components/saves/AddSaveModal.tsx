'use client';

import React, { useState, useRef } from 'react';
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
  FileText,
  Camera,
  Mic,
  Upload,
  Check
} from 'lucide-react';
import type { ParseResult } from '@/types';
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
  const [activeInputTab, setActiveInputTab] = useState<'link' | 'image' | 'audio'>('link');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);

  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const sampleReels = [
    { 
      label: '🏆 Hackathon Reel (Devpost $50k)', 
      url: 'https://www.instagram.com/reel/devpost-global-ai-hackathon-2026',
      context: 'Global AI Hackathon 2026 is LIVE! $50k in cash prizes. Open to students and devs worldwide. Deadline to submit project on Devpost is Nov 25, 2026. Teams up to 4.',
      type: 'opportunity'
    },
    { 
      label: '💼 Google SWE Internship', 
      url: 'https://www.instagram.com/reel/google-swe-summer-internship-2027',
      context: 'Google SWE Summer 2027 Intern application opened! Eligibility: 2nd/3rd year CS. Deadline Nov 15 on careers.google.com with CV and transcript.',
      type: 'opportunity'
    },
    { 
      label: '🍳 Matcha Basque Cheesecake', 
      url: 'https://www.instagram.com/reel/easy-matcha-basque-cheesecake',
      context: 'Burnt Basque Matcha Cheesecake recipe. 20 min prep, cream cheese, matcha, heavy cream, eggs, bake at 220C for 25 mins. Best served cold.',
      type: 'recipe'
    },
    { 
      label: '📍 Blue Tokai Koramangala', 
      url: 'https://www.instagram.com/reel/blue-tokai-coffee-koramangala-guide',
      context: 'Blue Tokai Koramangala best for cold brew & quiet work on weekend mornings.',
      type: 'place'
    }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setAudioBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleParse = async (
    overrideUrl?: string, 
    overrideContext?: string,
    overrideImage?: string | null,
    overrideAudio?: string | null
  ) => {
    const targetUrl = (overrideUrl !== undefined ? overrideUrl : url).trim();
    const targetContext = (overrideContext !== undefined ? overrideContext : context).trim();
    const targetImage = overrideImage !== undefined ? overrideImage : imageBase64;
    const targetAudio = overrideAudio !== undefined ? overrideAudio : audioBase64;

    if (!targetUrl && !targetContext && !targetImage && !targetAudio) {
      setError('Please provide at least a URL, caption, reel screenshot, or audio track.');
      return;
    }

    setIsParsing(true);
    setError(null);
    setParseResult(null);

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: targetUrl || 'https://instagram.com/reel',
          context: targetContext || undefined,
          imageBase64: targetImage || undefined,
          audioBase64: targetAudio || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze reel with DeepInfra AI');
      }

      setParseResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please check the URL.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleCommitSave = async () => {
    if (!url.trim() && !context.trim() && !imageBase64 && !audioBase64) return;
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/saves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: url.trim() || 'https://instagram.com/reel',
          context: context.trim() || undefined,
          imageBase64: imageBase64 || undefined,
          audioBase64: audioBase64 || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save item');
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
        className="bg-white rounded-2xl border border-[#E5E3DC] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 pb-4 border-b border-[#EBEAE5] flex items-center justify-between bg-[#FBFBF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D9532F] text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#1C1917]">
                  Analyze &amp; Save Reel
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EBF4EE] text-[#2C6E49] border border-[#CDE5D4]">
                  Multi-Model Pipeline
                </span>
              </div>
              <p className="text-xs text-[#78716C] mt-0.5">
                Whisper Large-v3 (Audio) + Ling-3.0-flash-VL (OCR) + Llama 3.3 70B (Orchestration)
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

        {/* Input Mode Selector Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-[#EBEAE5] bg-white">
          <button
            onClick={() => setActiveInputTab('link')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 ${
              activeInputTab === 'link'
                ? 'border-[#D9532F] text-[#D9532F]'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Reel URL &amp; Caption</span>
          </button>

          <button
            onClick={() => setActiveInputTab('image')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 ${
              activeInputTab === 'image'
                ? 'border-[#D9532F] text-[#D9532F]'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Visual Frame / OCR (Ling-VL)</span>
            {imageBase64 && <Check className="w-3 h-3 text-[#2C6E49]" />}
          </button>

          <button
            onClick={() => setActiveInputTab('audio')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 ${
              activeInputTab === 'audio'
                ? 'border-[#D9532F] text-[#D9532F]'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Audio Track (Whisper-v3)</span>
            {audioBase64 && <Check className="w-3 h-3 text-[#2C6E49]" />}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: Link & Caption */}
          {activeInputTab === 'link' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#57534E]">
                  Instagram Reel / YouTube URL
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.instagram.com/reel/..."
                    className="w-full bg-[#F7F6F2] focus:bg-white text-sm text-[#1C1917] placeholder-[#A8A29E] pl-9 pr-4 py-2.5 rounded-lg border border-[#E5E3DC] focus:border-[#D9532F] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#57534E]">
                    Reel Caption / Creator Text / Comments
                  </label>
                  <span className="text-[11px] text-[#A8A29E]">
                    Helps AI classify accurately (e.g. Hackathon vs Recipe)
                  </span>
                </div>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Paste the caption or post text from Instagram/YouTube..."
                  rows={3}
                  className="w-full bg-[#F7F6F2] focus:bg-white text-xs text-[#1C1917] placeholder-[#A8A29E] p-2.5 rounded-lg border border-[#E5E3DC] focus:border-[#D9532F] focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Image Frame / OCR */}
          {activeInputTab === 'image' && (
            <div className="p-4 rounded-xl border border-dashed border-[#D5D2C9] bg-[#FAF9F5] text-center space-y-3">
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-white border border-[#E5E3DC] text-[#D9532F] mx-auto flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#1C1917]">
                  {imageFileName ? `Selected: ${imageFileName}` : 'Upload a screenshot of the reel frame'}
                </h4>
                <p className="text-[11px] text-[#78716C] mt-0.5">
                  DeepInfra Ling-3.0-flash-VL reads on-screen text, dates, deadline posters, and logos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F2F0EB] text-[#1C1917] border border-[#E5E3DC] text-xs font-medium inline-flex items-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{imageFileName ? 'Replace Screenshot' : 'Choose Image'}</span>
              </button>
            </div>
          )}

          {/* TAB 3: Audio Track / Whisper */}
          {activeInputTab === 'audio' && (
            <div className="p-4 rounded-xl border border-dashed border-[#D5D2C9] bg-[#FAF9F5] text-center space-y-3">
              <input
                type="file"
                ref={audioInputRef}
                onChange={handleAudioUpload}
                accept="audio/*"
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-white border border-[#E5E3DC] text-[#2C6E49] mx-auto flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#1C1917]">
                  {audioFileName ? `Selected: ${audioFileName}` : 'Upload audio clip (.mp3, .wav, .m4a)'}
                </h4>
                <p className="text-[11px] text-[#78716C] mt-0.5">
                  DeepInfra Whisper Large-v3 transcribes spoken creator dialogue and deadlines.
                </p>
              </div>
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F2F0EB] text-[#1C1917] border border-[#E5E3DC] text-xs font-medium inline-flex items-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{audioFileName ? 'Replace Audio' : 'Choose Audio File'}</span>
              </button>
            </div>
          )}

          {/* Pre-tested Reel Scenarios */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider block">
              Try a realistic sample reel:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {sampleReels.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUrl(s.url);
                    setContext(s.context);
                    handleParse(s.url, s.context);
                  }}
                  className="p-2 text-left rounded-lg bg-[#FAF9F5] hover:bg-[#F0EEE8] border border-[#EAE8E1] hover:border-[#D5D2C9] transition-all"
                >
                  <span className="text-xs font-medium text-[#1C1917] block truncate">
                    {s.label}
                  </span>
                  <span className="text-[10px] text-[#78716C] block truncate mt-0.5">
                    {s.context}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => handleParse()}
              disabled={(!url.trim() && !context.trim() && !imageBase64 && !audioBase64) || isParsing}
              className="px-4 py-2 bg-[#D9532F] hover:bg-[#C24523] disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Running Multi-Model Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze with Multi-Model AI</span>
                </>
              )}
            </button>
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
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#1C1917]">
                    Multi-Model Extracted Output
                  </span>
                  <span className="text-[10px] font-mono text-[#78716C] bg-white px-1.5 py-0.2 rounded border border-[#E5E3DC]">
                    {parseResult.model_name}
                  </span>
                </div>

                {/* Combined Cost Per Reel */}
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold bg-[#EBF4EE] text-[#2C6E49] px-2 py-0.5 rounded border border-[#CDE5D4]">
                  <Coins className="w-3 h-3 text-[#2C6E49]" />
                  <span>Total Cost: ${typeof parseResult.analysis_cost_usd === 'number' ? parseResult.analysis_cost_usd.toFixed(6) : '0.00004'}</span>
                </span>
              </div>

              {/* Title & Classification Badges */}
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

              {/* Transcripts or OCR previews if run */}
              {parseResult.whisper_transcript && (
                <div className="p-2.5 rounded-lg bg-white border border-[#E5E3DC] text-[11px] text-[#44403C]">
                  <span className="font-semibold text-[#2C6E49] block mb-0.5">🎙️ Whisper Transcript:</span>
                  <p className="italic">&ldquo;{parseResult.whisper_transcript}&rdquo;</p>
                </div>
              )}

              {parseResult.vision_ocr_text && (
                <div className="p-2.5 rounded-lg bg-white border border-[#E5E3DC] text-[11px] text-[#44403C]">
                  <span className="font-semibold text-[#B45309] block mb-0.5">👁️ Ling-VL On-Screen OCR:</span>
                  <p className="line-clamp-2">{parseResult.vision_ocr_text}</p>
                </div>
              )}

              {/* Action plan preview */}
              {parseResult.suggested_steps.length > 0 && (
                <div className="pt-2 border-t border-[#EAE8E1]">
                  <span className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <ListChecks className="w-3.5 h-3.5 text-[#D9532F]" />
                    Generated Action Plan ({parseResult.suggested_steps.length} steps)
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
            disabled={(!url.trim() && !context.trim() && !imageBase64 && !audioBase64) || isSaving}
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
