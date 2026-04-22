import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');  // Changed from 'authToken' to 'auth_token'
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config);
  return config;
});

// Log responses
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status} from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error(`[API] Error from ${error.config?.url}:`, error.response?.status, error.response?.data, error.message);
    return Promise.reject(error);
  }
);

export const mentorApi = {
  // Profile
  getProfile: () => api.get('/mentor/profile'),

  // Dashboard
  getDashboard: () => api.get('/mentor/dashboard'),

  // Interns
  getInterns: (search = '') => api.get('/mentor/interns', {
  params: search ? { search } : {}
}),

  // Competencies
  getCompetencies: (idSubmission) => 
    api.get(`/mentor/interns/${idSubmission}/competencies`),

  // Scores
  inputScores: (idSubmission, scores) =>
    api.post(`/mentor/interns/${idSubmission}/scores`, { scores }),

  getScoreRecap: (search = '') => api.get('/mentor/score-recap', {
  params: search ? { search } : {}
  }),

  // Evaluation
  getEvaluation: (idSubmission) =>
    api.get(`/mentor/interns/${idSubmission}/evaluation`),

  saveEvaluation: (idSubmission, data) => api.post(`/mentor/interns/${idSubmission}/evaluation`, data),

  // Certificates
  getCertificates: (search = '') => api.get('/mentor/certificates', {
  params: search ? { search } : {}
  }),

  generateCertificate: (idSubmission) => api.post(`/mentor/interns/${idSubmission}/generate-certificate`),
  sendCertificate: (idSubmission) => api.post(`/mentor/interns/${idSubmission}/send-certificate`),
  previewCertificate: async (idSubmission) => {
    const response = await api.get(`/mentor/interns/${idSubmission}/preview-certificate`, {responseType:'blob'});
    return URL.createObjectURL(response.data);
  }
};

export default api;
