import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Button } from '../ui/Button';

describe('Componente Reutilizable: Button', () => {
  it('renderiza el texto del botón correctamente', () => {
    render(<Button label="Guardar Recordatorio" onPress={jest.fn()} />);
    expect(screen.getByText('Guardar Recordatorio')).toBeTruthy();
  });

  it('dispara la función onPress al hacer clic', () => {
    const handlePress = jest.fn();
    render(<Button label="Aceptar" onPress={handlePress} />);

    fireEvent.press(screen.getByText('Aceptar'));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });
});