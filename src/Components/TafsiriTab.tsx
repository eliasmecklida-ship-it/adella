import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, Download, AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface TafsiriTabProps {
  onDownload: (subId: string, filename: string, srtContent: string) => Promise<void>;
}

export default function TafsiriTab({ onDownload }: TafsiriTabProps) {
  const [srtContent, setSrtContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState('');
  const [translatedResult, setTranslatedResult] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kushughulikia upakiaji wa faili la .srt
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadSrtFile(file);
  };

  const loadSrtFile = (file: File) => {
    if (!file.name.endsWith('.srt')) {
      setError('Tafadhali pakia faili lililo katika muundo wa .srt pekee.');
      return;
    }
    setError('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSrtContent(content);
    };
    reader.onerror = () => {
      setError('Imeshindikana kusoma faili hili. Jaribu tena au bandika maneno.');
    };
    reader.readAsText(file);
  };

  // Kushughulikia Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      loadSrtFile(file);
    }
  };

  // Kuanza kutafsiri kwa kutumia API ya Server-side Gemini
  const handleStartTranslation = async () => {
    if (!srtContent.trim()) {
      setError('Tafadhali pakia faili la SRT au ubandike maandishi yako kwanza.');
      return;
    }

    setIsTranslating(true);
    setTranslatedResult('');
    setNotice('');
    setError('');
    setTranslationProgress('Mkalimani mkuu wa AI anaanza kazi...');

    // Simulisha upakiaji wa hatua tofauti za ufasiri ili mtumiaji asichoke
    const stages = [
      'Inasoma na kuchambua muundo wa SRT...',
      'Inatengeneza makundi (batches) ya maneno...',
      'Mkalimani Gemini anatafsiri kuelekea Kiswahili...',
      'Inasawazisha misemo ya asili ya vichekesho vya kibongo...',
      'Inahakikisha muda wa maongezi upo sawa kabisa...',
      'Inaunda upya faili lako la mwisho...'
    ];

    let stageIdx = 0;
    const progressInterval = setInterval(() => {
      if (stageIdx < stages.length) {
        setTranslationProgress(stages[stageIdx]);
        stageIdx++;
      }
    }, 2500);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ srtContent, instructions })
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Tafsiri imefeli kwenye server.');
      }

      const data = await response.json();
      setTranslatedResult(data.translatedSrt);
      if (data.simulated) {
        setNotice(data.message);
      } else {
        setNotice('Tafsiri imekamilika kikamilifu kwa uwezo wa Gemini AI!');
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error(err);
      setError(err.message || 'Kuna hitilafu iliyotokea wakati wa kuwasiliana na mfumo wa AI.');
    } finally {
      setIsTranslating(false);
    }
  };

  const triggerDownload = () => {
    if (!translatedResult) return;
    const originalBaseName = fileName ? fileName.replace('.srt', '') : 'SwahiliMi_Tafsiri';
    const outputName = `${originalBaseName}_Kiswahili.srt`;

    // Kutumia download action ya kawaida
    const blob = new Blob([translatedResult], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = outputName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Introduction Card */}
      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center gap-5">
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/20 rounded-2xl text-amber-500 flex-shrink-0">
          <Sparkles className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-extrabold text-white">Tafsiri kwa AI (Gemini Language Engine)</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pakia faili lolote la subtitles za Kiingereza (muundo wa <span className="font-mono text-slate-300 font-bold">.srt</span>) hapa chini, na AI yetu itatafsiri kwa haraka kuelekea Kiswahili sanifu kinachoeleweka na chenye hisia sahihi kulingana na matukio ya filamu.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-start gap-3 text-xs font-semibold">
          <Sparkles className="w-5 h-5 flex-shrink-0 text-amber-500" />
          <p className="leading-relaxed">{notice}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Inputs */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
              1. Pakia au Bandika Faili la SRT
            </label>
            
            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-amber-500/30 bg-slate-900/10 hover:bg-slate-900/30 p-8 rounded-2xl cursor-pointer text-center space-y-3 transition-all group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".srt"
                className="hidden"
              />
              <Upload className="w-10 h-10 text-slate-500 group-hover:text-amber-500 mx-auto transition-colors" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-300">
                  {fileName ? `Faili lililowekwa: ${fileName}` : 'Bonyeza hapa au buruta faili la .srt hapa'}
                </p>
                <p className="text-[10px] text-slate-500">Mwisho wa ukubwa wa faili ni 10MB</p>
              </div>
            </div>

            {/* Manual Textarea Fallback */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-500 font-bold">Au bandika maudhui ya faili la srt moja kwa moja hapa:</span>
                {srtContent && (
                  <button
                    onClick={() => { setSrtContent(''); setFileName(''); }}
                    className="text-[10px] text-red-400 hover:underline font-semibold"
                  >
                    Futa yote
                  </button>
                )}
              </div>
              <textarea
                value={srtContent}
                onChange={(e) => setSrtContent(e.target.value)}
                placeholder="1&#10;00:00:01,000 --> 00:00:04,000&#10;Hello my friend!&#10;&#10;2&#10;00:00:05,000 --> 00:00:08,000&#10;Welcome back."
                rows={6}
                className="w-full bg-slate-950 border border-slate-800/80 rounded-2xl p-4 text-xs font-mono focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 text-slate-300 transition-all leading-relaxed"
              />
            </div>
          </div>

          {/* AI Style Instructions */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>2. Maagizo Maalum ya Tafsiri (Sura na Mtindo)</span>
              <span className="text-[9px] bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-slate-500 font-bold lowercase">hiari</span>
            </label>
            <input
              type="text"
              placeholder="Mfano: 'Tumia Kiswahili cha ucheshi wa Bongo movie', au 'Tafsiri rasmi sana isiyo na slang'"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 text-slate-300 transition-all placeholder:text-slate-600 font-medium"
            />
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={handleStartTranslation}
            disabled={isTranslating || !srtContent.trim()}
            className={`w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg ${
              isTranslating || !srtContent.trim()
                ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed shadow-none'
                : 'bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 shadow-amber-500/10'
            }`}
          >
            {isTranslating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Inatafsiri... Tafadhali Subiri
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                Anza Kutafsiri kwa AI
              </>
            )}
          </button>
        </div>

        {/* Right Column: Loading or Results */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between h-full min-h-[380px]">
          {isTranslating ? (
            /* Loading State */
            <div className="flex-grow flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-300 tracking-wider">MSANIDI AI YUKO KAZINI</p>
                <p className="text-[10px] text-amber-500 font-mono font-black animate-pulse uppercase tracking-widest">
                  {translationProgress}
                </p>
              </div>
            </div>
          ) : translatedResult ? (
            /* Results Panel */
            <div className="flex flex-col h-full justify-between space-y-4">
              <div className="space-y-3 flex-grow">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-extrabold text-amber-500 flex items-center gap-1.5 uppercase tracking-wider">
                    <FileText className="w-4 h-4" /> Hakiki Faili la Kiswahili
                  </span>
                  <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded font-black uppercase">
                    tayari
                  </span>
                </div>
                
                {/* Result Preview Box */}
                <textarea
                  readOnly
                  value={translatedResult}
                  rows={14}
                  className="w-full bg-slate-950 border border-slate-850 rounded-2xl p-4 text-xs font-mono text-emerald-400/90 leading-relaxed focus:outline-none resize-none"
                />
              </div>

              {/* Download Action */}
              <button
                onClick={triggerDownload}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10"
              >
                <Download className="w-4 h-4" />
                Pakua SRT ya Kiswahili sasa
              </button>
            </div>
          ) : (
            /* Idle Placeholder */
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 space-y-4">
              <HelpCircle className="w-12 h-12 text-slate-700" />
              <div className="space-y-1 max-w-xs">
                <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Matokeo ya Tafsiri</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Baada ya kubofya kitufe cha 'Anza Kutafsiri kwa AI', matokeo ya faili la srt la Kiswahili yatatokea hapa na unaweza kuyahakiki na kuyapakua mara moja.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
