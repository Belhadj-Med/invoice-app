import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../i18n/translations';
import { useTheme } from '../context/ThemeContext';

function GridPicker({ colors }) {
  const { language, setLanguage } = useLanguage();
  return (
    <View style={styles.wrap}>
      {LANGUAGES.map((lang) => {
        const active = language === lang.code;
        return (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.option,
              { backgroundColor: colors.surface, borderColor: colors.border },
              active && { backgroundColor: colors.accent + '18', borderColor: colors.accent2 },
            ]}
            onPress={() => setLanguage(lang.code)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.nativeLabel,
              { color: colors.text },
              active && { color: colors.accent2 },
            ]}>
              {lang.nativeLabel}
            </Text>
            <Text style={[styles.label, { color: colors.text3 }]}>
              {lang.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function DropdownPicker({ colors }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === language);

  return (
    <>
      <TouchableOpacity
        style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownText, { color: colors.text }]}>
          {current?.nativeLabel} — {current?.label}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.text3} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.modal, { backgroundColor: colors.surface }]}>
            {LANGUAGES.map((lang, i) => {
              const active = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.modalOption,
                    i < LANGUAGES.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    active && { backgroundColor: colors.accent + '12' },
                  ]}
                  onPress={() => { setLanguage(lang.code); setOpen(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalNativeLabel, { color: colors.text }, active && { color: colors.accent2 }]}>
                    {lang.nativeLabel}
                  </Text>
                  <Text style={[styles.modalLabel, { color: colors.text3 }]}>
                    {lang.label}
                  </Text>
                  {active && <Ionicons name="checkmark" size={18} color={colors.accent2} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function LanguagePicker({ style, variant = 'grid' }) {
  const { colors } = useTheme();
  return (
    <View style={style}>
      {variant === 'dropdown' ? <DropdownPicker colors={colors} /> : <GridPicker colors={colors} />}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '75%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 10,
  },
  modalNativeLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  option: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  nativeLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  label: {
    fontSize: 9,
    fontWeight: '500',
  },
});
