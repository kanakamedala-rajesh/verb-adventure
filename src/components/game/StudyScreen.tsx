'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Star, Sparkles, ChevronLeft, ChevronRight, Home, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { verbsData } from '@/lib/verbs';
import { callGemini } from '@/lib/gemini';
import { AIModal } from './AIModal';
import { AudioControls } from '@/hooks/use-audio';

interface StudyScreenProps {
  onBack: () => void;
  onSoundPop: () => void;
  audio: AudioControls;
}

export const StudyScreen = ({ onBack, onSoundPop, audio }: StudyScreenProps) => {
  const { speak, isSpeaking } = audio;
  const [shuffledVerbs] = useState(() => {
    const data = [...verbsData];
    for (let i = data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [data[i], data[j]] = [data[j], data[i]];
    }
    return data;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [discovered, setDiscovered] = useState<Record<string, boolean>>({});
  const cardRef = useRef<HTMLDivElement>(null);

  const currentVerb = shuffledVerbs[currentIndex];

  const handleGetExamples = async (e?: any, previousHint?: string) => {
    if (e && e.stopPropagation) e.stopPropagation();
    onSoundPop();
    setModalOpen(true);
    setAiLoading(true);
    
    // If regenerating, we clear content AFTER keeping the reference for the prompt
    setAiContent('');

    setDiscovered(prev => ({ ...prev, [currentVerb.base]: true }));

    let negativeInstruction = "";
    if (previousHint) {
      negativeInstruction = `IMPORTANT: Do not use or repeat this previous hint: "${previousHint}". Provide a completely different explanation or trick.`;
    }

    const prompt = `Write one very simple, funny sentence for a 3rd grader that helps them remember that the verb "${currentVerb.base}" changes to "${currentVerb.simple}" and "${currentVerb.participle}".
    Use **bold** text (double asterisks) for the three verb forms only. Do NOT use single quotes for markers.
    Keep it to a single sentence. ${negativeInstruction} Return ONLY a JSON object: {"hint": "the simple sentence"}`;

    const result = await callGemini(prompt);
    setAiContent(result);
    setAiLoading(false);
  };

  const nextCard = () => {
    onSoundPop();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % shuffledVerbs.length);
  };

  const prevCard = () => {
    onSoundPop();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + shuffledVerbs.length) % shuffledVerbs.length);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSoundPop();
      setIsFlipped(!isFlipped);
    }
    if (e.key === 'ArrowRight') nextCard();
    if (e.key === 'ArrowLeft') prevCard();
  };

  const unlockedCount = Object.keys(discovered).length;

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 flex flex-col md:flex-row min-h-screen bg-green-50 relative overflow-x-hidden gap-4 lg:gap-12">
      <AIModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onRegenerate={() => handleGetExamples(undefined, aiContent)}
        loading={aiLoading} 
        content={aiContent}
        title={`Word Magic: ${currentVerb.base}`}
        audio={audio}
      />

      {/* Playful Background Shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Desktop Sidebar - Verb List */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 z-10 bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 shadow-xl border-4 border-green-100 max-h-[calc(100vh-4rem)]">
        <div className="mb-6 text-center lg:text-left">
          <h2 className="text-2xl font-heading text-green-600 uppercase">Flashcard Fun</h2>
          <p className="text-xs font-bold text-slate-400 uppercase mt-1">Pick a word!</p>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {shuffledVerbs.map((verb, idx) => (
            <button
              key={verb.base}
              onClick={() => { onSoundPop(); setCurrentIndex(idx); setIsFlipped(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-heading text-sm uppercase transition-all border-2 ${
                currentIndex === idx 
                ? 'bg-green-500 border-green-600 text-white shadow-md' 
                : 'bg-white border-slate-100 text-slate-400 hover:border-green-200 hover:text-green-500'
              }`}
              aria-current={currentIndex === idx ? 'true' : 'false'}
            >
              {verb.base}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col z-10 py-2 sm:py-0">
        {/* Header */}
        <header className="flex items-center justify-between mb-4 sm:mb-8 lg:mb-12 shrink-0 bg-white/80 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-4 border-green-100 shadow-sm md:mx-0">
          <button 
            onClick={() => { onSoundPop(); onBack(); }}
            className="bg-slate-100 text-slate-500 p-2 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-slate-200 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
            aria-label="Back to home"
          >
            <Home size={20} className="sm:w-6 sm:h-6" />
          </button>
          
          <div className="text-center px-2 flex-1">
            <h2 className="text-lg sm:text-xl font-heading text-green-600 uppercase truncate">
              Flashcard <span className="hidden sm:inline">Zone</span>
            </h2>
          </div>

          <div className="bg-yellow-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl flex items-center gap-1.5 sm:gap-2 text-yellow-700 font-bold text-xs sm:text-sm shadow-sm border-2 border-yellow-200/50">
            <Star fill="currentColor" className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> {unlockedCount} <span className="hidden sm:inline">Learned!</span>
          </div>
        </header>

        {/* Card Area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 sm:gap-8 lg:gap-12 min-h-0 perspective-2000 py-2">
          <div 
            ref={cardRef}
            tabIndex={0}
            onKeyDown={handleCardKeyDown}
            aria-label={`Word card for ${currentVerb.base}. Press Space or Enter to flip.`}
            className="relative w-full max-w-[260px] sm:max-w-[360px] md:max-w-[440px] aspect-[4/5] cursor-pointer preserve-3d group shadow-2xl focus:outline-none focus-visible:ring-8 focus-visible:ring-blue-200 rounded-[2.5rem] sm:rounded-[3rem]"
          >
            <motion.div 
              className="relative w-full h-full preserve-3d"
              onClick={() => { onSoundPop(); setIsFlipped(!isFlipped); }}
              initial={false}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 150, damping: 20 }}
            >
              {/* Front of Card */}
              <div 
                className="absolute inset-0 w-full h-full backface-hidden rounded-[2.5rem] sm:rounded-[3rem] border-[8px] sm:border-[12px] border-blue-100 bg-white p-6 sm:p-8 flex flex-col items-center justify-center text-center overflow-hidden"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <div className="absolute top-4 left-4 text-blue-50 opacity-20 sm:top-8 sm:left-8 pointer-events-none"><Star fill="currentColor" className="w-[60px] h-[60px] sm:w-20 sm:h-20" /></div>
                <div className="absolute bottom-4 right-4 text-blue-50 opacity-20 sm:bottom-8 sm:right-8 pointer-events-none"><Sparkles fill="currentColor" className="w-[60px] h-[60px] sm:w-20 sm:h-20" /></div>
                
                <span className="text-blue-400 font-heading text-base sm:text-lg uppercase tracking-widest mb-2 sm:mb-4">The Word:</span>
                <div className="flex items-center gap-3">
                  <h1 className="text-5xl sm:text-7xl md:text-8xl font-heading text-blue-600 drop-shadow-sm mb-0">{currentVerb.base}</h1>
                  <button 
                    onClick={(e) => { e.stopPropagation(); speak(currentVerb.base); }}
                    disabled={isSpeaking}
                    className={`p-2 rounded-full transition-all 
                      ${isSpeaking ? 'bg-blue-200 text-blue-700 animate-pulse cursor-not-allowed' : 'bg-blue-50 text-blue-500 hover:bg-blue-100'}
                    `}
                    aria-label={isSpeaking ? "Speaking" : "Speak base word"}
                  >
                    <Volume2 size={24} />
                  </button>
                </div>
                
                <div className="bg-blue-50 text-blue-500 px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 animate-bounce mt-4 sm:mt-8" aria-hidden="true">
                  TAP TO FLIP! 🔄
                </div>
              </div>

              {/* Back of Card */}
              <div 
                className="absolute inset-0 w-full h-full backface-hidden rounded-[2.5rem] sm:rounded-[3rem] border-[8px] sm:border-[12px] border-orange-100 bg-white p-6 sm:p-8 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)]"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="space-y-6 sm:space-y-12 w-full">
                  <div>
                    <span className="text-orange-400 font-heading text-xs sm:text-sm uppercase tracking-widest block mb-1 sm:mb-2">Past Simple:</span>
                    <div className="flex items-center justify-center gap-3">
                      <h2 className="text-3xl sm:text-5xl md:text-6xl font-heading text-orange-600">{currentVerb.simple}</h2>
                      <button 
                        onClick={(e) => { e.stopPropagation(); speak(currentVerb.simple); }}
                        disabled={isSpeaking}
                        className={`p-2 rounded-full transition-all
                          ${isSpeaking ? 'bg-orange-200 text-orange-700 animate-pulse cursor-not-allowed' : 'bg-orange-50 text-orange-500 hover:bg-orange-100'}
                        `}
                        aria-label={isSpeaking ? "Speaking" : "Speak past simple"}
                      >
                        <Volume2 size={24} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="h-1.5 sm:h-2 w-12 sm:w-16 bg-orange-50 rounded-full mx-auto" />
                  
                  <div>
                    <span className="text-orange-400 font-heading text-xs sm:text-sm uppercase tracking-widest block mb-1 sm:mb-2">Past Participle:</span>
                    <div className="flex items-center justify-center gap-3">
                      <h2 className="text-3xl sm:text-5xl md:text-6xl font-heading text-orange-600">{currentVerb.participle}</h2>
                      <button 
                        onClick={(e) => { e.stopPropagation(); speak(currentVerb.participle); }}
                        disabled={isSpeaking}
                        className={`p-2 rounded-full transition-all
                          ${isSpeaking ? 'bg-orange-200 text-orange-700 animate-pulse cursor-not-allowed' : 'bg-orange-50 text-orange-500 hover:bg-orange-100'}
                        `}
                        aria-label={isSpeaking ? "Speaking" : "Speak past participle"}
                      >
                        <Volume2 size={24} />
                      </button>
                    </div>
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleGetExamples()}
                    onKeyDown={(e) => { if(e.key==='Enter' || e.key===' ') handleGetExamples(); }}
                    className="mt-4 sm:mt-6 bg-purple-500 hover:bg-purple-400 text-white font-heading text-xs sm:text-sm py-3 px-6 sm:py-4 sm:px-8 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 mx-auto shadow-[0_4px_0_#9333ea] sm:shadow-[0_6px_0_#9333ea] transition-all"
                  >
                    Sparkle Help! ✨
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 sm:gap-8 w-full shrink-0 max-w-[260px] sm:max-w-md mb-4 sm:mb-0">
            <button 
              onClick={prevCard}
              className="flex-1 bg-white border-b-4 sm:border-b-8 border-slate-100 text-slate-400 p-3 sm:p-4 rounded-2xl sm:rounded-3xl hover:border-blue-200 hover:text-blue-500 transition-all flex items-center justify-center shadow-sm active:translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
              aria-label="Previous word"
            >
              <ChevronLeft size={28} className="sm:w-8 sm:h-8" />
            </button>
            
            <div className="font-heading text-lg sm:text-xl text-slate-400 min-w-[60px] sm:min-w-[80px] text-center" aria-live="polite">
              {currentIndex + 1} <span className="text-sm opacity-40 lowercase">of</span> {shuffledVerbs.length}
            </div>

            <button 
              onClick={nextCard}
              className="flex-1 bg-white border-b-4 sm:border-b-8 border-slate-100 text-slate-400 p-3 sm:p-4 rounded-2xl sm:rounded-3xl hover:border-blue-200 hover:text-blue-500 transition-all flex items-center justify-center shadow-sm active:translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
              aria-label="Next word"
            >
              <ChevronRight size={28} className="sm:w-8 sm:h-8" />
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #dcfce7; border-radius: 10px; }
      `}</style>
    </div>
  );
};
