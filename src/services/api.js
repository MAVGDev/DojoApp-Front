import axios from 'axios';

// Usamos la variable de entorno configurada en Netlify.
// Si no encuentra la variable, por defecto usará localhost para desarrollo.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Adjuntar el token a cada solicitud automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dojo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejo global de errores (401 - Sesión expirada)
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
