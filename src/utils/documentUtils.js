import { DOC_PREFIX, TVA_RATE } from '../constants/document';

export function calcTotals(lineItems, docType) {
  const ht = (lineItems || []).reduce((s, i) => s + (i.qty || 0) * (i.price || 0), 0);
  if (docType === 'Avoir') {
    return { ht, tva: 0, ttc: ht };
  }
  const tva = ht * TVA_RATE;
  return { ht, tva, ttc: ht + tva };
}

export function fmtCurrency(value) {
  const n = Number(value) || 0;
  return (
    n.toLocaleString('fr-TN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }) + ' DT'
  );
}

export function fmtCurrencyShort(value) {
  return fmtCurrency(value).replace(' DT', '');
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
  const total = docs.reduce((s, d) => s + calcTotals(d.lineItems, d.docType).ttc, 0);
  return { count: docs.length, total };
}

export function getDashboardStats(documents, clients) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const factures = documents.filter(d => d.docType === 'Facture');
  const paidThisMonth = factures.filter(d => {
    if (d.status !== 'paid') return false;
    const created = new Date(d.createdAt);
    return created.getMonth() === thisMonth && created.getFullYear() === thisYear;
  });

  const revenue = paidThisMonth.reduce(
    (s, d) => s + calcTotals(d.lineItems, d.docType).ttc,
    0,
  );

  const pendingCount = documents.filter(
    d => d.docType === 'Facture' && d.status === 'pending',
  ).length;

  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(thisYear, thisMonth - (5 - i), 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    const total = factures
      .filter(doc => {
        if (doc.status !== 'paid') return false;
        const created = new Date(doc.createdAt);
        return created.getMonth() === month && created.getFullYear() === year;
      })
      .reduce((s, doc) => s + calcTotals(doc.lineItems, doc.docType).ttc, 0);
    return {
      month: d.toLocaleDateString('fr-TN', { month: 'short' }),
      total,
      highlight: i === 5,
    };
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
