import React, { useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Title, HelperText, ActivityIndicator, useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import useFormValidation from '../hooks/useFormValidation';

/**
 * Écran de connexion à l'application
 */
const LoginScreen = () => {
  const theme = useTheme();
  const { login, error: authError, loading } = useAuth();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loginError, setLoginError] = useState(null);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  // Règles de validation pour le formulaire de connexion
  const loginValidationRules = (data) => {
    const errors = {};
    
    if (!data.email) {
      errors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    if (!forgotPasswordMode && !data.password) {
      errors.password = 'Le mot de passe est obligatoire';
    }
    
    return errors;
  };

  // Initialisation du formulaire avec useFormValidation
  const { 
    formData, 
    errors, 
    handleChange, 
    validateForm, 
    resetForm 
  } = useFormValidation(
    { email: '', password: '' }, 
    loginValidationRules
  );

  // Gestion de la soumission du formulaire
  const handleSubmit = async () => {
    setLoginError(null);
    
    if (!validateForm()) {
      return;
    }
    
    if (forgotPasswordMode) {
      // Logique de mot de passe oublié
      const { success, message } = await handleForgotPassword(formData.email);
      
      if (success) {
        setLoginError(null);
        alert('Un email de réinitialisation a été envoyé à votre adresse email.');
        setForgotPasswordMode(false);
      } else {
        setLoginError(message);
      }
    } else {
      // Logique de connexion
      const { success, message } = await login(formData.email, formData.password);
      
      if (!success) {
        setLoginError(message || 'Échec de la connexion. Veuillez vérifier vos identifiants.');
      }
    }
  };

  // Fonction pour gérer la demande de réinitialisation de mot de passe
  const handleForgotPassword = async (email) => {
    try {
      await forgotPassword(email);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      return { 
        success: false, 
        message: 'Impossible d\'envoyer l\'email de réinitialisation. Veuillez réessayer.' 
      };
    }
  };

  // Basculer entre le mode de connexion et de réinitialisation de mot de passe
  const toggleForgotPasswordMode = () => {
    setForgotPasswordMode(!forgotPasswordMode);
    setLoginError(null);
    resetForm();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Title style={styles.appTitle}>KinéBilan</Title>
          <Text style={styles.appSubtitle}>La gestion de vos patients simplifiée</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Title style={styles.formTitle}>
            {forgotPasswordMode ? 'Réinitialiser le mot de passe' : 'Connexion'}
          </Title>
          
          {/* Affichage des erreurs */}
          {(loginError || authError) && (
            <HelperText type="error" style={styles.errorMessage}>
              {loginError || authError}
            </HelperText>
          )}
          
          {/* Champ Email */}
          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={loading}
            error={!!errors.email}
            left={<TextInput.Icon icon="email" />}
          />
          {errors.email && <HelperText type="error">{errors.email}</HelperText>}
          
          {/* Champ Mot de passe (uniquement en mode connexion) */}
          {!forgotPasswordMode && (
            <>
              <TextInput
                label="Mot de passe"
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                mode="outlined"
                style={styles.input}
                secureTextEntry={secureTextEntry}
                disabled={loading}
                error={!!errors.password}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon 
                    icon={secureTextEntry ? "eye" : "eye-off"} 
                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                  />
                }
              />
              {errors.password && <HelperText type="error">{errors.password}</HelperText>}
            </>
          )}
          
          {/* Bouton de connexion/réinitialisation */}
          <Button 
            mode="contained" 
            onPress={handleSubmit}
            style={styles.submitButton}
            loading={loading}
            disabled={loading}
          >
            {forgotPasswordMode ? 'Envoyer les instructions' : 'Se connecter'}
          </Button>
          
          {/* Lien de mot de passe oublié/retour à la connexion */}
          <TouchableOpacity 
            onPress={toggleForgotPasswordMode}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>
              {forgotPasswordMode 
                ? 'Retour à la connexion' 
                : 'Mot de passe oublié ?'
              }
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>© {new Date().getFullYear()} KinéBilan</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
      
      {/* Indicateur de chargement plein écran */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
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
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  errorMessage: {
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  forgotPasswordContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#5b9bd5',
    fontSize: 14,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default LoginScreen;