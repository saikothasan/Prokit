'use client';
import { useState, useRef } from 'react';
import { 
  AudioLines, 
  Play, 
  Pause, 
  Download, 
  Loader2, 
  RefreshCw,
  Volume2
} from 'lucide-react';

// Deepgram Aura Voice Options
const VOICES = [
  { id: 'aura-asteria-en', name: 'Asteria (US Female)', type: 'Standard' },
  { id: 'aura-luna-en', name: 'Luna (US Female)', type: 'Soft' },
  { id: 'aura-stella-en', name: 'Stella (US Female)', type: 'Energetic' },
  { id: 'aura-orion-en', name: 'Orion (US Male)', type: 'Deep' },
  { id: 'aura-arcas-en', name: 'Arcas (US Male)', type: 'Authoritative' },
  { id: 'aura-perseus-en', name: 'Perseus (US Male)', type: 'Casual' },
  { id: 'aura-angus-en', name: 'Angus (Irish Male)', type: 'Authentic' },
  { id: 'aura-athena-en', name: 'Athena (UK Female)', type: 'Professional' },
];

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [model, setModel] = useState(VOICES[0].id);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (!text) return;
    
    // Cleanup previous audio URL to avoid memory leaks
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setIsPlaying(false);
    setLoading(true);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model }),
      });

      if (!res.ok) throw new Error('Generation failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (e) {
      console.error(e);
      alert("Failed to generate speech. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `prokit-speech-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Input Area */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <AudioLines size={16} />
              Input Text
            </label>
            <span className="text-xs text-gray-400">{text.length} chars</span>
          </div>
          <textarea 
            className="w-full h-48 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black focus:ring-2 focus:ring-purple-500 outline-none resize-none transition-all shadow-sm"
            placeholder="Type specific content here to convert into realistic human speech..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {/* Controls Side Panel */}
        <div className="w-full md:w-80 space-y-4">
          
          {/* Voice Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500">Select Voice</label>
            <div className="grid grid-cols-1 gap-2">
              {VOICES.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setModel(voice.id)}
                  className={`flex items-center justify-between p-3 rounded-lg text-sm border transition-all ${
                    model === voice.id 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' 
                      : 'border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                >
                  <span className="font-medium">{voice.name}</span>
                  <span className="text-xs opacity-70 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full">{voice.type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleGenerate}
            disabled={loading || !text}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={20} />}
            Generate Audio
          </button>
        </div>
      </div>

      {/* Output / Player Section */}
      {audioUrl && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl flex flex-col sm:flex-row items-center gap-6">
            
            {/* Play/Pause Button */}
            <button 
              onClick={togglePlayback}
              className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-transform hover:scale-105 shadow-lg shadow-purple-500/30"
            >
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>

            {/* Waveform Visualization (CSS Simulated) */}
            <div className="flex-1 w-full h-12 flex items-center gap-1 justify-center px-4 overflow-hidden">
               {isPlaying ? (
                 Array.from({ length: 20 }).map((_, i) => (
                   <div 
                     key={i} 
                     className="w-1.5 bg-purple-500 rounded-full animate-pulse"
                     style={{ 
                       height: `${Math.random() * 100}%`,
                       animationDuration: `${0.5 + Math.random() * 0.5}s` 
                     }}
                   />
                 ))
               ) : (
                 <div className="flex items-center gap-2 text-gray-400 w-full justify-center border-t border-dashed border-gray-300 dark:border-gray-700 h-1"></div>
               )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleDownload}
                className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors tooltip"
                title="Download MP3"
              >
                <Download size={20} />
              </button>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-mono bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
                <Volume2 size={12} />
                MP3 • 48kHz
              </div>
            </div>

            {/* Hidden Audio Element */}
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}
