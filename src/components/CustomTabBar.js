import React, { useMemo } from 'react';
import {
  View, TouchableOpacity, Text, StyleSheet, Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const TABS = [
  { name: 'Dashboard', label: 'Accueil',  icon: 'home',                  lib: 'Ionicons' },
  { name: 'Clients',   label: 'Clients',  icon: 'people',                lib: 'Ionicons' },
  { name: 'Create',    label: '',          icon: 'add',                   lib: 'Ionicons', isFab: true },
  { name: 'Preview',   label: 'Aperçu',   icon: 'document-text-outline', lib: 'Ionicons' },
  { name: 'Settings',  label: 'Réglages', icon: 'settings-outline',      lib: 'Ionicons' },
];

function TabIcon({ lib, name, size, color }) {
  if (lib === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={name} size={size} color={color} />;
  }
  return <Ionicons name={name} size={size} color={color} />;
}

export default function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 8), backgroundColor: colors.tabBarBg },
      ]}
    >
      {TABS.map((tab, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[index]?.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(tab.name);
          }
        };

        if (tab.isFab) {
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={onPress}
              style={styles.fabWrapper}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.accent, colors.accent2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.fab, Platform.OS === 'ios' ? styles.fabShadowIOS : styles.fabShadowAndroid]}
              >
                <Ionicons name="add" size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={onPress}
            style={styles.tabBtn}
            activeOpacity={0.7}
          >
            <TabIcon
              lib={tab.lib}
              name={tab.icon}
              size={20}
              color={isFocused ? colors.accent2 : colors.text3}
            />
            <Text style={[styles.label, isFocused && { color: colors.accent2 }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 8,
    minHeight: 64,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.text3,
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  fabShadowIOS: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
  fabShadowAndroid: {
    elevation: 10,
  },
});
