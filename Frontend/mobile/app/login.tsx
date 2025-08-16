import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth/loginService';
import { useNetworkError } from '@/hooks/useNetworkError';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { handleAndShowError } = useNetworkError();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login with:', { email, password: '***' });
      const result = await authService.login(email, password);
      console.log('Login result:', { success: result.success, message: result.message });
      
      if (result.success && result.data) {
        console.log('Login successful, analyzing response data:', result.data);
        
        // Verificar si los datos del usuario están en el lugar correcto
        const userData = result.data.user || result.data;
        const tokenData = result.data.token;
        
        console.log('Extracted user data:', userData);
        console.log('Extracted token:', tokenData);
        
        if (userData) {
          await login({ 
            user: userData, 
            token: tokenData,
            password: password 
          });
          console.log('Context login completed, checking user roles for redirect');
          
          // Verificar roles y redirigir según corresponda
          const userRoles = userData.roles || userData.authorities || [];
          const hasAdminRole = userRoles.some((role: any) => 
            ['ROLE_ADMIN', 'ADMIN', 'Admin', 'admin'].includes(role.name || role)
          );
          const hasTechnicianRole = userRoles.some((role: any) => 
            ['ROLE_TECHNICIAN', 'TECHNICIAN', 'Technician', 'technician'].includes(role.name || role)
          );
          
          console.log('User roles detected:', {
            roles: userRoles,
            hasAdminRole,
            hasTechnicianRole
          });
          
          // Pequeña pausa para asegurar que el estado se actualice
          setTimeout(() => {
            if (hasAdminRole) {
              console.log('Redirecting to admin tabs');
              router.replace('/(tabs)');
            } else if (hasTechnicianRole) {
              console.log('Redirecting to technician tabs');
              router.replace('/(technician)');
            } else {
              console.log('No specific role found, redirecting to admin by default');
              router.replace('/(tabs)');
            }
          }, 100);
        } else {
          console.error('No user data found in response');
          Alert.alert('Error', 'No se encontraron datos del usuario');
        }
      } else {
        console.log('Login failed:', result.message);
        // Usar el hook de manejo de errores
        handleAndShowError(
          new Error(result.message || 'Error al iniciar sesión'),
          undefined,
          () => setPassword('') // Limpiar contraseña en caso de error
        );
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Usar el hook de manejo de errores
      handleAndShowError(
        error,
        undefined,
        () => setPassword('') // Limpiar contraseña en caso de error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>PlagiSmart Admin</Text>
          <Text style={styles.subtitle}>Iniciar Sesión</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Ingrese su correo"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Ingrese su contraseña"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 40,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});