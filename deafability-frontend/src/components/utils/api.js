// src/components/utils/api.js
import axios from 'axios';

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

export default axios;



