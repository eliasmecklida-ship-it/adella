import React, { useState } from 'react';
import { SubtitleRequest } from '../types';
import { MessageSquare, Plus, Flame, ThumbsUp, CheckCircle, Clock, Film, Tv, Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface MaombiTabProps {
  requests: SubtitleRequest[];
  onVote: (reqId: string) => Promise<void>;
  onRequestSubmit: (title: string, type: 'movie' | 'series', year?: string, requestedBy?: string) => Promise<void>;
}

export default function MaombiTab({ requests, onVote, onRequestSubmit }: MaombiTabProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'movie' | 'series'>('movie');
  const [year, setYear] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Tafadhali jaza Jina la Filamu/Series.');
      return;
    }
    setFormError('');
    setFormSuccess(false);
    setIsSubmitting(true);

    try {
      await onRequestSubmit(title, type, year || undefined, requestedBy || undefined);
      setFormSuccess(true);
      setTitle('');
      setYear('');
      setRequestedBy('');
      // Ondoa ujumbe wa mafanikio baada ya sekunde chache
      setTimeout(() => setFormSuccess(false), 5000);
    } catch (err: any) {
      setFormError(err.message || 'Uwasilishaji wa ombi umeshindikana. Tafadhali jaribu tena.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kuchuja na kupanga maombi kwa idadi ya kura zake (Votes) kuanzia ya juu
  const pendingRequests = requests
    .filter(r => r.status === 'pending')
    .sort((a, b) => b.votes - a.votes);

  const completedRequests = requests
    .filter(r => r.status === 'completed')
    .sort((a, b) => b.requestDate.localeCompare(a.requestDate));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left side: Request Submission Form */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-850">
            <div className="p-2 bg-amber-500 rounded-xl text-slate-950">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Omba Subtitle Mpya</h3>
              <p className="text-[10px] text-slate-500">Ombi litatufikia na kuonekana kwenye ubao</p>
            </div>
          </div>

          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2.5 text-[11px] font-semibold">
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-2.5 text-[11px] font-semibold">
              <CheckCircle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>Ombi lako limewasilishwa kikamilifu!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Jina la Filamu au Series *
              </label>
              <input
                type="text"
                required
                placeholder="Mfano: Avatar: The Way of Water"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/20 text-slate-300"
              />
            </div>

            {/* Type Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Aina ya Maudhui
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('movie')}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    type === 'movie'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  Filamu (Movie)
                </button>
                <button
                  type="button"
                  onClick={() => setType('series')}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    type === 'series'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  Tamthilia (Series)
                </button>
              </div>
            </div>

            {/* Year & Requested By */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Mwaka (Hiari)
                </label>
                <input
                  type="number"
                  placeholder="2026"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/20 text-slate-300 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Jina lako (Hiari)
                </label>
                <input
                  type="text"
                  placeholder="Kiba_cinema"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/20 text-slate-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className={`w-full py-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md ${
                isSubmitting || !title.trim()
                  ? 'bg-slate-950 text-slate-600 border border-slate-800 cursor-not-allowed shadow-none'
                  : 'bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 shadow-amber-500/10'
              }`}
            >
              Tuma Ombi la Subtitle
            </button>
          </form>
        </div>
      </div>

      {/* Right side: Requests list board */}
      <div className="lg:col-span-2 space-y-6">
        {/* Pending Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Maombi Yanayosubiriwa ({pendingRequests.length})</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-bold">Yamepangwa kwa kura nyingi</span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/10 border border-slate-900 rounded-3xl p-6">
              <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Hakuna maombi ya subtitles yanayosubiri sasa.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-900/30 border border-slate-850 hover:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1 flex-grow">
                    <div className="flex items-center gap-1.5">
                      {req.type === 'movie' ? (
                        <Film className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <Tv className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <h4 className="font-extrabold text-slate-200 text-sm">{req.title}</h4>
                      {req.year && (
                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-bold font-mono">
                          {req.year}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 font-bold">
                      <span>Limeombwa na: <span className="text-slate-400">{req.requestedBy}</span></span>
                      <span>•</span>
                      <span>Tarehe: {req.requestDate}</span>
                    </div>
                  </div>

                  {/* Vote Count and Vote Button */}
                  <button
                    onClick={() => onVote(req.id)}
                    className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-850 active:scale-95 border border-slate-800 hover:border-slate-750 text-slate-300 hover:text-amber-500 rounded-xl flex items-center gap-2 transition-all group"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 group-hover:scale-110 text-amber-500 transition-transform" />
                    <span className="font-black text-xs">{req.votes}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Section */}
        {completedRequests.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2 border-b border-slate-900 pb-2">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
              <span>Maombi Yaliyokamilika ({completedRequests.length})</span>
            </h3>

            <div className="space-y-3 opacity-75">
              {completedRequests.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-400 text-xs line-through">{req.title}</h4>
                      <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded font-black uppercase">
                        tayari
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-600 font-semibold">
                      Limeombwa na {req.requestedBy} • Likakamilishwa hivi karibuni
                    </p>
                  </div>

                  <span className="text-[10px] text-slate-600 font-bold font-mono">
                    {req.votes} Kura
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
