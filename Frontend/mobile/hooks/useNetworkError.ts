import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

interface NetworkError {
  message: string;
  type: 'auth' | 'network' | 'server' | 'unknown';
}

export const useNetworkError = () => {
  const [isHandlingError, setIsHandlingError] = useState(false);

  const handleError = useCallback((error: any, customMessage?: string): NetworkError => {
    console.error('Network error handled:', error);
    
    let errorMessage = customMessage || 'Error de conexión';
    let errorType: NetworkError['type'] = 'unknown';
    
    if (error && error.message) {
      const lowerMessage = error.message.toLowerCase();
      
      // Errores de autenticación
      if (lowerMessage.includes('unauthorized') || 
          lowerMessage.includes('401') ||
          lowerMessage.includes('bad credentials') ||
          lowerMessage.includes('invalid credentials') ||
          lowerMessage.includes('credenciales') ||
          lowerMessage.includes('authentication failed')) {
        errorMessage = 'Correo electrónico o contraseña incorrectos';
        errorType = 'auth';
      }
      // Errores de red
      else if (lowerMessage.includes('network') || 
               lowerMessage.includes('fetch') ||
               lowerMessage.includes('timeout') ||
               lowerMessage.includes('abort') ||
               lowerMessage.includes('connection') ||
               lowerMessage.includes('net::')) {
        errorMessage = 'Error de conexión. Verifique su conexión a internet';
        errorType = 'network';
      }
      // Errores del servidor
      else if (lowerMessage.includes('500') ||
               lowerMessage.includes('internal server') ||
               lowerMessage.includes('server error')) {
        errorMessage = 'Error del servidor. Inténtelo más tarde';
        errorType = 'server';
      }
      // Otros errores
      else {
        errorMessage = error.message;
        errorType = 'unknown';
      }
    }
    
    return {
      message: errorMessage,
      type: errorType
    };
  }, []);

  const showErrorAlert = useCallback((error: NetworkError, onDismiss?: () => void) => {
    if (isHandlingError) return; // Evitar múltiples alerts
    
    setIsHandlingError(true);
    
    const title = error.type === 'auth' ? 'Error de Autenticación' :
                  error.type === 'network' ? 'Error de Conexión' :
                  error.type === 'server' ? 'Error del Servidor' :
                  'Error';
    
    Alert.alert(
      title,
      error.message,
      [
        {
          text: 'OK',
          onPress: () => {
            setIsHandlingError(false);
            onDismiss?.();
          }
        }
      ]
    );
  }, [isHandlingError]);

  const handleAndShowError = useCallback((error: any, customMessage?: string, onDismiss?: () => void) => {
    const networkError = handleError(error, customMessage);
    showErrorAlert(networkError, onDismiss);
    return networkError;
  }, [handleError, showErrorAlert]);

  return {
    handleError,
    showErrorAlert,
    handleAndShowError,
    isHandlingError
  };
};
