import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { openSupportEmail } from '../services/emailService';

function ActionRow({ icon, iconColor, label, description, onPress, colors }) {
  return (
    <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.settingIcon, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
        {description ? <Text style={[styles.settingDesc, { color: colors.text3 }]}>{description}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={14} color={colors.text3} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }) {
  const { showToast } = useApp();
  const { colors, shared, isLightMode, setLightMode } = useTheme();
  const localStyles = useMemo(() => createStyles(colors), [colors]);

  const handleSupport = async () => {
    try {
      await openSupportEmail();
    } catch {
      showToast('❌ Aucune application e-mail', 'red');
    }
  };

  return (
    <SafeAreaView style={shared.screen} edges={['top']}>
      <ScrollView contentContainerStyle={localStyles.content} showsVerticalScrollIndicator={false}>
        <Text style={[shared.screenTitle, localStyles.title]}>Réglages</Text>

        <Text style={[shared.sectionLabel, localStyles.sectionLabel]}>Apparence</Text>
        <View style={shared.card}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: colors.warm + '18' }]}>
              <Ionicons name="sunny-outline" size={16} color={colors.warm} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Mode clair</Text>
              <Text style={[styles.settingDesc, { color: colors.text3 }]}>Interface claire et lumineuse</Text>
            </View>
            <Switch
              value={isLightMode}
              onValueChange={(v) => {
                setLightMode(v);
                showToast(v ? '☀️ Mode clair activé' : '🌙 Mode sombre activé', 'purple');
              }}
              trackColor={{ false: colors.surface3, true: colors.accent + '88' }}
              thumbColor={isLightMode ? colors.accent2 : colors.text3}
            />
          </View>
        </View>

        <Text style={[shared.sectionLabel, localStyles.sectionLabel]}>Entreprise & documents</Text>
        <View style={shared.card}>
          <ActionRow
            icon="business-outline"
            iconColor={colors.accent}
            label="Informations entreprise"
            description="Nom, adresse, MF, RIB — affichés sur les factures"
            colors={colors}
            onPress={() => navigation.navigate('CompanyInfo')}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ActionRow
            icon="document-text-outline"
            iconColor={colors.warm}
            label="Modèles de documents"
            description="Aperçu facture, devis et avoir"
            colors={colors}
            onPress={() => navigation.navigate('DocumentTemplates')}
          />
        </View>

        <Text style={[shared.sectionLabel, localStyles.sectionLabel]}>Application</Text>
        <View style={shared.card}>
          <ActionRow
            icon="help-circle-outline"
            iconColor={colors.text2}
            label="Aide & support"
            description="Contacter le support par e-mail"
            colors={colors}
            onPress={handleSupport}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ActionRow
            icon="information-circle-outline"
            iconColor={colors.text2}
            label="À propos — v1.0.0"
            description="Ala App — Facturation professionnelle"
            colors={colors}
            onPress={() => showToast('Ala App v1.0.0 — Facturation TN', 'purple')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, gap: 12 },
  settingIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 13, fontWeight: '600' },
  settingDesc: { fontSize: 10, marginTop: 2 },
  actionRow: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, gap: 12 },
  divider: { height: 1, marginHorizontal: 16 },
});

const createStyles = (colors) => StyleSheet.create({
  content: { padding: 16, paddingBottom: 110 },
  title: { marginBottom: 20 },
  sectionLabel: { marginBottom: 10 },
});
