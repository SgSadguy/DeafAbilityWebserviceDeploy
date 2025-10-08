// src/components/utils/api.js
import axios from 'axios';

// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api",
//   withCredentials: true, // if you need CSRF/cookies
// });

// ให้ส่ง/รับ cookie ไป-กลับ (จำเป็นต่อ CSRF ของ Django)
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
  baseURL: "https://deafabilitywebservicedeploy.onrender.com/api",
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request interceptor for debugging
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

// Add response interceptor for debugging
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


