'use client';
import { useState, useRef, useMemo } from 'react';
import { 
  AudioLines, 
  Play, 
  Pause, 
  Download, 
  Loader2, 
  // RefreshCw, // Removed unused import
  // Volume2,   // Removed unused import
  Globe,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

// Organized Voice Data with Flags and Metadata
interface Voice {
  id: string;
  name: string;
  lang: string;
  gender: 'Male' | 'Female';
  traits: string[];
  flag: string;
}

const VOICES: Voice[] = [
  // --- English (US) ---
  { id: 'aura-asteria-en', name: 'Asteria', lang: 'English (US)', gender: 'Female', traits: ['Standard', 'Confident'], flag: '🇺🇸' },
  { id: 'aura-luna-en', name: 'Luna', lang: 'English (US)', gender: 'Female', traits: ['Soft', 'Young'], flag: '🇺🇸' },
  { id: 'aura-stella-en', name: 'Stella', lang: 'English (US)', gender: 'Female', traits: ['Energetic', 'Narrative'], flag: '🇺🇸' },
  { id: 'aura-athena-en', name: 'Athena', lang: 'English (UK)', gender: 'Female', traits: ['Professional', 'Calm'], flag: '🇬🇧' },
  { id: 'aura-orion-en', name: 'Orion', lang: 'English (US)', gender: 'Male', traits: ['Deep', 'Narrative'], flag: '🇺🇸' },
  { id: 'aura-arcas-en', name: 'Arcas', lang: 'English (US)', gender: 'Male', traits: ['Authoritative', 'News'], flag: '🇺🇸' },
  { id: 'aura-perseus-en', name: 'Perseus', lang: 'English (US)', gender: 'Male', traits: ['Casual', 'Fast'], flag: '🇺🇸' },
  { id: 'aura-angus-en', name: 'Angus', lang: 'English (Ireland)', gender: 'Male', traits: ['Authentic', 'Story'], flag: '🇮🇪' },
  
  // --- Aura 2 (Multilingual) ---
  { id: 'aura-2-luna-en', name: 'Luna (V2)', lang: 'English (US)', gender: 'Female', traits: ['Next-Gen', 'Realistic'], flag: '🇺🇸' },
  { id: 'aura-2-zeus-en', name: 'Zeus', lang: 'English (US)', gender: 'Male', traits: ['Deep', 'Movie Trailer'], flag: '🇺🇸' },
  
  // --- International ---
  { id: 'aura-2-julius-de', name: 'Julius', lang: 'German', gender: 'Male', traits: ['Conversational'], flag: '🇩🇪' },
  { id: 'aura-2-lara-de', name: 'Lara', lang: 'German', gender: 'Female', traits: ['Warm'], flag: '🇩🇪' },
  { id: 'aura-2-agathe-fr', name: 'Agathe', lang: 'French', gender: 'Female', traits: ['Friendly'], flag: '🇫🇷' },
  { id: 'aura-2-hector-fr', name: 'Hector', lang: 'French', gender: 'Male', traits: ['Confident'], flag: '🇫🇷' },
  { id: 'aura-2-fujin-ja', name: 'Fujin', lang: 'Japanese', gender: 'Male', traits: ['Smooth'], flag: '🇯🇵' },
  { id: 'aura-2-izanami-ja', name: 'Izanami', lang: 'Japanese', gender: 'Female', traits: ['Polite'], flag: '🇯🇵' },
];

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<Voice>(VOICES[0]);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Group voices by language for easier selection
  const groupedVoices = useMemo(() => {
    const groups: Record<string, Voice[]> = {};
    VOICES.forEach(v => {
      if (!groups[v.lang]) groups[v.lang] = [];
      groups[v.lang].push(v);
    });
    return groups;
  }, []);

  const handleGenerate = async () => {
    if (!text) return;
    
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setIsPlaying(false);
    setLoading(true);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model: selectedVoice.id }),
      });

      if (!res.ok) throw new Error('Generation failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      }, 100);

    } catch (e) {
      console.error(e);
      alert("Failed to generate speech. Please check your text and try again.");
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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Introduction */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">AI Voice Studio</h2>
        <p className="text-muted-foreground">
          Convert text to lifelike speech using Deepgram&apos;s next-generation Aura-2 models.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Input & Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Text Input */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 group-focus-within:opacity-100 transition duration-500 blur"></div>
            <div className="relative bg-white dark:bg-black rounded-xl p-1">
              <textarea 
                className="w-full h-64 p-6 rounded-lg bg-transparent border-0 focus:ring-0 outline-none resize-none text-lg leading-relaxed placeholder:text-gray-300 dark:placeholder:text-gray-700"
                placeholder="Enter your script here. Deepgram Aura models are optimized for conversational, narrative, and professional speech. Try writing a few sentences to hear the natural inflection..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="absolute bottom-4 right-4 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                {text.length} chars
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={handleGenerate}
              disabled={loading || !text}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> 
                  Synthesizing...
                </>
              ) : (
                <>
                  <Sparkles size={20} className="group-hover:scale-110 transition-transform" />
                  Generate Speech
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Voice Selection & Player */}
        <div className="space-y-6">
          
          {/* Voice Selector */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 h-[600px] overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
              <Globe size={14} /> Available Voices
            </div>
            
            <div className="space-y-6">
              {Object.entries(groupedVoices).map(([lang, voices]) => (
                <div key={lang} className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 pl-2">{lang}</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {voices.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => setSelectedVoice(voice)}
                        className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:bg-white dark:hover:bg-gray-800 ${
                          selectedVoice.id === voice.id 
                            ? 'bg-white dark:bg-gray-800 border-blue-500 ring-1 ring-blue-500 shadow-sm' 
                            : 'bg-transparent border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                        }`}
                      >
                        <span className="text-2xl">{voice.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{voice.name}</span>
                            {selectedVoice.id === voice.id && <CheckCircle2 size={14} className="text-blue-500" />}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span>{voice.gender}</span>
                            <span>•</span>
                            <span className="truncate">{voice.traits.join(', ')}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Floating Audio Player */}
      {audioUrl && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-10 fade-in duration-500 z-50">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-2xl flex items-center gap-6 ring-1 ring-black/5">
            
            <button 
              onClick={togglePlayback}
              className="w-14 h-14 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                {selectedVoice.name} • {selectedVoice.lang}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {isPlaying ? (
                   <span className="text-xs text-blue-500 font-medium animate-pulse flex items-center gap-1">
                     <AudioLines size={12} /> Playing...
                   </span>
                ) : (
                   <span className="text-xs text-gray-500">Ready to play</span>
                )}
              </div>
            </div>

            <a 
              href={audioUrl}
              download={`prokit-voice-${selectedVoice.name}-${Date.now()}.mp3`}
              className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              title="Download MP3"
            >
              <Download size={20} />
            </a>
            
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              onEnded={() => setIsPlaying(false)} 
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="hidden" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
