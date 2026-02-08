'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, BookOpen, Trophy, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-blue-100"
          >
            <div className="bg-blue-500 p-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <HelpCircle size={28} />
                <h2 className="text-2xl font-heading uppercase tracking-wide">How to Play</h2>
              </div>
              <button 
                onClick={onClose}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-orange-500">
                  <BookOpen size={20} />
                  <h3 className="font-heading uppercase text-lg">Game Modes</h3>
                </div>
                <ul className="space-y-4 text-slate-600 font-body">
                  <li className="flex gap-3">
                    <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-1">1</span>
                    <p><strong>Quick Play:</strong> Jump straight into action with all verbs. Perfect for a quick warm-up!</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-1">2</span>
                    <p><strong>Challenge:</strong> Customize your session by choosing difficulty and the number of questions.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-green-100 text-green-600 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-1">3</span>
                    <p><strong>Flashcards:</strong> Take your time to study each {"verb's"} forms and listen to their pronunciation.</p>
                  </li>
                </ul>
              </section>

              <section className="space-y-3 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 text-purple-500">
                  <Trophy size={20} />
                  <h3 className="font-heading uppercase text-lg">Question Types</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl text-center">
                    <span className="block font-bold text-slate-700 text-sm mb-1">Fill-in</span>
                    <span className="text-xs text-slate-500">Type the forms</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-center">
                    <span className="block font-bold text-slate-700 text-sm mb-1">MCQ</span>
                    <span className="text-xs text-slate-500">Pick the right one</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-center">
                    <span className="block font-bold text-slate-700 text-sm mb-1">True/False</span>
                    <span className="text-xs text-slate-500">Quick check</span>
                  </div>
                </div>
              </section>

              <section className="space-y-3 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 text-blue-500">
                  <Sparkles size={20} />
                  <h3 className="font-heading uppercase text-lg">Pro Features</h3>
                </div>
                <ul className="space-y-4 text-slate-600 font-body text-sm">
                  <li className="flex gap-3">
                    <span className="bg-blue-100 p-1.5 rounded-lg flex items-center justify-center shrink-0">🚀</span>
                    <p><strong>Installable:</strong> Add this to your home screen to use it just like a native app!</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-green-100 p-1.5 rounded-lg flex items-center justify-center shrink-0">📶</span>
                    <p><strong>Offline Play:</strong> Most features work without internet. Perfect for learning on the go!</p>
                  </li>
                </ul>
              </section>

              <section className="bg-yellow-50 p-6 rounded-3xl border-2 border-yellow-100 flex items-start gap-4">
                <div className="bg-white p-2 rounded-xl shadow-sm text-yellow-500">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="font-heading text-yellow-700 uppercase mb-1">Expert Tip!</h3>
                  <p className="text-yellow-800 text-sm leading-relaxed">
                    Use the <strong>Review</strong> button at the end of a session to see exactly which verbs you missed and learn from your mistakes!
                  </p>
                </div>
              </section>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <button 
                onClick={onClose}
                className="bg-blue-500 hover:bg-blue-400 text-white font-heading px-12 py-3 rounded-2xl shadow-lg transition-all active:scale-95"
              >
                GOT IT!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
