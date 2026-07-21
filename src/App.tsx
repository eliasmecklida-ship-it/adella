import React, { useState, useEffect } from 'react';
import Header from './Components/Header.tsx';
import Footer from './Components/Footer.tsx';
import KatalogiTab from './Components/KatalogiTab.tsx';
import TafsiriTab from './Components/TafsiriTab.tsx';
import MaombiTab from './Components/MaombiTab.tsx';
import ChangiaTab from './Components/ChangiaTab.tsx';
import { MediaItem, SubtitleRequest } from './types';
import { Film, Sparkles, MessageSquare, PlusCircle, AlertCircle, Info } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'katalogi' | 'tafsiri' | 'maombi' | 'changia'>('katalogi');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [requests, setRequests] = useState<SubtitleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generalError, setGeneralError] = useState('');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [mediaRes, reqRes] = await Promise.all([
          fetch('/api/media'),
          fetch('/api/requests')
        ]);

        if (!mediaRes.ok || !reqRes.ok) {
          throw new Error('Kuna shida ya kuunganisha na mfumo.');
        }

        const mediaData = await mediaRes.json();
        const reqData = await reqRes.json();

        setMediaItems(mediaData);
        setRequests(reqData);
      } catch (err: any) {
        console.error(err);
        setGeneralError('Kushindwa kupata taarifa kutoka kwenye server. Hakikisha server inaendeshwa vyema.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty array runs only once on mount

  // 1. Download subtitle action
  const handleDownload = async (subId: string, filename: string, srtContent: string) => {
    try {
      // Increment download count on server
      await fetch(`/api/subtitles/${subId}/download`, { method: 'POST' });
      
      // Update local state download count
      setMediaItems(prevItems => prevItems.map(item => {
        return {
          ...item,
          subtitles: item.subtitles.map(sub => {
            if (sub.id === subId) {
              return { ...sub, downloads: sub.downloads + 1 };
            }
            return sub;
          })
        };
      }));

      // Trigger standard local file download
      const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Hitilafu ya kupakua faili:', err);
    }
  };

  // 2. Request subtitle submission
  const handleRequestSubmit = async (title: string, type: 'movie' | 'series', year?: string, requestedBy?: string) => {
    const response = await fetch('/api/subtitles/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, type, year, requestedBy })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Uwasilishaji wa ombi umefeli.');
    }

    const newRequest = await response.json();
    setRequests(prev => [newRequest, ...prev]);
  };

  // 3. Vote on a request
  const handleVote = async (reqId: string) => {
    try {
      const response = await fetch(`/api/requests/${reqId}/vote`, { method: 'POST' });
      if (!response.ok) return;

      const updatedRequest = await response.json();
      setRequests(prev => prev.map(r => r.id === reqId ? updatedRequest : r));
    } catch (err) {
      console.error('Hitilafu wakati wa kupiga kura:', err);
    }
  };

  // 4. Contribute subtitle upload
  const handleUploadSubmit = async (
    mediaId: string, 
    translator: string, 
    srtContent: string, 
    version: string,
    season?: string,
    episode?: string,
    episodeTitle?: string,
    developerKey?: string
  ) => {
    const response = await fetch('/api/subtitles/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaId, translator, srtContent, version, season, episode, episodeTitle, developerKey })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Upakiaji umeshindikana.');
    }

    const newSubtitle = await response.json();

    // Update local state mediaItems subtitle count
    setMediaItems(prev => prev.map(item => {
      if (item.id === mediaId) {
        return {
          ...item,
          subtitles: [...item.subtitles, newSubtitle]
        };
      }
      return item;
    }));

    // Re-fetch requests from server because some request might have been marked completed
    try {
      const reqRes = await fetch('/api/requests');
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-2xl">
          <button
            onClick={() => setActiveTab('katalogi')}
            className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'katalogi'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-extrabold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Film className="w-4 h-4" />
            Katalogi ya Filamu
          </button>
          
          <button
            onClick={() => setActiveTab('tafsiri')}
            className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'tafsiri'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-extrabold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Tafsiri kwa AI
          </button>

          <button
            onClick={() => setActiveTab('maombi')}
            className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'maombi'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-extrabold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Ubao wa Maombi
          </button>

          <button
            onClick={() => setActiveTab('changia')}
            className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'changia'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-extrabold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Changia Subtitle
          </button>
        </div>

        {/* Global Error Banner */}
        {generalError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-start gap-3 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Active Tab Content Panel */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
                Inapakia taarifa za mfumo...
              </p>
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'katalogi' && (
                <KatalogiTab mediaItems={mediaItems} onDownload={handleDownload} />
              )}
              {activeTab === 'tafsiri' && (
                <TafsiriTab onDownload={handleDownload} />
              )}
              {activeTab === 'maombi' && (
                <MaombiTab
                  requests={requests}
                  onVote={handleVote}
                  onRequestSubmit={handleRequestSubmit}
                />
              )}
              {activeTab === 'changia' && (
                <ChangiaTab mediaItems={mediaItems} onUploadSubmit={handleUploadSubmit} />
              )}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
