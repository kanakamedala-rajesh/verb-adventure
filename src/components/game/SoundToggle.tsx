'use client';

import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface SoundToggleProps {
  onOpenSettings: () => void;
}

export const SoundToggle = ({ onOpenSettings }: SoundToggleProps) => (
  <motion.button 
    whileHover={{ scale: 1.05, backgroundColor: 'rgb(253, 224, 71)' }}
    whileTap={{ scale: 0.95 }}
    onClick={onOpenSettings}
    className="fixed top-4 left-4 sm:top-8 sm:right-8 sm:left-auto z-[100] bg-yellow-400 text-yellow-900 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl shadow-[0_4px_0_#ca8a04] transition-all flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-200 active:translate-y-1 active:shadow-none"
    title="Open Settings"
    aria-label="Open Settings"
  >
    <Settings className="w-5 h-5 sm:w-8 sm:h-8" />
  </motion.button>
);
