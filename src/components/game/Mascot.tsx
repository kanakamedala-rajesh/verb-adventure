'use client';

import { motion, AnimatePresence } from 'framer-motion';

export type Mood = 'neutral' | 'happy' | 'thinking' | 'celebrating' | 'sad';

interface MascotProps {
  mood: Mood;
  userName?: string;
  message?: string;
}

const emojis: Record<Mood, string> = {
  neutral: "🦁",
  happy: "🤩",
  thinking: "🤔",
  celebrating: "🥳",
  sad: "😿"
};

const getMessage = (mood: Mood, name: string) => {
  switch (mood) {
    case 'happy': return `Great job, ${name}!`;
    case 'celebrating': return `You're a star, ${name}!`;
    case 'thinking': return `You got this, ${name}!`;
    case 'sad': return `Don't give up, ${name}!`;
    default: return `Hi, ${name}!`;
  }
};

export const Mascot = ({ mood, userName, message }: MascotProps) => {
  const displayMessage = message || (userName ? getMessage(mood, userName) : null);

  return (
    <div className="relative">
      <AnimatePresence>
        {displayMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-2xl shadow-xl border-2 border-blue-100 whitespace-nowrap z-30 font-bold text-blue-600 text-sm sm:text-base pointer-events-none"
          >
            {displayMessage}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-blue-100 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div 
        initial={{ scale: 0.8, y: 10 }}
        animate={{ 
          scale: 1, 
          y: [0, -5, 0],
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          },
          scale: {
            type: "spring",
            stiffness: 260,
            damping: 20
          }
        }}
        className="bg-white p-2 rounded-full shadow-md text-3xl sm:text-4xl border-4 border-yellow-300 z-10 cursor-default"
      >
        {emojis[mood] || emojis.neutral}
      </motion.div>
    </div>
  );
};