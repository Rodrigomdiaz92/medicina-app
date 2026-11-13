import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recordatorio } from '../types';

interface RecordatoriosState {
  recordatorios: Recordatorio[];
  agregarRecordatorioStore: (nuevo: Recordatorio) => void;
  eliminarRecordatorioStore: (id: string) => void;
  completarRecordatorioStore: (id: string) => void;
  actualizarRecordatorioStore: (id: string, cambios: Partial<Recordatorio>) => void;
  limpiarRecordatoriosStore: () => void;
  verificarExpirados: () => void;
}

export const useRecordatoriosStore = create<RecordatoriosState>()(
  persist(
    (set) => ({
      recordatorios: [],

      agregarRecordatorioStore: (nuevo) =>
        set((state) => ({
          recordatorios: [nuevo, ...state.recordatorios],
        })),

      eliminarRecordatorioStore: (id) =>
        set((state) => ({
          recordatorios: state.recordatorios.filter((r) => r.id !== id),
        })),

      completarRecordatorioStore: (id) =>
        set((state) => ({
          recordatorios: state.recordatorios.map((r) =>
            r.id === id ? { ...r, completado: true, notificationId: null } : r
          ),
        })),

      actualizarRecordatorioStore: (id, cambios) =>
        set((state) => ({
          recordatorios: state.recordatorios.map((r) =>
            r.id === id ? { ...r, ...cambios } : r
          ),
        })),

      limpiarRecordatoriosStore: () => set({ recordatorios: [] }),

      verificarExpirados: () =>
        set((state) => {
          const ahora = Date.now();
          return {
            recordatorios: state.recordatorios.map((r) =>
              !r.completado && r.fechaProgramada < ahora && r.notificationId
                ? { ...r, notificationId: null }
                : r
            ),
          };
        }),
    }),
    {
      name: '@notifications_recordatorios', // Mantiene compatibilidad con tu clave anterior
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);