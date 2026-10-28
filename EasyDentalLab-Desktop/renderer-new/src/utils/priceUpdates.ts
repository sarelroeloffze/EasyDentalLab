// ============================================================
// Price Update Utilities
// ============================================================

import {
  PRICE_LISTS_REPO_URL,
  TARIFFS_VERSION,
  MEDICAL_AIDS_VERSION,
  MEDICAL_AID_TARIFFS_VERSION,
  LAST_UPDATE_CHECK_KEY,
  UPDATE_CHECK_INTERVAL,
} from '../constants';
import { parseTariffCSV, parseMedicalAidsCSV, parseMedicalAidTariffsCSV } from './csv';
import type { Tariff, MedicalAid, MedicalAidTariff } from '../types';

// ============================================================
// Types
// ============================================================

export interface PriceListVersion {
  version: string;
  releaseDate: string;
  tariffs: {
    filename: string;
    version: string;
    codeCount: number;
    lastUpdated: string;
    changes: string;
  };
  medicalAids: {
    filename: string;
    version: string;
    aidCount: number;
    lastUpdated: string;
    changes: string;
  };
  medicalAidTariffs?: {
    filename: string;
    version: string;
    rateCount: number;
    lastUpdated: string;
    changes: string;
  };
  notes: string;
}

export interface UpdateCheckResult {
  tariffsUpdateAvailable: boolean;
  medicalAidsUpdateAvailable: boolean;
  medicalAidTariffsUpdateAvailable: boolean;
  latestVersion: PriceListVersion | null;
  error?: string;
}

export interface PriceUpdatePreview {
  added: Tariff[];
  updated: Tariff[];
  removed: Tariff[];
  unchanged: number;
}

export interface MedicalAidsUpdatePreview {
  added: MedicalAid[];
  removed: MedicalAid[];
  unchanged: number;
}

export interface MedicalAidTariffsUpdatePreview {
  added: MedicalAidTariff[];
  updated: MedicalAidTariff[];
  removed: MedicalAidTariff[];
  unchanged: number;
}

// ============================================================
// Update Check Functions
// ============================================================

/**
 * Check if enough time has passed since last update check
 */
export function shouldCheckForUpdates(): boolean {
  const lastCheck = localStorage.getItem(LAST_UPDATE_CHECK_KEY);
  if (!lastCheck) return true;

  const lastCheckTime = parseInt(lastCheck, 10);
  const now = Date.now();

  return (now - lastCheckTime) > UPDATE_CHECK_INTERVAL;
}

/**
 * Fetch version.json from GitHub to check for updates
 */
