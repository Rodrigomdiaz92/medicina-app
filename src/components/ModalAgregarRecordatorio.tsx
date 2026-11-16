import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
  Switch,
} from 'react-native';
import { format, addSeconds, addMinutes, addHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from './ui';
import { Colors, Spacing, Radius, Fonts } from '../theme';
import { UbicacionFarmacia, ContactoVinculado } from '../types';
import { useMediaPicker } from '../hooks/useMediaPicker';
import { useLocation } from '../hooks/useLocation';
import { useContacts } from '../hooks/useContacts';
import { useCalendar } from '../hooks/useCalendar';

type TipoPreset = '10s' | '4h' | '6h' | '8h' | 'custom';
type TipoUnidadDosis = 'pastillas' | 'ml';
type UnidadesCustom = 'minutos' | 'horas';

export interface DatosNuevoRecordatorio {
  titulo: string;
  descripcion: string;
  fechaProgramada: Date;
  imagenUri?: string | null;
  ubicacion?: UbicacionFarmacia | null;
  contacto?: ContactoVinculado | null;
  calendarEventId?: string | null;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onGuardar: (datos: DatosNuevoRecordatorio) => Promise<void>;
}

export function ModalAgregarRecordatorio({ visible, onClose, onGuardar }: Props) {
  const [titulo, setTitulo] = useState('');
  const [dosis, setDosis] = useState('');
  const [unidadDosis, setUnidadDosis] = useState<TipoUnidadDosis>('pastillas');
  const [descripcion, setDescripcion] = useState('');

  // Tiempos
  const [preset, setPreset] = useState<TipoPreset>('10s');
  const [customValor, setCustomValor] = useState('15');
  const [customUnidad, setCustomUnidad] = useState<UnidadesCustom>('minutos');

  // Recursos nativos 
  const [imagenUri, setImagenUri] = useState<string | null>(null);
  const [ubicacion, setUbicacion] = useState<UbicacionFarmacia | null>(null);
  const [contacto, setContacto] = useState<ContactoVinculado | null>(null);
  const [agendarCalendario, setAgendarCalendario] = useState(false);

  const [guardando, setGuardando] = useState(false);

  const { tomarFoto, elegirDeGaleria } = useMediaPicker();
  const { cargandoUbicacion, obtenerUbicacionActual } = useLocation();
  const { seleccionarContacto } = useContacts();
  const { solicitarPermisoCalendario, agendarEnCalendario } = useCalendar();

  const resetear = () => {
    setTitulo('');
    setDosis('');
    setUnidadDosis('pastillas');
    setDescripcion('');
    setPreset('10s');
    setCustomValor('15');
    setCustomUnidad('minutos');
    setImagenUri(null);
    setUbicacion(null);
    setContacto(null);
    setAgendarCalendario(false);
  };

  const calcularFechaProgramada = (): Date | null => {
    const ahora = new Date();
    if (preset === '10s') return addSeconds(ahora, 10);
    if (preset === '4h') return addHours(ahora, 4);
    if (preset === '6h') return addHours(ahora, 6);
    if (preset === '8h') return addHours(ahora, 8);
    if (preset === 'custom') {
      const num = parseInt(customValor, 10);
      if (isNaN(num) || num <= 0) return null;
      return customUnidad === 'minutos' ? addMinutes(ahora, num) : addHours(ahora, num);
    }
    return null;
  };

  const handleTomarFoto = async () => {
    const uri = await tomarFoto();
    if (uri) setImagenUri(uri);
  };

  const handleGaleria = async () => {
    const uri = await elegirDeGaleria();
    if (uri) setImagenUri(uri);
  };

  const handleUbicacion = async () => {
    const loc = await obtenerUbicacionActual();
    if (loc) setUbicacion(loc);
  };

  const handleContacto = async () => {
    const c = await seleccionarContacto();
    if (c) setContacto(c);
  };

  const handleToggleCalendario = async (valor: boolean) => {
    if (!valor) {
      setAgendarCalendario(false);
      return;
    }

    const concedido = await solicitarPermisoCalendario();
    setAgendarCalendario(concedido);
  };

  const handleGuardar = async () => {
    if (!titulo.trim()) {
      Alert.alert('Falta el título', 'Ingresá el nombre del medicamento o remedio.');
      return;
    }

    const fecha = calcularFechaProgramada();
    if (!fecha) {
      Alert.alert('Tiempo inválido', 'Ingresá una cantidad de tiempo válida.');
      return;
    }

    setGuardando(true);
    try {
      let descFinal = '';
      if (dosis.trim()) {
        descFinal += `Dosis: ${dosis.trim()} ${
          unidadDosis === 'pastillas'
            ? parseFloat(dosis) === 1
              ? 'pastilla'
              : 'pastillas'
            : 'ml'
        }`;
      }
      if (descripcion.trim()) {
        descFinal += descFinal ? ` - ${descripcion.trim()}` : descripcion.trim();
      }

      let calendarEventId: string | null = null;
      if (agendarCalendario) {
        calendarEventId = await agendarEnCalendario(titulo.trim(), descFinal, fecha);
      }

      await onGuardar({
        titulo: titulo.trim(),
        descripcion: descFinal,
        fechaProgramada: fecha,
        imagenUri,
        ubicacion,
        contacto,
        calendarEventId,
      });

      resetear();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo programar el recordatorio.');
    } finally {
      setGuardando(false);
    }
  };

  const fechaPreview = calcularFechaProgramada();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Nuevo Recordatorio</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>
            {/* Título */}
            <Text style={styles.label}>Medicamento / Título *</Text>
            <TextInput
              style={styles.input}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ej: Ibuprofeno"
              placeholderTextColor={Colors.textMuted}
              maxLength={60}
            />

            {/* Cantidad / Dosis */}
            <Text style={styles.label}>Cantidad / Dosis</Text>
            <View style={styles.dosisRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={dosis}
                onChangeText={setDosis}
                placeholder="Ej: 1 o 5"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
              />
              <View style={styles.segmentedContainer}>
                <TouchableOpacity
                  style={[styles.segmentBtn, unidadDosis === 'pastillas' && styles.segmentBtnActivo]}
                  onPress={() => setUnidadDosis('pastillas')}
                >
                  <Text style={[styles.segmentText, unidadDosis === 'pastillas' && styles.segmentTextActivo]}>
                    Pastilla(s)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentBtn, unidadDosis === 'ml' && styles.segmentBtnActivo]}
                  onPress={() => setUnidadDosis('ml')}
                >
                  <Text style={[styles.segmentText, unidadDosis === 'ml' && styles.segmentTextActivo]}>
                    ml
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notas */}
            <Text style={[styles.label, { marginTop: Spacing.md }]}>Notas (opcional)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Ej: Tomar con agua después de comer…"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={2}
              maxLength={120}
            />

            {/* Foto del medicamento (Cámara / Galería) */}
            <Text style={styles.label}>Foto del medicamento (opcional)</Text>
            <View style={styles.resourceRow}>
              <TouchableOpacity style={styles.resourceBtn} onPress={handleTomarFoto}>
                <Text style={styles.resourceBtnText}>📷 Cámara</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resourceBtn} onPress={handleGaleria}>
                <Text style={styles.resourceBtnText}>🖼️ Galería</Text>
              </TouchableOpacity>
            </View>
            {imagenUri && (
              <View style={styles.imagePreviewBox}>
                <Image source={{ uri: imagenUri }} style={styles.imagePreview} />
                <TouchableOpacity onPress={() => setImagenUri(null)}>
                  <Text style={styles.removeText}>✕ Quitar foto</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Ubicación GPS de la Farmacia */}
            <Text style={styles.label}>Ubicación de farmacia (GPS)</Text>
            <TouchableOpacity
              style={styles.resourceBtnFull}
              onPress={handleUbicacion}
              disabled={cargandoUbicacion}
            >
              <Text style={styles.resourceBtnText}>
                {cargandoUbicacion
                  ? 'Obteniendo ubicación…'
                  : ubicacion
                  ? `📍 ${ubicacion.direccion}`
                  : '📍 Adjuntar ubicación actual'}
              </Text>
            </TouchableOpacity>

            {/* Contacto Relacionado (Médico / Familiar) */}
            <Text style={styles.label}>Médico o Familiar (Contactos)</Text>
            <TouchableOpacity style={styles.resourceBtnFull} onPress={handleContacto}>
              <Text style={styles.resourceBtnText}>
                {contacto
                  ? `👤 ${contacto.nombre}${contacto.telefono ? ` (${contacto.telefono})` : ''}`
                  : '👤 Seleccionar contacto'}
              </Text>
            </TouchableOpacity>

            {/* Calendario del dispositivo */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>📅 Agendar en calendario del teléfono</Text>
              <Switch
                value={agendarCalendario}
                onValueChange={handleToggleCalendario}
                trackColor={{ false: Colors.border, true: Colors.accent }}
              />
            </View>

            {/* Tiempo / Repetición */}
            <Text style={styles.label}>¿En cuánto tiempo notificará? *</Text>
            <View style={styles.presetsGrid}>
              {[
                { id: '10s', label: '10 seg' },
                { id: '4h', label: '4 hs' },
                { id: '6h', label: '6 hs' },
                { id: '8h', label: '8 hs' },
                { id: 'custom', label: 'Personalizado' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.presetBtn, preset === item.id && styles.presetBtnActivo]}
                  onPress={() => setPreset(item.id as TipoPreset)}
                >
                  <Text style={[styles.presetText, preset === item.id && styles.presetTextActivo]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {preset === 'custom' && (
              <View style={styles.customTimeRow}>
                <TextInput
                  style={[styles.input, { width: 80, marginBottom: 0, textAlign: 'center' }]}
                  value={customValor}
                  onChangeText={setCustomValor}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <View style={styles.segmentedContainer}>
                  <TouchableOpacity
                    style={[styles.segmentBtn, customUnidad === 'minutos' && styles.segmentBtnActivo]}
                    onPress={() => setCustomUnidad('minutos')}
                  >
                    <Text style={[styles.segmentText, customUnidad === 'minutos' && styles.segmentTextActivo]}>
                      Minutos
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.segmentBtn, customUnidad === 'horas' && styles.segmentBtnActivo]}
                    onPress={() => setCustomUnidad('horas')}
                  >
                    <Text style={[styles.segmentText, customUnidad === 'horas' && styles.segmentTextActivo]}>
                      Horas
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {fechaPreview && (
              <Text style={styles.preview}>
                ⏰ Se disparará a las{' '}
                <Text style={{ fontWeight: 'bold' }}>
                  {format(fechaPreview, 'HH:mm:ss', { locale: es })}
                </Text>
              </Text>
            )}
          </ScrollView>

          <View style={styles.actions}>
            <Button label="Cancelar" onPress={onClose} variant="ghost" style={{ flex: 1 }} />
            <Button label="Guardar" onPress={handleGuardar} loading={guardando} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  container: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.comic,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  formScroll: {
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.comic,
    fontWeight: 'bold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
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
    marginBottom: Spacing.md,
  },
  inputMultiline: {
    height: 60,
    textAlignVertical: 'top',
  },
  dosisRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 2,
  },
  segmentBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.sm - 2,
  },
  segmentBtnActivo: {
    backgroundColor: Colors.accent,
  },
  segmentText: {
    fontSize: 12,
    fontFamily: Fonts.comic,
    color: Colors.textSecondary,
  },
  segmentTextActivo: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  resourceRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  resourceBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceHigh,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  resourceBtnFull: {
    backgroundColor: Colors.surfaceHigh,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  resourceBtnText: {
    fontSize: 13,
    fontFamily: Fonts.comic,
    color: Colors.textPrimary,
  },
  imagePreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  imagePreview: {
    width: 64,
    height: 64,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removeText: {
    color: Colors.danger,
    fontSize: 12,
    fontFamily: Fonts.comic,
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 13,
    fontFamily: Fonts.comic,
    color: Colors.textPrimary,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  presetBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceHigh,
  },
  presetBtnActivo: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accent,
  },
  presetText: {
    fontSize: 12,
    fontFamily: Fonts.comic,
    color: Colors.textSecondary,
  },
  presetTextActivo: {
    color: Colors.accent,
    fontWeight: 'bold',
  },
  customTimeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  preview: {
    color: Colors.accent,
    fontSize: 13,
    fontFamily: Fonts.comic,
    textAlign: 'center',
    marginVertical: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
});