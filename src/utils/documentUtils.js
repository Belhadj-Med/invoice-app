import { DOC_PREFIX, DEFAULT_TAX_RATE, DEFAULT_CURRENCY_SYMBOL, DEFAULT_CURRENCY_LOCALE } from '../constants/document';

export function calcTotals(lineItems, docType, taxRate = DEFAULT_TAX_RATE, discount = 0) {
  const ht = (lineItems || []).reduce((s, i) => s + (i.qty || 0) * (i.price || 0), 0);
  const discountAmount = ht * (discount / 100);
  const netHt = ht - discountAmount;
  if (docType === 'Avoir') {
    return { ht, discountAmount, tva: 0, ttc: netHt };
  }
  const tva = netHt * taxRate;
  return { ht, discountAmount, tva, ttc: netHt + tva };
}

export function fmtCurrency(value, symbol = DEFAULT_CURRENCY_SYMBOL, locale = DEFAULT_CURRENCY_LOCALE) {
  const n = Number(value) || 0;
  return (
    n.toLocaleString(locale, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }) + ' ' + symbol
  );
}

export function fmtCurrencyShort(value, symbol = DEFAULT_CURRENCY_SYMBOL, locale = DEFAULT_CURRENCY_LOCALE) {
  return fmtCurrency(value, symbol, locale).replace(` ${symbol}`, '');
}

export function fmtDateFR(isoOrDate) {
  if (!isoOrDate) return '—';
  try {
    const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
    if (Number.isNaN(d.getTime())) return isoOrDate;
    return d.toLocaleDateString('fr-TN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return String(isoOrDate);
  }
}

export function fmtDateISO(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getYearFromDate(iso) {
  return new Date(iso || Date.now()).getFullYear();
}

export function nextDocNumber(docType, counters) {
  const year = new Date().getFullYear();
  const prefix = DOC_PREFIX[docType];
  const yearCounters = counters[prefix] || {};
  const seq = (yearCounters[year] || 0) + 1;
  const num = String(seq).padStart(3, '0');
  return { docNumber: `${prefix}-${year}-${num}`, seq, year, prefix };
}

export function bumpCounter(counters, prefix, year, seq) {
  return {
    ...counters,
    [prefix]: {
      ...(counters[prefix] || {}),
      [year]: seq,
    },
  };
}

export function getClientStats(clientId, documents) {
  const docs = documents.filter(d => d.clientId === clientId);
  const total = docs.reduce((s, d) => s + calcTotals(d.lineItems, d.docType, DEFAULT_TAX_RATE, d.discount || 0).ttc, 0);
  return { count: docs.length, total };
}

export function getDashboardStats(documents, clients, counters = {}) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const factures = documents.filter(d => d.docType === 'Facture');

  function getDateKey(dateStr) {
    const d = new Date(dateStr);
    return { year: d.getFullYear(), month: d.getMonth() };
  }

  const yearRevs = (counters.revenues && counters.revenues[thisYear]) || {};
  const revenue = yearRevs[thisMonth] != null ? yearRevs[thisMonth] : factures
    .filter(d => {
      if (d.status !== 'paid') return false;
      const { year, month } = getDateKey(d.paidAt || d.updatedAt || d.createdAt);
      return year === thisYear && month === thisMonth;
    })
    .reduce((s, d) => s + calcTotals(d.lineItems, d.docType, DEFAULT_TAX_RATE, d.discount || 0).ttc, 0);

  const pendingCount = documents.filter(
    d => d.docType === 'Facture' && d.status === 'pending',
  ).length;

  const monthlyRevenue = Array.from({ length: thisMonth + 1 }, (_, m) => {
    const month = m;
    const monthName = new Date(thisYear, month, 1).toLocaleDateString('fr-TN', { month: 'short' });
    const total = (yearRevs[month] != null)
      ? yearRevs[month]
      : factures
        .filter(doc => {
          if (doc.status !== 'paid') return false;
          const { year, month: docMonth } = getDateKey(doc.paidAt || doc.updatedAt || doc.createdAt);
          return year === thisYear && docMonth === month;
        })
        .reduce((s, doc) => s + calcTotals(doc.lineItems, doc.docType, DEFAULT_TAX_RATE, doc.discount || 0).ttc, 0);
    return { month: monthName, total, highlight: month === thisMonth };
  });

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.total), 1);

  return {
    revenue,
    invoiceCount: documents.length,
    pendingCount,
    clientCount: clients.length,
    monthlyRevenue: monthlyRevenue.map(m => ({
      ...m,
      height: Math.max(12, Math.round((m.total / maxRevenue) * 70)),
    })),
    recentDocuments: [...documents]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8),
  };
}
