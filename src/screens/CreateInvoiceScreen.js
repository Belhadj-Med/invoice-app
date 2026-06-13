import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

function LineItemRow({ item, onUpdate, onRemove, styles, colors, t, company }) {
  const total = (item.qty * item.price).toFixed(3);
  return (
    <View style={styles.lineRow}>
      <TouchableOpacity style={styles.delBtn} onPress={onRemove} activeOpacity={0.7}>
        <Ionicons name="close" size={13} color={colors.text3} />
      </TouchableOpacity>
      <TextInput
        style={styles.lineDesc}
        value={item.desc}
        onChangeText={(v) => onUpdate(item.id, 'desc', v)}
        placeholder={t('createDoc.descriptionPH')}
        placeholderTextColor={colors.text3}
      />
      <View style={styles.rowNums}>
        <View style={styles.numField}>
          <Text style={styles.numLabel}>{t('createDoc.qty')}</Text>
          <TextInput
            style={[styles.numInput, { width: 52 }]}
            value={String(item.qty)}
            onChangeText={(v) => onUpdate(item.id, 'qty', v)}
            keyboardType="numeric"
            textAlign="center"
          />
        </View>
        <View style={styles.numField}>
          <Text style={styles.numLabel}>{t('createDoc.price', { sym: company.currencySymbol })}</Text>
          <TextInput
            style={[styles.numInput, { width: 78 }]}
            value={String(item.price)}
            onChangeText={(v) => onUpdate(item.id, 'price', v)}
            keyboardType="decimal-pad"
            textAlign="center"
          />
        </View>
        <View style={styles.totalDisplay}>
          <Text style={styles.numLabel}>{t('createDoc.lineTotal')}</Text>
          <Text style={styles.totalVal}>{total}</Text>
        </View>
      </View>
    </View>
  );
}

