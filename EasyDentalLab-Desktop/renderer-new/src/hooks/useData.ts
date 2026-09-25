// ============================================================
// useData Hook - Centralized State Management
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import type { AppData } from '../types';
import { INITIAL_DATA, STORAGE_KEY } from '../constants/initialData';

/**
 * Custom hook for managing app data with localStorage persistence
 */
export function useData() {
  const [data, setDataState] = useState<AppData>(INITIAL_DATA);
  const [loaded, setLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Merge with INITIAL_DATA to ensure all fields exist
        const merged: AppData = {
          ...INITIAL_DATA,
          ...parsed,
          profile: {
            ...INITIAL_DATA.profile,
            ...parsed.profile,
            layout: {
              ...INITIAL_DATA.profile.layout,
              ...(parsed.profile?.layout || {})
            }
          }
        };
        
        setDataState(merged);
      }
    } catch (e) {
      console.error('Failed to load data from localStorage:', e);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!loaded) return; // Don't save during initial load
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e: any) {
      // Check if quota exceeded
      if (e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        alert('WARNING: Storage is full! Export a backup immediately.');
      }
      console.error('Failed to save data to localStorage:', e);
    }
  }, [data, loaded]);

  // Wrapper to update data
  const setData = useCallback((updater: AppData | ((prev: AppData) => AppData)) => {
    setDataState(prev => typeof updater === 'function' ? updater(prev) : updater);
  }, []);

  return { data, setData, loaded };
}
