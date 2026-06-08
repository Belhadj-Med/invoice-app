import React, {
  createContext, useContext, useState, useRef, useEffect, useCallback, useMemo,
} from 'react';
import {
  CLIENT_COLORS, DEFAULT_COMPANY, defaultStatusForType,
} from '../constants/document';
import {
  loadAppData, saveClients, saveDocuments, saveCompany, saveCounters,
} from '../services/storage';
import {
  calcTotals, fmtCurrency, fmtDateISO, nextDocNumber, bumpCounter,
  getClientStats, getDashboardStats,
} from '../utils/documentUtils';

const AppContext = createContext(null);

const EMPTY_DRAFT = () => ({
  clientId: null,
  clientName: '',
  docType: 'Facture',
  docNumber: '',
  dueDate: fmtDateISO(new Date(Date.now() + 30 * 86400000)),
  notes: DEFAULT_COMPANY.defaultNotes,
  lineItems: [{ id: 1, desc: '', qty: 1, price: 0 }],
  nextLineId: 2,
});

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [clients, setClients] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [company, setCompanyState] = useState(DEFAULT_COMPANY);
  const [counters, setCounters] = useState({});

  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [editingDocumentId, setEditingDocumentId] = useState(null);
  const [previewOrigin, setPreviewOrigin] = useState(null);

  const [toast, setToast] = useState({ visible: false, message: '', type: 'purple' });
  const toastTimer = useRef(null);

  useEffect(() => {
    loadAppData().then((data) => {
      setClients(data.clients);
      setDocuments(data.documents);
      setCompanyState(data.company);
      setCounters(data.counters);
      const { docNumber, seq, year, prefix } = nextDocNumber('Facture', data.counters);
      setDraft({
        ...EMPTY_DRAFT(),
        docNumber,
        notes: data.company.defaultNotes || DEFAULT_COMPANY.defaultNotes,
        _pendingCounter: { prefix, year, seq },
      });
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveClients(clients);
  }, [clients, ready]);

  useEffect(() => {
    if (!ready) return;
    saveDocuments(documents);
  }, [documents, ready]);

  useEffect(() => {
    if (!ready) return;
    saveCompany(company);
  }, [company, ready]);

  useEffect(() => {
    if (!ready) return;
    saveCounters(counters);
  }, [counters, ready]);

  const showToast = useCallback((message, type = 'purple') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, message, type });
    toastTimer.current = setTimeout(() => {
      setToast(t => ({ ...t, visible: false }));
    }, 2800);
  }, []);

  const setCompany = useCallback((updates) => {
    setCompanyState(prev => ({ ...prev, ...updates }));
  }, []);

  const addClient = useCallback((client) => {
    const newClient = {
      ...client,
      id: String(Date.now()),
      color: CLIENT_COLORS[Math.floor(Math.random() * CLIENT_COLORS.length)],
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  }, []);

  const updateClient = useCallback((id, updates) => {
    setClients(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    if (updates.name) {
      setDocuments(prev =>
        prev.map(d => (d.clientId === id ? { ...d, clientName: updates.name } : d)),
      );
    }
  }, []);

  const deleteClient = useCallback((id) => {
    setClients(prev => prev.filter(c => c.id !== id));
    setDocuments(prev => prev.filter(d => d.clientId !== id));
  }, []);

  const getClientById = useCallback(
    (id) => clients.find(c => c.id === id),
    [clients],
  );

  const getClientDocuments = useCallback(
    (clientId) =>
      documents
        .filter(d => d.clientId === clientId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [documents],
  );

  const getDocumentById = useCallback(
    (id) => documents.find(d => d.id === id),
    [documents],
  );

  const activeDocument = useMemo(
    () => (activeDocumentId ? documents.find(d => d.id === activeDocumentId) : null),
    [activeDocumentId, documents],
  );

  const previewDocument = useMemo(() => {
    if (activeDocument) return activeDocument;
    if (editingDocumentId) {
      const existing = documents.find(d => d.id === editingDocumentId);
      if (existing) {
        return {
          ...existing,
          clientName: draft.clientName || existing.clientName,
          docType: draft.docType,
          docNumber: draft.docNumber,
          dueDate: draft.dueDate,
          notes: draft.notes,
          lineItems: draft.lineItems,
        };
      }
    }
    return {
      id: 'draft',
      clientId: draft.clientId,
      clientName: draft.clientName,
      docType: draft.docType,
      docNumber: draft.docNumber,
      dueDate: draft.dueDate,
      notes: draft.notes,
      lineItems: draft.lineItems,
      status: defaultStatusForType(draft.docType),
      createdAt: new Date().toISOString(),
    };
  }, [activeDocument, editingDocumentId, documents, draft]);

  const startNewDocument = useCallback((clientId = null, docType = 'Facture') => {
    const client = clientId ? clients.find(c => c.id === clientId) : null;
    const { docNumber, seq, year, prefix } = nextDocNumber(docType, counters);
    setEditingDocumentId(null);
    setActiveDocumentId(null);
    setDraft({
      clientId: client?.id || null,
      clientName: client?.name || '',
      docType,
      docNumber,
      dueDate: fmtDateISO(new Date(Date.now() + 30 * 86400000)),
      notes: company.defaultNotes || DEFAULT_COMPANY.defaultNotes,
      lineItems: [{ id: 1, desc: '', qty: 1, price: 0 }],
      nextLineId: 2,
      _pendingCounter: { prefix, year, seq },
    });
    return docNumber;
  }, [clients, counters, company.defaultNotes]);

  const loadDocumentForEdit = useCallback((documentId) => {
    const doc = documents.find(d => d.id === documentId);
    if (!doc) return;
    setEditingDocumentId(documentId);
    setActiveDocumentId(null);
    const maxLineId = Math.max(...doc.lineItems.map(i => i.id), 0);
    setDraft({
      clientId: doc.clientId,
      clientName: doc.clientName,
      docType: doc.docType,
      docNumber: doc.docNumber,
      dueDate: doc.dueDate,
      notes: doc.notes,
      lineItems: doc.lineItems,
      nextLineId: maxLineId + 1,
    });
  }, [documents]);

  const setDocType = useCallback((type) => {
    setDraft(prev => {
      if (editingDocumentId) return { ...prev, docType: type };
      const { docNumber, seq, year, prefix } = nextDocNumber(type, counters);
      return { ...prev, docType: type, docNumber, _pendingCounter: { prefix, year, seq } };
    });
  }, [counters, editingDocumentId]);

  const addLineItem = useCallback(() => {
    setDraft(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { id: prev.nextLineId, desc: '', qty: 1, price: 0 }],
      nextLineId: prev.nextLineId + 1,
    }));
  }, []);

  const removeLineItem = useCallback((id) => {
    setDraft(prev => {
      if (prev.lineItems.length === 1) return prev;
      return { ...prev, lineItems: prev.lineItems.filter(i => i.id !== id) };
    });
  }, []);

  const updateLineItem = useCallback((id, field, value) => {
    setDraft(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item =>
        item.id === id
          ? { ...item, [field]: field === 'desc' ? value : (parseFloat(value) || 0) }
          : item,
      ),
    }));
  }, []);

  const updateDraft = useCallback((updates) => {
    setDraft(prev => ({ ...prev, ...updates }));
  }, []);

  const saveDocument = useCallback(() => {
    if (!draft.clientName?.trim()) {
      showToast('⚠️ Nom du client requis', 'red');
      return null;
    }
    if (!draft.lineItems.some(i => i.desc?.trim() && i.price > 0)) {
      showToast('⚠️ Ajoutez au moins une prestation', 'red');
      return null;
    }

    const matchedClient = clients.find(
      c => c.id === draft.clientId || c.name.toLowerCase() === draft.clientName.trim().toLowerCase(),
    );
    const resolvedClientId = matchedClient?.id || draft.clientId || null;
    const resolvedClientName = matchedClient?.name || draft.clientName.trim();

    const now = new Date().toISOString();
    let saved;

    if (editingDocumentId) {
      setDocuments(prev =>
        prev.map(d =>
          d.id === editingDocumentId
            ? {
                ...d,
                clientId: resolvedClientId,
                clientName: resolvedClientName,
                docType: draft.docType,
                docNumber: draft.docNumber,
                dueDate: draft.dueDate,
                notes: draft.notes,
                lineItems: draft.lineItems,
                updatedAt: now,
              }
            : d,
        ),
      );
      saved = editingDocumentId;
      setActiveDocumentId(editingDocumentId);
      setEditingDocumentId(null);
      showToast('✅ Document mis à jour', 'green');
    } else {
      const id = String(Date.now());
      const newDoc = {
        id,
        clientId: resolvedClientId,
        clientName: resolvedClientName,
        docType: draft.docType,
        docNumber: draft.docNumber,
        dueDate: draft.dueDate,
        notes: draft.notes,
        lineItems: draft.lineItems,
        status: defaultStatusForType(draft.docType),
        createdAt: now,
        updatedAt: now,
      };
      setDocuments(prev => [newDoc, ...prev]);
      saved = id;
      setActiveDocumentId(id);
      showToast('✅ Document enregistré', 'green');

      setCounters(prevCounters => {
        const updated = draft._pendingCounter
          ? bumpCounter(prevCounters, draft._pendingCounter.prefix, draft._pendingCounter.year, draft._pendingCounter.seq)
          : prevCounters;
        const next = nextDocNumber('Facture', updated);
        setDraft({
          ...EMPTY_DRAFT(),
          docNumber: next.docNumber,
          notes: company.defaultNotes || DEFAULT_COMPANY.defaultNotes,
          _pendingCounter: { prefix: next.prefix, year: next.year, seq: next.seq },
        });
        return updated;
      });
    }
    return saved;
  }, [draft, editingDocumentId, clients, company.defaultNotes, showToast]);

  const updateDocumentStatus = useCallback((documentId, status) => {
    setDocuments(prev =>
      prev.map(d => {
        if (d.id !== documentId) return d;
        // Prevent status changes for Devis and Avoir
        if (d.docType === 'Devis' || d.docType === 'Avoir') return d;
        const now = new Date().toISOString();
        const updated = { ...d, status, updatedAt: now };
        // If moving to paid from non-paid, set paidAt and update counters.revenues
        if (status === 'paid' && d.status !== 'paid') {
          updated.paidAt = now;
          setCounters(prevCounters => {
            const year = new Date().getFullYear();
            const month = new Date().getMonth();
            const add = calcTotals(d.lineItems, d.docType).ttc;
            const prevRevs = prevCounters.revenues || {};
            const yearRevs = { ...(prevRevs[year] || {}) };
            yearRevs[month] = (yearRevs[month] || 0) + add;
            return {
              ...prevCounters,
              revenues: { ...prevRevs, [year]: yearRevs },
            };
          });
        }
        // If moving from paid to non-paid, subtract from stored revenue
        if (d.status === 'paid' && status !== 'paid') {
          const paidDate = d.paidAt ? new Date(d.paidAt) : new Date(d.updatedAt || d.createdAt);
          const year = paidDate.getFullYear();
          const month = paidDate.getMonth();
          const sub = calcTotals(d.lineItems, d.docType).ttc;
          setCounters(prevCounters => {
            const prevRevs = prevCounters.revenues || {};
            const yearRevs = { ...(prevRevs[year] || {}) };
            yearRevs[month] = Math.max(0, (yearRevs[month] || 0) - sub);
            return {
              ...prevCounters,
              revenues: { ...prevRevs, [year]: yearRevs },
            };
          });
          delete updated.paidAt;
        }
        return updated;
      }),
    );
    showToast('✅ Statut mis à jour', 'green');
  }, [showToast]);

  const deleteDocument = useCallback((documentId) => {
    setDocuments(prev => {
      const toDelete = prev.find(d => d.id === documentId);
      if (toDelete && toDelete.status === 'paid') {
        const paidDate = toDelete.paidAt ? new Date(toDelete.paidAt) : new Date(toDelete.updatedAt || toDelete.createdAt);
        const year = paidDate.getFullYear();
        const month = paidDate.getMonth();
        const sub = calcTotals(toDelete.lineItems, toDelete.docType).ttc;
        setCounters(prevCounters => {
          const prevRevs = prevCounters.revenues || {};
          const yearRevs = { ...(prevRevs[year] || {}) };
          yearRevs[month] = Math.max(0, (yearRevs[month] || 0) - sub);
          return {
            ...prevCounters,
            revenues: { ...prevRevs, [year]: yearRevs },
          };
        });
      }
      return prev.filter(d => d.id !== documentId);
    });
    if (activeDocumentId === documentId) setActiveDocumentId(null);
    showToast('🗑️ Document supprimé', 'purple');
  }, [activeDocumentId, showToast]);

  const openDocumentPreview = useCallback((documentId, origin = null) => {
    setActiveDocumentId(documentId);
    setEditingDocumentId(null);
    setPreviewOrigin(origin);
  }, []);

  const dashboardStats = useMemo(
    () => getDashboardStats(documents, clients, counters),
    [documents, clients, counters],
  );

  const getClientDisplayStats = useCallback(
    (clientId) => {
      const stats = getClientStats(clientId, documents);
      return {
        count: stats.count,
        total: fmtCurrency(stats.total),
        totalRaw: stats.total,
      };
    },
    [documents],
  );

  if (!ready) return null;

  return (
    <AppContext.Provider
      value={{
        clients,
        documents,
        company,
        counters,
        draft,
        activeDocumentId,
        activeDocument,
        previewDocument,
        editingDocumentId,
        dashboardStats,
        toast,
        addClient,
        updateClient,
        deleteClient,
        getClientById,
        getClientDocuments,
        getDocumentById,
        getClientDisplayStats,
        setCompany,
        startNewDocument,
        loadDocumentForEdit,
        setDocType,
        addLineItem,
        removeLineItem,
        updateLineItem,
        updateDraft,
        saveDocument,
        updateDocumentStatus,
        deleteDocument,
        openDocumentPreview,
        previewOrigin,
        setPreviewOrigin,
        setActiveDocumentId,
        calcTotals,
        fmtCurrency,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
