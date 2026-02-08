'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface AudioControls {
  isMuted: boolean;
  isSpeaking: boolean;
  toggleMute: () => void;
  playSound: (type: 'pop' | 'correct' | 'incorrect' | 'streak' | 'win') => void;
  speak: (text: string, overrideSpeed?: number, overrideVoiceURI?: string | null) => void;
}

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const [speed, setSpeed] = useState(0.9);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const speedRef = useRef(0.9);
  const voiceURIRef = useRef<string | null>(null);

  useEffect(() => {
    const savedMuted = localStorage.getItem('verbMasterMuted');
    if (savedMuted !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMuted(JSON.parse(savedMuted));
    }

    const savedVoice = localStorage.getItem('verbMasterVoiceURI');
    if (savedVoice !== null) {
      setSelectedVoiceURI(savedVoice);
      voiceURIRef.current = savedVoice;
    }

    const savedSpeed = localStorage.getItem('verbMasterSpeed');
    if (savedSpeed !== null) {
      const parsedSpeed = JSON.parse(savedSpeed);
      setSpeed(parsedSpeed);
      speedRef.current = parsedSpeed;
    }

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      // Filter for English voices as they are most relevant for irregular verbs
      const englishVoices = allVoices.filter((v) => v.lang.startsWith('en'));
      voicesRef.current = allVoices;
      setVoices(englishVoices.length > 0 ? englishVoices : allVoices);
    };

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    // Cleanup speech on unmount
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev: boolean) => {
      const next = !prev;
      localStorage.setItem('verbMasterMuted', JSON.stringify(next));
      return next;
    });
  }, []);

  const changeVoice = useCallback((uri: string) => {
    setSelectedVoiceURI(uri);
    voiceURIRef.current = uri;
    localStorage.setItem('verbMasterVoiceURI', uri);
  }, []);

  const changeSpeed = useCallback((val: number) => {
    setSpeed(val);
    speedRef.current = val;
    localStorage.setItem('verbMasterSpeed', JSON.stringify(val));
  }, []);

  const playSound = useCallback(
    (type: 'pop' | 'correct' | 'incorrect' | 'streak' | 'win') => {
      if (isMuted) return;

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;

      const createOsc = (
        freq: number,
        startTime: number,
        duration: number,
        oscType: OscillatorType = 'sine',
        volume = 0.2,
      ) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = oscType;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      switch (type) {
        case 'pop':
          createOsc(400, now, 0.1, 'sine', 0.3);
          break;
        case 'correct':
          createOsc(523.25, now, 0.2, 'sine', 0.2);
          break;
        case 'incorrect':
          createOsc(150, now, 0.2, 'sawtooth', 0.1);
          break;
        case 'streak':
          createOsc(440, now, 0.3, 'sine', 0.1);
          break;
        case 'win':
          [0, 0.1, 0.2].forEach((offset, i) => createOsc(523.25 + i * 100, now + offset, 0.3));
          break;
      }
    },
    [isMuted],
  );

  const speak = useCallback(
    (text: string, overrideSpeed?: number, overrideVoiceURI?: string | null) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      // Stop current speech
      window.speechSynthesis.cancel();
      setIsSpeaking(false);

      // Clean text of markdown
      const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);

      utterance.rate = overrideSpeed ?? speedRef.current;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const allVoices =
        voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();

      let voice = null;
      const voiceURI = overrideVoiceURI !== undefined ? overrideVoiceURI : voiceURIRef.current;

      if (voiceURI) {
        voice = allVoices.find((v) => v.voiceURI === voiceURI);
      }

      if (!voice) {
        // Fallback logic if selected voice is not available or not yet set
        voice =
          allVoices.find((v) => v.name === 'Microsoft Heera - English (India) (en-IN)') ||
          allVoices.find((v) => v.name.includes('Heera')) ||
          allVoices.find((v) => v.name.includes('Google') && v.name.includes('Female')) ||
          allVoices.find((v) => v.lang === 'en-IN') ||
          allVoices.find((v) => v.lang.startsWith('en'));
      }

      if (voice) utterance.voice = voice;

      // Track state for UI feedback
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [],
  );

  return {
    isMuted,
    isSpeaking,
    voices,
    selectedVoiceURI,
    speed,
    toggleMute,
    changeVoice,
    changeSpeed,
    playSound,
    speak,
  };
};
