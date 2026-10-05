import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService, UserProfile } from '../userService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('userService (Lógica de negocio y persistencia)', () => {
  const mockUser: UserProfile = {
    nombre: 'Juan Pérez',
    email: 'juan@medicina.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getUser: obtiene y parsea los datos del usuario correctamente', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockUser));

    const result = await userService.getUser();

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('@medicina_app_user');
    expect(result).toEqual(mockUser);
  });

  it('saveUser: serializa y guarda los datos en AsyncStorage', async () => {
    (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined);

    await userService.saveUser(mockUser);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@medicina_app_user',
      JSON.stringify(mockUser)
    );
  });

  it('clearUser: elimina la clave del usuario al cerrar sesión', async () => {
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValueOnce(undefined);

    await userService.clearUser();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@medicina_app_user');
  });
});