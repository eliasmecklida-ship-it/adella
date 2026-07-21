import React from 'react';
import { Sparkles, Film } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500 rounded-2xl text-slate-950 shadow-lg shadow-amber-500/20">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              SwahiliMi <span className="text-xs bg-amber-500/15 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full font-bold">PRO</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Subtitles Bora za Kiswahili • Tafsiri ya AI</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-full text-slate-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Saa za Tanzania</span>
        </div>
      </div>
    </header>
  );
}
