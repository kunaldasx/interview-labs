import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Add trailing slash on POST/PUT/PATCH to avoid 307 redirects that lose auth headers
  // (FastAPI collection endpoints like @router.post("/") require trailing slash)
  const method = config.method?.toLowerCase();
  if (config.url && !config.url.endsWith('/') && (method === 'post' || method === 'put' || method === 'patch')) {
    config.url += '/';
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 ||
        (error.response?.status === 403 && error.response?.data?.detail === 'Not authenticated')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
