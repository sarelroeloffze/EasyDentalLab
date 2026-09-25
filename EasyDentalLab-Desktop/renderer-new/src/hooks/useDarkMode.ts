// ============================================================
// useDarkMode Hook - Theme Management
// ============================================================

import { useState, useEffect } from 'react';
import { DARK_MODE_KEY } from '../constants/initialData';

/**
 * Custom hook for dark mode state
 */
export function useDarkMode() {
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    // Initialize from localStorage synchronously to prevent flash
    try {
      const stored = localStorage.getItem(DARK_MODE_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  // Apply dark mode class to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Save to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(DARK_MODE_KEY, String(darkMode));
    } catch (e) {
      console.error('Failed to save dark mode preference:', e);
    }
  }, [darkMode]);

  const setDarkMode = (value: boolean) => {
    setDarkModeState(value);
  };

  const toggleDarkMode = () => {
    setDarkModeState(prev => !prev);
  };

  return { darkMode, setDarkMode, toggleDarkMode };
}
