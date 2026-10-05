import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  nombre: string;
  email: string;
  telefono?: string;
  grupoSanguineo?: string;
  obraSocial?: string;
  numeroAfiliado?: string;
  fotoUrl?: string;
}

const USER_STORAGE_KEY = '@medicina_app_user';

export const userService = {
  async getUser(): Promise<UserProfile | null> {
    try {
      const json = await AsyncStorage.getItem(USER_STORAGE_KEY);
      return json ? JSON.parse(json) : null;
    } catch (e) {
      console.error('Error leyendo usuario:', e);
      return null;
    }
  },

  async saveUser(user: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error guardando usuario:', e);
      throw e;
    }
  },

  async clearUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.error('Error borrando usuario:', e);
      throw e;
    }
  },
};