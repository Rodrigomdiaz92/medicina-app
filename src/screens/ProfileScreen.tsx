import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, StatusChip, SectionHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, Radius, Fonts } from '../theme';

// Datos hardcodeados por defecto para campos médicos y contacto
const DEFAULT_MEDICAL_DATA = {
  telefono: '+54 11 1234-5678',
  grupoSanguineo: 'A+',
  obraSocial: 'OSDE 310',
  numeroAfiliado: '12345678901',
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [cargandoLogout, setCargandoLogout] = useState(false);

  const handleCerrarSesion = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que querés salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          setCargandoLogout(true);
          await logout();
          setCargandoLogout(false);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header con Foto, Nombre y Correo desde AsyncStorage */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.fotoUrl || 'https://i.pravatar.cc/300?img=12' }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>{user?.nombre || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'sin-correo@medicina.com'}</Text>

          <View style={styles.statusBadge}>
            <StatusChip label="Paciente Activo" color={Colors.success} />
          </View>
        </View>

        {/* Datos Médicos (Hardcodeados por ahora) */}
        <View style={styles.section}>
          <SectionHeader title="Datos Médicos" accent={Colors.mint} />
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Grupo Sanguíneo</Text>
              <Text style={styles.infoValue}>{DEFAULT_MEDICAL_DATA.grupoSanguineo}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Obra Social / Prepaga</Text>
              <Text style={styles.infoValue}>{DEFAULT_MEDICAL_DATA.obraSocial}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>N° de Afiliado</Text>
              <Text style={styles.infoValue}>{DEFAULT_MEDICAL_DATA.numeroAfiliado}</Text>
            </View>
          </View>
        </View>

        {/* Contacto (Hardcodeado por ahora) */}
        <View style={styles.section}>
          <SectionHeader title="Contacto" accent={Colors.accent} />
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{DEFAULT_MEDICAL_DATA.telefono}</Text>
            </View>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.actionsSection}>
          <Button
            label="Editar Perfil"
            variant="secondary"
            onPress={() => Alert.alert('Editar', 'Próximamente se podrán modificar estos campos.')}
            fullWidth
            style={{ marginBottom: Spacing.sm }}
          />

          <Button
            label="Cerrar Sesión"
            variant="danger"
            loading={cargandoLogout}
            onPress={handleCerrarSesion}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  profileHeader: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: Colors.accent,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 22,
    fontFamily: Fonts.comic,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    fontFamily: Fonts.comic,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    marginTop: Spacing.sm,
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: Fonts.comic,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: Fonts.comic,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  actionsSection: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xl,
  },
});