

import { useEffect, useCallback, useRef, useState } from 'react';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { Recordatorio } from '../types';


const STORAGE_KEY = '@notifications_recordatorios';


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

interface NuevoRecordatorio {
  titulo: string;
  descripcion: string;
  fechaProgramada: Date;
}

interface UseLocalNotificationsReturn {
  recordatorios: Recordatorio[];
  permissionStatus: PermissionStatus;
  cargando: boolean;
  requestPermission: () => Promise<void>;
  agregarRecordatorio: (data: NuevoRecordatorio) => Promise<void>;
  eliminarRecordatorio: (id: string) => Promise<void>;
  marcarCompletado: (id: string) => Promise<void>;
  limpiarTodos: () => Promise<void>;
}

// ─── Hook 
export function useLocalNotifications(): UseLocalNotificationsReturn {
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('idle');
  const [cargando, setCargando] = useState(true);

  // Ref para el listener de notificaciones recibidas
  const notificationListener = useRef<EventSubscription | null>(null);

  // ── Paso 5: Restaurar desde AsyncStorage al iniciar ──────────────────────
  useEffect(() => {
    const restaurar = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const guardados: Recordatorio[] = JSON.parse(raw);
          // Filtrar los que ya pasaron su fecha y no completados
          const ahora = Date.now();
          const vigentes = guardados.map((r) => {
            if (!r.completado && r.fechaProgramada < ahora) {
              return { ...r, notificationId: null }; // notif ya se disparó
            }
            return r;
          });
          setRecordatorios(vigentes);
        }
      } catch (err) {
        console.error('[LocalNotif] Error al restaurar:', err);
      } finally {
        setCargando(false);
      }
    };

    restaurar();

    // Listener para cuando se recibe una notificación estando en foreground
    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        const notifId = notification.request.identifier;
        // Marcar automáticamente como "recibida" en el estado
        setRecordatorios((prev) =>
          prev.map((r) =>
            r.notificationId === notifId ? { ...r, notificationId: null } : r
          )
        );
      }
    );

    return () => {
      notificationListener.current?.remove();
    };
  }, []);

  // ── Persistir en AsyncStorage cada vez que cambia el estado ───────────────
  const persistir = useCallback(async (lista: Recordatorio[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch (err) {
      console.error('[LocalNotif] Error al persistir:', err);
    }
  }, []);

  
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
    console.log('[LocalNotif] Permiso actual:', existingPermission);

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
      console.log('[LocalNotif] Permiso luego de solicitar:', requestedPermission);

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
    async ({ titulo, descripcion, fechaProgramada }: NuevoRecordatorio) => {
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
        console.log('[LocalNotif] Notificación programada, ID:', notifId);
      }

      const nuevo: Recordatorio = {
        id: Date.now().toString(),
        titulo,
        descripcion,
        fechaProgramada: fechaProgramada.getTime(),
        notificationId: notifId,
        completado: false,
        creadoEn: Date.now(),
      };

      setRecordatorios((prev) => {
        const actualizada = [nuevo, ...prev];
        persistir(actualizada);
        return actualizada;
      });
    },
    [permissionStatus, requestPermission, persistir]
  );

  
  const eliminarRecordatorio = useCallback(
    async (id: string) => {
      setRecordatorios((prev) => {
        const item = prev.find((r) => r.id === id);
        if (item?.notificationId) {
          // Cancelar la notificación si aún no se disparó
          cancelScheduledNotificationAsync(item.notificationId).catch(
            console.error
          );
        }
        const actualizada = prev.filter((r) => r.id !== id);
        persistir(actualizada);
        return actualizada;
      });
    },
    [persistir]
  );

  
  const marcarCompletado = useCallback(
    async (id: string) => {
      setRecordatorios((prev) => {
        const actualizada = prev.map((r) => {
          if (r.id === id) {
            if (r.notificationId) {
              cancelScheduledNotificationAsync(r.notificationId).catch(
                console.error
              );
            }
            return { ...r, completado: true, notificationId: null };
          }
          return r;
        });
        persistir(actualizada);
        return actualizada;
      });
    },
    [persistir]
  );

  
  const limpiarTodos = useCallback(async () => {
    await cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(STORAGE_KEY);
    setRecordatorios([]);
  }, []);

  return {
    recordatorios,
    permissionStatus,
    cargando,
    requestPermission,
    agregarRecordatorio,
    eliminarRecordatorio,
    marcarCompletado,
    limpiarTodos,
  };
}
