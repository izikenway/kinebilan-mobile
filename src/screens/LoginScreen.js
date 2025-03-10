import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Title, ActivityIndicator, useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

/**
 * Écran de connexion à l'application
 */
const LoginScreen = () => {
  const theme = useTheme();
  const { login, loading } = useAuth();
  
  // États
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Fonction de connexion
  const handleLogin = async () => {
    // Validation des champs
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (!password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Tentative de connexion
    const result = await login(email, password);
    
    if (!result.success) {
      setErrors({ general: result.message });
    }
  };
  
  // Fonction pour récupérer le mot de passe
  const handleForgotPassword = () => {
    // Navigation vers l'écran de récupération de mot de passe
    // À implémenter
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Title style={styles.title}>KinéBilan</Title>
          <Text style={styles.subtitle}>Application de gestion pour kinésithérapeutes</Text>
        </View>
        
        <View style={styles.formContainer}>
          {errors.general && (
            <Text style={styles.errorGeneral}>{errors.general}</Text>
          )}
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors({ ...errors, email: null, general: null });
            }}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.email}
            disabled={loading}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
          
          <TextInput
            label="Mot de passe"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: null, general: null });
            }}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showPassword}
            error={!!errors.password}
            disabled={loading}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
          
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
          
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
            disabled={loading}
            loading={loading}
          >
            Se connecter
          </Button>
          
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 8,
  },
  errorGeneral: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#2196F3',
    fontSize: 14,
  },
  loginButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 24,
  },
});

export default LoginScreen;