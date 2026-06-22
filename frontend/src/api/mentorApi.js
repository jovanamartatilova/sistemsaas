import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('auth_token');  // Changed from 'authToken' to 'auth_token'
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
  
  // Assessment (input score page — saves narrative + evaluation_status)
  saveAssessment: (data) => api.post(`/mentor/interns/${data.id_submission}/assessment`, data),

  // Certificates
  getCertificates: (search = '') => api.get('/mentor/certificates', {
  params: search ? { search } : {}
  }),

  generateCertificate: (idSubmission, data) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    return api.post(`/mentor/interns/${idSubmission}/generate-certificate`, data, { headers });
  },
  bulkGenerateCertificates: (submissionIds, data = {}) => api.post('/mentor/certificates/bulk-generate', { submission_ids: submissionIds, ...data }),
  bulkSendCertificates: (submissionIds) => api.post('/mentor/certificates/bulk-send', { submission_ids: submissionIds }),
  sendCertificate: (idSubmission) => api.post(`/mentor/interns/${idSubmission}/send-certificate`),
  previewCertificate: async (idSubmission, data) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.post(`/mentor/interns/${idSubmission}/preview-certificate`, data, { 
      responseType: 'blob',
      headers
    });
    return URL.createObjectURL(response.data);
  },

  // Templates
  getTemplates: () => api.get('/mentor/certificate-templates'),
  createTemplate: (data) => api.post('/mentor/certificate-templates', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateTemplate: (id, data) => api.post(`/mentor/certificate-templates/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteTemplate: (id) => api.delete(`/mentor/certificate-templates/${id}`),

  // AI Generation
  aiGenerate: (prompt) => api.post('/ai/generate', { prompt }),
};

export default api;
