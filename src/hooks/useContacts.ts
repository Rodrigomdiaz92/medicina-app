import { useState, useCallback } from 'react';
import * as Contacts from 'expo-contacts/legacy';
import { Alert, Linking } from 'react-native';
import { ContactoVinculado } from '../types';
import { EstadoPermiso } from './useMediaPicker';

export function useContacts() {
  const [estadoPermiso, setEstadoPermiso] = useState<EstadoPermiso>('pendiente');

  const seleccionarContacto = useCallback(async (): Promise<ContactoVinculado | null> => {
    try {
      const { status, canAskAgain } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setEstadoPermiso('denegado');
        Alert.alert(
          'Permiso de contactos denegado',
          canAskAgain
            ? 'Necesitamos acceso a tus contactos para vincular un médico o familiar.'
            : 'El permiso de Contactos está bloqueado. Habilitalo desde Ajustes.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
          ]
        );
        return null;
      }

      setEstadoPermiso('concedido');

      const contacto = await Contacts.presentContactPickerAsync();
      if (contacto) {
        return {
          id: contacto.id ?? Date.now().toString(),
          nombre: contacto.name || 'Contacto sin nombre',
          telefono: contacto.phoneNumbers?.[0]?.number,
        };
      }
      return null;
    } catch (err: any) {
      // Fallback si el picker nativo falla en el dispositivo
      try {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
          pageSize: 15,
        });

        if (!data || data.length === 0) {
          Alert.alert('Agenda vacía', 'No se encontraron contactos en el dispositivo.');
          return null;
        }

        return await new Promise<ContactoVinculado | null>((resolve) => {
          const opciones = data.slice(0, 5).map((c) => ({
            text: `${c.name || 'Sin nombre'}${c.phoneNumbers?.[0]?.number ? ` (${c.phoneNumbers[0].number})` : ''}`,
            onPress: () =>
              resolve({
                id: c.id ?? Date.now().toString(),
                nombre: c.name || 'Contacto sin nombre',
                telefono: c.phoneNumbers?.[0]?.number,
              }),
          }));

          Alert.alert('Seleccionar contacto', 'Elegí un médico o familiar:', [
            ...opciones,
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
          ]);
        });
      } catch {
        Alert.alert('Error de contactos', err?.message || 'No se pudo abrir la agenda.');
        return null;
      }
    }
  }, []);

  return { estadoPermiso, seleccionarContacto };
}