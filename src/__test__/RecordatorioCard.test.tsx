import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RecordatorioCard } from '../components/RecordatorioCard';
import { Recordatorio } from '../types';

const recordatorioPendiente: Recordatorio = {
  id: 'rec-10',
  titulo: 'Amoxicilina 500mg',
  descripcion: 'Dosis: 1 pastilla - Cada 8 horas',
  fechaProgramada: Date.now() + 7200000,
  creadoEn: Date.now(),
  completado: false,
  notificationId: 'notif-999',
  ubicacion: {
    latitude: -34.706,
    longitude: -58.278,
    direccion: 'Farmacia Central 123',
  },
  contacto: {
    id: 'c-1',
    nombre: 'Dr. García',
    telefono: '1155443322',
  },
  calendarEventId: 'cal-evt-1',
};

describe('RecordatorioCard Component', () => {
  test('renderiza título, dosis y metadatos nativos (farmacia, contacto y calendario)', () => {
    const { getByText } = render(
      <RecordatorioCard
        recordatorio={recordatorioPendiente}
        onCompletar={jest.fn()}
        onEliminar={jest.fn()}
      />
    );

    expect(getByText('Amoxicilina 500mg')).toBeTruthy();
    expect(getByText('Dosis: 1 pastilla - Cada 8 horas')).toBeTruthy();
    expect(getByText(/Farmacia Central 123/)).toBeTruthy();
    expect(getByText(/Dr. García/)).toBeTruthy();
    expect(getByText(/Agendado en calendario/)).toBeTruthy();
  });

  test('dispara onCompletar y onEliminar con el id correcto', () => {
    const onCompletarMock = jest.fn();
    const onEliminarMock = jest.fn();

    const { getByText } = render(
      <RecordatorioCard
        recordatorio={recordatorioPendiente}
        onCompletar={onCompletarMock}
        onEliminar={onEliminarMock}
      />
    );

    fireEvent.press(getByText('✓ Completar'));
    expect(onCompletarMock).toHaveBeenCalledWith('rec-10');

    fireEvent.press(getByText('✕ Eliminar'));
    expect(onEliminarMock).toHaveBeenCalledWith('rec-10');
  });

  test('oculta el botón Completar cuando el recordatorio ya está completado', () => {
    const completado: Recordatorio = {
      ...recordatorioPendiente,
      completado: true,
      notificationId: null,
    };

    const { queryByText, getByText } = render(
      <RecordatorioCard
        recordatorio={completado}
        onCompletar={jest.fn()}
        onEliminar={jest.fn()}
      />
    );

    expect(getByText('Completado')).toBeTruthy();
    expect(queryByText('✓ Completar')).toBeNull();
  });
});