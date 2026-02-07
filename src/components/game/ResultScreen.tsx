'use client';

import { RotateCcw, BookOpen, Home, Trophy, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getRank } from '@/lib/verbs';
import { useState } from 'react';
import { Mascot } from './Mascot';

interface ResultScreenProps {
  score: number;
  total: number;
  onRestart: (mode: 'immediate' | 'delayed', count: number) => void;
  onHome: () => void;
  onReview: () => void;
  showConfetti: boolean;
  mode: 'immediate' | 'delayed';
  onSoundPop: () => void;
  userName: string;
}

const Balloon = ({ delay, x }: { delay: number, x: string }) => (
  <motion.div
    initial={{ y: '110vh', opacity: 1 }}
    animate={{ y: '-10vh' }}
    transition={{ duration: 4, delay, ease: "linear", repeat: Infinity }}
    className="absolute text-6xl select-none pointer-events-none"
    style={{ left: x }}
  >
    {['🎈', '🎈', '🎈', '✨', '⭐'][Math.floor(Math.random() * 5)]}
  </motion.div>
);

export const ResultScreen = ({ score, total, onRestart, onHome, onReview, showConfetti, mode, onSoundPop, userName }: ResultScreenProps) => {
    const percentage = Math.round((score / total) * 100);
    const rank = getRank(percentage);

    return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 text-center min-h-screen relative overflow-hidden bg-blue-50">
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <Balloon key={i} delay={i * 0.5} x={`${Math.random() * 90}%`} />
            ))}
          </div>
        )}

        {/* Playful background circles */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-200/50 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-200/50 rounded-full blur-3xl animate-pulse" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="w-full max-w-2xl relative z-10 py-8 bg-white/80 backdrop-blur-sm rounded-[4rem] shadow-2xl border-b-[16px] border-blue-100 p-8 sm:p-12 mx-4"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="mb-6 scale-150">
              <Mascot mood={percentage >= 60 ? "celebrating" : "happy"} />
            </div>
            
            <h2 className="text-blue-400 font-heading text-xl sm:text-2xl uppercase tracking-widest mb-4">Quest Complete, {userName}!</h2>
            
            <motion.div 
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
              className="text-7xl sm:text-9xl font-heading text-blue-600 drop-shadow-[0_6px_0_rgba(37,99,235,0.1)] mb-4"
            >
              {percentage}%
            </motion.div>
          </div>
          
          <div className="bg-yellow-50 p-8 rounded-[3rem] border-4 border-yellow-100 mb-10 relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white rounded-full p-3 shadow-md border-4 border-yellow-100 text-yellow-500 scale-125">
              <Star fill="currentColor" size={32} />
            </div>
            
            <h3 className="text-2xl sm:text-4xl font-heading text-slate-800 uppercase mb-3 mt-2">
              {rank.title}
            </h3>
            <p className="text-slate-500 font-bold text-lg sm:text-xl leading-relaxed mb-6">
              &quot;Great job {userName}! {rank.message}&quot;
            </p>
            
            <div className="flex items-center justify-center gap-4 bg-white/50 py-3 px-6 rounded-2xl border-2 border-yellow-100/50">
              <Star className="text-yellow-400" fill="currentColor" size={24} />
              <span className="font-heading text-xl text-slate-700">
                {score} / {total} Correct
              </span>
              <Star className="text-yellow-400" fill="currentColor" size={24} />
            </div>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-4">
                <motion.button 
                whileHover={{ scale: 1.05, y: -4 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => { onSoundPop(); onReview(); }}
                className="w-full bg-purple-500 hover:bg-purple-400 text-white font-heading text-sm py-5 rounded-3xl transition-all shadow-[0_6px_0_#9333ea] flex items-center justify-center gap-2"
                >
                <BookOpen size={20} /> REVIEW
                </motion.button>

                <motion.button 
                whileHover={{ scale: 1.05, y: -4 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => { onSoundPop(); onRestart(mode, total); }}
                className="w-full bg-blue-500 hover:bg-blue-400 text-white font-heading text-sm py-5 rounded-3xl transition-all shadow-[0_6px_0_#2563eb] flex items-center justify-center gap-2"
                >
                <RotateCcw size={20} /> RETRY
                </motion.button>
            </div>

            <motion.button 
              whileHover={{ scale: 1.05, y: -4 }} 
              whileTap={{ scale: 0.95 }}
              onClick={() => { onSoundPop(); onHome(); }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-heading text-sm py-5 rounded-3xl transition-all border-b-8 border-slate-200 flex items-center justify-center gap-2"
            >
              <Home size={20} /> GO HOME
            </motion.button>
          </div>
        </motion.div>
    </div>
    );
};
