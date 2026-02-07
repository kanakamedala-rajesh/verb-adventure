'use client';

import { useState } from 'react';
import { Play, BookOpen, Trophy, ChevronRight, Star, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { verbsData } from '@/lib/verbs';
import { Mascot } from './Mascot';
import { HelpModal } from './HelpModal';

interface StartScreenProps {
  onStart: (mode: 'immediate' | 'delayed', count: number, difficulty: 'all' | 'common' | 'advanced') => void;
  onStudy: () => void;
  onSoundPop: () => void;
  stats: {
    bestScore: number;
    totalCorrect: number;
    totalAttempted: number;
    gamesPlayed: number;
    lastRank: string;
  };
  userName: string;
}

export const StartScreen = ({ onStart, onStudy, onSoundPop, stats, userName }: StartScreenProps) => {
  const [showExamOptions, setShowExamOptions] = useState(false);
  const [selectedCount, setSelectedCount] = useState(10);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'common' | 'advanced'>('all');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  const totalVerbs = verbsData.length;
  const commonVerbs = verbsData.filter(v => v.difficulty === 'common').length;
  const advancedVerbs = verbsData.filter(v => v.difficulty === 'advanced').length;
  
  const questionOptions = [5, 10, 20, 'ALL'];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200 } }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 text-center w-full min-h-screen relative overflow-x-hidden bg-blue-50">
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      
      {/* Playful Background Shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-200/50 rounded-full blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-200/50 rounded-full blur-[80px] animate-pulse pointer-events-none" />
      
      {/* Decorative Icons */}
      <div className="hidden lg:block absolute top-20 left-20 text-blue-200 animate-bounce pointer-events-none"><Star size={64} fill="currentColor" aria-hidden="true" /></div>
      <div className="hidden lg:block absolute bottom-20 right-20 text-orange-200 animate-bounce pointer-events-none" style={{ animationDelay: '1s' }}><Sparkles size={64} fill="currentColor" aria-hidden="true" /></div>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { onSoundPop(); setIsHelpOpen(true); }}
        className="absolute top-6 right-20 sm:right-24 bg-white p-3 rounded-full shadow-lg text-blue-500 border-2 border-blue-50 z-[20]"
        aria-label="How to play"
      >
        <HelpCircle size={28} aria-hidden="true" />
      </motion.button>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl z-10 space-y-6 sm:space-y-12 md:space-y-16 py-12"
      >
        <motion.div variants={itemVariants} className="flex flex-col items-center px-4">
          <div className="mb-2 sm:mb-6 scale-90 sm:scale-100">
            <Mascot mood="happy" />
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-heading text-blue-600 drop-shadow-[0_4px_0_rgba(0,0,0,0.1)] mb-1 sm:mb-2 uppercase tracking-tight leading-none">
            Verb <br className="sm:hidden" /> Adventures!
          </h1>
          <p className="text-slate-500 font-body text-base sm:text-2xl font-bold tracking-wide">
            Welcome back, <span className="text-blue-500 underline decoration-blue-200 decoration-4 underline-offset-4">{userName}</span>! ✨
          </p>

          {stats.gamesPlayed > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex flex-wrap justify-center gap-4"
            >
              <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border-2 border-blue-100 shadow-sm">
                <span className="text-slate-400 text-xs uppercase font-bold tracking-widest block">Best Score</span>
                <span className="text-blue-600 font-heading text-xl">{stats.bestScore}%</span>
              </div>
              <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border-2 border-orange-100 shadow-sm">
                <span className="text-slate-400 text-xs uppercase font-bold tracking-widest block">Current Rank</span>
                <span className="text-orange-600 font-heading text-xl">{stats.lastRank}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        <div className="w-full max-w-sm sm:max-w-md mx-auto px-4">
          <AnimatePresence mode="wait">
            {!showExamOptions ? (
              <motion.div 
                key="main-menu"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="space-y-4 sm:space-y-6"
              >
                <motion.button 
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { onSoundPop(); onStart('immediate', totalVerbs, 'all'); }}
                  className="group relative w-full bg-blue-500 hover:bg-blue-400 text-white py-4 sm:py-6 px-6 sm:px-8 rounded-[2rem] shadow-[0_6px_0_#2563eb] sm:shadow-[0_8px_0_#2563eb] transition-all flex items-center justify-between focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="text-xl sm:text-2xl font-heading uppercase tracking-wide">Quick Play</span>
                    <span className="text-blue-100 text-xs sm:text-sm font-bold opacity-80">All {totalVerbs} verbs!</span>
                  </div>
                  <Play size={24} fill="currentColor" className="shrink-0 ml-4 sm:w-8 sm:h-8" aria-hidden="true" />
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { onSoundPop(); setShowExamOptions(true); }}
                  className="group relative w-full bg-orange-500 hover:bg-orange-400 text-white py-4 sm:py-6 px-6 sm:px-8 rounded-[2rem] shadow-[0_6px_0_#ea580c] sm:shadow-[0_8px_0_#ea580c] transition-all flex items-center justify-between focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="text-xl sm:text-2xl font-heading uppercase tracking-wide">Challenge</span>
                    <span className="text-orange-100 text-xs sm:text-sm font-bold opacity-80">Test your brain!</span>
                  </div>
                  <Trophy size={24} fill="currentColor" className="shrink-0 ml-4 sm:w-8 sm:h-8" aria-hidden="true" />
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { onSoundPop(); onStudy(); }}
                  className="group relative w-full bg-green-500 hover:bg-green-400 text-white py-4 sm:py-6 px-6 sm:px-8 rounded-[2rem] shadow-[0_6px_0_#16a34a] sm:shadow-[0_8px_0_#16a34a] transition-all flex items-center justify-between focus:outline-none focus-visible:ring-4 focus-visible:ring-green-200"
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="text-xl sm:text-2xl font-heading uppercase tracking-wide">Flashcards</span>
                    <span className="text-green-100 text-xs sm:text-sm font-bold opacity-80">Study the verbs!</span>
                  </div>
                  <BookOpen size={24} fill="currentColor" className="shrink-0 ml-4 sm:w-8 sm:h-8" aria-hidden="true" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                key="exam-options"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6 bg-white p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] shadow-xl border-4 border-orange-100"
              >
                <div className="text-left space-y-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-heading text-slate-700 uppercase mb-3 px-2">Difficulty</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {(['all', 'common', 'advanced'] as const).map((diff) => (
                        <button
                          key={diff}
                          onClick={() => { onSoundPop(); setSelectedDifficulty(diff); }}
                          className={`py-2 rounded-xl font-heading text-sm transition-all border-2 ${
                            selectedDifficulty === diff 
                            ? 'bg-blue-50 border-blue-500 text-blue-600' 
                            : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                          }`}
                        >
                          {diff.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-heading text-slate-700 uppercase mb-3 px-2">How many?</h3>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {questionOptions.map((count) => (
                        <button
                          key={count}
                          onClick={() => { onSoundPop(); setSelectedCount(count === 'ALL' ? 999 : count as number); }}
                          className={`py-3 sm:py-4 rounded-xl sm:rounded-2xl font-heading text-base sm:text-lg transition-all border-4 ${
                            (selectedCount === count || (count === 'ALL' && selectedCount === 999))
                            ? 'bg-orange-50 border-orange-500 text-orange-600' 
                            : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4 pt-2">
                  <button 
                    onClick={() => { onSoundPop(); setShowExamOptions(false); }}
                    className="flex-1 bg-slate-100 text-slate-500 font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:bg-slate-200 transition-all uppercase text-xs focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => { 
                      onSoundPop(); 
                      const maxAvailable = selectedDifficulty === 'all' ? totalVerbs : (selectedDifficulty === 'common' ? commonVerbs : advancedVerbs);
                      const finalCount = Math.min(selectedCount, maxAvailable);
                      onStart('delayed', finalCount, selectedDifficulty); 
                    }}
                    className="flex-[2] bg-orange-500 text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-[0_4px_0_#ea580c] sm:shadow-[0_6px_0_#ea580c] hover:bg-orange-400 transition-all flex items-center justify-center gap-2 uppercase text-base sm:text-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
                  >
                    Start! <ChevronRight size={20} className="sm:w-6 sm:h-6" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer Decoration */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        className="pb-8 pt-4 text-slate-400 font-bold text-xs sm:text-sm tracking-widest z-10"
      >
        LET'S LEARN TOGETHER! 🚀
      </motion.div>
    </div>
  );
};
