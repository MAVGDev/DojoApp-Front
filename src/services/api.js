import axios from 'axios';

// La baseURL incluye /api para que todas las rutas funcionen correctamente
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para enviar el token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dojo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores 401 (token expirado)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dojo_token');
      localStorage.removeItem('dojo_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;