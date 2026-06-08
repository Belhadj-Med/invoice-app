import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Image,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const FIELDS = [
  { key: 'name', label: 'Nom commercial' },
  { key: 'legalName', label: 'Raison sociale' },
  { key: 'matriculeFiscal', label: 'Matricule fiscal' },
  { key: 'address', label: 'Adresse' },
  { key: 'postalCode', label: 'Code postal' },
  { key: 'city', label: 'Ville' },
  { key: 'country', label: 'Pays' },
  { key: 'phone', label: 'Téléphone', keyboard: 'phone-pad' },
  { key: 'email', label: 'E-mail', keyboard: 'email-address', autoCapitalize: 'none' },
  { key: 'website', label: 'Site web', autoCapitalize: 'none' },
  { key: 'bankName', label: 'Banque' },
  { key: 'rib', label: 'RIB' },
  { key: 'defaultNotes', label: 'Notes par défaut', multiline: true },
];

export default function CompanyInfoScreen({ navigation }) {
  const { company, setCompany, showToast } = useApp();
  const { colors, shared } = useTheme();
  const [form, setForm] = useState({ ...company });
  const localStyles = useMemo(() => createStyles(colors), [colors]);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setCompany(form);
    showToast('✅ Informations entreprise enregistrées', 'green');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={shared.screen} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={localStyles.header}>
          <TouchableOpacity style={shared.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={16} color={colors.text2} />
          </TouchableOpacity>
          <Text style={shared.screenTitle}>Informations entreprise</Text>
        </View>

        <ScrollView contentContainerStyle={localStyles.content} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <Image source={require('../assets/logo.png')} style={{ width: 96, height: 96, borderRadius: 12 }} />
          </View>
          <Text style={[shared.sectionLabel, { marginBottom: 14 }]}>
            Ces informations apparaissent sur vos factures, devis et avoirs
          </Text>

          {FIELDS.map(({ key, label, multiline, keyboard, autoCapitalize }) => (
            <View key={key} style={localStyles.inputWrap}>
              <Text style={shared.inputLabel}>{label}</Text>
              <TextInput
                style={[shared.inputField, multiline && localStyles.multiline]}
                value={form[key] || ''}
                onChangeText={(v) => update(key, v)}
                placeholder={label}
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
              <Text style={localStyles.saveBtnText}>Enregistrer</Text>
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
