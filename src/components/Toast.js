import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export default function Toast() {
  const { toast } = useApp();
  const { colors } = useTheme();
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const insets     = useSafeAreaInsets();

  const typeColors = useMemo(() => ({
    green:  colors.accent3 + '55',
    purple: colors.accent2 + '55',
    red:    colors.danger  + '55',
    yellow: colors.warm    + '55',
  }), [colors]);

  const styles = useMemo(() => StyleSheet.create({
    toast: {
      position: 'absolute',
      left: 16,
      right: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderRadius: 14,
      paddingVertical: 13,
      paddingHorizontal: 16,
      zIndex: 9999,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 10,
    },
    message: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '500',
      lineHeight: 18,
    },
  }), [colors]);

  useEffect(() => {
    const toValue = toast.visible ? 1 : 0;
    const transY  = toast.visible ? 0 : 12;
    Animated.parallel([
      Animated.timing(opacity,    { toValue, duration: 280, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: transY, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [toast.visible]);

  const borderColor = typeColors[toast.type] || typeColors.purple;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          opacity,
          transform: [{ translateY }],
          bottom: 84 + insets.bottom,
          borderColor,
        },
      ]}
    >
      <Text style={styles.message}>{toast.message}</Text>
    </Animated.View>
  );
}
