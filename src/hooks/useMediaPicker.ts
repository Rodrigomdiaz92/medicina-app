import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

export type EstadoPermiso = 'pendiente' | 'concedido' | 'denegado';

export function useMediaPicker() {
  const [estadoPermisoCamara, setEstadoPermisoCamara] = useState<EstadoPermiso>('pendiente');
  const [estadoPermisoGaleria, setEstadoPermisoGaleria] = useState<EstadoPermiso>('pendiente');

  const mostrarAlertaPermiso = (recurso: 'cámara' | 'galería') => {
    Alert.alert(
      `Permiso de ${recurso} denegado`,
      `Necesitamos acceso a tu ${recurso} para adjuntar la foto del medicamento. Podés habilitarlo desde Ajustes.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
      ]
    );
  };

  const tomarFoto = useCallback(async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setEstadoPermisoCamara('denegado');
      mostrarAlertaPermiso('cámara');
      return null;
    }

    setEstadoPermisoCamara('concedido');
    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!resultado.canceled && resultado.assets.length > 0) {
      return resultado.assets[0].uri;
    }
    return null;
  }, []);

  const elegirDeGaleria = useCallback(async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setEstadoPermisoGaleria('denegado');
      mostrarAlertaPermiso('galería');
      return null;
    }

    setEstadoPermisoGaleria('concedido');
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!resultado.canceled && resultado.assets.length > 0) {
      return resultado.assets[0].uri;
    }
    return null;
  }, []);

  return {
    estadoPermisoCamara,
    estadoPermisoGaleria,
    tomarFoto,
    elegirDeGaleria,
  };
}