export async function checkForPriceUpdates(): Promise<UpdateCheckResult> {
  try {
    const versionUrl = `${PRICE_LISTS_REPO_URL}/version.json`;
    const response = await fetch(versionUrl, {
      cache: 'no-cache',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch version info: ${response.status}`);
    }

    const latestVersion: PriceListVersion = await response.json();

    // Compare versions
    const tariffsUpdateAvailable = latestVersion.tariffs.version !== TARIFFS_VERSION;
    const medicalAidsUpdateAvailable = latestVersion.medicalAids.version !== MEDICAL_AIDS_VERSION;
    const medicalAidTariffsUpdateAvailable = latestVersion.medicalAidTariffs
      ? latestVersion.medicalAidTariffs.version !== MEDICAL_AID_TARIFFS_VERSION
      : false;

    // Update last check timestamp
    localStorage.setItem(LAST_UPDATE_CHECK_KEY, Date.now().toString());

    return {
      tariffsUpdateAvailable,
      medicalAidsUpdateAvailable,
      medicalAidTariffsUpdateAvailable,
      latestVersion,
    };
  } catch (error) {
    console.warn('Failed to check for price updates:', error);
    return {
      tariffsUpdateAvailable: false,
      medicalAidsUpdateAvailable: false,
      medicalAidTariffsUpdateAvailable: false,
      latestVersion: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Download tariffs CSV from GitHub
 */
export async function downloadTariffsCSV(filename: string): Promise<string> {
  const url = `${PRICE_LISTS_REPO_URL}/${filename}`;
  const response = await fetch(url, {
    cache: 'no-cache',
    headers: { 'Accept': 'text/csv' },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${filename}: ${response.status}`);
  }

  return await response.text();
}

/**
 * Download medical aids CSV from GitHub
 */
export async function downloadMedicalAidsCSV(filename: string): Promise<string> {
  const url = `${PRICE_LISTS_REPO_URL}/${filename}`;
  const response = await fetch(url, {
    cache: 'no-cache',
    headers: { 'Accept': 'text/csv' },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${filename}: ${response.status}`);
  }

  return await response.text();
}

/**
 * Download medical aid tariffs CSV from GitHub
 */
export async function downloadMedicalAidTariffsCSV(filename: string): Promise<string> {
  const url = `${PRICE_LISTS_REPO_URL}/${filename}`;
  const response = await fetch(url, {
    cache: 'no-cache',
    headers: { 'Accept': 'text/csv' },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${filename}: ${response.status}`);
  }

  return await response.text();
}

// ============================================================
// Preview Functions
// ============================================================

/**
 * Generate preview of tariff changes
 */
export function previewTariffUpdate(
  currentTariffs: Tariff[],
  newTariffsCSV: string
): PriceUpdatePreview {
  const newTariffs = parseTariffCSV(newTariffsCSV);

  const currentMap = new Map(currentTariffs.map(t => [t.code, t]));
  const newMap = new Map(newTariffs.map(t => [t.code, t]));

  const added: Tariff[] = [];
  const updated: Tariff[] = [];
  const removed: Tariff[] = [];
  let unchanged = 0;

  // Find added and updated
  for (const newTariff of newTariffs) {
    const current = currentMap.get(newTariff.code);

    if (!current) {
      added.push(newTariff);
    } else {
      // Check if anything changed
      const hasChanges =
        current.description !== newTariff.description ||
        current.price !== newTariff.price ||
        current.category !== newTariff.category;

      if (hasChanges) {
        updated.push(newTariff);
      } else {
        unchanged++;
      }
    }
  }

  // Find removed
  for (const current of currentTariffs) {
    if (!newMap.has(current.code)) {
      removed.push(current);
    }
  }

  return { added, updated, removed, unchanged };
}

/**
 * Generate preview of medical aids changes
 */
export function previewMedicalAidsUpdate(
  currentMedicalAids: MedicalAid[],
  newMedicalAidsCSV: string
): MedicalAidsUpdatePreview {
  const newMedicalAids = parseMedicalAidsCSV(newMedicalAidsCSV);

  // Create normalized maps for comparison (name-plan combinations)
  const currentSet = new Set(
    currentMedicalAids.flatMap(aid =>
      aid.plans.length > 0
        ? aid.plans.map(plan => `${aid.name}|${plan.name}`)
        : [`${aid.name}|`]
    )
  );

  const newSet = new Set(
    newMedicalAids.flatMap(aid =>
      aid.plans.length > 0
        ? aid.plans.map(plan => `${aid.name}|${plan.name}`)
        : [`${aid.name}|`]
    )
  );

  const added: MedicalAid[] = [];
  const removed: MedicalAid[] = [];

  // Find added
  for (const aid of newMedicalAids) {
    const aidPlans = aid.plans.length > 0
      ? aid.plans.map(plan => `${aid.name}|${plan.name}`)
      : [`${aid.name}|`];

    for (const combo of aidPlans) {
      if (!currentSet.has(combo)) {
        added.push(aid);
        break;
      }
    }
  }

  // Find removed
  for (const aid of currentMedicalAids) {
    const aidPlans = aid.plans.length > 0
      ? aid.plans.map(plan => `${aid.name}|${plan.name}`)
      : [`${aid.name}|`];

    for (const combo of aidPlans) {
      if (!newSet.has(combo)) {
        removed.push(aid);
        break;
      }
    }
  }

  const unchanged = currentMedicalAids.length - removed.length;

  return { added, removed, unchanged };
}

/**
 * Generate preview of medical aid tariffs changes
 */
export function previewMedicalAidTariffsUpdate(
  currentMedicalAidTariffs: MedicalAidTariff[],
  newMedicalAidTariffsCSV: string
): MedicalAidTariffsUpdatePreview {
  const newMedicalAidTariffs = parseMedicalAidTariffsCSV(newMedicalAidTariffsCSV);

  // Create map using medicalAid+code as key
  const currentMap = new Map(
    currentMedicalAidTariffs.map(mat => [`${mat.medicalAid}|${mat.code}`, mat])
  );
  const newMap = new Map(
    newMedicalAidTariffs.map(mat => [`${mat.medicalAid}|${mat.code}`, mat])
  );

  const added: MedicalAidTariff[] = [];
  const updated: MedicalAidTariff[] = [];
  const removed: MedicalAidTariff[] = [];
  let unchanged = 0;

  // Find added and updated
  for (const newRate of newMedicalAidTariffs) {
    const key = `${newRate.medicalAid}|${newRate.code}`;
    const current = currentMap.get(key);

    if (!current) {
      added.push(newRate);
    } else {
      // Check if price changed
      if (current.price !== newRate.price) {
        updated.push(newRate);
      } else {
        unchanged++;
      }
    }
  }

  // Find removed
  for (const current of currentMedicalAidTariffs) {
    const key = `${current.medicalAid}|${current.code}`;
    if (!newMap.has(key)) {
      removed.push(current);
    }
  }

  return { added, updated, removed, unchanged };
}

// ============================================================
// Apply Update Functions
// ============================================================

/**
 * Create backup of current data before applying update
 */
export function createBackup(data: any): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupKey = `edl_backup_${timestamp}`;

  try {
    localStorage.setItem(backupKey, JSON.stringify(data));
    console.log(`Backup created: ${backupKey}`);
  } catch (error) {
    console.error('Failed to create backup:', error);
    throw new Error('Failed to create backup before update');
  }
}

