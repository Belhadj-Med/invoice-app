import { Linking } from 'react-native';
import { SUPPORT_EMAIL } from '../constants/document';
import { calcTotals as calcTotalsRaw, fmtCurrency as fmtCurrencyRaw, fmtDateFR } from '../utils/documentUtils';
import T from '../i18n/translations';

function interp(str, params) {
  if (!params) return str;
  return Object.entries(params).reduce(
    (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), v != null ? String(v) : ''),
    str,
  );
}

function tr(key, lang, params) {
  const entry = T[key];
  if (!entry) return key;
  return interp(entry[lang] || entry.fr || key, params);
}

export async function sendDocumentEmail(document, company, clientEmail, lang = 'fr') {
  const symbol = company.currencySymbol || 'DT';
  const locale = company.currencyLocale || 'fr-TN';
  const { ttc } = calcTotalsRaw(document.lineItems, document.docType, company.taxRate || 0.19);
  const to = clientEmail || SUPPORT_EMAIL;
  const subject = encodeURIComponent(
    `${document.docType} ${document.docNumber} — ${company.name}`,
  );
  const bodyLines = [
    tr('email.greeting', lang, { name: document.clientName }),
    '',
    tr('email.body', lang, { type: document.docType.toLowerCase() }),
    '',
    tr('email.docNumber', lang, { n: document.docNumber }),
    tr('email.date', lang, { d: fmtDateFR(document.createdAt) }),
    tr('email.amount', lang, { a: fmtCurrencyRaw(ttc, symbol, locale) }),
    '',
  ];
  if (document.notes) bodyLines.push(document.notes, '');
  bodyLines.push(
    tr('email.closing', lang),
    `${company.name}\n${company.email}\n${company.phone}`,
  );
  const body = encodeURIComponent(bodyLines.join('\n'));
  const url = `mailto:${to}?subject=${subject}&body=${body}`;
  const can = await Linking.canOpenURL(url);
  if (!can) throw new Error(tr('email.noApp', lang));
  await Linking.openURL(url);
}

export async function openSupportEmail(lang = 'fr') {
  const subject = encodeURIComponent(tr('email.supportSubject', lang));
  const body = encodeURIComponent(tr('email.supportBody', lang));
  const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  const can = await Linking.canOpenURL(url);
  if (!can) throw new Error(tr('email.noApp', lang));
  await Linking.openURL(url);
}
