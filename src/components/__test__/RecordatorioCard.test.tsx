import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { RecordatorioCard } from '../RecordatorioCard';
import { Recordatorio } from '../../types';

describe('Componente: RecordatorioCard', () => {
  const mockRecordatorio: Recordatorio = {
    id: '1',
    titulo: 'Ibuprofeno 400mg',
    descripcion: 'Dosis: 1 pastilla',
    fechaProgramada: Date.now() + 60000, 
    notificationId: 'notif-123',
    completado: false,
    creadoEn: Date.now(),
  };

  it('renderiza el título y la descripción de la medicina', () => {
    render(
      <RecordatorioCard
        recordatorio={mockRecordatorio}
        onEliminar={jest.fn()}
        onCompletar={jest.fn()}
      />
    );

    expect(screen.getByText('Ibuprofeno 400mg')).toBeTruthy();
    expect(screen.getByText('Dosis: 1 pastilla')).toBeTruthy();
  });

  it('dispara la acción de completar cuando se presiona el botón ✓ Completar', () => {
    const handleCompletar = jest.fn();
    render(
      <RecordatorioCard
        recordatorio={mockRecordatorio}
        onEliminar={jest.fn()}
        onCompletar={handleCompletar}
      />
    );

    fireEvent.press(screen.getByText('✓ Completar'));
    expect(handleCompletar).toHaveBeenCalledWith('1');
  });

  it('dispara la acción de eliminar cuando se presiona el botón ✕ Eliminar', () => {
    const handleEliminar = jest.fn();
    render(
      <RecordatorioCard
        recordatorio={mockRecordatorio}
        onEliminar={handleEliminar}
        onCompletar={jest.fn()}
      />
    );

    fireEvent.press(screen.getByText('✕ Eliminar'));
    expect(handleEliminar).toHaveBeenCalledWith('1');
  });
});