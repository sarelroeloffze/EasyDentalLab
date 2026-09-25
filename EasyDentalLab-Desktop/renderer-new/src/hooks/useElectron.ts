// ============================================================
// useElectron Hook - Electron API Wrapper
// ============================================================

import { useEffect, useState } from 'react';
import type { ElectronAPI } from '../types';

/**
 * Check if running in Electron environment
 */
export function isElectron(): boolean {
  return typeof window !== 'undefined' && !!window.electronAPI;
}

/**
 * Get Electron API (type-safe)
 */
export function getElectronAPI(): ElectronAPI | null {
  if (typeof window === 'undefined' || !window.electronAPI) {
    return null;
  }
  return window.electronAPI;
}

/**
 * Custom hook for Electron-specific features
 */
export function useElectron() {
  const [api] = useState<ElectronAPI | null>(() => getElectronAPI());
  const [backupFolderPath, setBackupFolderPath] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState<string | null>(null);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);

  // Load backup folder path on mount
  useEffect(() => {
    if (!api) return;

    api.getBackupFolder().then(result => {
      setBackupFolderPath(result.path);
    });
  }, [api]);

  // Listen for update events
  useEffect(() => {
    if (!api) return;
    
    api.onUpdateAvailable((version) => {
      setUpdateAvailable(version);
      setUpdateDownloaded(false);
    });
    
    api.onUpdateDownloaded(() => {
      setUpdateDownloaded(true);
    });
  }, [api]);

  return {
    isElectron: !!api,
    api,
    backupFolderPath,
    setBackupFolderPath,
    updateAvailable,
    updateDownloaded,
    installUpdate: () => api?.installUpdate()
  };
}
