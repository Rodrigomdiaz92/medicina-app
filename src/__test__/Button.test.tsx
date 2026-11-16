import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../components/ui/Button';

describe('Button Component', () => {
  test('renderiza el label correctamente y dispara onPress al presionar', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button label="Guardar" onPress={onPressMock} />);

    const boton = getByText('Guardar');
    expect(boton).toBeTruthy();

    fireEvent.press(boton);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  test('no dispara onPress cuando disabled es true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button label="Guardar" onPress={onPressMock} disabled />
    );

    fireEvent.press(getByText('Guardar'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  test('oculta el label y muestra indicador de carga cuando loading es true', () => {
    const onPressMock = jest.fn();
    const { queryByText } = render(
      <Button label="Guardar" onPress={onPressMock} loading />
    );

    expect(queryByText('Guardar')).toBeNull();
  });
});