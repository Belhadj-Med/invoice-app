import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { STATUS, DOC_TYPES } from '../constants/document';
import { calcTotals, fmtCurrency, fmtDateFR } from '../utils/documentUtils';
import StatPill from '../components/StatPill';

function StatusPicker({ visible, current, onSelect, onClose, colors }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.statusSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statusTitle, { color: colors.text }]}>Modifier le statut</Text>
          {Object.entries(STATUS).map(([key, cfg]) => (
            <TouchableOpacity
              key={key}
              style={[styles.statusOption, current === key && { backgroundColor: colors.surface2 }]}
              onPress={() => { onSelect(key); onClose(); }}
            >
              <StatPill type={cfg.pill} label={cfg.label} />
              {current === key && <Ionicons name="checkmark" size={18} color={colors.accent2} />}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function ClientDetailScreen({ route, navigation }) {
  const { clientId } = route.params;
  const {
    getClientById, getClientDocuments, getClientDisplayStats,
    updateDocumentStatus, openDocumentPreview, startNewDocument, deleteDocument,
  } = useApp();
  const { colors, shared } = useTheme();
  const localStyles = useMemo(() => createStyles(colors), [colors]);

  const client = getClientById(clientId);
  const docs = getClientDocuments(clientId);
  const stats = getClientDisplayStats(clientId);
  const [statusDocId, setStatusDocId] = useState(null);

  if (!client) {
    return (
      <SafeAreaView style={shared.screen}>
        <Text style={{ color: colors.text, padding: 20 }}>Client introuvable</Text>
      </SafeAreaView>
    );
  }

  const initials = client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleNewDoc = (docType) => {
    startNewDocument(clientId, docType);
    navigation.getParent()?.navigate('Create');
  };

  return (
    <SafeAreaView style={shared.screen} edges={['top']}>
      <View style={localStyles.header}>
        <TouchableOpacity style={shared.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={16} color={colors.text2} />
        </TouchableOpacity>
        <Text style={shared.screenTitle} numberOfLines={1}>{client.name}</Text>
      </View>

      <ScrollView contentContainerStyle={localStyles.content} showsVerticalScrollIndicator={false}>
        <View style={localStyles.profileCard}>
          <View style={[localStyles.avatar, { backgroundColor: client.color + '22' }]}>
            <Text style={[localStyles.avatarText, { color: client.color }]}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={localStyles.clientName}>{client.name}</Text>
            <Text style={localStyles.clientMeta}>{client.phone || '—'}</Text>
          </View>
          <View style={localStyles.statsBox}>
            <Text style={localStyles.statsTotal}>{stats.total}</Text>
            <Text style={localStyles.statsCount}>{stats.count} document{stats.count !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        <Text style={[shared.sectionLabel, { marginBottom: 10 }]}>Nouveau document</Text>
        <View style={localStyles.docTypeRow}>
          {DOC_TYPES.map((type) => (
            <TouchableOpacity key={type} style={{ flex: 1 }} onPress={() => handleNewDoc(type)} activeOpacity={0.85}>
              <LinearGradient
                colors={[colors.accent, colors.accent2]}
                style={localStyles.docTypeBtn}
              >
                <Ionicons name="add" size={14} color="white" />
                <Text style={localStyles.docTypeBtnText}>{type}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[shared.sectionLabel, { marginTop: 20, marginBottom: 10 }]}>
          Documents ({docs.length})
        </Text>

        {docs.length === 0 ? (
          <View style={localStyles.empty}>
            <Ionicons name="document-outline" size={36} color={colors.text3} />
            <Text style={{ color: colors.text3, marginTop: 8 }}>Aucun document pour ce client</Text>
          </View>
        ) : (
          <View style={shared.card}>
            {docs.map((doc, index) => {
              const cfg = STATUS[doc.status] || STATUS.pending;
              const { ttc } = calcTotals(doc.lineItems, doc.docType);
              return (
                <React.Fragment key={doc.id}>
                  <View style={localStyles.docRow}>
                    <TouchableOpacity
                      style={localStyles.docMain}
                      onPress={() => {
                        openDocumentPreview(doc.id, { tab: 'Clients', screen: 'ClientDetail', params: { clientId } });
                        navigation.getParent()?.navigate('Preview');
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[localStyles.docIcon, { backgroundColor: colors.accent + '18' }]}>
                        <Ionicons name="document-text" size={16} color={colors.accent2} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={localStyles.docNum}>{doc.docNumber}</Text>
                        <Text style={localStyles.docMeta}>
                          {doc.docType} · {fmtDateFR(doc.createdAt)}
                        </Text>
                      </View>
                      <Text style={localStyles.docAmount}>{fmtCurrency(ttc)}</Text>
                    </TouchableOpacity>
                    <View style={localStyles.docActions}>
                      {doc.docType === 'Facture' ? (
                        <TouchableOpacity onPress={() => setStatusDocId(doc.id)}>
                          <StatPill type={cfg.pill} label={cfg.label} />
                        </TouchableOpacity>
                      ) : (
                        <StatPill type={cfg.pill} label={cfg.label} />
                      )}
                      <TouchableOpacity
                        onPress={() => deleteDocument(doc.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {index < docs.length - 1 && <View style={[localStyles.divider, { backgroundColor: colors.border }]} />}
                </React.Fragment>
              );
            })}
          </View>
        )}
      </ScrollView>

      <StatusPicker
        visible={!!statusDocId}
        current={docs.find(d => d.id === statusDocId)?.status}
        onSelect={(status) => updateDocumentStatus(statusDocId, status)}
        onClose={() => setStatusDocId(null)}
        colors={colors}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  statusSheet: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  statusTitle: { fontSize: 16, fontWeight: '800', marginBottom: 16 },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
});

const createStyles = (colors) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: { padding: 16, paddingBottom: 110 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  avatar: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', fontSize: 16 },
  clientName: { fontSize: 16, fontWeight: '700', color: colors.text },
  clientMeta: { fontSize: 11, color: colors.text3, marginTop: 2 },
  statsBox: { alignItems: 'flex-end' },
  statsTotal: { fontSize: 14, fontWeight: '800', color: colors.text },
  statsCount: { fontSize: 10, color: colors.text3, marginTop: 2 },
  docTypeRow: { flexDirection: 'row', gap: 8 },
  docTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 12,
    paddingVertical: 10,
  },
  docTypeBtnText: { color: 'white', fontWeight: '700', fontSize: 10 },
  empty: { alignItems: 'center', padding: 40 },
  docRow: { padding: 14, paddingHorizontal: 16 },
  docMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  docNum: { fontSize: 13, fontWeight: '600', color: colors.text },
  docMeta: { fontSize: 10, color: colors.text3, marginTop: 2 },
  docAmount: { fontSize: 12, fontWeight: '700', color: colors.text },
  docActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingLeft: 50,
  },
  divider: { height: 1, marginHorizontal: 16 },
});
