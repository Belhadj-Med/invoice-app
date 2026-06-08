import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import DocumentPaper from '../components/DocumentPaper';

const TEMPLATES = [
  { type: 'Facture', icon: 'receipt-outline', desc: 'Facture avec TVA 19%' },
  { type: 'Devis', icon: 'document-outline', desc: 'Devis avec TVA 19%' },
  { type: 'Avoir', icon: 'return-down-back-outline', desc: 'Avoir sans TVA' },
];

const SAMPLE_DOC = (type) => ({
  id: 'template',
  docType: type,
  docNumber: `${type === 'Facture' ? 'FACT' : type === 'Devis' ? 'DEVI' : 'AVOI'}-2026-001`,
  clientName: 'Client Exemple SARL',
  dueDate: new Date().toISOString().slice(0, 10),
  notes: 'Paiement par virement sous 30 jours.',
  createdAt: new Date().toISOString(),
  lineItems: [
    { id: 1, desc: 'Prestation de service', qty: 1, price: 500 },
    { id: 2, desc: 'Consultation', qty: 2, price: 150 },
  ],
  status: 'pending',
});

export default function DocumentTemplatesScreen({ navigation }) {
  const { company } = useApp();
  const { colors, shared } = useTheme();
  const localStyles = useMemo(() => createStyles(colors), [colors]);
  const [expanded, setExpanded] = React.useState(null);

  return (
    <SafeAreaView style={shared.screen} edges={['top']}>
      <View style={localStyles.header}>
        <TouchableOpacity style={shared.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={16} color={colors.text2} />
        </TouchableOpacity>
        <Text style={shared.screenTitle}>Modèles de documents</Text>
      </View>

      <ScrollView contentContainerStyle={localStyles.content} showsVerticalScrollIndicator={false}>
        <Text style={[shared.sectionLabel, { marginBottom: 14 }]}>
          Aperçu des modèles utilisés pour vos documents
        </Text>

        {TEMPLATES.map((tpl) => (
          <View key={tpl.type} style={localStyles.templateBlock}>
            <TouchableOpacity
              style={[localStyles.templateHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setExpanded(expanded === tpl.type ? null : tpl.type)}
              activeOpacity={0.7}
            >
              <View style={[localStyles.iconWrap, { backgroundColor: colors.accent + '18' }]}>
                <Ionicons name={tpl.icon} size={20} color={colors.accent2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[localStyles.tplTitle, { color: colors.text }]}>{tpl.type}</Text>
                <Text style={{ color: colors.text3, fontSize: 11 }}>{tpl.desc}</Text>
              </View>
              <Ionicons
                name={expanded === tpl.type ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.text3}
              />
            </TouchableOpacity>

            {expanded === tpl.type && (
              <View style={localStyles.previewWrap}>
                <DocumentPaper document={SAMPLE_DOC(tpl.type)} company={company} />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: { padding: 16, paddingBottom: 110 },
  templateBlock: { marginBottom: 12 },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tplTitle: { fontSize: 14, fontWeight: '700' },
  previewWrap: { marginTop: 10 },
});
