// ============================================================
// Initial Data Structure
// ============================================================

import type { AppData } from '../types';

export const APP_VERSION = '3.0.36';
export const STORAGE_KEY = 'easydentallab_data';
export const DARK_MODE_KEY = 'edl_dark';

export const INITIAL_DATA: AppData = {
  profile: {
    businessName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    vatNumber: '',
    vatPercent: 15,
    labNumber: '',
    pcns: '',
    bankName: '',
    bankAccount: '',
    bankBranch: '',
    logo: '',
    layout: {
      logoPosition: 'right',
      logoMaxHeight: 60,
      businessFontSize: 22,
      bodyFontSize: 11,
      minItemRows: 18,
      printCopies: 2,
      footerMsg1: 'Thank you for your support',
      footerMsg2: 'Outstanding invoices more than 60 days will be handed over for collection',
      footerMsg3: 'Conforms to scale of benefits',
      confirmMsg1: 'Please confirm details and acknowledge that the work is complete',
      confirmMsg2: 'The patient agrees to our terms of trade and liability for the payment',
      statementSendMethod: 'print',
      statementFormat: 'pdf',
      monthEndMode: 'individual'
    }
  },
  clients: [],
  tariffs: [],
  macros: [],
  invoices: [],
  estimates: [],
  payments: [],
  categories: [],
  medicalAids: [],
  nextInvoiceNo: 1,
  nextEstimateNo: 1
};

export const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'invoices', label: 'Invoices', icon: '📄' },
  { id: 'estimates', label: 'Estimates', icon: '📝' },
  { id: 'directclaimed', label: 'Direct Claimed', icon: '🏥' },
  { id: 'clients', label: 'Dentist/Practice', icon: '👨‍⚕️' },
  { id: 'tariffs', label: 'Tariffs', icon: '💰' },
  { id: 'macros', label: 'Macros', icon: '⚡' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
];

export const SUPPORT_WHATSAPP = '27123456789'; // Replace with actual number
export const SUPPORT_EMAIL = 'support@easydentallab.com'; // Replace with actual email
