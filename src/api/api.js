import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration de base d'axios
const API_URL = 'https://api.kinebilan.fr/api';

// Création de l'instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Services API pour l'authentification
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  refreshToken: () => api.post('/auth/refresh-token'),
  logout: () => api.post('/auth/logout'),
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, new_password: newPassword }),
};

// Services API pour les patients
export const patientsAPI = {
  getAll: (params) => api.get('/patients', { params }),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
  search: (query) => api.get('/patients/search', { params: { q: query } }),
  export: (id, format = 'pdf') => api.get(`/patients/${id}/export`, { params: { format } }),
  anonymize: (id) => api.post(`/patients/${id}/anonymize`),
};

// Services API pour les rendez-vous
export const appointmentsAPI = {
  getAll: (params) => api.get('/rendez-vous', { params }),
  getById: (id) => api.get(`/rendez-vous/${id}`),
  create: (data) => api.post('/rendez-vous', data),
  update: (id, data) => api.put(`/rendez-vous/${id}`, data),
  delete: (id) => api.delete(`/rendez-vous/${id}`),
  cancel: (id) => api.post(`/rendez-vous/${id}/cancel`),
  sendReminder: (id) => api.post(`/rendez-vous/${id}/reminder`),
  getByPatient: (patientId, params) => api.get(`/patients/${patientId}/rendez-vous`, { params }),
  getUpcoming: (params) => api.get('/rendez-vous/upcoming', { params }),
};

// Services API pour les bilans
export const bilansAPI = {
  getAll: (params) => api.get('/bilans', { params }),
  getById: (id) => api.get(`/bilans/${id}`),
  create: (data) => api.post('/bilans', data),
  update: (id, data) => api.put(`/bilans/${id}`, data),
  delete: (id) => api.delete(`/bilans/${id}`),
  getByPatient: (patientId, params) => api.get(`/patients/${patientId}/bilans`, { params }),
  updateStatus: (id, status) => api.put(`/bilans/${id}/status`, { statut: status }),
  addComment: (id, comment) => api.post(`/bilans/${id}/comments`, { contenu: comment }),
  export: (id, format = 'pdf') => api.get(`/bilans/${id}/export`, { params: { format } }),
};

// Services API pour les statistiques
export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
  getPatientStats: (patientId) => api.get(`/stats/patients/${patientId}`),
  getMonthlyBilans: (year, month) => api.get('/stats/bilans/monthly', { params: { year, month } }),
  getSystemEfficiency: () => api.get('/stats/system-efficiency'),
};

// Services API pour la gestion du RGPD
export const rgpdAPI = {
  getConsents: (patientId) => api.get(`/rgpd/patients/${patientId}/consents`),
  setConsent: (patientId, type, accepted) => api.post(`/rgpd/patients/${patientId}/consents`, { type, accepted }),
  exportData: (patientId) => api.get(`/rgpd/patients/${patientId}/export`),
  deleteData: (patientId) => api.delete(`/rgpd/patients/${patientId}`),
  getDeletion: () => api.get('/rgpd/deletion-policy'),
};

export default api;