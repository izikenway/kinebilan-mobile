import { useState } from 'react';

/**
 * Hook personnalisé pour la validation des formulaires
 * @param {Object} initialFormData - Données initiales du formulaire
 * @param {Function} validationRules - Fonction contenant les règles de validation
 * @returns {Object} Objet contenant les données, erreurs et fonctions de gestion
 */
const useFormValidation = (initialFormData, validationRules) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  /**
   * Met à jour un champ du formulaire
   * @param {string} field - Nom du champ
   * @param {any} value - Nouvelle valeur
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur du champ si elle existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  /**
   * Valide le formulaire selon les règles fournies
   * @returns {boolean} Indique si le formulaire est valide
   */
  const validateForm = () => {
    const newErrors = validationRules(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Réinitialise le formulaire à ses valeurs initiales
   */
  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  /**
   * Met à jour l'ensemble du formulaire
   * @param {Object} newData - Nouvelles données complètes
   */
  const setFormValues = (newData) => {
    setFormData(newData);
  };

  return {
    formData,
    errors,
    handleChange,
    validateForm,
    resetForm,
    setFormValues,
    setErrors
  };
};

export default useFormValidation;