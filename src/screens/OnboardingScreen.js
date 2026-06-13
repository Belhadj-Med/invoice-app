import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Image,
  StyleSheet, Animated, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import LanguagePicker from '../components/LanguagePicker';

const STEPS = [
  {
    title: 'Bienvenue',
    subtitle: 'Configurez votre entreprise pour commencer à créer des factures, devis et avoirs.',
    icon: 'rocket-outline',
  },
  {
    title: 'Votre entreprise',
    subtitle: 'Ces informations apparaîtront sur vos documents.',
    fields: [
      { key: 'name', label: 'Nom commercial *', placeholder: 'Mon Entreprise' },
      { key: 'legalName', label: 'Raison sociale', placeholder: 'Mon Entreprise SARL' },
      { key: 'address', label: 'Adresse', placeholder: '12 Rue Exemple' },
      { key: 'city', label: 'Ville', placeholder: 'Ville' },
      { key: 'matriculeFiscal', label: 'Matricule fiscal', placeholder: '1234567' },
      { key: 'phone', label: 'Téléphone', placeholder: '+216 00 000 000', keyboard: 'phone-pad' },
      { key: 'email', label: 'E-mail', placeholder: 'contact@exemple.com', keyboard: 'email-address', autoCapitalize: 'none' },
    ],
  },
  {
    title: 'Préférences',
    subtitle: 'Taux de TVA et devise pour vos documents.',
    fields: [
      { key: 'taxRate', label: 'Taux TVA (ex: 0.19)', placeholder: '0.19', keyboard: 'decimal-pad' },
      { key: 'currencySymbol', label: 'Symbole monnaie (ex: DT)', placeholder: 'DT' },
    ],
  },
  {
    title: 'Logo',
    subtitle: 'Optionnel — ajoutez le logo de votre entreprise. Sera affiché sur vos factures.',
    isLogo: true,
  },
  {
    title: 'Prêt !',
    subtitle: 'Vous pouvez commencer à créer des documents. Tous ces réglages sont modifiables plus tard dans les paramètres.',
    icon: 'checkmark-circle-outline',
  },
];

