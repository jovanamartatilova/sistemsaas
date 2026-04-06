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
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const mentorApi = {
  // Dashboard
  getDashboard: () => api.get('/mentor/dashboard'),

  // Interns
  getInterns: () => api.get('/mentor/interns'),

  // Competencies
  getCompetencies: (idSubmission) => 
    api.get(`/mentor/interns/${idSubmission}/competencies`),

  // Scores
  inputScores: (idSubmission, scores) =>
    api.post(`/mentor/interns/${idSubmission}/scores`, { scores }),

  getScoreRecap: () => api.get('/mentor/score-recap'),

  // Evaluation
  getEvaluation: (idSubmission) =>
    api.get(`/mentor/interns/${idSubmission}/evaluation`),

  saveEvaluation: (idSubmission, data) =>
    api.post(`/mentor/interns/${idSubmission}/evaluation`, data),

  // Certificates
  getCertificates: () => api.get('/mentor/certificates'),

  generateCertificate: (idSubmission) =>
    api.post(`/mentor/interns/${idSubmission}/generate-certificate`),
};

export default api;
