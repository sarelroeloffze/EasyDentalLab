// ============================================================
// Type Definitions for EasyDentalLab
// ============================================================

export interface LineItem {
  id: string;
  code: string;           // User Code (internal)
  tariffCode?: string;    // Medical aid billing code (defaults to code if blank)
  description: string;
  qty: number;
  price: number;
}

export interface Invoice {
  id: string;
  number: number;
  clientId: string;
  clientName: string;
  date: string;           // YYYY-MM-DD
  patientTitle: string;
  patientSurname: string;
  patientName: string;
  memberName: string;
  medicalAidName: string;
  medicalAidNumber: string;
  lang: 'en' | 'af';
  items: LineItem[];
  notes: string;
  total: number;          // VAT-inclusive total
  status: 'unpaid' | 'paid';
  paidDate: string | null;
  claimed: boolean;
  claimedDate: string | null;
  estimateRef: number | null;
  discountEnabled?: boolean;
  discountPercent?: number;
}

export interface Estimate {
  id: string;
  number: number;
  clientId: string;
  clientName: string;
  date: string;
  patientTitle: string;
  patientSurname: string;
  patientName: string;
  memberName: string;
  medicalAidName: string;
  medicalAidNumber: string;
  lang: 'en' | 'af';
  items: LineItem[];
  notes: string;
  total: number;
  discountEnabled?: boolean;
  discountPercent?: number;
}

export interface Client {
  id: string;
  name: string;
  practice: string;
  phone: string;
  email: string;
  pcns: string;
  address: string;
  city: string;
  postalCode: string;
  archived?: boolean;
}

export interface Tariff {
  id: string;
  code: string;           // User Code
  tariffCode?: string;    // Medical aid billing code
  description: string;
  descriptionAFR: string;
  price: number;
  category: string;
  measure: string;
}

export interface Macro {
  id: string;
  name: string;
  codes: Array<{ code: string; qty: number }>;
}

export interface Payment {
  id: string;
  date: string;
  clientId: string;
  clientName: string;
  amount: number;
  reference: string;
  method: string;
  allocations: Array<{
    invoiceId: string;
    amount: number;
  }>;
}

export interface Category {
  id: string;
  name: string;
}

export interface MedicalAid {
  name: string;
}

export interface LayoutSettings {
  logoPosition: 'left' | 'right' | 'center';
  logoSize: number;
  fontSize: number;
  printCopies: number;
  footerMessage: string;
  confirmationMessage: string;
  statementSendMethod: 'print' | 'whatsapp' | 'both';
  statementFormat: 'pdf' | 'browser';
  monthEndMode: 'individual' | 'batch' | 'both';
}

export interface Profile {
  businessName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  vatNumber: string;
  vatPercent: number;
  labNumber: string;
  pcns: string;
  bankName: string;
  bankAccount: string;
  bankBranch: string;
  logo: string;           // base64 encoded image
  layout: LayoutSettings;
  backupPassword?: string;
}

export interface AppData {
  profile: Profile;
  clients: Client[];
  tariffs: Tariff[];
  macros: Macro[];
  invoices: Invoice[];
  estimates: Estimate[];
  payments: Payment[];
  categories: Category[];
  medicalAids: MedicalAid[];
  nextInvoiceNo: number;
  nextEstimateNo: number;
}

// Electron API types
export interface ElectronAPI {
  selectBackupFolder: () => Promise<{ success: boolean; path?: string; error?: string }>;
  getBackupFolder: () => Promise<{ path: string | null }>;
  clearBackupFolder: () => Promise<void>;
  writeBackupFile: (filename: string, content: string) => Promise<{ success: boolean; error?: string }>;
  writeSubfolderFile: (subfolder: string, filename: string, dataUrl: string) => Promise<{ success: boolean; error?: string }>;
  readBackupFile: (filename: string) => Promise<{ success: boolean; content?: string; error?: string }>;
  openExternal: (url: string) => Promise<void>;
  flushDataNow: () => Promise<void>;
  onMainProcessLog: (callback: (message: string) => void) => void;
  onUpdateAvailable: (callback: (version: string) => void) => void;
  onUpdateDownloaded: (callback: () => void) => void;
  installUpdate: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    _flushDataNow?: () => void;
  }
}

export {};
