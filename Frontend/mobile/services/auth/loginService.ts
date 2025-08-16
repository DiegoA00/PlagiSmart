import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../api/apiService';

const AUTH_TOKEN_KEY = 'auth_token';
const TOKEN_TYPE_KEY = 'token_type';
const USER_DATA_KEY = 'user_data';

export const authService = {
  async setAuthData(token: string, tokenType = 'Bearer', userData: any = null) {
    try {
      // Store complete authorization header like web does
      const authHeader = `${tokenType || 'Bearer'} ${token}`.trim().replace(/\s+/g, ' ');
      const cleanTokenType = (tokenType || 'Bearer').trim();
      
      await AsyncStorage.multiSet([
        [AUTH_TOKEN_KEY, authHeader],
        [TOKEN_TYPE_KEY, cleanTokenType],
        [USER_DATA_KEY, userData ? JSON.stringify(userData) : '']
      ]);
    } catch (error) {
      console.error('Error setting auth data:', error);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async getAuthHeader(): Promise<string | null> {
    try {
      // Return the stored auth header (which already contains "Bearer token")
      const authHeader = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return authHeader ? authHeader.trim() : null;
    } catch (error) {
      console.error('Error getting auth header:', error);
      return null;
    }
  },

  async getUserData(): Promise<any | null> {
    try {
      const userDataStr = await AsyncStorage.getItem(USER_DATA_KEY);
      return userDataStr ? JSON.parse(userDataStr) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, TOKEN_TYPE_KEY, USER_DATA_KEY]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return !!(token && userData);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  async login(email: string, password: string, rememberMe: boolean = false): Promise<{
    success: boolean;
    data?: { token: string; user: any };
    message?: string;
  }> {
    try {
      // Primera llamada: obtener token
      const authResponse = await apiService.postWithoutAuth<{ token: string; tokenType?: string }>('/auth/login', {
        email,
        password
      });

      if (!authResponse.success) {
        // Manejar errores específicos de autenticación
        let errorMessage = 'Error al iniciar sesión';
        
        if (authResponse.message) {
          // Buscar mensajes específicos de credenciales incorrectas
          const lowerMessage = authResponse.message.toLowerCase();
          if (lowerMessage.includes('bad credentials') || 
              lowerMessage.includes('invalid credentials') ||
              lowerMessage.includes('credenciales inválidas') ||
              lowerMessage.includes('usuario no encontrado') ||
              lowerMessage.includes('contraseña incorrecta') ||
              lowerMessage.includes('email o contraseña incorrectos')) {
            errorMessage = 'Correo electrónico o contraseña incorrectos';
          } else if (lowerMessage.includes('unauthorized') || 
                     lowerMessage.includes('no autorizado')) {
            errorMessage = 'Credenciales incorrectas';
          } else if (lowerMessage.includes('timeout') || 
                     lowerMessage.includes('connection')) {
            errorMessage = 'Error de conexión. Verifique su conexión a internet';
          } else {
            errorMessage = authResponse.message;
          }
        }
        
        return {
          success: false,
          message: errorMessage
        };
      }

      if (!authResponse.data || !authResponse.data.token) {
        return {
          success: false,
          message: 'No se recibió el token de autenticación'
        };
      }

      const { token, tokenType } = authResponse.data;
      console.log('Auth token received:', { token: token.substring(0, 10) + '...', tokenType });
      
      // Debug: Check for spaces in received token
      console.log('=== TOKEN RECEIVED DEBUG ===');
      console.log('Token length:', token.length);
      console.log('Token contains spaces:', token.includes(' '));
      console.log('Token type:', `"${tokenType}"`);
      console.log('Raw token preview:', `"${token.substring(0, 50)}..."`);
      console.log('===========================');

      // Segunda llamada: obtener datos del usuario usando el token
      try {
        const userResponse = await fetch(`${apiService.baseURL}/users/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${tokenType || 'Bearer'} ${token}`
          }
        });

        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          console.error('User data fetch error:', errorText);
          return {
            success: false,
            message: 'Error al obtener datos del usuario. Inténtelo nuevamente.'
          };
        }

        const userData = await userResponse.json();
        console.log('User data received:', userData);

        // Store the complete authorization header like web does
        // The web stores the full "Bearer token" string in auth_token
        const authHeader = `${tokenType || 'Bearer'} ${token}`.trim().replace(/\s+/g, ' ');
        await AsyncStorage.setItem('auth_token', authHeader);
        await AsyncStorage.setItem('token_type', (tokenType || 'Bearer').trim());
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        
        // Verificar que se guardó correctamente
        const savedToken = await AsyncStorage.getItem('auth_token');
        const savedUserData = await AsyncStorage.getItem('user_data');
        
        console.log('=== LOGIN VERIFICATION ===');
        console.log('Token saved successfully:', !!savedToken);
        console.log('User data saved successfully:', !!savedUserData);
        console.log('Saved token preview:', savedToken ? savedToken.substring(0, 30) + '...' : 'NULL');
        console.log('=========================');

        return {
          success: true,
          data: {
            token,
            user: userData
          }
        };
      } catch (userError: any) {
        console.error('Error fetching user data:', userError);
        return {
          success: false,
          message: 'Error al obtener datos del usuario. Inténtelo nuevamente.'
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Manejar errores específicos de red
      let errorMessage = 'Error de conexión';
      
      if (error.message) {
        const lowerMessage = error.message.toLowerCase();
        if (lowerMessage.includes('network') || 
            lowerMessage.includes('fetch') ||
            lowerMessage.includes('timeout') ||
            lowerMessage.includes('abort')) {
          errorMessage = 'Error de conexión. Verifique su conexión a internet';
        } else if (lowerMessage.includes('unauthorized') || 
                   lowerMessage.includes('401')) {
          errorMessage = 'Correo electrónico o contraseña incorrectos';
        } else if (lowerMessage.includes('bad credentials') || 
                   lowerMessage.includes('invalid credentials')) {
          errorMessage = 'Credenciales incorrectas';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }
};