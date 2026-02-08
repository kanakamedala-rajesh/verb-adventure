'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Mascot } from './Mascot';

interface NamePromptProps {
  onConfirm: (name: string) => void;
}

export const NamePrompt = ({ onConfirm }: NamePromptProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onConfirm(inputValue.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-600">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-400 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-400 rounded-full blur-[120px] opacity-50" />
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-8 sm:p-12 text-center"
      >
        <div className="mb-8 scale-125">
          <Mascot mood="happy" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-heading text-blue-600 mb-2 uppercase">Welcome!</h2>
        <p className="text-slate-500 font-bold mb-8">What is your name, young adventurer?</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              autoFocus
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your name..."
              className="w-full bg-slate-50 border-4 border-slate-100 rounded-2xl px-6 py-4 text-xl font-bold text-slate-700 focus:outline-none focus:border-blue-400 transition-all placeholder:text-slate-300"
              maxLength={20}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-200">
              <Sparkles size={24} />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            disabled={!inputValue.trim()}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-slate-200 disabled:shadow-none text-white font-heading text-xl py-5 rounded-2xl shadow-[0_6px_0_#ea580c] flex items-center justify-center gap-3 transition-all"
          >
            {"LET'S GO!"} <ArrowRight size={24} />
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
