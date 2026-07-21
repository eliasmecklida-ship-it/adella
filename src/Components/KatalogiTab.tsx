import React, { useState, useEffect } from 'react';
import { MediaItem, Subtitle } from '../types';
import { Search, Star, Download, Heart, Tv, Film, Calendar, ChevronRight, ChevronDown, Award, ListFilter, Sparkles, Check, Gift, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KatalogiTabProps {
  mediaItems: MediaItem[];
  onDownload: (subId: string, filename: string, srtContent: string) => Promise<void>;
}

export default function KatalogiTab({ mediaItems, onDownload }: KatalogiTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'series' | 'favorites'>('all');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);

  // Pakia favorites kutoka localStorage wakati wa kuwasha
  useEffect(() => {
    const saved = localStorage.getItem('swahilimi_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Hifadhi favorites
  const toggleFavorite = (subId: string) => {
    let updated: string[];
    if (favorites.includes(subId)) {
      updated = favorites.filter(id => id !== subId);
    } else {
      updated = [...favorites, subId];
    }
    setFavorites(updated);
    localStorage.setItem('swahilimi_favorites', JSON.stringify(updated));
  };

  // Tafuta na uchuje filamu
  const filteredItems = mediaItems.filter(item => {
    // 1. Chujio cha Aina au Favorites
    if (filterType === 'movie' && item.type !== 'movie') return false;
    if (filterType === 'series' && item.type !== 'series') return false;
    
    if (filterType === 'favorites') {
      // Lazima iwe na angalau subtitle moja ambayo ipo kwenye favorites
      const hasFavSub = item.subtitles.some(sub => favorites.includes(sub.id));
      if (!hasFavSub) return false;
    }

    // 2. Chujio cha kutafuta kwa maandishi
    const matchSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.originalTitle && item.originalTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.descriptionSw.toLowerCase().includes(searchQuery.toLowerCase());

    return matchSearch;
  });

  // Kuchagua season ya kwanza kiotomatiki wakati wa kufungua series
  useEffect(() => {
    if (selectedItem && selectedItem.type === 'series') {
      const seasons = Array.from(new Set(selectedItem.subtitles.map(s => s.season).filter((s): s is number => s !== undefined))) as number[];
      if (seasons.length > 0) {
        setExpandedSeason(Math.min(...seasons));
      } else {
        setExpandedSeason(null);
      }
    }
  }, [selectedItem]);

  return (
    <div className="space-y-6">
      {/* Adsterra Smartlink Promo Banner */}
      <a
        href="https://www.effectivecpmnetwork.com/krk4ku2kt?key=b96e9dfbc7c7ba9450787997d2825c41"
        target="_blank"
        rel="noopener noreferrer"
        className="group block p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 border border-amber-500/30 hover:border-amber-500/60 rounded-3xl transition-all duration-300 shadow-lg shadow-amber-500/5 hover:shadow-amber-500/10"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl group-hover:scale-105 transition-transform">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-amber-400 group-hover:text-amber-300 flex items-center gap-1.5">
                Ofa na Mipango Maalum ya Leo
                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">Bure</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Bofya hapa kufungua na kutazama matoleo mapya, zawadi na misaada ya kijamii.</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>Fungua Ofa</span>
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>
      </a>

      {/* Search and Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/60 p-4 rounded-3xl border border-slate-800/80">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tafuta filamu au tamthilia (series) hapa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all text-slate-200 placeholder:text-slate-500"
          />
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Zote
          </button>
          <button
            onClick={() => setFilterType('movie')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              filterType === 'movie'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Filamu (Movies)
          </button>
          <button
            onClick={() => setFilterType('series')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              filterType === 'series'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            Tamthilia (Series)
          </button>
          <button
            onClick={() => setFilterType('favorites')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              filterType === 'favorites'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
            Vipendwa vyangu ({favorites.length})
          </button>
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-24 bg-slate-900/20 border border-slate-900 rounded-3xl p-8">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-300">Hakuna kilichopatikana</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Tafadhali jaribu kutumia maneno mengine ya utafutaji au ubadilishe kichujio chako cha upande wa juu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => {
            const isFav = item.subtitles.some(sub => favorites.includes(sub.id));
            return (
              <motion.div
                key={item.id}
                layoutId={`media-card-${item.id}`}
                onClick={() => setSelectedItem(item)}
                className="bg-slate-900/40 border border-slate-800/80 hover:border-amber-500/30 rounded-3xl overflow-hidden cursor-pointer group transition-all duration-300 flex flex-col h-full hover:shadow-xl hover:shadow-amber-500/5"
              >
                {/* Poster Container */}
                <div className="relative aspect-video sm:aspect-square overflow-hidden bg-slate-950">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  
                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-2 py-1 rounded-lg flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-bold text-slate-200">{item.rating}</span>
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 px-2 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">
                    {item.type === 'movie' ? 'Movie' : 'Series'}
                  </div>

                  {/* Favorites badge indicator */}
                  {isFav && (
                    <div className="absolute bottom-3 right-3 p-1.5 bg-red-500 text-white rounded-full">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.year}</span>
                      <span>•</span>
                      <span className="truncate max-w-[150px]">{item.genre.join(', ')}</span>
                    </div>
                    <h3 className="font-extrabold text-slate-100 group-hover:text-amber-500 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 italic line-clamp-1 font-mono">
                      {item.originalTitle || item.title}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.descriptionSw}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2.5 py-1 rounded-lg">
                      {item.subtitles.length} Subtitles
                    </span>
                    <span className="text-xs font-bold text-amber-500 group-hover:underline flex items-center gap-0.5">
                      Fungua Pakua <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800/80 w-full max-w-3xl rounded-3xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
            >
              {/* Modal Header/Hero */}
              <div className="relative aspect-video sm:aspect-[2.5/1] overflow-hidden bg-slate-950 flex-shrink-0">
                <img
                  src={selectedItem.posterUrl}
                  alt={selectedItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-40 blur-[1px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent" />
                
                {/* Hero Info overlay */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-amber-500 mb-1">
                      <span className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
                        {selectedItem.type === 'movie' ? 'Filamu' : 'Tamthilia'}
                      </span>
                      <span>•</span>
                      <span>{selectedItem.year}</span>
                      <span>•</span>
                      <span>{selectedItem.genre.join(', ')}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">{selectedItem.title}</h2>
                    <p className="text-xs text-slate-400 italic font-mono mt-0.5">Title: {selectedItem.originalTitle || selectedItem.title}</p>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800/60 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-black text-white">{selectedItem.rating}</span>
                    <span className="text-xs text-slate-500 font-semibold">/10</span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800 text-slate-400 hover:text-white transition-all focus:outline-none"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                {/* Description Swahili */}
                <div className="space-y-2 bg-slate-950/40 border border-slate-800/40 p-4 rounded-2xl">
                  <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Muhtasari wa Kiswahili
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {selectedItem.descriptionSw}
                  </p>
                </div>

                {/* Subtitle Downloads list */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-200 border-b border-slate-800 pb-2 text-sm flex items-center justify-between">
                    <span>Maudhui ya Subtitles za Kiswahili ({selectedItem.subtitles.length})</span>
                    <span className="text-xs font-normal text-slate-400">Pakua na ufurahie filamu yako</span>
                  </h3>

                  {selectedItem.subtitles.length === 0 ? (
                    <div className="text-center py-8 bg-slate-950/30 border border-slate-800/30 rounded-2xl">
                      <p className="text-xs text-slate-500">Bado hakuna subtitle zilizopakiwa hapa.</p>
                      <p className="text-[10px] text-amber-500/70 mt-1 font-semibold">Tuma ombi au upendekeze kwa msanidi programu.</p>
                    </div>
                  ) : selectedItem.type === 'movie' ? (
                    /* Movie Subtitles: Standard List */
                    <div className="space-y-3">
                      {selectedItem.subtitles.map(sub => {
                        const isFavorited = favorites.includes(sub.id);
                        return (
                          <div
                            key={sub.id}
                            className="bg-slate-950/55 border border-slate-800/65 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                          >
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Award className="w-3.5 h-3.5" /> mtafsiri: {sub.translator}
                                </span>
                                <span className="text-slate-500 font-semibold text-[10px]">{sub.createdAt}</span>
                              </div>
                              <p className="text-xs font-mono text-slate-300 truncate max-w-[350px]">
                                Version: <span className="text-slate-400 font-semibold">{sub.version}</span>
                              </p>
                              <div className="flex gap-4 text-[10px] text-slate-500 font-bold">
                                <span>Ukubwa: <span className="text-slate-400">{sub.fileSize}</span></span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 text-amber-500">
                                  Upakuaji: <span className="text-slate-300 font-bold">{sub.downloads}</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                              {/* Toggle Favorite button */}
                              <button
                                onClick={() => toggleFavorite(sub.id)}
                                className={`p-2.5 rounded-xl border transition-all ${
                                  isFavorited
                                    ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-red-500'
                                }`}
                                title={isFavorited ? "Ondoa kwenye vipendwa" : "Weka kwenye vipendwa"}
                              >
                                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                              </button>

                              {/* Download Button */}
                              <button
                                onClick={() => onDownload(sub.id, `${selectedItem.title.replace(/\s+/g, '_')}_SW_by_${sub.translator}.srt`, sub.srtContent)}
                                className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10"
                              >
                                <Download className="w-4 h-4" />
                                Pakua SRT
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Series Subtitles: Grouped by Season & Episode */
                    <div className="space-y-4">
                      {/* Season Selectors */}
                      <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-3">
                        {(Array.from(new Set(selectedItem.subtitles.map(s => s.season).filter((s): s is number => s !== undefined))) as number[])
                          .sort((a, b) => a - b)
                          .map(seasonNum => (
                            <button
                              key={seasonNum}
                              onClick={() => setExpandedSeason(seasonNum)}
                              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                expandedSeason === seasonNum
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              Season {seasonNum}
                            </button>
                          ))}
                      </div>

                      {/* Episode Listing for the selected Season */}
                      {expandedSeason !== null && (
                        <div className="space-y-3">
                          {selectedItem.subtitles
                            .filter(sub => sub.season === expandedSeason)
                            .sort((a, b) => (a.episode || 0) - (b.episode || 0))
                            .map(sub => {
                              const isFavorited = favorites.includes(sub.id);
                              return (
                                <div
                                  key={sub.id}
                                  className="bg-slate-950/50 border border-slate-850 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-800 transition-all"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded">
                                        EPISODE {sub.episode}
                                      </span>
                                      <h4 className="text-xs font-black text-slate-200">{sub.episodeTitle || `Episode ${sub.episode}`}</h4>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 font-bold pt-1">
                                      <span className="text-amber-500/90 font-extrabold">By: {sub.translator}</span>
                                      <span>•</span>
                                      <span>Size: {sub.fileSize}</span>
                                      <span>•</span>
                                      <span className="text-slate-400">Downloads: {sub.downloads}</span>
                                    </div>
                                    <p className="text-[10px] font-mono text-slate-400">Version: {sub.version}</p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {/* Favorite button */}
                                    <button
                                      onClick={() => toggleFavorite(sub.id)}
                                      className={`p-2 rounded-xl border transition-all ${
                                        isFavorited
                                          ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-red-500'
                                      }`}
                                      title={isFavorited ? "Ondoa kwenye vipendwa" : "Weka kwenye vipendwa"}
                                    >
                                      <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
                                    </button>

                                    {/* Download button */}
                                    <button
                                      onClick={() => onDownload(sub.id, `${selectedItem.title.replace(/\s+/g, '_')}_S${expandedSeason.toString().padStart(2,'0')}E${(sub.episode || 1).toString().padStart(2,'0')}_SW.srt`, sub.srtContent)}
                                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/5"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      Pakua SRT
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                          {selectedItem.subtitles.filter(sub => sub.season === expandedSeason).length === 0 && (
                            <p className="text-xs text-slate-500 text-center py-4">Bado hakuna subtitles zilizopakiwa za Season hii.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
