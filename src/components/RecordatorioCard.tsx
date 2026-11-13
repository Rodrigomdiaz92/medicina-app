import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { StatusChip } from './ui';
import { Colors, Spacing, Radius, Fonts } from '../theme';
import { Recordatorio } from '../types';

interface Props {
  recordatorio: Recordatorio;
  onEliminar: (id: string) => void;
  onCompletar: (id: string) => void;
}

export function RecordatorioCard({ recordatorio: r, onEliminar, onCompletar }: Props) {
  const pasado = isPast(new Date(r.fechaProgramada));
  const pendiente = !r.completado && !pasado && r.notificationId;

  let estadoColor: string = Colors.textMuted;
  let estadoLabel = 'Expirado';

  if (r.completado) {
    estadoColor = Colors.success;
    estadoLabel = 'Completado';
  } else if (pendiente) {
    estadoColor = Colors.accent;
    estadoLabel = 'Pendiente';
  } else if (pasado && !r.completado) {
    estadoColor = Colors.warning;
    estadoLabel = 'Enviado';
  }

  return (
    <View style={[styles.container, r.completado && styles.containerCompletado]}>
      <View style={styles.header}>
        <StatusChip label={estadoLabel} color={estadoColor} />
        <Text style={styles.fecha}>
          {format(new Date(r.fechaProgramada), 'HH:mm', { locale: es })}
          {' · '}
          {formatDistanceToNow(new Date(r.fechaProgramada), {
            addSuffix: true,
            locale: es,
          })}
        </Text>
      </View>

      <View style={styles.bodyRow}>
        {r.imagenUri ? (
          <Image source={{ uri: r.imagenUri }} style={styles.medImage} />
        ) : null}

        <View style={{ flex: 1 }}>
          <Text style={[styles.titulo, r.completado && styles.tituloCompletado]}>
            {r.titulo}
          </Text>
          {r.descripcion ? <Text style={styles.descripcion}>{r.descripcion}</Text> : null}
        </View>
      </View>

      {/* Metadatos nativos (Farmacia GPS, Contacto, Calendario) */}
      {(r.ubicacion || r.contacto || r.calendarEventId) && (
        <View style={styles.metaContainer}>
          {r.ubicacion && (
            <Text style={styles.metaText}>
              📍 Farmacia: {r.ubicacion.direccion || `${r.ubicacion.latitude.toFixed(3)}, ${r.ubicacion.longitude.toFixed(3)}`}
            </Text>
          )}
          {r.contacto && (
            <Text style={styles.metaText}>
              👤 Contacto: {r.contacto.nombre} {r.contacto.telefono ? `(${r.contacto.telefono})` : ''}
            </Text>
          )}
          {r.calendarEventId && (
            <Text style={styles.metaText}>📅 Agendado en calendario</Text>
          )}
        </View>
      )}

      <View style={styles.actions}>
        {!r.completado && (
          <TouchableOpacity
            style={[styles.btn, styles.btnCompletar]}
            onPress={() => onCompletar(r.id)}
          >
            <Text style={styles.btnCompl}>✓ Completar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.btn, styles.btnEliminar]}
          onPress={() => onEliminar(r.id)}
        >
          <Text style={styles.btnElim}>✕ Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  containerCompletado: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  fecha: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: Fonts.comic,
  },
  bodyRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  medImage: {
    width: 56,
    height: 56,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  titulo: {
    fontSize: 16,
    fontFamily: Fonts.comic,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  tituloCompletado: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  descripcion: {
    fontSize: 13,
    fontFamily: Fonts.comic,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  metaContainer: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 2,
  },
  metaText: {
    fontSize: 12,
    fontFamily: Fonts.comic,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  btnCompletar: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accent + '33',
  },
  btnEliminar: {
    backgroundColor: 'rgba(255, 90, 95, 0.1)',
    borderColor: 'rgba(255, 90, 95, 0.3)',
  },
  btnCompl: { color: Colors.accent, fontSize: 13, fontFamily: Fonts.comic, fontWeight: 'bold' },
  btnElim: { color: Colors.danger, fontSize: 13, fontFamily: Fonts.comic, fontWeight: 'bold' },
});