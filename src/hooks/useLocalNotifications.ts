import { useEffect, useCallback, useRef, useState } from 'react';
import * as Device from 'expo-device';
import { Alert, Linking, Platform } from 'react-native';
import type { EventSubscription } from 'expo-modules-core';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import { cancelAllScheduledNotificationsAsync } from 'expo-notifications/build/cancelAllScheduledNotificationsAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { addNotificationReceivedListener } from 'expo-notifications/build/NotificationsEmitter';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { Recordatorio, UbicacionFarmacia, ContactoVinculado } from '../types';
import { useRecordatoriosStore } from '../store/useRecordatoriosStore';

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

type PermissionStatus = 'idle' | 'granted' | 'denied' | 'loading';

export interface NuevoRecordatorioInput {
  titulo: string;
  descripcion: string;
  fechaProgramada: Date;
  imagenUri?: string | null;
  ubicacion?: UbicacionFarmacia | null;
  contacto?: ContactoVinculado | null;
  calendarEventId?: string | null;
}

export function useLocalNotifications() {
  const recordatorios = useRecordatoriosStore((state) => state.recordatorios);
  const agregarRecordatorioStore = useRecordatoriosStore((state) => state.agregarRecordatorioStore);
  const eliminarRecordatorioStore = useRecordatoriosStore((state) => state.eliminarRecordatorioStore);
  const completarRecordatorioStore = useRecordatoriosStore((state) => state.completarRecordatorioStore);
  const actualizarRecordatorioStore = useRecordatoriosStore((state) => state.actualizarRecordatorioStore);
  const limpiarRecordatoriosStore = useRecordatoriosStore((state) => state.limpiarRecordatoriosStore);
  const verificarExpirados = useRecordatoriosStore((state) => state.verificarExpirados);

  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('idle');
  const notificationListener = useRef<EventSubscription | null>(null);

  useEffect(() => {
    verificarExpirados();

    notificationListener.current = addNotificationReceivedListener((notification) => {
      const notifId = notification.request.identifier;
      const actual = useRecordatoriosStore
        .getState()
        .recordatorios.find((r) => r.notificationId === notifId);
      if (actual) {
        actualizarRecordatorioStore(actual.id, { notificationId: null });
      }
    });

    return () => {
      notificationListener.current?.remove();
    };
  }, [verificarExpirados, actualizarRecordatorioStore]);

  const requestPermission = useCallback(async () => {
    setPermissionStatus('loading');

    if (!Device.isDevice) {
      console.warn('[LocalNotif] Emulador detectado. Notificaciones pueden no funcionar.');
    }

    if (Platform.OS === 'android') {
      try {
        await setNotificationChannelAsync('recordatorios', {
          name: 'Recordatorios',
          importance: AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6C63FF',
          sound: 'default',
        });
      } catch (err) {
        console.warn('[LocalNotif] No se pudo crear el canal Android:', err);
      }
    }

    const existingPermission = await getPermissionsAsync();
    let finalStatus = existingPermission.status;
    let canAskAgain = existingPermission.canAskAgain;

    if (existingPermission.status !== 'granted') {
      const requestedPermission = await requestPermissionsAsync({
        android: {},
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = requestedPermission.status;
      canAskAgain = requestedPermission.canAskAgain;
    }

    setPermissionStatus(finalStatus === 'granted' ? 'granted' : 'denied');

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permisos de notificación desactivados',
        canAskAgain
          ? 'Android no concedió el permiso. Probá tocar el botón otra vez o revisá que las notificaciones de Expo Go estén habilitadas.'
          : 'Android ya no muestra el aviso porque el permiso fue denegado antes. Activá las notificaciones manualmente en Ajustes.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
        ]
      );
    }
  }, []);

  const agregarRecordatorio = useCallback(
    async ({
      titulo,
      descripcion,
      fechaProgramada,
      imagenUri = null,
      ubicacion = null,
      contacto = null,
      calendarEventId = null,
    }: NuevoRecordatorioInput) => {
      if (permissionStatus !== 'granted') {
        await requestPermission();
      }

      const segundosHastaDisparar = Math.floor(
        (fechaProgramada.getTime() - Date.now()) / 1000
      );

      let notifId: string | null = null;

      if (segundosHastaDisparar > 0) {
        notifId = await scheduleNotificationAsync({
          content: {
            title: titulo,
            body: descripcion,
            sound: 'default',
            data: { tipo: 'recordatorio' },
          },
          trigger: {
            type: SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: segundosHastaDisparar,
          },
        });
      }

      const nuevo: Recordatorio = {
        id: Date.now().toString(),
        titulo,
        descripcion,
        fechaProgramada: fechaProgramada.getTime(),
        notificationId: notifId,
        completado: false,
        creadoEn: Date.now(),
        imagenUri,
        ubicacion,
        contacto,
        calendarEventId,
      };

      agregarRecordatorioStore(nuevo);
    },
    [permissionStatus, requestPermission, agregarRecordatorioStore]
  );

  const eliminarRecordatorio = useCallback(
    async (id: string) => {
      const item = useRecordatoriosStore
        .getState()
        .recordatorios.find((r) => r.id === id);
      if (item?.notificationId) {
        cancelScheduledNotificationAsync(item.notificationId).catch(console.error);
      }
      eliminarRecordatorioStore(id);
    },
    [eliminarRecordatorioStore]
  );

  const marcarCompletado = useCallback(
    async (id: string) => {
      const item = useRecordatoriosStore
        .getState()
        .recordatorios.find((r) => r.id === id);
      if (item?.notificationId) {
        cancelScheduledNotificationAsync(item.notificationId).catch(console.error);
      }
      completarRecordatorioStore(id);
    },
    [completarRecordatorioStore]
  );

  const limpiarTodos = useCallback(async () => {
    await cancelAllScheduledNotificationsAsync();
    limpiarRecordatoriosStore();
  }, [limpiarRecordatoriosStore]);

  return {
    recordatorios,
    permissionStatus,
    cargando: false,
    requestPermission,
    agregarRecordatorio,
    eliminarRecordatorio,
    marcarCompletado,
    limpiarTodos,
  };
}