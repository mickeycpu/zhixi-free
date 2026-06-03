import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60000,
});

// 后端唤醒标记
let warmUpDone = false;

client.interceptors.request.use(async (config) => {
  if (!warmUpDone) {
    warmUpDone = true;
    try {
      await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || '/api'}/api/health`,
        { timeout: 90000 }
      );
    } catch {
      // 唤醒失败不阻塞，继续发请求
    }
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (resp) => resp,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.hash.includes('/login')) {
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  },
);

export default client;
