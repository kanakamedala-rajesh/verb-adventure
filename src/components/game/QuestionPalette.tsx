'use client';

import { X, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Question, Answer } from '@/lib/verbs';

interface QuestionPaletteProps {
  questions: Question[];
  results: Record<number, boolean>;
  answers: Record<number, Answer>;
  currentIndex: number;
  onJump: (index: number) => void;
  mode: 'immediate' | 'delayed';
  onClose: () => void;
  onSoundPop: () => void;
}

export const QuestionPalette = ({ 
  questions, 
  results, 
  answers, 
  currentIndex, 
  onJump, 
  mode, 
  onClose, 
  onSoundPop 
}: QuestionPaletteProps) => {
    const paletteRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Tab') {
                const focusable = paletteRef.current?.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
                if (!focusable) return;
                const first = focusable[0] as HTMLElement;
                const last = focusable[focusable.length - 1] as HTMLElement;

                if (e.shiftKey && document.activeElement === first) {
                    last.focus();
                    e.preventDefault();
                } else if (!e.shiftKey && document.activeElement === last) {
                    first.focus();
                    e.preventDefault();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        paletteRef.current?.querySelector('button')?.focus();
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="palette-title"
        >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.div 
              ref={paletteRef}
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="bg-white rounded-[2.5rem] sm:rounded-[3rem] w-full max-w-lg p-6 sm:p-8 shadow-2xl max-h-[85vh] flex flex-col relative z-10 border-b-[8px] sm:border-b-[12px] border-blue-100"
            >
                <div className="flex justify-between items-center mb-4 sm:mb-8 shrink-0">
                    <h3 id="palette-title" className="text-xl sm:text-2xl font-heading text-blue-600 uppercase flex items-center gap-2 sm:gap-3">
                        <Map className="text-blue-400 w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" /> Quest Map
                    </h3>
                    <button 
                      onClick={onClose} 
                      className="p-2 bg-slate-100 text-slate-400 hover:text-red-500 rounded-xl sm:rounded-2xl transition-all"
                      aria-label="Close quest map"
                    >
                        <X size={20} className="sm:w-6 sm:h-6" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4 p-1 custom-scrollbar">
                    {questions.map((_, idx) => {
                        let statusClass = "bg-white border-2 sm:border-4 border-slate-100 text-slate-300 hover:border-blue-200 hover:text-blue-400"; 
                        let statusText = "Ready!";
                        
                        if (mode === 'immediate') {
                            if (results[idx] === true) { statusClass = "bg-green-50 border-2 sm:border-4 border-green-400 text-green-600 font-bold shadow-sm shadow-green-100"; statusText = "Great Job!"; }
                            else if (results[idx] === false) { statusClass = "bg-red-50 border-2 sm:border-4 border-red-400 text-red-600 font-bold shadow-sm shadow-red-100"; statusText = "Oops!"; }
                            else if (idx === currentIndex) { statusClass = "bg-blue-500 border-2 sm:border-4 border-blue-600 text-white font-bold shadow-lg shadow-blue-200 scale-105 sm:scale-110"; statusText = "You are here!"; }
                        } else {
                            const isAnswered = answers[idx] && (answers[idx].simple || answers[idx].selected);
                            if (idx === currentIndex) { statusClass = "bg-blue-500 border-2 sm:border-4 border-blue-600 text-white font-bold shadow-lg shadow-blue-200 scale-105 sm:scale-110"; statusText = "You are here!"; }
                            else if (isAnswered) { statusClass = "bg-blue-50 border-2 sm:border-4 border-blue-200 text-blue-500 font-bold"; statusText = "Answered!"; }
                        }

                        return (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                key={idx}
                                onClick={() => { onSoundPop(); onJump(idx); onClose(); }}
                                className={`aspect-square rounded-xl sm:rounded-2xl flex items-center justify-center font-heading text-base sm:text-lg transition-all border-2 sm:border-4 ${statusClass}`}
                                aria-label={`Word ${idx + 1}, ${statusText}`}
                                aria-current={idx === currentIndex ? 'step' : undefined}
                            >
                                {idx + 1}
                            </motion.button>
                        )
                    })}
                </div>

                <div className="mt-6 pt-4 sm:mt-8 sm:pt-6 border-t border-slate-100 grid grid-cols-3 gap-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0" aria-hidden="true">
                   <div className="flex flex-col items-center gap-1 text-center"><span className="w-3 h-3 sm:w-4 sm:h-4 rounded-md sm:rounded-lg bg-blue-500 shadow-md"></span> <span className="text-slate-400">Current</span></div>
                   <div className="flex flex-col items-center gap-1 text-center"><span className="w-3 h-3 sm:w-4 sm:h-4 rounded-md sm:rounded-lg bg-green-400 shadow-md"></span> <span className="text-slate-400">Correct</span></div>
                   <div className="flex flex-col items-center gap-1 text-center"><span className="w-3 h-3 sm:w-4 sm:h-4 rounded-md sm:rounded-lg bg-slate-100 border-2 border-slate-200"></span> <span className="text-slate-400">Next!</span></div>
                </div>
            </motion.div>
        </div>
    );
};
