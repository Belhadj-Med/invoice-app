import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { calcTotals as calcTotalsRaw, fmtCurrency as fmtCurrencyRaw, fmtDateFR } from '../utils/documentUtils';
import T from '../i18n/translations';

const DOWNLOAD_DIR_KEY = '@invoice_creator_download_dir_uri';
const { StorageAccessFramework } = FileSystem;

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

export function buildDocumentHtml(document, company, logoDataUri, client, lang = 'fr') {
  const taxRate = company.taxRate || 0.19;
  const symbol = company.currencySymbol || 'DT';
  const locale = company.currencyLocale || 'fr-TN';
  const discount = document.discount || 0;
  const { ht, discountAmount, tva, ttc } = calcTotalsRaw(document.lineItems, document.docType, taxRate, discount);
  const isAvoir = document.docType === 'Avoir';
  const fmt = (v) => fmtCurrencyRaw(v, symbol, locale);
  const rows = (document.lineItems || [])
    .map(
      item => `
      <tr>
        <td>${escapeHtml(item.desc)}</td>
        <td style="text-align:center">${item.qty}</td>
        <td style="text-align:right">${Number(item.price).toFixed(3)} ${symbol}</td>
        <td style="text-align:right;font-weight:700">${(item.qty * item.price).toFixed(3)} ${symbol}</td>
      </tr>`,
    )
    .join('');

  const tvaBlock = isAvoir
    ? ''
    : `<tr><td>${tr('docPaper.tva', lang, { rate: (taxRate * 100).toFixed(0) })}</td><td style="text-align:right">${fmt(tva)}</td></tr>`;

  const logoHtml = logoDataUri
    ? `<img src="${logoDataUri}" style="width:60px;height:60px;border-radius:8px;object-fit:contain;margin-right:8px;display:block"/>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Helvetica, Arial, sans-serif; color: #1a1a2e; padding: 32px; font-size: 12px; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .brand { font-size: 22px; font-weight: 800; color: #0a0a1a; }
    .doc-type { font-size: 14px; font-weight: 800; color: #6c63ff; text-transform: uppercase; text-align: right; }
    .divider { border-top: 1px solid #e8e8f0; margin: 16px 0; }
    .parties { display: flex; gap: 24px; margin-bottom: 16px; }
    .party { flex: 1; }
    .party-label { font-size: 9px; text-transform: uppercase; color: #8888aa; font-weight: 700; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th { text-align: left; font-size: 9px; text-transform: uppercase; color: #8888aa; border-bottom: 1px solid #e8e8f0; padding: 6px 4px; }
    td { padding: 8px 4px; border-bottom: 1px solid #f0f0f8; }
    .totals { margin-left: auto; width: 220px; }
    .totals td { border: none; padding: 4px 0; }
    .total-ttc { font-weight: 800; color: #6c63ff; font-size: 14px; border-top: 1px solid #e8e8f0 !important; padding-top: 8px !important; }
    .notes { background: #f8f8fc; border-radius: 8px; padding: 12px; margin-top: 16px; }
    .footer { text-align: center; color: #aaa; font-style: italic; margin-top: 20px; font-size: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div style="display:flex;align-items:center;gap:12px">
      ${logoHtml}
      <div>
        <div class="brand">${escapeHtml(company.name)}</div>
        <div style="color:#888;font-size:10px">${escapeHtml(company.legalName)}</div>
      </div>
    </div>
    <div>
      <div class="doc-type">${escapeHtml(tr('docType.' + document.docType.toLowerCase(), lang))}</div>
      <div style="text-align:right;font-weight:600;margin-top:4px">N° ${escapeHtml(document.docNumber)}</div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="parties">
    <div class="party">
      <div class="party-label">${tr('docPaper.emitter', lang)}</div>
      <strong>${escapeHtml(company.legalName)}</strong><br/>
      ${escapeHtml(company.address)}<br/>
      ${escapeHtml(company.postalCode)} ${escapeHtml(company.city)}, ${escapeHtml(company.country)}<br/>
      ${tr('docPaper.mf', lang, { n: escapeHtml(company.matriculeFiscal) })}<br/>
      ${tr('docPaper.tel', lang, { n: escapeHtml(company.phone) })}<br/>
      ${escapeHtml(company.email)}
    </div>
    <div class="party">
      <div class="party-label">${tr('docPaper.recipient', lang)}</div>
      <strong>${escapeHtml(document.clientName)}</strong><br/>
      ${client?.address ? escapeHtml(client.address) + '<br/>' : ''}\
      ${client?.matriculeFiscal ? `${tr('docPaper.mf', lang, { n: escapeHtml(client.matriculeFiscal) })}<br/>` : ''}\
      ${tr('docPaper.date', lang, { d: fmtDateFR(document.createdAt) })}<br/>
      ${tr('docPaper.dueDate', lang, { d: fmtDateFR(document.dueDate) })}
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>${tr('docPaper.description', lang)}</th>
        <th style="text-align:center">${tr('docPaper.qty', lang)}</th>
        <th style="text-align:right">${tr('docPaper.unitPrice', lang, { sym: symbol })}</th>
        <th style="text-align:right">${tr('docPaper.lineTotal', lang)}</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <table class="totals">
    <tr><td>${tr('docPaper.totalHt', lang)}</td><td style="text-align:right">${fmt(ht)}</td></tr>
    ${discount > 0 ? `<tr><td>${tr('docPaper.discount', lang, { pct: discount })}</td><td style="text-align:right;color:#e74c3c">-${fmt(discountAmount)}</td></tr>` : ''}
    ${tvaBlock}
    <tr class="total-ttc"><td>${tr('docPaper.totalTtc', lang, { label: isAvoir ? '' : 'TTC' })}</td><td style="text-align:right">${fmt(ttc)}</td></tr>
  </table>
  ${document.notes ? `<div class="notes"><strong>${tr('docPaper.paymentTerms', lang)}</strong><br/>${escapeHtml(document.notes)}</div>` : ''}
  ${company.rib ? `<div style="margin-top:12px;font-size:10px">${tr('docPaper.rib', lang, { bank: escapeHtml(company.bankName), rib: escapeHtml(company.rib) })}</div>` : ''}
  <div class="footer">${tr('docPaper.footer', lang, { email: escapeHtml(company.email), website: escapeHtml(company.website) })}</div>
</body>
</html>`;
}

