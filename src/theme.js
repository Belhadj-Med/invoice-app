import { StyleSheet, Platform } from 'react-native';

export const darkColors = {
  bg: '#0a0a0f',
  surface: '#13131a',
  surface2: '#1c1c26',
  surface3: '#242432',
  border: 'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.12)',
  accent: '#6c63ff',
  accent2: '#a78bfa',
  accent3: '#38d9a9',
  warm: '#fbbf24',
  danger: '#f87171',
  text: '#f1f1f5',
  text2: '#a0a0b8',
  text3: '#5a5a72',
  tabBarBg: 'rgba(13,13,20,0.97)',
  heroGradient: ['#1a1040', '#0d0d20', '#0a1520'],
  heroBorder: 'rgba(108,99,255,0.2)',
};

export const lightColors = {
  bg: '#f4f4f8',
  surface: '#ffffff',
  surface2: '#f0f0f6',
  surface3: '#e6e6ef',
  border: 'rgba(0,0,0,0.08)',
  border2: 'rgba(0,0,0,0.12)',
  accent: '#6c63ff',
  accent2: '#7c3aed',
  accent3: '#059669',
  warm: '#d97706',
  danger: '#dc2626',
  text: '#1a1a2e',
  text2: '#4a4a68',
  text3: '#8888aa',
  tabBarBg: 'rgba(255,255,255,0.97)',
  heroGradient: ['#ede9fe', '#f8f7ff', '#ecfdf5'],
  heroBorder: 'rgba(108,99,255,0.18)',
};

export function buildPillColors(colors) {
  return {
    green:  { bg: colors.accent3 + '1f', color: colors.accent3 },
    yellow: { bg: colors.warm + '1f',    color: colors.warm },
    red:    { bg: colors.danger + '1f',  color: colors.danger },
    purple: { bg: colors.accent + '1f',  color: colors.accent2 },
  };
}

export function buildShared(colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    screenTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.5,
    },
    sectionLabel: {
      marginTop: 10,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: colors.text3,
    },
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      overflow: 'hidden',
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputField: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      paddingHorizontal: 14,
      color: colors.text,
      fontSize: 13,
      fontWeight: '500',
    },
    inputLabel: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      color: colors.text3,
      marginBottom: 6,
    },
    btnGhost: {
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 13,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 6,
    },
    btnGhostText: {
      color: colors.text2,
      fontWeight: '600',
      fontSize: 12,
    },
    shadow: Platform.select({
      ios: {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
    }),
  });
}

export function getTheme(isDark) {
  const colors = isDark ? darkColors : lightColors;
  return {
    colors,
    pillColors: buildPillColors(colors),
    shared: buildShared(colors),
    isDark,
  };
}

// Legacy static exports (dark) — prefer useTheme() in components
export const colors = darkColors;
export const pillColors = buildPillColors(darkColors);
export const shared = buildShared(darkColors);
