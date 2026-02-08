'use client';

import { useState, useEffect } from 'react';

interface Stats {
  bestScore: number;
  totalCorrect: number;
  totalAttempted: number;
  gamesPlayed: number;
  lastRank: string;
}

const INITIAL_STATS: Stats = {
  bestScore: 0,
  totalCorrect: 0,
  totalAttempted: 0,
  gamesPlayed: 0,
  lastRank: 'Beginner',
};

export function useStats() {
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);

  useEffect(() => {
    const savedStats = localStorage.getItem('verb-adventure-stats');
    if (savedStats) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error('Failed to load stats', e);
      }
    }
  }, []);

  const updateStats = (score: number, total: number, rankTitle: string) => {
    const percentage = Math.round((score / total) * 100);
    
    setStats(prev => {
      const newStats = {
        ...prev,
        bestScore: Math.max(prev.bestScore, percentage),
        totalCorrect: prev.totalCorrect + score,
        totalAttempted: prev.totalAttempted + total,
        gamesPlayed: prev.gamesPlayed + 1,
        lastRank: rankTitle,
      };
      
      localStorage.setItem('verb-adventure-stats', JSON.stringify(newStats));
      return newStats;
    });
  };

  return { stats, updateStats };
}