export default function OnboardingScreen() {
  const { setCompany, completeOnboarding } = useApp();
  const { colors, shared } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({});
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const STEPS = useMemo(() => [
    {
      title: t('onboarding.welcomeTitle'),
      subtitle: t('onboarding.welcomeSubtitle'),
      icon: 'rocket-outline',
      isLang: true,
    },
    {
      title: t('onboarding.companyTitle'),
      subtitle: t('onboarding.companySubtitle'),
      fields: [
        { key: 'name', label: t('onboarding.welcomeTitle') + ' *', placeholder: t('onboarding.namePlaceholder') },
        { key: 'legalName', label: t('companyInfo.legalName'), placeholder: t('onboarding.legalPlaceholder') },
        { key: 'address', label: t('companyInfo.address'), placeholder: t('onboarding.addressPlaceholder') },
        { key: 'city', label: t('companyInfo.city'), placeholder: t('onboarding.cityPlaceholder') },
        { key: 'matriculeFiscal', label: t('companyInfo.matricule'), placeholder: t('onboarding.matriculePlaceholder') },
        { key: 'phone', label: t('companyInfo.phone'), placeholder: t('onboarding.phonePlaceholder'), keyboard: 'phone-pad' },
        { key: 'email', label: t('companyInfo.email'), placeholder: t('onboarding.emailPlaceholder'), keyboard: 'email-address', autoCapitalize: 'none' },
      ],
    },
    {
      title: t('onboarding.prefsTitle'),
      subtitle: t('onboarding.prefsSubtitle'),
      fields: [
        { key: 'taxRate', label: t('onboarding.taxLabel'), placeholder: t('onboarding.taxPlaceholder'), keyboard: 'decimal-pad' },
        { key: 'currencySymbol', label: t('onboarding.currencyLabel'), placeholder: t('onboarding.currencyPlaceholder') },
      ],
    },
    {
      title: t('onboarding.logoTitle'),
      subtitle: t('onboarding.logoSubtitle'),
      isLogo: true,
    },
    {
      title: t('onboarding.readyTitle'),
      subtitle: t('onboarding.readySubtitle'),
      icon: 'checkmark-circle-outline',
    },
  ], [t]);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const animateTo = (nextStep) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const handleNext = () => {
    if (step === 1 && !form.name?.trim()) return;
    if (step < STEPS.length - 1) {
      animateTo(step + 1);
    }
  };

  const handlePickLogo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('onboarding.permissionTitle'), t('onboarding.permissionMsg'));
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
      const base64 = asset.base64;
      const mimeType = asset.mimeType || 'image/png';
      update('logo', `data:${mimeType};base64,${base64}`);
    }
  };

  const handleRemoveLogo = () => {
    update('logo', null);
  };

  const handleFinish = async () => {
    setCompany({ ...form, taxRate: parseFloat(form.taxRate) || 0.19 });
    await completeOnboarding();
  };

  const stepDef = STEPS[step];

  return (
    <SafeAreaView style={shared.screen} edges={['top']}>
      <View style={styles.progressBar}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i <= step && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {stepDef.icon && (
              <View style={styles.iconWrap}>
                <Ionicons name={stepDef.icon} size={48} color={colors.accent2} />
              </View>
            )}

            <Text style={styles.title}>{stepDef.title}</Text>
            <Text style={styles.subtitle}>{stepDef.subtitle}</Text>

            {stepDef.isLang ? (
              <View style={{ marginTop: 24 }}>
                <Text style={[styles.subtitle, { marginBottom: 16 }]}>{t('onboarding.langSubtitle')}</Text>
                <LanguagePicker />
              </View>
            ) : stepDef.isLogo ? (
              <View style={{ alignItems: 'center', marginTop: 20 }}>
                <View style={styles.logoPreview}>
                  {form.logo ? (
                    <Image source={{ uri: form.logo }} style={styles.logoImg} />
                  ) : (
                    <View style={[styles.logoPlaceholder, { backgroundColor: colors.surface2 }]}>
                      <Ionicons name="image-outline" size={40} color={colors.text3} />
                    </View>
                  )}
                </View>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                  <TouchableOpacity style={[shared.btnGhost, { flex: 0 }]} onPress={handlePickLogo}>
                    <Ionicons name="camera-outline" size={16} color={colors.accent2} />
                    <Text style={shared.btnGhostText}>{t('onboarding.choosePhoto')}</Text>
                  </TouchableOpacity>
                  {form.logo && (
                    <TouchableOpacity style={[shared.btnGhost, { flex: 0 }]} onPress={handleRemoveLogo}>
                      <Ionicons name="close-outline" size={16} color={colors.danger} />
                      <Text style={[shared.btnGhostText, { color: colors.danger }]}>{t('onboarding.removeLogo')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : stepDef.fields?.map(({ key, label, placeholder, keyboard, autoCapitalize }) => (
              <View key={key} style={styles.fieldWrap}>
                <Text style={shared.inputLabel}>{label}</Text>
                <TextInput
                  style={shared.inputField}
                  value={form[key] != null ? String(form[key]) : ''}
                  onChangeText={(v) => update(key, v)}
                  placeholder={placeholder}
                  placeholderTextColor={colors.text3}
                  keyboardType={keyboard}
                  autoCapitalize={autoCapitalize || 'sentences'}
                />
              </View>
            ))}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity
            style={[shared.btnGhost, styles.footerBtn]}
            onPress={() => animateTo(step - 1)}
          >
            <Ionicons name="arrow-back" size={16} color={colors.text2} />
            <Text style={shared.btnGhostText}>{t('common.back')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.footerBtn, { flex: step === 0 ? 1 : undefined }]}
          onPress={step < STEPS.length - 1 ? handleNext : handleFinish}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.accent, colors.accent2]}
            style={styles.nextBtn}
          >
            <Text style={styles.nextBtnText}>
              {step < STEPS.length - 1 ? t('common.next') : t('common.finish')}
            </Text>
            <Ionicons
              name={step < STEPS.length - 1 ? 'arrow-forward' : 'checkmark'}
              size={16}
              color="white"
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface3,
  },
  progressDotActive: {
    backgroundColor: colors.accent2,
    width: 24,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text2,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  fieldWrap: {
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerBtn: {
    flex: 1,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  nextBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  logoPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoImg: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
