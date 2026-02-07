'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, Check, RotateCcw } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { AIContent } from './AIContent';
import { AudioControls } from '@/hooks/use-audio';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate?: () => void;
  content: string;
  loading: boolean;
  title: string;
  audio: AudioControls;
}

export const AIModal = ({ isOpen, onClose, onRegenerate, content, loading, title, audio }: AIModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap and Escape key
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Tab') {
          const focusable = modalRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
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
      setTimeout(() => {
        const firstBtn = modalRef.current?.querySelector('button');
        firstBtn?.focus();
      }, 100);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
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
            ref={modalRef}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="bg-white rounded-[2.5rem] sm:rounded-[3rem] w-full max-w-md p-6 sm:p-8 shadow-2xl relative overflow-hidden z-10 border-b-[8px] sm:border-b-[12px] border-purple-100 max-h-[90vh] flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-3 sm:h-4 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400" />
            
            <div className="flex justify-between items-center mb-4 sm:mb-6 shrink-0 pt-2 sm:pt-0">
              <h3 id="modal-title" className="text-xl sm:text-2xl font-heading text-purple-600 uppercase flex items-center gap-2 sm:gap-3">
                <Sparkles className="text-yellow-400 sm:w-6 sm:h-6" fill="currentColor" size={20} aria-hidden="true"/> 
                {title}
              </h3>
              <button 
                onClick={onClose} 
                className="p-2 bg-slate-100 text-slate-400 hover:text-red-500 rounded-xl sm:rounded-2xl transition-all"
                aria-label="Close"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[100px] sm:min-h-[160px] bg-purple-50 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 border-4 border-white shadow-inner flex items-center justify-center custom-scrollbar relative">
                {loading ? (
                  <div className="flex flex-col items-center gap-3 sm:gap-4 text-purple-500">
                    <Loader2 className="animate-spin sm:w-12 sm:h-12" size={32} strokeWidth={3} aria-hidden="true" />
                    <span className="font-heading text-base sm:text-lg animate-pulse text-center uppercase tracking-wide">Thinking...</span>
                  </div>
                ) : (
                  <div className="w-full">
                    <AIContent content={content} audio={audio} />
                  </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8 shrink-0">
              {onRegenerate && !loading && (
                <button 
                  onClick={onRegenerate}
                  className="flex-1 bg-white border-4 border-purple-100 text-purple-500 font-heading text-sm sm:text-base py-3 sm:py-4 rounded-[1.5rem] transition-all hover:bg-purple-50 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> NEW HINT
                </button>
              )}
              <button 
                onClick={onClose}
                className={`flex-[1.5] bg-purple-500 hover:bg-purple-400 text-white font-heading text-lg sm:text-xl py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] transition-all shadow-[0_4px_0_#9333ea] sm:shadow-[0_6px_0_#9333ea] flex items-center justify-center gap-3`}
              >
                <Check size={24} className="sm:w-7 sm:h-7" aria-hidden="true" /> AWESOME!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};