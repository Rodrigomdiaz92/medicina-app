import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Radius, Fonts } from '../../theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const bgColors: Record<string, string> = {
    primary: Colors.accent,
    secondary: Colors.surfaceHigh,
    danger: 'rgba(255, 90, 95, 0.12)',
    ghost: 'transparent',
  };

  const textColors: Record<string, string> = {
    primary: '#FFFFFF',
    secondary: Colors.accent,
    danger: Colors.danger,
    ghost: Colors.accent,
  };

  const borderColors: Record<string, string> = {
    primary: 'transparent',
    secondary: Colors.border,
    danger: 'rgba(255, 90, 95, 0.3)',
    ghost: 'transparent',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        {
          backgroundColor: bgColors[variant],
          borderColor: borderColors[variant],
          opacity: isDisabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#FFF' : Colors.accent} />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.buttonText, { color: textColors[variant] }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    minHeight: 48,
  },
  fullWidth: {
    width: '100%',
  },
  buttonText: {
    fontSize: 15,
    fontFamily: Fonts.comic,
    fontWeight: 'bold',
  },
  iconContainer: {
    marginRight: 4,
  },
});