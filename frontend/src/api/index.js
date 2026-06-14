import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token
api.interceptors.request.use((config) => {
  const tokens = JSON.parse(localStorage.getItem('cf_tokens') || '{}');
  if (tokens.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const tokens = JSON.parse(localStorage.getItem('cf_tokens') || '{}');
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/auth/token/refresh/`,
          { refresh: tokens.refresh }
        );
        const newTokens = { ...tokens, access: data.access };
        localStorage.setItem('cf_tokens', JSON.stringify(newTokens));
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.removeItem('cf_tokens');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login/', data),
  register: (data) => api.post('/auth/registration/', data),
  logout: (data) => api.post('/auth/logout/', data),
  googleLogin: (token) => api.post('/auth/social/google/', { access_token: token }),
  me: () => api.get('/users/me/'),
  updateMe: (data) => api.patch('/users/me/', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  }),
  changeLanguage: (language) => api.post('/users/language/', { language }),
};

// ── Cards ─────────────────────────────────────────────────────────────────────
export const cardsApi = {
  list: () => api.get('/cards/'),
  get: (id) => api.get(`/cards/${id}/`),
  create: (data) => api.post('/cards/', data),
  update: (id, data) => api.patch(`/cards/${id}/`, data),
  delete: (id) => api.delete(`/cards/${id}/`),
  getPublic: (slug) => api.get(`/cards/public/${slug}/`),
  addProject: (cardId, data) =>
    api.post(`/cards/${cardId}/projects/`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  updateProject: (cardId, projectId, data) =>
    api.patch(`/cards/${cardId}/projects/${projectId}/`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  deleteProject: (cardId, projectId) =>
    api.delete(`/cards/${cardId}/projects/${projectId}/`),
};

// ── Generator ─────────────────────────────────────────────────────────────────
export const generatorApi = {
  generate: (cardId) => api.post(`/generator/${cardId}/generate/`),
};

export const getApiErrorMessage = (error, fallback = 'Something went wrong') => {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') {
    if (/<html[\s>]|<!doctype html/i.test(data)) return fallback;
    return data;
  }
  if (Array.isArray(data)) return data[0] || fallback;
  if (typeof data === 'object') {
    const firstValue = Object.values(data)[0];
    if (Array.isArray(firstValue)) return firstValue[0] || fallback;
    if (typeof firstValue === 'string') return firstValue;
  }
  return fallback;
};

export default api;
