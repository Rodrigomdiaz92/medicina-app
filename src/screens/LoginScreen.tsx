import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, SectionHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, Radius, Fonts } from '../theme';

interface Props {
  onGoToRegister: () => void;
}

export default function LoginScreen({ onGoToRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos incompletos', 'Ingresá tu correo y contraseña.');
      return;
    }

    setCargando(true);
    try {
      const nombreExtraido = email.split('@')[0];
      await login(email.trim(), nombreExtraido);
    } catch (e) {
      Alert.alert('Error', 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <SectionHeader title="Iniciar Sesión" subtitle="Accedé a tus recordatorios de medicina" />

        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="ejemplo@correo.com"
          placeholderTextColor={Colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={Colors.textMuted}
          secureTextEntry
        />

        <Button
          label="Ingresar"
          onPress={handleLogin}
          loading={cargando}
          fullWidth
          style={{ marginTop: Spacing.md }}
        />

        <TouchableOpacity style={styles.footerLink} onPress={onGoToRegister}>
          <Text style={styles.linkText}>
            ¿No tenés cuenta? <Text style={styles.boldText}>Registrate</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center' },
  container: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.comic,
    fontWeight: 'bold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 14,
    fontFamily: Fonts.comic,
  },
  footerLink: { marginTop: Spacing.lg, alignItems: 'center' },
  linkText: { fontSize: 13, fontFamily: Fonts.comic, color: Colors.textSecondary },
  boldText: { color: Colors.accent, fontWeight: 'bold' },
});