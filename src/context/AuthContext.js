import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/api';

// Création du contexte d'authentification
const AuthContext = createContext();

// Provider du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérification de l'authentification au chargement de l'application
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const userJson = await AsyncStorage.getItem('user');
          if (userJson) {
            const userData = JSON.parse(userJson);
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token présent mais pas d'informations utilisateur
            await logout();
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;
      
      // Sauvegarde du token et des données utilisateur
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      
      let errorMessage = 'Erreur lors de la connexion. Veuillez réessayer.';
      
      if (error.response) {
        // Erreur retournée par le serveur
        errorMessage = error.response.data.error || errorMessage;
      } else if (error.request) {
        // Pas de réponse du serveur
        errorMessage = 'Impossible de joindre le serveur. Vérifiez votre connexion internet.';
      }
      
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction de déconnexion
  const logout = async () => {
    setLoading(true);
    
    try {
      // Appel API de déconnexion (facultatif si le serveur le gère)
      await authAPI.logout().catch(() => {
        // Ignorer les erreurs lors de la déconnexion
      });
      
      // Suppression des données locales
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour mettre à jour le profil utilisateur
  const updateProfile = async (userData) => {
    try {
      // Mise à jour des données utilisateur en local
      const updatedUser = { ...user, ...userData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return { success: false, message: 'Erreur lors de la mise à jour du profil.' };
    }
  };
  
  // Fonction pour gérer la récupération de mot de passe
  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation de mot de passe:', error);
      
      let errorMessage = 'Erreur lors de la demande de réinitialisation. Veuillez réessayer.';
      
      if (error.response) {
        errorMessage = error.response.data.error || errorMessage;
      }
      
      return { success: false, message: errorMessage };
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        loading, 
        error,
        login,
        logout,
        updateProfile,
        forgotPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  
  return context;
};

export default AuthContext;