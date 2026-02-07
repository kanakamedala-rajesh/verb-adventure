'use client';

import { Star, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { AudioControls } from '@/hooks/use-audio';

interface AIContentProps {
  content: string;
  audio: AudioControls;
}

export const AIContent = ({ content, audio }: AIContentProps) => {
  const { speak, isSpeaking } = audio;
  const parsedData = useMemo(() => {
    if (!content) return null;
    try {
      // Robust extraction: find the first { and the last }
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      return null;
    } catch (e) {
      return null;
    }
  }, [content]);

  // Extract the single sentence from various possible keys
  const rawHintText = parsedData?.hint || parsedData?.rhyme || parsedData?.present || content;

  // Function to convert markdown (**bold**, *italics*) to highlighted JSX
  const formatText = (text: string) => {
    if (typeof text !== 'string') return text;
    
    // We only use ** and * now to avoid issues with contractions like "it's"
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/);
    
    return parts.map((part, index) => {
      // Handle Bold **text**
      if (part.startsWith('**') && part.endsWith('**')) {
        const innerText = part.slice(2, -2);
        return (
          <span 
            key={index} 
            className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-lg border border-blue-100 mx-0.5 whitespace-nowrap"
          >
            {innerText}
          </span>
        );
      }
      
      // Handle Italics *text*
      if (part.startsWith('*') && part.endsWith('*')) {
        const innerText = part.slice(1, -1);
        return (
          <span 
            key={index} 
            className="font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-lg border border-orange-100 mx-0.5 whitespace-nowrap"
          >
            {innerText}
          </span>
        );
      }

      return part;
    });
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center text-center space-y-4 sm:space-y-6 py-4"
    >
      <div className="relative group">
        <button 
          onClick={() => speak(rawHintText)}
          disabled={isSpeaking}
          className={`p-4 rounded-full text-yellow-600 shadow-sm border-4 border-white relative z-10 transition-all
            ${isSpeaking ? 'bg-yellow-200 scale-110 animate-pulse cursor-not-allowed' : 'bg-yellow-100 hover:scale-110 animate-bounce'}
          `}
          aria-label={isSpeaking ? "Speaking..." : "Read hint aloud"}
        >
          <Volume2 size={32} className="sm:w-10 sm:h-10" />
        </button>
        <div className={`absolute inset-0 bg-yellow-400 rounded-full blur-xl transition-opacity
          ${isSpeaking ? 'opacity-40 animate-pulse' : 'opacity-20 group-hover:opacity-40'}
        `} />
      </div>
      
      <div className="space-y-2 px-2">
        <span className="text-[10px] sm:text-xs font-heading text-purple-400 uppercase tracking-[0.2em] block">
          Magic Hint!
        </span>
        <div className="text-xl sm:text-2xl font-heading text-slate-700 leading-relaxed max-w-[280px] sm:max-w-md mx-auto">
          &quot;{formatText(rawHintText)}&quot;
        </div>
      </div>

      <div className="flex gap-2 text-yellow-400 opacity-50">
        <Star size={16} fill="currentColor" />
        <Star size={16} fill="currentColor" />
        <Star size={16} fill="currentColor" />
      </div>
    </motion.div>
  );
};
