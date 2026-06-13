import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import DocumentPaper from '../components/DocumentPaper';
import { downloadDocumentPdf } from '../services/pdfService';
import { sendDocumentEmail } from '../services/emailService';
import { STATUS } from '../constants/document';

export default function PreviewScreen({ navigation, route }) {
  const {
    previewDocument, company, activeDocumentId,
    updateDocumentStatus, showToast, loadDocumentForEdit, getClientById,
  } = useApp();
  const { colors, shared } = useTheme();
  const { t, language } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);

  const origin = route.params?.origin;

  const doc = previewDocument;
  const client = doc.clientId ? getClientById(doc.clientId) : null;
  const statusCfg = STATUS[doc.status] || STATUS.pending;
  const isSaved = doc.id && doc.id !== 'draft';

  const handleDownload = async () => {
    if (!isSaved) {
      showToast(t('preview.saveFirst'), 'red');
      return;
    }
    setLoading(true);
    try {
      const { location, fileName } = await downloadDocumentPdf(doc, company, client, language);
      showToast(t('preview.downloaded', { file: fileName, loc: location }), 'green');
    } catch (err) {
      if (err?.message === 'DOWNLOAD_CANCELLED') {
        showToast(t('preview.downloadCancelled'), 'yellow');
        return;
      }
      showToast(t('preview.downloadError'), 'red');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!isSaved) {
      showToast(t('preview.saveFirst'), 'red');
      return;
    }
    try {
      await sendDocumentEmail(doc, company, company.email, language);
      showToast(t('preview.emailOpened'), 'green');
    } catch {
      showToast(t('preview.noEmail'), 'red');
    }
  };

  const handleMarkPaid = () => {
    if (!isSaved) return;
    updateDocumentStatus(doc.id, 'paid');
  };

  const handleEdit = () => {
    if (!isSaved) {
      navigation.getParent()?.navigate('CreateModal');
      return;
    }
    loadDocumentForEdit(doc.id);
    navigation.getParent()?.navigate('CreateModal');
  };

  if (!doc) {
    return (
      <SafeAreaView style={shared.screen}>
        <View style={styles.empty}>
          <Ionicons name="document-outline" size={48} color={colors.text3} />
          <Text style={{ color: colors.text2, marginTop: 12 }}>{t('preview.empty')}</Text>
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate('CreateModal')} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.accent2, fontWeight: '700' }}>{t('preview.createOne')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={shared.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={shared.backBtn}
          onPress={() => {
            if (origin && origin.tab) {
              navigation.navigate(origin.tab, origin.screen ? { screen: origin.screen, params: origin.params } : undefined);
              return;
            }
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={16} color={colors.text2} />
        </TouchableOpacity>
        <Text style={shared.screenTitle}>{t('preview.title')}</Text>
        {isSaved && (
          <View style={{ marginLeft: 'auto' }}>
            <StatPillInline type={statusCfg.pill} label={statusCfg.label} colors={colors} />
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DocumentPaper document={doc} company={company} client={client} />

        <TouchableOpacity onPress={handleSend} activeOpacity={0.85} disabled={loading}>
          <LinearGradient colors={[colors.accent, colors.accent2]} style={styles.btnPrimary}>
            <Ionicons name="send" size={16} color="white" />
            <Text style={styles.btnPrimaryText}>{t('preview.sendEmail')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[shared.btnGhost, { flex: 1 }]} onPress={handleDownload} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.text2} />
            ) : (
              <>
                <Ionicons name="download-outline" size={15} color={colors.text2} />
                <Text style={shared.btnGhostText}>{t('preview.downloadPdf')}</Text>
              </>
            )}
          </TouchableOpacity>
          {doc.docType === 'Facture' && isSaved && doc.status !== 'paid' && (
            <TouchableOpacity style={[shared.btnGhost, { flex: 1 }]} onPress={handleMarkPaid}>
              <Ionicons name="checkmark-circle-outline" size={15} color={colors.accent3} />
              <Text style={[shared.btnGhostText, { color: colors.accent3 }]}>{t('preview.markPaid')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={[shared.btnGhost, { marginTop: 10 }]} onPress={handleEdit}>
          <Ionicons name="create-outline" size={15} color={colors.text2} />
          <Text style={shared.btnGhostText}>{t('preview.editDoc')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatPillInline({ type, label, colors }) {
  const pillMap = {
    green: { bg: colors.accent3 + '1f', color: colors.accent3 },
    yellow: { bg: colors.warm + '1f', color: colors.warm },
    purple: { bg: colors.accent + '1f', color: colors.accent2 },
  };
  const s = pillMap[type] || pillMap.purple;
  return (
    <View style={{ backgroundColor: s.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 }}>
      <Text style={{ color: s.color, fontSize: 10, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  content: { paddingHorizontal: 16, paddingBottom: 110 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 15, gap: 8, marginTop: 16, marginBottom: 10 },
  btnPrimaryText: { color: 'white', fontWeight: '700', fontSize: 13 },
  actionsRow: { flexDirection: 'row', gap: 10 },
});