async function resolveLogoUri(company) {
  if (company?.logo) {
    return company.logo;
  }
  return '';
}

function sanitizePdfFileName(docNumber) {
  return `${docNumber.replace(/[/\\?%*:|"<>]/g, '-')}.pdf`;
}

async function assertPdfReady(pdfUri) {
  const info = await FileSystem.getInfoAsync(pdfUri);
  if (!info.exists || info.size === 0) {
    throw new Error('PDF_GENERATION_FAILED');
  }
}

async function writePdfToAndroidDirectory(directoryUri, fileName, base64) {
  const baseName = fileName.replace(/\.pdf$/i, '');
  const destUri = await StorageAccessFramework.createFileAsync(
    directoryUri,
    baseName,
    'application/pdf',
  );
  await FileSystem.writeAsStringAsync(destUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

async function requestAndroidDownloadDirectory() {
  const initialUri = StorageAccessFramework.getUriForDirectoryInRoot('Download');
  const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync(initialUri);
  if (!permissions.granted) {
    throw new Error('DOWNLOAD_CANCELLED');
  }
  await AsyncStorage.setItem(DOWNLOAD_DIR_KEY, permissions.directoryUri);
  return permissions.directoryUri;
}

async function savePdfToAndroidDownloads(pdfUri, fileName) {
  const base64 = await FileSystem.readAsStringAsync(pdfUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  let directoryUri = await AsyncStorage.getItem(DOWNLOAD_DIR_KEY);
  if (directoryUri) {
    try {
      await writePdfToAndroidDirectory(directoryUri, fileName, base64);
      return { location: 'Téléchargements', fileName };
    } catch {
      await AsyncStorage.removeItem(DOWNLOAD_DIR_KEY);
      directoryUri = null;
    }
  }

  directoryUri = await requestAndroidDownloadDirectory();
  try {
    await writePdfToAndroidDirectory(directoryUri, fileName, base64);
  } catch {
    const stampedName = fileName.replace(/\.pdf$/i, `-${Date.now()}.pdf`);
    await writePdfToAndroidDirectory(directoryUri, stampedName, base64);
    return { location: 'Téléchargements', fileName: stampedName };
  }

  return { location: 'Téléchargements', fileName };
}

async function savePdfToIosDocuments(pdfUri, fileName) {
  const dest = `${FileSystem.documentDirectory}${fileName}`;
  const existing = await FileSystem.getInfoAsync(dest);
  if (existing.exists) {
    await FileSystem.deleteAsync(dest, { idempotent: true });
  }
  await FileSystem.copyAsync({ from: pdfUri, to: dest });
  return { location: 'Fichiers', fileName };
}

export async function downloadDocumentPdf(document, company, client, lang = 'fr') {
  const logoUri = await resolveLogoUri(company);
  let logoDataUri = '';

  if (logoUri) {
    if (logoUri.startsWith('data:')) {
      logoDataUri = logoUri;
    } else {
      try {
        const base64 = await FileSystem.readAsStringAsync(logoUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const mimeType = logoUri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        logoDataUri = `data:${mimeType};base64,${base64}`;
      } catch (error) {
        console.warn('Failed to convert logo to base64:', error);
      }
    }
  }

  const html = buildDocumentHtml(document, company, logoDataUri, client, lang);
  const { uri } = await Print.printToFileAsync({ html });
  await assertPdfReady(uri);

  const fileName = sanitizePdfFileName(document.docNumber);

  if (Platform.OS === 'android') {
    return savePdfToAndroidDownloads(uri, fileName);
  }

  if (Platform.OS === 'ios') {
    return savePdfToIosDocuments(uri, fileName);
  }

  const dest = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return { location: 'Cache', fileName };
}
