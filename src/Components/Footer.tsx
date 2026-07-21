import React from 'react';
import { Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-12 mt-12 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Contact Us Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
          <div className="text-center md:text-left space-y-1">
            <h4 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider">Mawasiliano (Contact Us)</h4>
            <p className="text-slate-500">Kama una maoni, ushauri au unahitaji usaidizi wa haraka, wasiliana nasi kupitia mitandao yetu.</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* WhatsApp Contact */}
            <a
              href="https://wa.me/255779430083"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/20 text-slate-300 hover:text-emerald-400 rounded-xl transition-all duration-300 text-xs font-bold"
            >
              <MessageCircle className="w-4.5 h-4.5 text-emerald-500" />
              <span>WhatsApp: 0779430083</span>
            </a>
            
            {/* Instagram Contact */}
            <a
              href="https://www.instagram.com/subtitles_za_kiswahili?igsh=MWF0dWloNHlzcW01cw=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-pink-500/10 border border-slate-800 hover:border-pink-500/20 text-slate-300 hover:text-pink-400 rounded-xl transition-all duration-300 text-xs font-bold"
            >
              <Instagram className="w-4.5 h-4.5 text-pink-500" />
              <span>Instagram: @subtitles_za_kiswahili</span>
            </a>
          </div>
        </div>

        {/* Copyright and Info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center md:text-left">© 2026 SwahiliMi. Haki zote zimehifadhiwa. Imeundwa kwa upendo kwa ajili ya wapenzi wa filamu za Kiswahili.</p>
          <p className="font-mono text-[10px] text-slate-600 text-center md:text-right">Mazingira ya Upakuaji Salama na ya Haraka • v2.1.0</p>
        </div>

      </div>
    </footer>
  );
}
