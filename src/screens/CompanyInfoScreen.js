import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Image,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const FIELDS = [
  { key: 'name', tKey: 'companyInfo.tradeName' },
  { key: 'legalName', tKey: 'companyInfo.legalName' },
  { key: 'matriculeFiscal', tKey: 'companyInfo.matricule' },
  { key: 'address', tKey: 'companyInfo.address' },
  { key: 'postalCode', tKey: 'companyInfo.postalCode' },
  { key: 'city', tKey: 'companyInfo.city' },
  { key: 'country', tKey: 'companyInfo.country' },
  { key: 'phone', tKey: 'companyInfo.phone', keyboard: 'phone-pad' },
  { key: 'email', tKey: 'companyInfo.email', keyboard: 'email-address', autoCapitalize: 'none' },
  { key: 'website', tKey: 'companyInfo.website', autoCapitalize: 'none' },
  { key: 'bankName', tKey: 'companyInfo.bank' },
  { key: 'rib', tKey: 'companyInfo.rib' },
  { key: 'defaultNotes', tKey: 'companyInfo.defaultNotes', multiline: true },
  { key: 'taxRate', tKey: 'companyInfo.taxRate', keyboard: 'decimal-pad' },
  { key: 'currencySymbol', tKey: 'companyInfo.currencySymbol' },
];

export default function CompanyInfoScreen({ navigation }) {
  const { company, setCompany, showToast } = useApp();
  const { colors, shared } = useTheme();
  const { t } = useLanguage();
  const [form, setForm] = useState({ ...company });
  const localStyles = useMemo(() => createStyles(colors), [colors]);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handlePickLogo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('companyInfo.permissionTitle'), t('companyInfo.permissionMsg'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'Images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      let base64 = asset.base64;
      if (!base64) {
        const cachedPath = `${FileSystem.cacheDirectory}logo_${Date.now()}.jpg`;
        await FileSystem.copyAsync({ from: asset.uri, to: cachedPath });
        base64 = await FileSystem.readAsStringAsync(cachedPath, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }
      const mimeType = asset.mimeType || 'image/png';
      update('logo', `data:${mimeType};base64,${base64}`);
    }
  };

  const handleRemoveLogo = () => {
    update('logo', null);
  };

  const handleSave = () => {
    const cleaned = { ...form };
    if (cleaned.taxRate) cleaned.taxRate = parseFloat(cleaned.taxRate) || 0.19;
    if (cleaned.currencySymbol === 'DT') cleaned.currencyLocale = 'fr-TN';
    setCompany(cleaned);
    showToast(t('companyInfo.saved'), 'green');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={shared.screen} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={localStyles.header}>
          <TouchableOpacity style={shared.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={16} color={colors.text2} />
          </TouchableOpacity>
          <Text style={shared.screenTitle}>{t('companyInfo.title')}</Text>
        </View>

        <ScrollView contentContainerStyle={localStyles.content} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View style={localStyles.logoWrap}>
              {form.logo ? (
                <Image source={{ uri: form.logo }} style={localStyles.logo} />
              ) : (
                <Image source={require('../assets/logo.png')} style={localStyles.logo} />
              )}
              <View style={localStyles.logoActions}>
                <TouchableOpacity style={localStyles.logoBtn} onPress={handlePickLogo}>
                  <Ionicons name="camera-outline" size={16} color={colors.accent2} />
                </TouchableOpacity>
                {form.logo && (
                  <TouchableOpacity style={localStyles.logoBtn} onPress={handleRemoveLogo}>
                    <Ionicons name="close-outline" size={16} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <Text style={{ color: colors.text3, fontSize: 10, marginTop: 4 }}>{t('companyInfo.logoLabel')}</Text>
          </View>
          <Text style={[shared.sectionLabel, { marginBottom: 14 }]}>
            {t('companyInfo.description')}
          </Text>

          {FIELDS.map(({ key, tKey, multiline, keyboard, autoCapitalize }) => (
            <View key={key} style={localStyles.inputWrap}>
              <Text style={shared.inputLabel}>{t(tKey)}</Text>
              <TextInput
                style={[shared.inputField, multiline && localStyles.multiline]}
                value={form[key] != null ? String(form[key]) : ''}
                onChangeText={(v) => update(key, v)}
                placeholder={t(tKey)}
                placeholderTextColor={colors.text3}
                multiline={multiline}
                keyboardType={keyboard}
                autoCapitalize={autoCapitalize || 'sentences'}
                textAlignVertical={multiline ? 'top' : 'auto'}
              />
            </View>
          ))}

          <TouchableOpacity onPress={handleSave} activeOpacity={0.85}>
            <LinearGradient
              colors={[colors.accent, colors.accent2]}
              style={localStyles.saveBtn}
            >
              <Ionicons name="save-outline" size={18} color="white" />
              <Text style={localStyles.saveBtnText}>{t('companyInfo.save')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  inputWrap: { marginBottom: 14 },
  multiline: { minHeight: 80, paddingTop: 12 },
  logoWrap: { alignItems: 'center', position: 'relative' },
  logo: { width: 96, height: 96, borderRadius: 12 },
  logoActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  logoBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 8,
  },
  saveBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
});
