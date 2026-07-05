import axios from 'axios';
import { API_BASE_URL } from '../utils/apiBaseUrl';

// Função auxiliar para obter cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Instância do axios configurada
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Habilitado para funcionários
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    // Rotas que não precisam de token
    const rotasSemToken = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/admin/login'];
    const precisaToken = !rotasSemToken.some(rota => config.url.includes(rota));
    
    if (precisaToken) {
      // Verificar se é uma rota de administrador
      const isAdminRoute = config.url.includes('/api/admin/');
      
      if (isAdminRoute) {
        // Para rotas de admin, tentar obter adminToken do cookie
        const adminToken = getCookie('adminToken');
        if (adminToken) {
          config.headers.Authorization = `Bearer ${adminToken}`;
        }
      } else {
        // Para rotas normais, usar token do localStorage
        const usuario = localStorage.getItem('usuario');
        
        if (usuario) {
          const userData = JSON.parse(usuario);
          
          if (userData.token) {
            config.headers.Authorization = `Bearer ${userData.token}`;
          }
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    
    if (error.response?.status === 401) {
      // Verificar se é uma rota administrativa
      const isAdminRoute = error.config?.url?.includes('/api/admin/');
      
      if (!isAdminRoute) {
        // Token expirado ou inválido para rotas normais
        localStorage.removeItem('usuario');
        window.location.href = '/';
      }
      // Para rotas admin, deixar o AdminProtectedRoute lidar com o erro
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
