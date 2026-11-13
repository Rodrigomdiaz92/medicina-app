import { useState, useCallback } from 'react';
import * as Calendar from 'expo-calendar/legacy';
import { Alert, Linking, Platform } from 'react-native';
import { EstadoPermiso } from './useMediaPicker';

export function useCalendar() {
  const [estadoPermiso, setEstadoPermiso] = useState<EstadoPermiso>('pendiente');

  const solicitarPermisoCalendario = useCallback(async (): Promise<boolean> => {
    try {
      const { status, canAskAgain } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        setEstadoPermiso('denegado');
        Alert.alert(
          'Permiso de calendario denegado',
          canAskAgain
            ? 'Necesitamos acceso a tu calendario para agendar el recordatorio.'
            : 'El permiso de Calendario está bloqueado. Habilitalo desde Ajustes.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }

      setEstadoPermiso('concedido');
      return true;
    } catch (err: any) {
      Alert.alert('Error de permisos', err?.message || 'No se pudo solicitar acceso al calendario.');
      return false;
    }
  }, []);

  const obtenerOCrearCalendario = async (): Promise<string | null> => {
    const calendarios = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const modificable = calendarios.find(
      (c) => c.allowsModifications && (Platform.OS === 'ios' || c.isPrimary || c.accessLevel === 'owner')
    ) || calendarios.find((c) => c.allowsModifications);

    if (modificable) return modificable.id;

    const fuentePorDefecto =
      Platform.OS === 'ios'
        ? calendarios.find((c) => c.source?.name === 'Default')?.source || calendarios[0]?.source
        : { isLocalAccount: true, name: 'Medicina App', type: Calendar.SourceType.LOCAL };

    if (!fuentePorDefecto) return null;

    return await Calendar.createCalendarAsync({
      title: 'Medicina App',
      color: '#2563EB',
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: fuentePorDefecto.id,
      source: fuentePorDefecto,
      name: 'MedicinaAppCalendar',
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
  };

  const agendarEnCalendario = useCallback(
    async (titulo: string, notas: string | undefined, fechaInicio: Date): Promise<string | null> => {
      try {
        const tienePermiso = await solicitarPermisoCalendario();
        if (!tienePermiso) return null;

        const calendarId = await obtenerOCrearCalendario();
        if (!calendarId) {
          Alert.alert('Calendario no disponible', 'No se encontró un calendario editable en el dispositivo.');
          return null;
        }

        const fechaFin = new Date(fechaInicio.getTime() + 15 * 60 * 1000);

        const eventId = await Calendar.createEventAsync(calendarId, {
          title: `💊 Toma: ${titulo}`,
          notes: notas || 'Recordatorio programado desde Medicina App',
          startDate: fechaInicio,
          endDate: fechaFin,
          alarms: [{ relativeOffset: 0 }],
        });

        return eventId;
      } catch (err: any) {
        Alert.alert('Error de calendario', err?.message || 'No se pudo agendar el evento.');
        return null;
      }
    },
    [solicitarPermisoCalendario]
  );

  return { estadoPermiso, solicitarPermisoCalendario, agendarEnCalendario };
}