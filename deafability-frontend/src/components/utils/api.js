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

export default axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://deafabilitywebservicedeploy.onrender.com/api",   // 👈 important
  withCredentials: true,              // if CSRF/cookies needed
});


