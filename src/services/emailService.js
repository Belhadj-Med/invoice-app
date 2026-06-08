import { Linking } from 'react-native';
import { SUPPORT_EMAIL } from '../constants/document';
import { calcTotals, fmtCurrency, fmtDateFR } from '../utils/documentUtils';

export async function sendDocumentEmail(document, company, clientEmail) {
  const { ttc } = calcTotals(document.lineItems, document.docType);
  const to = clientEmail || SUPPORT_EMAIL;
  const subject = encodeURIComponent(
    `${document.docType} ${document.docNumber} — ${company.name}`,
  );
  const body = encodeURIComponent(
    `Bonjour ${document.clientName},\n\n` +
    `Veuillez trouver ci-dessous les détails de votre ${document.docType.toLowerCase()} :\n\n` +
    `N° : ${document.docNumber}\n` +
    `Date : ${fmtDateFR(document.createdAt)}\n` +
    `Montant : ${fmtCurrency(ttc)}\n\n` +
    `${document.notes ? document.notes + '\n\n' : ''}` +
    `Cordialement,\n${company.name}\n${company.email}\n${company.phone}`,
  );
  const url = `mailto:${to}?subject=${subject}&body=${body}`;
  const can = await Linking.canOpenURL(url);
  if (!can) throw new Error('Aucune application e-mail disponible');
  await Linking.openURL(url);
}

export async function openSupportEmail() {
  const subject = encodeURIComponent('Support Ala App');
  const body = encodeURIComponent('Bonjour,\n\nJ\'ai besoin d\'aide concernant :\n\n');
  const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  await Linking.openURL(url);
}
