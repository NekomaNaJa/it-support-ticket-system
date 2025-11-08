// src/api.js
import axios from 'axios';

// 1. สร้าง "API" instance (ชี้ไปที่ /api)
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // <-- กลับมาชี้ที่ /api
  withCredentials: false // <-- 2. ปิด Crendentials เราจะใช้ Token
});

// --- 3. นี่คือ Interceptor (ผู้ดักจับ Request) ---
apiClient.interceptors.request.use(
  (config) => {
    // 4. ดึง Token (ตั๋ว) มาจาก localStorage
    const token = localStorage.getItem('token'); 
    
    if (token) {
      // 5. ถ้ามี Token, ให้แนบไปใน Header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// --------------------------------------------------

export default apiClient;