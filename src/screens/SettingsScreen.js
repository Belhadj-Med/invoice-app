import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { openSupportEmail } from '../services/emailService';
import { exportAllData } from '../services/exportService';
import LanguagePicker from '../components/LanguagePicker';

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
  const { showToast, clients, documents, company } = useApp();
  const { colors, shared, isLightMode, setLightMode } = useTheme();
  const { t, language } = useLanguage();
  const localStyles = useMemo(() => createStyles(colors), [colors]);

  const handleSupport = async () => {
    try {
      await openSupportEmail(language);
    } catch {
      showToast(t('settings.noEmail'), 'red');
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportAllData(clients, documents, company);
      if (result.success) {
        showToast(t('settings.exportSuccess'), 'green');
      } else {
        showToast(result.message || t('settings.exportError'), 'red');
      }
    } catch {
      showToast(t('settings.exportException'), 'red');
    }
  };

  return (
    <SafeAreaView style={shared.screen} edges={['top']}>
      <ScrollView contentContainerStyle={localStyles.content} showsVerticalScrollIndicator={false}>
        <Text style={[shared.screenTitle, localStyles.title]}>{t('settings.title')}</Text>

        <Text style={[shared.sectionLabel, localStyles.sectionLabel]}>{t('settings.appearance')}</Text>
        <View style={shared.card}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: colors.warm + '18' }]}>
              <Ionicons name="sunny-outline" size={16} color={colors.warm} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t('settings.lightMode')}</Text>
              <Text style={[styles.settingDesc, { color: colors.text3 }]}>{t('settings.lightDesc')}</Text>
            </View>
            <Switch
              value={isLightMode}
              onValueChange={(v) => {
                setLightMode(v);
                showToast(v ? t('settings.lightToast') : t('settings.darkToast'), 'purple');
              }}
              trackColor={{ false: colors.surface3, true: colors.accent + '88' }}
              thumbColor={isLightMode ? colors.accent2 : colors.text3}
            />
          </View>
        </View>

        <Text style={[shared.sectionLabel, localStyles.sectionLabel]}>{t('settings.language')}</Text>
        <View style={shared.card}>
          <LanguagePicker variant="dropdown" />
        </View>

        <Text style={[shared.sectionLabel, localStyles.sectionLabel]}>{t('settings.company')}</Text>
        <View style={shared.card}>
          <ActionRow
            icon="business-outline"
            iconColor={colors.accent}
            label={t('settings.companyInfo')}
            description={t('settings.companyDesc')}
            colors={colors}
            onPress={() => navigation.navigate('CompanyInfo')}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ActionRow
            icon="document-text-outline"
            iconColor={colors.warm}
            label={t('settings.templates')}
            description={t('settings.templatesDesc')}
            colors={colors}
            onPress={() => navigation.navigate('DocumentTemplates')}
          />
        </View>

        <Text style={[shared.sectionLabel, localStyles.sectionLabel]}>{t('settings.data')}</Text>
        <View style={shared.card}>
          <ActionRow
            icon="download-outline"
            iconColor={colors.accent3}
            label={t('settings.export')}
            description={t('settings.exportDesc')}
            colors={colors}
            onPress={handleExport}
          />
        </View>

        <Text style={[shared.sectionLabel, localStyles.sectionLabel]}>{t('settings.app')}</Text>
        <View style={shared.card}>
          <ActionRow
            icon="help-circle-outline"
            iconColor={colors.text2}
            label={t('settings.support')}
            description={t('settings.supportDesc')}
            colors={colors}
            onPress={handleSupport}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ActionRow
            icon="information-circle-outline"
            iconColor={colors.text2}
            label={t('settings.about', { ver: '1.0.0' })}
            description={t('settings.aboutDesc')}
            colors={colors}
            onPress={() => showToast(t('settings.aboutToast', { ver: '1.0.0' }), 'purple')}
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
