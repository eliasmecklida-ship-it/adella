import React, { useState, useRef, useEffect } from 'react';
import { MediaItem } from '../types';
import { Key, Upload, FileText, CheckCircle, AlertCircle, Sparkles, LogOut, MessageSquare, Plus, Trash2, Film, Tv, Calendar, Star, ShieldCheck, Search } from 'lucide-react';
import { motion } from 'motion/react';

interface ChangiaTabProps {
  mediaItems: MediaItem[];
  onUploadSubmit: (mediaId: string, translator: string, srtContent: string, version: string, season?: string, episode?: string, episodeTitle?: string, developerKey?: string) => Promise<void>;
  onMediaCreated?: () => void;
}

export default function ChangiaTab({ mediaItems, onUploadSubmit, onMediaCreated }: ChangiaTabProps) {
  // Authentication State
  const [developerKey, setDeveloperKey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Active Developer Section
  const [subTab, setSubTab] = useState<'upload' | 'requests' | 'add_media'>('upload');

  // Subtitle Upload Form State
  const [selectedMediaId, setSelectedMediaId] = useState('');
  const [mediaSearchQuery, setMediaSearchQuery] = useState('');

  // Kuchuja filamu kwa ajili ya kuchagua kiurahisi
  const filteredMediaItems = mediaItems.filter(m => 
    m.title.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
    (m.originalTitle && m.originalTitle.toLowerCase().includes(mediaSearchQuery.toLowerCase())) ||
    m.year.toString().includes(mediaSearchQuery)
  );
  const [translator, setTranslator] = useState('');
  const [srtContent, setSrtContent] = useState('');
  const [version, setVersion] = useState('');
  const [season, setSeason] = useState('');
  const [episode, setEpisode] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Media Form State
  const [newTitle, setNewTitle] = useState('');
  const [newOriginalTitle, setNewOriginalTitle] = useState('');
  const [newType, setNewType] = useState<'movie' | 'series'>('movie');
  const [newYear, setNewYear] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newPosterUrl, setNewPosterUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDescriptionSw, setNewDescriptionSw] = useState('');
  const [newRating, setNewRating] = useState('8.0');
  const [mediaError, setMediaError] = useState('');
  const [mediaSuccess, setMediaSuccess] = useState(false);
  const [isCreatingMedia, setIsCreatingMedia] = useState(false);

  // Developer Requests Management State
  const [developerRequests, setDeveloperRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Angalia kama alikuwa tayari ameshaingia kwenye session ya sasa
  useEffect(() => {
    const savedKey = sessionStorage.getItem('swahilimi_dev_key');
    if (savedKey) {
      setDeveloperKey(savedKey);
      setIsAuthorized(true);
    }
  }, []);

  // Fetch requests for developer when requests tab is selected
  useEffect(() => {
    if (isAuthorized && subTab === 'requests') {
      fetchDeveloperRequests();
    }
  }, [isAuthorized, subTab]);

  const fetchDeveloperRequests = async () => {
    try {
      setRequestsLoading(true);
      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = await res.json();
        setDeveloperRequests(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRequestsLoading(false);
    }
  };

  // Login handler
  const handleVerifyKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!developerKey.trim()) {
      setAuthError('Tafadhali weka nenosiri la Msanidi.');
      return;
    }

    setAuthError('');
    setIsVerifying(true);

    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ developerKey })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Uthibitisho umefeli.');
      }

      setIsAuthorized(true);
      sessionStorage.setItem('swahilimi_dev_key', developerKey);
    } catch (err: any) {
      setAuthError(err.message || 'Nenosiri si sahihi au halijatambuliwa.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    setDeveloperKey('');
    sessionStorage.removeItem('swahilimi_dev_key');
  };

  // Upload Subtitle Handler
  const handleSrtUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.srt')) {
      setUploadError('Tafadhali chagua faili la .srt pekee.');
      return;
    }
    setUploadError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSrtContent(content);
    };
    reader.readAsText(file);
  };

  const handleUploadSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMediaId) {
      setUploadError('Tafadhali chagua Filamu au Series kwanza.');
      return;
    }
    if (!translator.trim()) {
      setUploadError('Tafadhali jaza Jina la Mtafsiri.');
      return;
    }
    if (!srtContent.trim()) {
      setUploadError('Tafadhali pakia au ubandike maudhui ya SRT.');
      return;
    }

    const selectedMedia = mediaItems.find(m => m.id === selectedMediaId);
    if (selectedMedia?.type === 'series') {
      if (!season || !episode) {
        setUploadError('Kwa ajili ya Series, lazima ujaze namba ya Season na Episode.');
        return;
      }
    }

    setUploadError('');
    setUploadSuccess(false);
    setIsUploading(true);

    try {
      await onUploadSubmit(
        selectedMediaId,
        translator,
        srtContent,
        version || 'WEB-DL',
        season || undefined,
        episode || undefined,
        episodeTitle || undefined,
        developerKey
      );

      setUploadSuccess(true);
      setSrtContent('');
      setVersion('');
      setSeason('');
      setEpisode('');
      setEpisodeTitle('');
      
      // Fetch fresh requests to update counts
      if (subTab === 'requests') {
        fetchDeveloperRequests();
      }
    } catch (err: any) {
      setUploadError(err.message || 'Hitilafu imetokea wakati wa kupakia subtitle.');
    } finally {
      setIsUploading(false);
    }
  };

  // Add New Media Item Handler
  const handleCreateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setMediaError('Tafadhali jaza jina la filamu.');
      return;
    }

    setMediaError('');
    setMediaSuccess(false);
    setIsCreatingMedia(true);

    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          originalTitle: newOriginalTitle,
          type: newType,
          year: newYear,
          genre: newGenre,
          description: newDescription,
          descriptionSw: newDescriptionSw,
          posterUrl: newPosterUrl,
          rating: newRating,
          developerKey
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Imeshindikana kuongeza maudhui haya.');
      }

      setMediaSuccess(true);
      setNewTitle('');
      setNewOriginalTitle('');
      setNewYear('');
      setNewGenre('');
      setNewPosterUrl('');
      setNewDescription('');
      setNewDescriptionSw('');
      
      if (onMediaCreated) {
        onMediaCreated();
      }
      
      // Auto refresh catalog list in App state can be triggered by refreshing the page or manual fetch
      // But we will also tell the user that it succeeded!
    } catch (err: any) {
      setMediaError(err.message || 'Kuna hitilafu imetokea wakati wa kuongeza filamu.');
    } finally {
      setIsCreatingMedia(false);
    }
  };

  // Request Management Actions
  const handleCompleteRequest = async (reqId: string) => {
    try {
      const res = await fetch(`/api/requests/${reqId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ developerKey })
      });
      if (res.ok) {
        setDeveloperRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'completed' } : r));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRequest = async (reqId: string) => {
    if (!confirm('Je, una uhakika unataka kufuta kabisa ombi hili?')) return;
    try {
      const res = await fetch(`/api/requests/${reqId}?developerKey=${encodeURIComponent(developerKey)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDeveloperRequests(prev => prev.filter(r => r.id !== reqId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectedMedia = mediaItems.find(m => m.id === selectedMediaId);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 1. Unauthorized state - Login panel */}
      {!isAuthorized ? (
        <div className="max-w-md mx-auto bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl w-fit mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-extrabold text-white">Idhini ya Msanidi (Developer Verification)</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Sehemu hii ya kupakia subtitle kwenye Katalogi ya kudumu na kusimamia maombi imehifadhiwa kwa ajili ya Msanidi pekee. Tafadhali weka nenosiri lako la siri.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleVerifyKey} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Nenosiri / API Key ya Msanidi
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="password"
                  placeholder="Weka password"
                  value={developerKey}
                  onChange={(e) => setDeveloperKey(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 text-slate-300 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/15"
            >
              {isVerifying ? 'Inahakiki...' : 'Thibitisha Nenosiri'}
            </button>
          </form>

          <p className="text-[10px] text-slate-500 text-center">
            Kidokezo: Tumia neno la siri au API Key yako kuingia.
          </p>
        </div>
      ) : (
        /* 2. Authorized state - Developer Console */
        <div className="space-y-6">
          {/* Developer Header Panel */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500 rounded-2xl text-slate-950">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  Portal ya Msanidi Programu (Developer Panel)
                  <span className="text-[9px] bg-amber-500/15 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full font-extrabold uppercase">
                    Admin Online
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Dhibiti katalogi ya filamu, upakiaji wa series/seasons, na maombi yote hapa.</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-950 hover:bg-red-500/10 border border-slate-850 hover:border-red-500/20 text-slate-400 hover:text-red-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all self-end md:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              Toka (Logout)
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-800 gap-1 pb-px">
            <button
              onClick={() => setSubTab('upload')}
              className={`px-4 py-3 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 ${
                subTab === 'upload'
                  ? 'border-amber-500 text-amber-500 bg-slate-900/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              Pakia Subtitle Mpya
            </button>
            <button
              onClick={() => setSubTab('requests')}
              className={`px-4 py-3 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 ${
                subTab === 'requests'
                  ? 'border-amber-500 text-amber-500 bg-slate-900/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Kusimamia Maombi Yote
            </button>
            <button
              onClick={() => setSubTab('add_media')}
              className={`px-4 py-3 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 ${
                subTab === 'add_media'
                  ? 'border-amber-500 text-amber-500 bg-slate-900/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              Sajili Filamu/Series Mpya
            </button>
          </div>

          {/* Sub-tab Content panels */}
          <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6">
            
            {/* 2A. Sub-Tab: Upload Subtitle */}
            {subTab === 'upload' && (
              <div className="space-y-6">
                <div className="border-b border-slate-850 pb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Upload className="w-4.5 h-4.5 text-amber-500" /> Pakia faili la Subtitle ya Kiswahili
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Sajili faili rasmi la Kiswahili ambalo watumiaji watalikuta kwenye katalogi.</p>
                </div>

                {uploadError && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
                    <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
                    <CheckCircle className="w-4.5 h-4.5 flex-shrink-0" />
                    <span>Subtitle imepakiwa na kuunganishwa kwenye katalogi vyema! Watumiaji wanaweza kuipakua sasa hivi.</span>
                  </div>
                )}

                <form onSubmit={handleUploadSubmitForm} className="space-y-4">
                  {/* Select Media Item */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Chagua Filamu au Series kutoka Katalogi *
                      </label>
                      
                      {/* Sanduku la Utafutaji wa Filamu */}
                      <div className="relative">
                        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Andika hapa kutafuta filamu kwenye orodha..."
                          value={mediaSearchQuery}
                          onChange={(e) => setMediaSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-amber-500/50 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/30 text-slate-300 placeholder:text-slate-600 transition-all"
                        />
                      </div>

                      <select
                        required
                        value={selectedMediaId}
                        onChange={(e) => {
                          setSelectedMediaId(e.target.value);
                          setSeason('');
                          setEpisode('');
                          setEpisodeTitle('');
                        }}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-amber-500 focus:outline-none text-slate-300"
                      >
                        <option value="">
                          {mediaSearchQuery 
                            ? `-- Matokeo ya utafutaji (${filteredMediaItems.length}) --` 
                            : '-- Chagua filamu hapa --'}
                        </option>
                        {filteredMediaItems.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.title} ({m.type === 'movie' ? 'Movie' : 'Series'}) - {m.year}
                          </option>
                        ))}
                        {filteredMediaItems.length === 0 && (
                          <option disabled value="">Hakuna filamu iliyopatikana kwenye utafutaji wako</option>
                        )}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Mtafsiri / Translator Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Mfano: Simba_Subz_TZ"
                        value={translator}
                        onChange={(e) => setTranslator(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-amber-500 focus:outline-none text-slate-300"
                      />
                    </div>
                  </div>

                  {/* SERIES ONLY: Season and Episode Inputs */}
                  {selectedMedia && selectedMedia.type === 'series' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider block">
                          Namba ya Season *
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="Mfano: 1"
                          value={season}
                          onChange={(e) => setSeason(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-amber-500/20 focus:border-amber-500 rounded-xl text-xs focus:outline-none text-slate-300 font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider block">
                          Namba ya Episode *
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="Mfano: 3"
                          value={episode}
                          onChange={(e) => setEpisode(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-amber-500/20 focus:border-amber-500 rounded-xl text-xs focus:outline-none text-slate-300 font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider block">
                          Jina la Episode (Hiari)
                        </label>
                        <input
                          type="text"
                          placeholder="Mfano: E03: Presha Inapanda"
                          value={episodeTitle}
                          onChange={(e) => setEpisodeTitle(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-amber-500/20 focus:border-amber-500 rounded-xl text-xs focus:outline-none text-slate-300"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Version (Release version) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Release Version (Inayolengwa)
                    </label>
                    <input
                      type="text"
                      placeholder="Mfano: 720p.1080p.WEBRip.x264 au S01E01.720p.NF"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-amber-500 focus:outline-none text-slate-300 font-mono"
                    />
                  </div>

                  {/* SRT File Content */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Maudhui ya Subtitle ( SRT ) *
                      </label>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] text-amber-500 hover:underline flex items-center gap-1 font-bold"
                      >
                        <FileText className="w-3.5 h-3.5" /> Pakia kutoka faili .srt
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleSrtUpload}
                      accept=".srt"
                      className="hidden"
                    />
                    <textarea
                      required
                      rows={8}
                      placeholder="Bandika maandishi ya srt hapa..."
                      value={srtContent}
                      onChange={(e) => setSrtContent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono focus:border-amber-500 focus:outline-none text-slate-300 leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isUploading ? 'Inapakia sasa...' : 'Pakia Subtitle kwenye Katalogi'}
                  </button>
                </form>
              </div>
            )}

            {/* 2B. Sub-Tab: Manage Requests */}
            {subTab === 'requests' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <MessageSquare className="w-4.5 h-4.5 text-amber-500" /> Dhibiti Maombi ya Subtitles
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Maombi yaliyotumwa na watumiaji wa tovuti. Unaweza kuyaweka kuwa yamekamilika au kuyafuta.</p>
                  </div>
                  <button
                    onClick={fetchDeveloperRequests}
                    className="text-xs bg-slate-950 border border-slate-850 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-bold"
                  >
                    Refresh
                  </button>
                </div>

                {requestsLoading ? (
                  <p className="text-xs text-slate-500 text-center py-12">Inapakia maombi ya watumiaji...</p>
                ) : developerRequests.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-12">Bado hakuna maombi yoyote yaliyotumwa.</p>
                ) : (
                  <div className="space-y-3">
                    {developerRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-800 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {req.type === 'movie' ? (
                              <Film className="w-4 h-4 text-slate-400" />
                            ) : (
                              <Tv className="w-4 h-4 text-slate-400" />
                            )}
                            <h4 className="text-xs font-extrabold text-slate-200">{req.title}</h4>
                            <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-500 font-bold font-mono px-1.5 py-0.5 rounded">
                              Votes: {req.votes}
                            </span>
                            {req.status === 'completed' && (
                              <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 px-1.5 py-0.5 rounded font-black">
                                TAYARI
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold">
                            By: {req.requestedBy} • {req.requestDate} • Type: <span className="text-slate-400">{req.type}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {req.status !== 'completed' && (
                            <button
                              onClick={() => handleCompleteRequest(req.id)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-black rounded-lg transition-all"
                            >
                              Weka 'Tayari'
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteRequest(req.id)}
                            className="p-1.5 bg-slate-900 hover:bg-red-500/10 text-slate-500 hover:text-red-500 border border-slate-800 hover:border-red-500/20 rounded-lg transition-all"
                            title="Futa ombi hili"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2C. Sub-Tab: Add New Media */}
            {subTab === 'add_media' && (
              <div className="space-y-6">
                <div className="border-b border-slate-850 pb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Plus className="w-4.5 h-4.5 text-amber-500" /> Sajili Filamu au Series Mpya
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Sajili filamu au tamthilia mpya ili uweze kuipakia subtitles baadaye.</p>
                </div>

                {mediaError && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
                    <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                    <span>{mediaError}</span>
                  </div>
                )}

                {mediaSuccess && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
                    <CheckCircle className="w-4.5 h-4.5 flex-shrink-0" />
                    <span>Filamu mpya imesajiliwa kwenye Katalogi kikamilifu! Sasa unaweza kwenda kwenye kichupo cha 'Pakia Subtitle' kuisajilia srt file ya Kiswahili.</span>
                  </div>
                )}

                <form onSubmit={handleCreateMedia} className="space-y-4">
                  {/* Title & Original Title */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Jina la Filamu/Series (Title) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Mfano: Avatar: The Way of Water"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-amber-500 focus:outline-none text-slate-300"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Jina Mbadala la Kiswahili (Original Title)
                      </label>
                      <input
                        type="text"
                        placeholder="Mfano: Avatar: Njia ya Maji"
                        value={newOriginalTitle}
                        onChange={(e) => setNewOriginalTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-amber-500 focus:outline-none text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Type, Year, Genre */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Aina ya Maudhui (Type) *
                      </label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as 'movie' | 'series')}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-amber-500 focus:outline-none text-slate-300"
                      >
                        <option value="movie">Filamu (Movie)</option>
                        <option value="series">Tamthilia (Series)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Mwaka wa Kutoka (Year) *
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="Mfano: 2026"
                        value={newYear}
                        onChange={(e) => setNewYear(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-amber-500 focus:outline-none text-slate-300 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Aina/Genre (Zitenganishe kwa koma) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Action, Sci-Fi, Adventure"
                        value={newGenre}
                        onChange={(e) => setNewGenre(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-amber-500 focus:outline-none text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Poster URL & Rating */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Poster Image URL (Hiari, au inawekwa ya mfumo)
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={newPosterUrl}
                        onChange={(e) => setNewPosterUrl(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-amber-500 focus:outline-none text-slate-300 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Alama/Rating ( IMDb )
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="10"
                        placeholder="8.5"
                        value={newRating}
                        onChange={(e) => setNewRating(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-amber-500 focus:outline-none text-slate-300 font-mono"
                      />
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Muhtasari wa Kiswahili (Description Swahili) *
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Weka muhtasari mzuri wa kiswahili kwa ajili ya wasomaji..."
                        value={newDescriptionSw}
                        onChange={(e) => setNewDescriptionSw(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs focus:border-amber-500 focus:outline-none text-slate-300 leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Muhtasari wa Kiingereza (Description English) *
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="English movie description..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs focus:border-amber-500 focus:outline-none text-slate-300 leading-relaxed"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingMedia}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isCreatingMedia ? 'Inasajili sasa...' : 'Sajili Kwenye Katalogi'}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
