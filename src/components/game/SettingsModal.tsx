'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, User, Zap } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string | null;
  speed: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onChangeVoice: (uri: string) => void;
  onChangeSpeed: (speed: number) => void;
  onSoundPop: () => void;
  onSpeak: (text: string, speed?: number, voiceURI?: string | null) => void;
}

export const SettingsModal = ({
  isOpen,
  onClose,
  voices,
  selectedVoiceURI,
  speed,
  isMuted,
  onToggleMute,
  onChangeVoice,
  onChangeSpeed,
  onSoundPop,
  onSpeak,
}: SettingsModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-white rounded-[2.5rem] shadow-2xl z-[120] overflow-hidden border-4 border-blue-100"
          >
            <div className="p-6 sm:p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-heading text-blue-600 uppercase tracking-tight">
                  Settings
                </h2>
                <button
                  onClick={() => {
                    onSoundPop();
                    onClose();
                  }}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X size={32} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Mute Toggle */}
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                      {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                    </div>
                    <div>
                      <div className="font-heading text-lg text-slate-700">Sound Effects</div>
                      <div className="text-sm text-slate-400 font-bold uppercase">
                        Toggle game sounds
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onSoundPop();
                      onToggleMute();
                    }}
                    className={`w-14 h-8 rounded-full transition-all relative ${isMuted ? 'bg-slate-200' : 'bg-blue-500'}`}
                  >
                    <motion.div
                      animate={{ x: isMuted ? 4 : 28 }}
                      className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>

                {/* Voice Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-500 px-1">
                    <User size={18} />
                    <span className="font-bold text-sm uppercase tracking-wider">Tutor Voice</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {voices.map((voice) => (
                      <button
                        key={voice.voiceURI}
                        onClick={() => {
                          onSoundPop();
                          onChangeVoice(voice.voiceURI);
                          onSpeak('How does this voice sound?', speed, voice.voiceURI);
                        }}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                          selectedVoiceURI === voice.voiceURI
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-100 hover:border-blue-200 text-slate-600'
                        }`}
                      >
                        <div className="font-bold text-sm">{voice.name}</div>
                        <div className="text-[10px] opacity-60 uppercase">{voice.lang}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Zap size={18} />
                      <span className="font-bold text-sm uppercase tracking-wider">
                        Speech Speed
                      </span>
                    </div>
                    <span className="font-heading text-blue-600">{speed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={speed}
                    onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
                    onPointerUp={() => onSpeak('Testing speed.', speed, selectedVoiceURI)}
                    className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase px-1">
                    <span>Slower</span>
                    <span>Normal</span>
                    <span>Faster</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onSoundPop();
                  onClose();
                }}
                className="w-full bg-blue-500 text-white font-heading text-xl py-4 rounded-2xl shadow-[0_6px_0_#2563eb] hover:bg-blue-400 transition-all active:translate-y-1 active:shadow-none uppercase"
              >
                Save Settings
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
