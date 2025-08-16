import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: Array<{ name: string }>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (loginData: { user: any; token?: string; password?: string }) => Promise<void>;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokenRefreshInterval, setTokenRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Sincronizar isAuthenticated con el estado del usuario
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  useEffect(() => {
    // Verificar si hay datos de autenticación al iniciar
    checkAuthData();
  }, []);

  // Limpiar interval al desmontar
  useEffect(() => {
    return () => {
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
      }
    };
  }, [tokenRefreshInterval]);

  const checkAuthData = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userDataStr = await AsyncStorage.getItem('user_data');
      
      console.log('AuthContext - Checking auth data:', { 
        hasToken: !!token, 
        hasUserData: !!userDataStr,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
      });
      
      if (token && userDataStr) {
        const userData = JSON.parse(userDataStr);
        console.log('AuthContext - User data loaded:', userData.email);
        
        // Verificar que el token sea válido antes de establecer el usuario
        const { apiService } = await import('@/services/api/apiService');
        const isTokenValid = await apiService.verifyToken();
        
        if (isTokenValid) {
          console.log('AuthContext - Token is valid, setting user');
          setUser(userData);
          
          // Iniciar renovación automática si los datos están presentes
          if (userData.email) {
            startTokenRefresh(userData.email);
          }
        } else {
          console.log('AuthContext - Token is invalid, clearing auth data');
          await AsyncStorage.multiRemove(['auth_token', 'user_data', 'temp_password']);
          setUser(null);
        }
      } else {
        console.log('AuthContext - No valid auth data found');
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth data:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const startTokenRefresh = (userEmail: string) => {
    // Limpiar cualquier interval anterior
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval);
    }

    // Configurar renovación automática cada 4 minutos (240 segundos)
    const interval = setInterval(async () => {
      console.log('AuthContext - Attempting automatic token refresh...');
      try {
        // Usar el mismo servicio de login con las credenciales guardadas
        const { authService } = await import('@/services/auth/loginService');
        
        // Nota: En un entorno de producción, deberías usar un refresh token
        // Por ahora, usaremos las credenciales del usuario
        const storedPassword = await AsyncStorage.getItem('temp_password');
        if (storedPassword && userEmail) {
          const result = await authService.login(userEmail, storedPassword);
          if (result.success && result.data) {
            console.log('AuthContext - Token refreshed successfully');
            // No necesitamos actualizar el usuario, solo el token se actualizó
          } else {
            console.error('AuthContext - Failed to refresh token:', result.message);
          }
        }
      } catch (error) {
        console.error('AuthContext - Error during token refresh:', error);
      }
    }, 4 * 60 * 1000); // 4 minutos

    setTokenRefreshInterval(interval as any);
    console.log('AuthContext - Token refresh scheduled every 4 minutes');
  };

  const login = async (loginData: { user: any; token?: string; password?: string }) => {
    try {
      console.log('=== AUTHCONTEXT LOGIN DEBUG ===');
      console.log('Login data received:', {
        hasUser: !!loginData.user,
        hasToken: !!loginData.token,
        hasPassword: !!loginData.password,
        userPreview: loginData.user ? loginData.user.email || loginData.user.correo : 'No user'
      });
      
      // Validar que tenemos datos mínimos necesarios
      if (!loginData.user) {
        throw new Error('No se recibieron datos del usuario');
      }
      
      // Validar y normalizar los datos del usuario
      const normalizedUser: User = {
        id: loginData.user.id || loginData.user.userId || 0,
        firstName: loginData.user.firstName || loginData.user.first_name || loginData.user.nombre || '',
        lastName: loginData.user.lastName || loginData.user.last_name || loginData.user.apellido || '',
        email: loginData.user.email || loginData.user.correo || '',
        roles: loginData.user.roles || loginData.user.authorities || [{ name: 'USER' }]
      };
      
      console.log('Normalized user data:', normalizedUser);
      
      // Guardar datos del usuario en AsyncStorage PRIMERO
      await AsyncStorage.setItem('user_data', JSON.stringify(normalizedUser));
      
      // Si se proporciona un token, guardarlo sin prefijo (consistente con web)
      if (loginData.token) {
        console.log('Saving token to storage:', loginData.token.substring(0, 30) + '...');
        await AsyncStorage.setItem('auth_token', loginData.token);
      } else {
        console.log('WARNING: No token provided in login data');
        // No lanzar error aquí, algunos flujos pueden no requerir token inmediatamente
      }

      // Guardar password temporalmente para renovación automática (solo para desarrollo)
      if (loginData.password) {
        await AsyncStorage.setItem('temp_password', loginData.password);
      }
      
      // Verificar que todo se guardó correctamente
      const savedToken = await AsyncStorage.getItem('auth_token');
      const savedUserData = await AsyncStorage.getItem('user_data');
      
      console.log('Storage verification:', {
        tokenSaved: !!savedToken,
        userDataSaved: !!savedUserData,
        tokenPreview: savedToken ? savedToken.substring(0, 30) + '...' : 'NULL'
      });
      
      // Solo establecer el usuario - isAuthenticated se sincronizará automáticamente
      setUser(normalizedUser);
      
      // Iniciar renovación automática del token
      startTokenRefresh(normalizedUser.email);
      
      console.log('AuthContext login completed successfully');
      console.log('==============================');
    } catch (error: any) {
      console.error('Error saving login data:', error);
      // En caso de error, asegurar que el estado sea consistente
      setUser(null);
      
      // Limpiar datos corruptos si los hay
      try {
        await AsyncStorage.multiRemove(['auth_token', 'user_data', 'temp_password']);
      } catch (cleanupError) {
        console.error('Error cleaning up auth data:', cleanupError);
      }
      
      // Re-lanzar el error para que la UI pueda manejarlo
      throw new Error(error.message || 'Error al guardar datos de autenticación');
    }
  };

  const logout = async () => {
    try {
      // Limpiar interval de renovación
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
        setTokenRefreshInterval(null);
      }
      
      await AsyncStorage.multiRemove(['auth_token', 'user_data', 'temp_password']);
      setUser(null);
      // isAuthenticated se sincronizará automáticamente cuando user sea null
      console.log('AuthContext - Logged out and token refresh stopped');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const hasRole = (roles: string[]) => {
    if (!user || !user.roles) {
      return false;
    }
    const userRoles = user.roles.map(role => role.name);
    return roles.some(role => userRoles.includes(role));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};