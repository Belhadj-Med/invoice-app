import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function StatPill({ type = 'purple', label, icon }) {
  const { pillColors } = useTheme();
  const style = pillColors[type] || pillColors.purple;
  return (
    <View style={[styles.pill, { backgroundColor: style.bg }]}>
      {icon ? <Text style={{ fontSize: 8 }}>{icon}</Text> : null}
      <Text style={[styles.text, { color: style.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  text: {
    fontSize: 9,
    fontWeight: '700',
  },
});
