/**
 * Mock do módulo api.ts para testes
 * Exporta uma instância real do axios que pode ser interceptada pelo axios-mock-adapter
 */
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
