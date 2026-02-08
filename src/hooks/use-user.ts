'use client';

import { useState, useEffect } from 'react';

export function useUser() {
  const [name, setName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedName = localStorage.getItem('verb-adventure-user-name');
    if (savedName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(savedName);
    }
    setIsLoading(false);
  }, []);

  const updateName = (newName: string) => {
    const trimmedName = newName.trim();
    if (trimmedName) {
      setName(trimmedName);
      localStorage.setItem('verb-adventure-user-name', trimmedName);
    }
  };

  return { name, updateName, isLoading };
}
