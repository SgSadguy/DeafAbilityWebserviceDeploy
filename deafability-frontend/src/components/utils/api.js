// src/components/utils/api.js
import axios from 'axios';

// ✅ ตรวจสอบ environment
const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);

// ✅ baseURL ตามสถานที่รัน
export const API_ROOT = isLocal 
  ? "http://127.0.0.1:8000"  // Local backend
  : "https://deafabilitywebservicedeploy.onrender.com";  // Production backend

console.log('🌍 Environment:', isLocal ? 'LOCAL' : 'PRODUCTION');
console.log('🔗 Backend URL:', API_ROOT);

// ส่ง/รับ cookie (จำเป็นต่อ CSRF ของ Django)
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

// ฟังก์ชันดึงค่า csrftoken จาก cookie
function getCookie(name) {
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[2]) : null;
}

// ใส่ X-CSRFToken ทุก request (ถ้ามี cookie)
axios.interceptors.request.use((config) => {
  const csrf = getCookie('csrftoken');
  if (csrf && !config.headers['X-CSRFToken']) {
    config.headers['X-CSRFToken'] = csrf;
  }
  return config;
});

const api = axios.create({
  baseURL: API_ROOT,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default api;