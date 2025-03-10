import { useState } from 'react';
import { Alert } from 'react-native';

/**
 * Hook personnalisé pour la gestion des requêtes API
 * @returns {Object} Fonctions et états pour la gestion des requêtes API
 */
const useApiRequest = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Exécute une requête API avec gestion des états
   * @param {Function} apiCall - Fonction de requête API à exécuter
   * @param {Object} options - Options de la requête
   * @param {boolean} options.refresh - Indique si c'est un rafraîchissement
   * @param {boolean} options.showErrors - Indique si les erreurs doivent être affichées
   * @param {string} options.errorTitle - Titre pour l'alerte d'erreur
   * @param {string} options.errorMessage - Message par défaut pour l'alerte d'erreur
   * @param {Function} options.onSuccess - Fonction à exécuter en cas de succès
   * @param {Function} options.onError - Fonction à exécuter en cas d'erreur
   * @returns {Promise<any>} Résultat de la requête API
   */
  const executeRequest = async (apiCall, options = {}) => {
    const {
      refresh = false,
      showErrors = true,
      errorTitle = 'Erreur',
      errorMessage = 'Une erreur est survenue lors de la communication avec le serveur.',
      onSuccess,
      onError
    } = options;

    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await apiCall();
      
      if (onSuccess) {
        onSuccess(response);
      }
      
      return response;
    } catch (err) {
      console.error('Erreur API:', err);
      
      setError(err);
      
      if (showErrors) {
        let displayMessage = errorMessage;
        
        if (err.response && err.response.data && err.response.data.error) {
          displayMessage = err.response.data.error;
        }
        
        Alert.alert(errorTitle, displayMessage);
      }
      
      if (onError) {
        onError(err);
      }
      
      return null;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Affiche une alerte de confirmation
   * @param {Object} options - Options de l'alerte
   * @param {string} options.title - Titre de l'alerte
   * @param {string} options.message - Message de l'alerte
   * @param {string} options.confirmLabel - Texte du bouton de confirmation
   * @param {string} options.cancelLabel - Texte du bouton d'annulation
   * @param {Function} options.onConfirm - Fonction à exécuter en cas de confirmation
   * @param {Function} options.onCancel - Fonction à exécuter en cas d'annulation
   */
  const showConfirmation = (options = {}) => {
    const {
      title = 'Confirmation',
      message = 'Êtes-vous sûr de vouloir effectuer cette action ?',
      confirmLabel = 'Oui',
      cancelLabel = 'Non',
      onConfirm,
      onCancel
    } = options;

    Alert.alert(
      title,
      message,
      [
        {
          text: cancelLabel,
          onPress: onCancel,
          style: 'cancel',
        },
        {
          text: confirmLabel,
          onPress: onConfirm,
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

  return {
    loading,
    refreshing,
    error,
    executeRequest,
    showConfirmation
  };
};

export default useApiRequest;