export default function CreateInvoiceScreen({ navigation }) {
  const {
    draft, setDocType, addLineItem, removeLineItem, updateLineItem,
    updateDraft, calcTotals, fmtCurrency, saveDocument, showToast, editingDocumentId, company,
  } = useApp();
  const { t } = useLanguage();
  const { colors, shared } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const discount = draft.discount || 0;
  const { ht, discountAmount, tva, ttc } = calcTotals(draft.lineItems, draft.docType);
  const isAvoir = draft.docType === 'Avoir';

  const handlePreview = () => {
    const id = saveDocument();
    if (id) navigation.navigate('Preview');
  };

  const handleRemoveLine = (id) => {
    if (draft.lineItems.length === 1) {
      showToast(t('createDoc.oneLineRequired'), 'red');
      return;
    }
    removeLineItem(id);
  };

  return (
    <SafeAreaView style={shared.screen} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.fixedHeader}>
          <TouchableOpacity style={shared.backBtn} onPress={() => navigation.navigate('Dashboard')}>
            <Ionicons name="arrow-back" size={16} color={colors.text2} />
          </TouchableOpacity>
          <Text style={shared.screenTitle}>
            {editingDocumentId ? t('createDoc.titleEdit') : t('createDoc.titleNew')} {t('createDoc.document')}
          </Text>
        </View>

        <View style={styles.tabs}>
          {['Facture', 'Devis', 'Avoir'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.tabBtn, draft.docType === type && styles.tabBtnActive]}
              onPress={() => setDocType(type)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, draft.docType === type && styles.tabLabelActive]}>{t('docType.' + type.toLowerCase())}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[shared.card, styles.formCard]}>
            <Text style={[shared.sectionLabel, { marginBottom: 14 }]}>{t('createDoc.clientInfo')}</Text>
            <View style={styles.inputWrap}>
              <Text style={shared.inputLabel}>{t('createDoc.clientName')}</Text>
              <TextInput
                style={shared.inputField}
                value={draft.clientName}
                onChangeText={(v) => updateDraft({ clientName: v })}
                placeholder={t('createDoc.clientName')}
                placeholderTextColor={colors.text3}
              />
            </View>
            <View style={styles.row2}>
              <View style={[styles.inputWrap, { flex: 1 }]}>
                <Text style={shared.inputLabel}>{t('createDoc.docNumber')}</Text>
                <TextInput
                  style={shared.inputField}
                  value={draft.docNumber}
                  onChangeText={(v) => updateDraft({ docNumber: v })}
                  autoCapitalize="characters"
                />
              </View>
              <View style={[styles.inputWrap, { flex: 1 }]}>
                <Text style={shared.inputLabel}>{t('createDoc.dueDate')}</Text>
                <TextInput
                  style={shared.inputField}
                  value={draft.dueDate}
                  onChangeText={(v) => updateDraft({ dueDate: v })}
                  placeholder={t('createDoc.datePlaceholder')}
                  placeholderTextColor={colors.text3}
                />
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={shared.sectionLabel}>{t('createDoc.services')}</Text>
            <TouchableOpacity style={styles.addBtn} onPress={addLineItem}>
              <Ionicons name="add" size={13} color={colors.accent2} />
              <Text style={styles.addBtnText}>{t('createDoc.addLine')}</Text>
            </TouchableOpacity>
          </View>

          {draft.lineItems.map((item) => (
            <LineItemRow
              key={item.id}
              item={item}
              onUpdate={updateLineItem}
              onRemove={() => handleRemoveLine(item.id)}
              styles={styles}
              colors={colors}
              t={t}
              company={company}
            />
          ))}

          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>{t('createDoc.subtotal')}</Text>
              <Text style={styles.totalsVal}>{fmtCurrency(ht)}</Text>
            </View>
            <View style={[styles.totalsRow, styles.totalsRowBorder]}>
              <Text style={styles.totalsLabel}>{t('createDoc.discount')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <TextInput
                  style={[styles.numInput, { width: 56, textAlign: 'center', paddingVertical: 4, fontSize: 12 }]}
                  value={String(discount)}
                  onChangeText={(v) => updateDraft({ discount: parseFloat(v) || 0 })}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={colors.text3}
                />
                <Text style={[styles.totalsVal, { fontSize: 11 }]}>%</Text>
                <Text style={[styles.totalsVal, discount > 0 && { color: '#e74c3c' }]}>
                  {discount > 0 ? `-${fmtCurrency(discountAmount)}` : fmtCurrency(0)}
                </Text>
              </View>
            </View>
            {!isAvoir && (
              <View style={[styles.totalsRow, styles.totalsRowBorder]}>
                <Text style={styles.totalsLabel}>{t('createDoc.tva', { rate: 19 })}</Text>
                <Text style={styles.totalsVal}>{fmtCurrency(tva)}</Text>
              </View>
            )}
            <LinearGradient
              colors={['rgba(108,99,255,0.08)', 'rgba(56,217,169,0.04)']}
              style={styles.totalsHighlight}
            >
              <Text style={styles.totalsLabelHL}>{t('createDoc.total')}{isAvoir ? '' : ' ' + t('createDoc.ttc')}</Text>
              <Text style={styles.totalsValHL}>{fmtCurrency(ttc)}</Text>
            </LinearGradient>
          </View>

          <View style={[shared.card, styles.formCard]}>
            <Text style={[shared.inputLabel, { marginBottom: 10 }]}>{t('createDoc.notes')}</Text>
            <TextInput
              style={[shared.inputField, styles.notesInput]}
              value={draft.notes}
              onChangeText={(v) => updateDraft({ notes: v })}
              multiline
              placeholderTextColor={colors.text3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity onPress={handlePreview} activeOpacity={0.85} style={{ marginBottom: 10 }}>
            <LinearGradient colors={[colors.accent, colors.accent2]} style={styles.btnPrimary}>
              <Ionicons name="eye" size={16} color="white" />
              <Text style={styles.btnPrimaryText}>{t('createDoc.savePreview')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  fixedHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 14, backgroundColor: colors.surface, borderRadius: 12, padding: 3, gap: 2, borderWidth: 1, borderColor: colors.border },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 9 },
  tabBtnActive: { backgroundColor: colors.surface3 },
  tabLabel: { fontSize: 11, fontWeight: '700', color: colors.text3 },
  tabLabelActive: { color: colors.text },
  content: { paddingHorizontal: 16, paddingBottom: 110 },
  formCard: { padding: 16, marginBottom: 14 },
  inputWrap: { marginBottom: 12 },
  row2: { flexDirection: 'row', gap: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(108,99,255,0.1)', borderWidth: 1, borderColor: 'rgba(108,99,255,0.25)', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12 },
  addBtnText: { fontSize: 11, fontWeight: '700', color: colors.accent2 },
  lineRow: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, paddingHorizontal: 14, marginBottom: 10, position: 'relative' },
  lineDesc: { color: colors.text, fontSize: 13, fontWeight: '500', paddingRight: 28, paddingBottom: 2 },
  delBtn: { position: 'absolute', top: 10, right: 12, padding: 4, zIndex: 2 },
  rowNums: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  numField: { gap: 4 },
  numLabel: { fontSize: 9, color: colors.text3, fontWeight: '700', textTransform: 'uppercase' },
  numInput: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 6, color: colors.text, fontWeight: '700', fontSize: 12 },
  totalDisplay: { marginLeft: 'auto', alignItems: 'flex-end', gap: 4 },
  totalVal: { fontWeight: '800', fontSize: 15, color: colors.accent2 },
  totalsBox: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, overflow: 'hidden', marginBottom: 14 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  totalsRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  totalsLabel: { fontSize: 12, color: colors.text2 },
  totalsVal: { fontWeight: '700', fontSize: 13, color: colors.text },
  totalsHighlight: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.border },
  totalsLabelHL: { fontSize: 13, color: colors.accent2, fontWeight: '600' },
  totalsValHL: { fontWeight: '800', fontSize: 17, color: colors.accent3 },
  notesInput: { minHeight: 72, lineHeight: 20, paddingTop: 12 },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 15, gap: 8 },
  btnPrimaryText: { color: 'white', fontWeight: '700', fontSize: 13 },
});
