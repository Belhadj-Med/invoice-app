export const DOC_TYPES = ['Facture', 'Devis', 'Avoir'];

export const DOC_PREFIX = {
  Facture: 'FACT',
  Devis: 'DEVI',
  Avoir: 'AVOI',
};

export const TVA_RATE = 0.19;

export const SUPPORT_EMAIL = 'mohamedaminbelhadj20@gmail.com';

export const STATUS = {
  paid:    { label: 'Payé',    pill: 'green',  icon: 'checkmark-circle' },
  pending: { label: 'Attente', pill: 'yellow', icon: 'time'             },
  draft:   { label: 'Devis',   pill: 'purple', icon: 'create'           },
};

export const CLIENT_COLORS = [
  '#6c63ff', '#38d9a9', '#fbbf24', '#f87171', '#a78bfa',
  '#fb923c', '#34d399', '#60a5fa', '#ec4899', '#14b8a6',
];

export const DEFAULT_COMPANY = {
  name: 'Cabinet Ala',
  legalName: 'Cabinet Ala SARL',
  address: '12 Avenue Habib Bourguiba',
  city: 'Tunis',
  postalCode: '1000',
  country: 'Tunisie',
  matriculeFiscal: '1234567/A/B/M/000',
  phone: '+216 71 000 000',
  email: 'contact@ala-app.tn',
  website: 'www.ala-app.tn',
  bankName: 'BIAT',
  rib: '08 012 0000000000 12',
  defaultNotes: 'Paiement par virement sous 30 jours à réception de facture.',
};

export function defaultStatusForType(docType) {
  if (docType === 'Devis') return 'draft';
  if (docType === 'Avoir') return 'pending';
  return 'pending';
}
