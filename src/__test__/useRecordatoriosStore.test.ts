import { useRecordatoriosStore } from '../store/useRecordatoriosStore';
import { Recordatorio } from '../types';

const mockRecordatorio: Recordatorio = {
  id: 'rec-1',
  titulo: 'Ibuprofeno 400mg',
  descripcion: 'Dosis: 1 pastilla',
  fechaProgramada: Date.now() + 3600000,
  creadoEn: Date.now(),
  completado: false,
  notificationId: 'notif-123',
};

describe('useRecordatoriosStore (Zustand)', () => {
  beforeEach(() => {
    useRecordatoriosStore.getState().limpiarRecordatoriosStore();
  });

  test('agrega un nuevo recordatorio al inicio de la lista', () => {
    useRecordatoriosStore.getState().agregarRecordatorioStore(mockRecordatorio);

    const { recordatorios } = useRecordatoriosStore.getState();
    expect(recordatorios).toHaveLength(1);
    expect(recordatorios[0].titulo).toBe('Ibuprofeno 400mg');
    expect(recordatorios[0].completado).toBe(false);
  });

  test('marca un recordatorio como completado y limpia su notificationId', () => {
    useRecordatoriosStore.getState().agregarRecordatorioStore(mockRecordatorio);
    useRecordatoriosStore.getState().completarRecordatorioStore('rec-1');

    const { recordatorios } = useRecordatoriosStore.getState();
    expect(recordatorios[0].completado).toBe(true);
    expect(recordatorios[0].notificationId).toBeNull();
  });

  test('elimina un recordatorio por su id', () => {
    useRecordatoriosStore.getState().agregarRecordatorioStore(mockRecordatorio);
    useRecordatoriosStore.getState().eliminarRecordatorioStore('rec-1');

    const { recordatorios } = useRecordatoriosStore.getState();
    expect(recordatorios).toHaveLength(0);
  });
});