import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';
import { UbicacionFarmacia } from '../types';
import { EstadoPermiso } from './useMediaPicker';

export function useLocation() {
  const [estadoPermiso, setEstadoPermiso] = useState<EstadoPermiso>('pendiente');
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false);

  const obtenerUbicacionActual = useCallback(async (): Promise<UbicacionFarmacia | null> => {
    setCargandoUbicacion(true);
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setEstadoPermiso('denegado');
        Alert.alert(
          'Permiso de ubicación denegado',
          canAskAgain
            ? 'Necesitamos acceso al GPS para guardar la ubicación de la farmacia.'
            : 'El permiso de Ubicación está bloqueado. Habilitalo desde Ajustes.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
          ]
        );
        return null;
      }

      setEstadoPermiso('concedido');

      const gpsActivo = await Location.hasServicesEnabledAsync();
      if (!gpsActivo) {
        Alert.alert('GPS apagado', 'Activá la ubicación en tu dispositivo e intentá de nuevo.');
        return null;
      }

      let posicion = await Location.getLastKnownPositionAsync({});
      if (!posicion) {
        posicion = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
      }

      const { latitude, longitude } = posicion.coords;
      let direccionFormateada = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      try {
        const lugares = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (lugares.length > 0) {
          const l = lugares[0];
          const partes = [l.street, l.streetNumber, l.city || l.subregion].filter(Boolean);
          if (partes.length > 0) direccionFormateada = partes.join(' ');
        }
      } catch {
        // Mantiene coordenadas si no hay conexión para geocoding
      }

      return { latitude, longitude, direccion: direccionFormateada };
    } catch (err: any) {
      Alert.alert('Error de GPS', err?.message || 'No se pudo obtener la ubicación.');
      return null;
    } finally {
      setCargandoUbicacion(false);
    }
  }, []);

  return { estadoPermiso, cargandoUbicacion, obtenerUbicacionActual };
}