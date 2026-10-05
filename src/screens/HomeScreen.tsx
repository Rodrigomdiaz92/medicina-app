import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalNotifications } from '../hooks/useLocalNotifications';
import { Button, StatusChip, SectionHeader, EmptyState } from '../components/ui';
import { RecordatorioCard } from '../components/RecordatorioCard';
import { ModalAgregarRecordatorio } from '../components/ModalAgregarRecordatorio';
import { Colors, Spacing, Fonts } from '../theme';

export default function HomeScreen() {
  const {
    recordatorios,
    permissionStatus,
    cargando,
    requestPermission,
    agregarRecordatorio,
    eliminarRecordatorio,
    marcarCompletado,
    limpiarTodos,
  } = useLocalNotifications();

  const [modalVisible, setModalVisible] = useState(false);

  const pendientes = recordatorios.filter((r) => !r.completado);
  const completados = recordatorios.filter((r) => r.completado);

  const handleGuardar = useCallback(
    async (titulo: string, desc: string, fecha: Date) => {
      await agregarRecordatorio({ titulo, descripcion: desc, fechaProgramada: fecha });
    },
    [agregarRecordatorio]
  );

  const handleLimpiar = () => {
    Alert.alert('Limpiar todo', '¿Seguro que querés eliminar todos los recordatorios?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpiar', style: 'destructive', onPress: limpiarTodos },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Encabezado */}
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Medicina App</Text>
          <Text style={styles.subtitle}>Gestión de recordatorios de medicamentos</Text>
        </View>

        {/* Estado de Permisos */}
        <View style={styles.block}>
          <SectionHeader title="Permisos de Notificación" accent={Colors.accent} />
          <View style={styles.statusRow}>
            <StatusChip
              label={
                permissionStatus === 'idle' ? 'Sin verificar'
                : permissionStatus === 'loading' ? 'Solicitando…'
                : permissionStatus === 'granted' ? 'Activadas'
                : 'Denegadas'
              }
              color={
                permissionStatus === 'granted' ? Colors.success
                : permissionStatus === 'denied' ? Colors.danger
                : Colors.warning
              }
            />
          </View>

          {permissionStatus !== 'granted' && (
            <Button
              label={permissionStatus === 'loading' ? 'Solicitando…' : 'Activar notificaciones'}
              onPress={requestPermission}
              loading={permissionStatus === 'loading'}
              style={{ marginTop: Spacing.sm }}
              fullWidth
            />
          )}
        </View>

        {/* Lista de Recordatorios */}
        <View style={styles.block}>
          <SectionHeader
            title="Mis Recordatorios"
            accent={Colors.accent}
            rightContent={
              recordatorios.length > 0 ? (
                <TouchableOpacity onPress={handleLimpiar}>
                  <Text style={styles.clearText}>Limpiar todo</Text>
                </TouchableOpacity>
              ) : undefined
            }
          />

          <Button
            label="+ Agregar Recordatorio"
            onPress={() => {
              if (permissionStatus !== 'granted') {
                Alert.alert('Permisos requeridos', 'Debes activar las notificaciones primero.');
                return;
              }
              setModalVisible(true);
            }}
            fullWidth
            style={{ marginBottom: Spacing.md }}
          />

          {pendientes.length > 0 && (
            <>
              <Text style={styles.groupLabel}>PENDIENTES ({pendientes.length})</Text>
              {pendientes.map((r) => (
                <RecordatorioCard
                  key={r.id}
                  recordatorio={r}
                  onEliminar={eliminarRecordatorio}
                  onCompletar={marcarCompletado}
                />
              ))}
            </>
          )}

          {completados.length > 0 && (
            <>
              <Text style={[styles.groupLabel, { marginTop: Spacing.md }]}>
                COMPLETADOS ({completados.length})
              </Text>
              {completados.map((r) => (
                <RecordatorioCard
                  key={r.id}
                  recordatorio={r}
                  onEliminar={eliminarRecordatorio}
                  onCompletar={marcarCompletado}
                />
              ))}
            </>
          )}

          {recordatorios.length === 0 && !cargando && (
            <EmptyState
              icon="💊"
              title="Sin recordatorios"
              subtitle="Tocá en Agregar para programar tu primera toma."
            />
          )}
        </View>
      </ScrollView>

      <ModalAgregarRecordatorio
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onGuardar={handleGuardar}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingBottom: 30 },
  headerBlock: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.comic,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: Fonts.comic,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  block: {
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  clearText: {
    color: Colors.danger,
    fontSize: 12,
    fontFamily: Fonts.comic,
    fontWeight: 'bold',
  },
  groupLabel: {
    fontSize: 11,
    fontFamily: Fonts.comic,
    fontWeight: 'bold',
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
});