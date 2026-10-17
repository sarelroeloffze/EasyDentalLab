// ============================================================
// useBackup Hook - Auto-backup CSV files to selected folder
// ============================================================

import { useEffect, useRef } from 'react';
import type { AppData } from '../types';
import { buildClientsCSV, buildTariffsCSV, buildMacrosCSV, buildPaymentsCSV, buildMedicalAidsCSV } from '../utils/csv';

/**
 * Custom hook for auto-backing up CSV files
 * Debounced 2 seconds after data changes
 */
export function useBackup(data: AppData, loaded: boolean) {
  const timeoutRef = useRef<number | null>(null);
  const backupPendingRef = useRef(false);

  useEffect(() => {
    if (!loaded) return; // Don't backup during initial load
    if (!window.electronAPI) return; // Desktop only

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Mark backup as pending
    backupPendingRef.current = true;

    // Debounced backup (2 seconds)
    timeoutRef.current = window.setTimeout(async () => {
      await performBackup(data);
      backupPendingRef.current = false;
    }, 2000);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, loaded]);

  // Warn user if backup pending on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (backupPendingRef.current) {
        e.preventDefault();
        e.returnValue = 'Backup in progress...';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
}

async function performBackup(data: AppData) {
  if (!window.electronAPI) return;

  try {
    // Build CSVs
    const clientsCSV = buildClientsCSV(data.clients);
    const tariffsCSV = buildTariffsCSV(data.tariffs);
    const macrosCSV = buildMacrosCSV(data.macros);
    const paymentsCSV = buildPaymentsCSV(data.payments || [], data.invoices);
    const medicalAidsCSV = buildMedicalAidsCSV(data.medicalAids || []);

    // Write all CSV files
    const writes = [
      window.electronAPI.writeBackupFile('Clients.csv', clientsCSV),
      window.electronAPI.writeBackupFile('Tariffs.csv', tariffsCSV),
      window.electronAPI.writeBackupFile('Macros.csv', macrosCSV),
      window.electronAPI.writeBackupFile('Payments.csv', paymentsCSV),
      window.electronAPI.writeBackupFile('MedicalAids.csv', medicalAidsCSV),
    ];

    const results = await Promise.all(writes);

    // Check for failures
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      console.error('Backup failed for', failed.length, 'files');
    }

    // Write JSON backup
    const jsonBackup = JSON.stringify(data, null, 2);
    await window.electronAPI.writeBackupFile('EasyDentalLab-backup.json', jsonBackup);

  } catch (error) {
    console.error('Auto-backup error:', error);
  }
}
