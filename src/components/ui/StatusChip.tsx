import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Fonts } from '../../theme';

interface StatusChipProps {
  label: string;
  color?: string;
  bgColor?: string;
}

export function StatusChip({ label, color = Colors.accent, bgColor }: StatusChipProps) {
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: bgColor || color + '1A', borderColor: color + '40' },
      ]}
    >
      <View style={[styles.chipDot, { backgroundColor: color }]} />
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 11,
    fontFamily: Fonts.comic,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});