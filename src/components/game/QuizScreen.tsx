'use client';

import { useState, useEffect } from 'react';
import { Check, Trophy, ArrowRight, ArrowLeft, Grid, Sparkles, Flame, X, Star, ShieldAlert, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIModal } from './AIModal';
import { FillInBlankQuestion, MultipleChoiceQuestion, TrueFalseQuestion } from './QuestionTypes';
import { callGemini } from '@/lib/gemini';
import { Question, Answer } from '@/lib/verbs';
import { Mascot } from './Mascot';
import { AudioControls } from '@/hooks/use-audio';

interface QuizScreenProps {
  questions: Question[];
  currentIndex: number;
  allAnswers: Record<number, Answer>;
  allResults: Record<number, boolean>;
  onAnswerChange: (index: number, answer: Answer) => void;
  onCheck: (index: number) => void;
  onNavigate: (index: number) => void;
  onFinish: () => void;
  onExit: () => void;
  mode: 'immediate' | 'delayed' | 'review';
  onShowSummary: () => void;
  streak: number;
  onSoundPop: () => void;
  audio: AudioControls;
  userName: string;
}

export const QuizScreen = ({ 
  questions, 
  currentIndex, 
  allAnswers, 
  allResults,
  onAnswerChange, 
  onCheck, 
  onNavigate,
  onFinish,
  onExit,
  mode,
  onShowSummary,
  streak,
  onSoundPop,
  audio,
  userName
}: QuizScreenProps) => {
  const { speak, isSpeaking } = audio;
  const currentQ = questions[currentIndex];
  const currentAnswer = allAnswers[currentIndex] || {};
  const currentResult = allResults[currentIndex];
  const feedback = currentResult === true ? 'correct' : (currentResult === false ? 'incorrect' : null);
  const isReadOnly = mode === 'review' || (mode === 'immediate' && feedback !== null);
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const [modalOpen, setModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState('');

  const handleGetMnemonic = async (previousHint?: string) => {
    onSoundPop();
    setModalOpen(true);
    setAiLoading(true);
    
    // Clear content after keeping reference for negative prompt
    setAiContent('');

    let negativeInstruction = "";
    if (previousHint) {
      negativeInstruction = `IMPORTANT: Do not use or repeat this previous hint: "${previousHint}". Provide a completely different explanation or trick.`;
    }

    const prompt = `Create one simple, single-sentence trick for a student to remember that "${currentQ.verb.base}" changes to "${currentQ.verb.simple}" and "${currentQ.verb.participle}".
    Use **bold** text (double asterisks) for the three verb forms only. Do NOT use single quotes for markers.
    Return ONLY a JSON object: {"hint": "the single sentence trick"}. ${negativeInstruction}`;

    const result = await callGemini(prompt);
    setAiContent(result);
    setAiLoading(false);
  };

  const hasAnsweredCurrent = () => {
    if (currentQ.type === 'fill') return currentAnswer.simple && currentAnswer.participle;
    return currentAnswer.selected;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = (e.target as HTMLElement).tagName === 'INPUT';
      if (e.key === 'ArrowRight' && !isInput && currentIndex < questions.length - 1) {
        onSoundPop();
        onNavigate(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' && !isInput && currentIndex > 0) {
        onSoundPop();
        onNavigate(currentIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions.length, onNavigate, onSoundPop]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'immediate') {
      if (!isReadOnly) {
        if (hasAnsweredCurrent()) onCheck(currentIndex);
      } else {
        onSoundPop();
        onNavigate(currentIndex + 1);
      }
    } else if (mode === 'delayed') {
      if (currentIndex === questions.length - 1) {
        onFinish();
      } else {
        onSoundPop();
        onNavigate(currentIndex + 1);
      }
    } else {
        if (currentIndex < questions.length - 1) {
            onSoundPop();
            onNavigate(currentIndex + 1);
        } else {
            onExit();
        }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 flex flex-col min-h-screen bg-blue-50 relative overflow-x-hidden">
      <AIModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onRegenerate={() => handleGetMnemonic(aiContent)}
        loading={aiLoading} 
        content={aiContent}
        title={`Magic Hint for ${userName}!`}
        audio={audio}
      />

      {/* Header */}
      <header className="flex items-center justify-between mb-4 sm:mb-8 lg:mb-12 shrink-0 z-10 bg-white p-3 sm:p-4 rounded-2xl sm:rounded-[2rem] shadow-sm border-b-4 border-blue-100">
         <button 
            onClick={() => { onSoundPop(); onShowSummary(); }}
            className="p-2 sm:p-3 bg-blue-50 text-blue-500 rounded-xl sm:rounded-2xl hover:bg-blue-100 transition-all flex items-center gap-2 border-2 border-blue-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
         >
            <Grid size={20} className="sm:w-6 sm:h-6" />
            <span className="hidden sm:block font-heading text-sm uppercase">Quest Map</span>
         </button>
         
         <div className="text-center">
            <span className="text-slate-400 font-heading text-[10px] uppercase block mb-0.5">
                {mode === 'immediate' ? 'Practice' : mode === 'review' ? 'Review' : 'Word Challenge'}
            </span>
            <div className="text-blue-600 font-heading text-lg sm:text-2xl uppercase leading-none">
                Word {currentIndex + 1} <span className="text-[10px] sm:text-xs opacity-40 lowercase">of</span> {questions.length}
            </div>
         </div>
         
         <button
            onClick={() => { onSoundPop(); onExit(); }}
            className="p-2 sm:p-3 bg-red-50 text-red-500 rounded-xl sm:rounded-2xl hover:bg-red-100 transition-all flex items-center gap-2 border-2 border-red-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
         >
            <X size={20} className="sm:w-6 sm:h-6" />
            <span className="hidden sm:block font-heading text-sm uppercase">Exit</span>
         </button>
      </header>

      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[1fr_2.5fr_1fr] gap-4 sm:gap-8 min-h-0 z-10">
        
        {/* Left Side: Progress (Desktop Only) */}
        <aside className="hidden lg:flex flex-col bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-blue-50 overflow-hidden max-h-[calc(100vh-14rem)]">
          <h3 className="text-slate-400 font-heading text-sm uppercase mb-6 text-center">Your Journey</h3>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {questions.map((q, idx) => (
              <div key={q.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                idx === currentIndex ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-50'
              }`}>
                <span className={`font-heading text-sm uppercase ${idx === currentIndex ? 'text-blue-600' : 'text-slate-300'}`}>Word {idx + 1}</span>
                {allResults[idx] === true ? (
                  <div className="bg-green-100 p-1.5 rounded-full"><Check className="w-[14px] h-[14px] text-green-600" /></div>
                ) : allResults[idx] === false ? (
                  <div className="bg-red-100 p-1.5 rounded-full"><X className="w-[14px] h-[14px] text-red-600" /></div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-slate-100" />
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content: The Question Card */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 w-full max-w-2xl mx-auto lg:max-w-none">
            {/* Progress Bar */}
            <div className="w-full h-4 sm:h-6 bg-white rounded-full mb-6 sm:mb-10 relative p-1 shadow-inner border-2 border-blue-50">
              <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${progress}%` }} 
                  className="h-full bg-blue-500 rounded-full shadow-[0_2px_0_#2563eb] sm:shadow-[0_4px_0_#2563eb]"
              />
            </div>

            {/* Main Question Card Area - Now Scrollable on small screens */}
            <div className="flex-1 bg-white rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-12 shadow-2xl border-b-8 sm:border-b-[12px] border-blue-100 relative flex flex-col min-h-0 overflow-hidden">
                {/* Mascot - Moved inside scrollable area or relative to it */}
                <div className="absolute top-[-3rem] left-1/2 -translate-x-1/2 scale-75 sm:scale-125 z-20">
                  <Mascot mood={feedback === 'correct' ? 'celebrating' : feedback === 'incorrect' ? 'sad' : streak >= 3 ? 'happy' : 'neutral'} userName={userName} />
                </div>

                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar pt-12 sm:pt-16 pb-4">
                    <div className="text-center mb-6 sm:mb-10 shrink-0">
                        <span className="uppercase font-heading text-blue-400 text-xs sm:text-base block mb-1 tracking-widest">Master This Word:</span>
                        <div className="flex items-center justify-center gap-4">
                          <h2 className="text-4xl sm:text-7xl font-heading text-slate-800 uppercase tracking-tight leading-tight">{currentQ.verb.base}</h2>
                          <button 
                            type="button"
                            onClick={() => speak(currentQ.verb.base)}
                            disabled={isSpeaking}
                            className={`p-2 rounded-full transition-all
                              ${isSpeaking ? 'bg-blue-200 text-blue-700 animate-pulse cursor-not-allowed' : 'bg-blue-50 text-blue-500 hover:bg-blue-100'}
                            `}
                            aria-label={isSpeaking ? "Speaking" : "Speak word"}
                          >
                            <Volume2 size={24} className="sm:w-8 sm:h-8" />
                          </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        {currentQ.type === 'fill' && (
                            <FillInBlankQuestion 
                                question={currentQ} answer={currentAnswer} 
                                onChange={(ans: Answer) => onAnswerChange(currentIndex, ans)}
                                isReadOnly={isReadOnly} feedback={feedback}
                            />
                        )}
                        {currentQ.type === 'mcq' && (
                            <MultipleChoiceQuestion 
                                question={currentQ} answer={currentAnswer} 
                                onChange={(ans: Answer) => onAnswerChange(currentIndex, ans)}
                                isReadOnly={isReadOnly} feedback={feedback} onInteract={onSoundPop}
                            />
                        )}
                        {currentQ.type === 'tf' && (
                            <TrueFalseQuestion 
                                question={currentQ} answer={currentAnswer} 
                                onChange={(ans: Answer) => onAnswerChange(currentIndex, ans)}
                                isReadOnly={isReadOnly} feedback={feedback} onInteract={onSoundPop}
                            />
                        )}
                    </div>
                    
                    {(mode === 'review' || (mode === 'immediate' && feedback === 'incorrect')) && (
                        <motion.button
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            type="button" onClick={() => handleGetMnemonic()}
                            className="w-fit mx-auto mt-6 flex items-center justify-center gap-2 text-purple-600 bg-purple-50 hover:bg-purple-100 font-heading text-[10px] sm:text-sm py-2 px-4 sm:py-3 sm:px-6 rounded-xl sm:rounded-2xl border-2 border-purple-100 transition-all shrink-0"
                        >
                            <Sparkles size={16} className="animate-pulse sm:w-5 sm:h-5" />
                            Need a Magic Trick?
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Navigation Controls - Pushed to bottom */}
            <div className="flex gap-3 sm:gap-6 mt-6 sm:mt-10 mb-2 shrink-0 max-w-2xl mx-auto w-full">
                <button 
                    type="button"
                    onClick={() => { onSoundPop(); onNavigate(currentIndex - 1); }}
                    disabled={currentIndex === 0}
                    className="w-14 sm:w-24 bg-white border-b-4 sm:border-b-8 border-slate-200 text-slate-400 disabled:opacity-30 rounded-2xl sm:rounded-3xl flex items-center justify-center h-14 sm:h-20 hover:bg-slate-50 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                    aria-label="Previous word"
                >
                    <ArrowLeft size={24} className="sm:w-8 sm:h-8" />
                </button>

                <div className="flex-1">
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={!isReadOnly && !hasAnsweredCurrent()}
                        className={`w-full h-14 sm:h-20 rounded-2xl sm:rounded-3xl transition-all flex items-center justify-center gap-2 sm:gap-4 font-heading text-sm sm:text-2xl shadow-lg sm:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200
                        ${mode === 'review' ? 'bg-blue-500 border-b-4 sm:border-b-8 border-blue-700 text-white' : 
                        (mode === 'immediate' && feedback === 'correct') ? 'bg-green-500 border-b-4 sm:border-b-8 border-green-700 text-white' :
                        (mode === 'immediate' && feedback === 'incorrect') ? 'bg-red-500 border-b-4 sm:border-b-8 border-red-700 text-white' :
                        mode === 'delayed' && currentIndex === questions.length - 1 ? 'bg-orange-500 border-b-4 sm:border-b-8 border-orange-700 text-white' :
                        'bg-blue-500 border-b-4 sm:border-b-8 border-blue-700 text-white disabled:bg-slate-200 disabled:border-slate-300 disabled:text-slate-400 disabled:shadow-none'}`}
                    >
                        <span className="truncate">
                          {mode === 'review' ? (currentIndex === questions.length - 1 ? 'ALL DONE!' : 'NEXT WORD') :
                          (mode === 'immediate' && isReadOnly) ? 'NEXT WORD' :
                          (mode === 'delayed' && currentIndex === questions.length - 1) ? 'FINISH!' : 
                          'CHECK IT!'}
                        </span>
                        <ArrowRight size={20} className="shrink-0 sm:w-7 sm:h-7" />
                    </motion.button>
                </div>

                <button 
                    type="button"
                    onClick={() => { onSoundPop(); onNavigate(currentIndex + 1); }}
                    disabled={currentIndex === questions.length - 1} 
                    className="w-14 sm:w-24 bg-white border-b-4 sm:border-b-8 border-slate-200 text-slate-400 disabled:opacity-30 rounded-2xl sm:rounded-3xl flex items-center justify-center h-14 sm:h-20 hover:bg-slate-50 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                    aria-label="Next word"
                >
                    <ArrowRight size={24} className="sm:w-8 sm:h-8" />
                </button>
            </div>
        </form>

        {/* Right Side: Score Card (Desktop Only) */}
        <aside className="hidden lg:flex flex-col bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-blue-50">
          <h3 className="text-slate-400 font-heading text-sm uppercase mb-8 text-center">Star Progress</h3>
          <div className="flex-1 flex flex-col items-center justify-center space-y-12">
            <div className="relative scale-125">
              <div className="w-32 h-32 rounded-full border-8 border-blue-50 flex flex-col items-center justify-center bg-blue-50/30">
                <div className="text-3xl font-heading text-blue-600">{Math.round(progress)}%</div>
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Done</div>
              </div>
              <svg className="absolute top-0 left-0 w-32 h-32 -rotate-90">
                <circle
                  cx="64" cy="64" r="56"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="text-blue-500"
                  strokeDasharray={352}
                  strokeDashoffset={352 - (352 * progress) / 100}
                />
              </svg>
            </div>
            
            <div className="text-center space-y-4 bg-yellow-50 p-6 rounded-[2rem] border-2 border-yellow-100 w-full shadow-sm">
              <div className="text-yellow-600 font-heading text-sm uppercase flex items-center justify-center gap-2">
                <Star fill="currentColor" size={20} /> Score <Star fill="currentColor" size={20} />
              </div>
              <div className="text-4xl font-heading text-slate-800">
                {Object.values(allResults).filter(r => r === true).length}
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Correct Words</div>
            </div>

            {streak >= 2 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-2">
                <div className="bg-orange-100 p-4 rounded-full text-orange-500 shadow-lg shadow-orange-100 border-4 border-white">
                  <Flame size={40} fill="currentColor" className="animate-bounce" />
                </div>
                <span className="font-heading text-orange-600 text-xl">{streak} WORD STREAK!</span>
              </motion.div>
            )}
          </div>
        </aside>

      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #dbeafe; border-radius: 10px; }
      `}</style>
    </div>
  );
};