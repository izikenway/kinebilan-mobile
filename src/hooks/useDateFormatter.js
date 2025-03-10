import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Hook personnalisé pour le formatage des dates
 * @returns {Object} Fonctions de formatage des dates
 */
const useDateFormatter = () => {
  /**
   * Formate une date au format jour mois année
   * @param {string|Date} dateInput - Date à formater
   * @returns {string} Date formatée
   */
  const formatDate = (dateInput) => {
    if (!dateInput) return '';
    
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return format(date, 'dd MMMM yyyy', { locale: fr });
  };

  /**
   * Formate une date au format jour mois année à heure:minute
   * @param {string|Date} dateInput - Date à formater
   * @returns {string} Date et heure formatées
   */
  const formatDateTime = (dateInput) => {
    if (!dateInput) return '';
    
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  /**
   * Formate une date au format heure:minute
   * @param {string|Date} dateInput - Date à formater
   * @returns {string} Heure formatée
   */
  const formatTime = (dateInput) => {
    if (!dateInput) return '';
    
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return format(date, 'HH:mm', { locale: fr });
  };

  /**
   * Formate une date pour l'API (ISO)
   * @param {Date} date - Date à formater
   * @returns {string} Date au format ISO
   */
  const formatForApi = (date) => {
    if (!date) return '';
    return format(date, "yyyy-MM-dd'T'HH:mm:ss");
  };

  /**
   * Calcule la différence en jours entre deux dates
   * @param {Date} dateA - Première date
   * @param {Date} dateB - Deuxième date
   * @returns {number} Nombre de jours de différence
   */
  const daysBetween = (dateA, dateB) => {
    const diffTime = Math.abs(dateB - dateA);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return {
    formatDate,
    formatDateTime,
    formatTime,
    formatForApi,
    daysBetween
  };
};

export default useDateFormatter;