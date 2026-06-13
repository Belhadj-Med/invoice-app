export const DOC_TYPES = ['Facture', 'Devis', 'Avoir'];

export const DOC_PREFIX = {
  Facture: 'FACT',
  Devis: 'DEVI',
  Avoir: 'AVOI',
};

export const DEFAULT_TAX_RATE = 0.19;
export const DEFAULT_CURRENCY_SYMBOL = 'DT';
export const DEFAULT_CURRENCY_LOCALE = 'fr-TN';

export const SUPPORT_EMAIL = '';

export const STATUS = {
  paid:    { label: 'Payé',    pill: 'green',  icon: 'checkmark-circle' },
  pending: { label: 'Attente', pill: 'yellow', icon: 'time'             },
  draft:   { label: 'Devis',   pill: 'purple', icon: 'create'           },
};

export function getStatusLabel(key, lang = 'fr') {
  return T['status.' + key]?.[lang] || T['status.' + key]?.fr || key;
}

import T from '../i18n/translations';

export const CLIENT_COLORS = [
  '#6c63ff', '#38d9a9', '#fbbf24', '#f87171', '#a78bfa',
  '#fb923c', '#34d399', '#60a5fa', '#ec4899', '#14b8a6',
];

export const DEFAULT_COMPANY = {
  name: '',
  legalName: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
  matriculeFiscal: '',
  phone: '',
  email: '',
  website: '',
  bankName: '',
  rib: '',
  defaultNotes: '',
  logo: null,
  taxRate: DEFAULT_TAX_RATE,
  currencySymbol: DEFAULT_CURRENCY_SYMBOL,
  currencyLocale: DEFAULT_CURRENCY_LOCALE,
};

export function defaultStatusForType(docType) {
  if (docType === 'Devis') return 'draft';
  if (docType === 'Avoir') return 'pending';
  return 'pending';
}
