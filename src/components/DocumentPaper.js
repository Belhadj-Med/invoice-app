import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { calcTotals, fmtCurrency, fmtDateFR } from '../utils/documentUtils';

function Divider() {
  return <View style={styles.pdfDivider} />;
}

function TableRow({ desc, qty, price, total }) {
  return (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.cellDesc]} numberOfLines={2}>{desc}</Text>
      <Text style={[styles.tableCell, styles.cellQty]}>{qty}</Text>
      <Text style={[styles.tableCell, styles.cellRate]}>{Number(price).toFixed(3)}</Text>
      <Text style={[styles.tableCell, styles.cellTotal]}>{Number(total).toFixed(3)}</Text>
    </View>
  );
}

export default function DocumentPaper({ document, company }) {
  const { ht, tva, ttc } = calcTotals(document.lineItems, document.docType);
  const isAvoir = document.docType === 'Avoir';

  const emitterLines = useMemo(() => [
    company.legalName,
    company.address,
    `${company.postalCode} ${company.city}, ${company.country}`,
    `MF: ${company.matriculeFiscal}`,
    `Tél: ${company.phone}`,
    company.email,
  ].filter(Boolean), [company]);

  return (
    <View style={styles.pdfPaper}>
      <View style={styles.pdfTopRow}>
        <View>
          <Text style={styles.pdfBrand}>{company.name}</Text>
          <Text style={styles.pdfSubBrand}>{company.legalName}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.pdfDocType}>{document.docType.toUpperCase()}</Text>
          <Text style={styles.pdfDocNum}>N° {document.docNumber}</Text>
        </View>
      </View>

      <Divider />

      <View style={styles.pdfParties}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pdfPartyLabel}>Émetteur</Text>
          {emitterLines.map((line, i) => (
            <Text key={i} style={i === 0 ? styles.pdfPartyName : styles.pdfPartyInfo}>{line}</Text>
          ))}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.pdfPartyLabel}>Destinataire</Text>
          <Text style={styles.pdfPartyName}>{document.clientName}</Text>
          <Text style={styles.pdfPartyInfo}>Date: {fmtDateFR(document.createdAt)}</Text>
          <Text style={styles.pdfPartyInfo}>Échéance: {fmtDateFR(document.dueDate)}</Text>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, styles.cellDesc]}>Description</Text>
        <Text style={[styles.tableHeaderCell, styles.cellQty]}>Qté</Text>
        <Text style={[styles.tableHeaderCell, styles.cellRate]}>Prix DT</Text>
        <Text style={[styles.tableHeaderCell, styles.cellTotal]}>Total</Text>
      </View>

      {(document.lineItems || []).map((item) => (
        <TableRow
          key={item.id}
          desc={item.desc}
          qty={item.qty}
          price={item.price}
          total={item.qty * item.price}
        />
      ))}

      <Divider />

      <View style={styles.pdfTotalsWrap}>
        <View style={styles.pdfTotals}>
          <View style={styles.pdfTotalsRow}>
            <Text style={styles.pdfTotalsLabel}>Total HT</Text>
            <Text style={styles.pdfTotalsVal}>{fmtCurrency(ht)}</Text>
          </View>
          {!isAvoir && (
            <View style={styles.pdfTotalsRow}>
              <Text style={styles.pdfTotalsLabel}>TVA (19%)</Text>
              <Text style={styles.pdfTotalsVal}>{fmtCurrency(tva)}</Text>
            </View>
          )}
          <View style={styles.pdfTotalsRowHL}>
            <Text style={styles.pdfTotalsLabelHL}>Total {isAvoir ? '' : 'TTC'}</Text>
            <Text style={styles.pdfTotalsValHL}>{fmtCurrency(ttc)}</Text>
          </View>
        </View>
      </View>

      {document.notes ? (
        <View style={styles.pdfNotes}>
          <Text style={styles.pdfNotesLabel}>Conditions de paiement</Text>
          <Text style={styles.pdfNotesText}>{document.notes}</Text>
        </View>
      ) : null}

      {company.rib ? (
        <Text style={styles.bankInfo}>RIB: {company.bankName} — {company.rib}</Text>
      ) : null}

      <Divider />
      <Text style={styles.pdfFooter}>
        Merci de votre confiance — {company.email} — {company.website}
      </Text>
    </View>
  );
}

const PDF_TEXT = '#1a1a2e';

const styles = StyleSheet.create({
  pdfPaper: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 8,
  },
  pdfTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  pdfBrand: { fontSize: 18, fontWeight: '800', color: '#0a0a1a', letterSpacing: -0.3 },
  pdfSubBrand: { fontSize: 8, color: '#888', marginTop: 1 },
  pdfDocType: { fontSize: 11, fontWeight: '800', color: '#6c63ff', textTransform: 'uppercase', letterSpacing: 0.5 },
  pdfDocNum: { fontSize: 9, fontWeight: '600', color: '#444466', marginTop: 2 },
  pdfDivider: { height: 1, backgroundColor: '#e8e8f0', marginVertical: 12 },
  pdfParties: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  pdfPartyLabel: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: '#8888aa', marginBottom: 4 },
  pdfPartyName: { fontSize: 9, fontWeight: '700', color: PDF_TEXT, marginBottom: 3 },
  pdfPartyInfo: { fontSize: 7, color: '#666688', lineHeight: 12 },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8f0',
  },
  tableHeaderCell: { fontSize: 7, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: '#8888aa' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f8',
    alignItems: 'center',
  },
  tableCell: { fontSize: 8, color: '#333355' },
  cellDesc:  { flex: 1, fontWeight: '500' },
  cellQty:   { width: 28, textAlign: 'center', fontWeight: '600' },
  cellRate:  { width: 52, textAlign: 'right', color: '#666688' },
  cellTotal: { width: 58, textAlign: 'right', fontWeight: '700', color: PDF_TEXT },
  pdfTotalsWrap: { alignItems: 'flex-end', marginBottom: 10 },
  pdfTotals: { width: 180 },
  pdfTotalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  pdfTotalsRowHL: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#e8e8f0',
    marginTop: 3,
  },
  pdfTotalsLabel: { fontSize: 8, color: '#666' },
  pdfTotalsVal: { fontSize: 8, fontWeight: '600', color: '#333' },
  pdfTotalsLabelHL: { fontSize: 10, fontWeight: '800', color: '#6c63ff' },
  pdfTotalsValHL: { fontSize: 10, fontWeight: '800', color: '#6c63ff' },
  pdfNotes: { backgroundColor: '#f8f8fc', borderRadius: 8, padding: 10, marginBottom: 4 },
  pdfNotesLabel: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: '#8888aa', marginBottom: 3 },
  pdfNotesText: { fontSize: 7, color: '#555577', lineHeight: 11 },
  bankInfo: { fontSize: 7, color: '#666688', marginBottom: 4 },
  pdfFooter: { fontSize: 6, color: '#aaa', textAlign: 'center', fontStyle: 'italic' },
});