/**
 * Apply tariff update (replaces all tariffs)
 */
export function applyTariffUpdate(
  currentData: any,
  newTariffsCSV: string,
  createBackupFirst: boolean = true
): any {
  if (createBackupFirst) {
    createBackup(currentData);
  }

  const newTariffs = parseTariffCSV(newTariffsCSV);

  return {
    ...currentData,
    tariffs: newTariffs,
  };
}

/**
 * Apply medical aids update (replaces all medical aids)
 */
export function applyMedicalAidsUpdate(
  currentData: any,
  newMedicalAidsCSV: string,
  createBackupFirst: boolean = true
): any {
  if (createBackupFirst) {
    createBackup(currentData);
  }

  const newMedicalAids = parseMedicalAidsCSV(newMedicalAidsCSV);

  return {
    ...currentData,
    medicalAids: newMedicalAids,
  };
}

/**
 * Apply medical aid tariffs update (replaces all medical aid tariffs)
 */
export function applyMedicalAidTariffsUpdate(
  currentData: any,
  newMedicalAidTariffsCSV: string,
  createBackupFirst: boolean = true
): any {
  if (createBackupFirst) {
    createBackup(currentData);
  }

  const newMedicalAidTariffs = parseMedicalAidTariffsCSV(newMedicalAidTariffsCSV);

  return {
    ...currentData,
    medicalAidTariffs: newMedicalAidTariffs,
  };
}

// ============================================================
// Import from File Functions
// ============================================================

/**
 * Import tariffs from user-selected file
 */
export async function importTariffsFromFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      try {
        const text = await file.text();
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };

    input.click();
  });
}

/**
 * Import medical aids from user-selected file
 */
export async function importMedicalAidsFromFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      try {
        const text = await file.text();
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };

    input.click();
  });
}

/**
 * Import MedicalAidTariffs CSV from file
 * Opens file picker for user to select CSV file
 */
export async function importMedicalAidTariffsFromFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      try {
        const text = await file.text();
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };

    input.click();
  });
}
