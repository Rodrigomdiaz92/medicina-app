import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Fonts } from '../../theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  accent?: string;
  rightContent?: React.ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  accent = Colors.accent,
  rightContent,
}: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionAccent, { backgroundColor: accent }]} />
      <View style={styles.sectionTextContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {rightContent && <View style={styles.sectionRight}>{rightContent}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionAccent: {
    width: 4,
    height: 28,
    borderRadius: 2,
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.comic,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.comic,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionRight: {
    marginLeft: Spacing.sm,
  },
});