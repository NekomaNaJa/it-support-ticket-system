import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import apiClient from '../api';
import Button from '../components/Button';
import Input from '../components/Input';
import LoginIconImage from '../assets/LoginIcon.png'; 
import { useAuth } from '../context/AuthContext'; 

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    const { login, isAuthenticated, loading } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/ticket-flow" replace />;
    }
    if (loading) {
         return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#edf4f5' }}>
                <LoadingSpinner />
            </div>
         );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await apiClient.post('/login', { email, password });
            
            const userData = response.data.user;
            const token = response.data.token; 

            console.log('Login successful:', userData);
            
            // --- (4. แก้ไข) ---
            // (เราจะ "สั่ง" ให้อัปเดต State เท่านั้น)
            login(userData, token); 
            
            // ( "ลบ" navigate('/ticket-flow'); ออกจากตรงนี้ )
            // (เพราะ "ยาม" ในข้อ 3. จะจัดการย้ายหน้าให้เราเอง
            //  หลังจากที่ State 'isAuthenticated' อัปเดตเสร็จ)
            
        } catch (err) {
            console.error('Login failed:', err);
            // ... (โค้ด Error Handling เดิมของคุณ) ...
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

  // ... (โค้ด JSX ของ return (...) ทั้งหมดเหมือนเดิม) ...
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#edf4f5' }}>
        <div 
          className="p-4 w-full max-w-[28.125rem] shadow-xl border border-gray-200 flex justify-center items-center"
          style={{ 
              borderRadius: '61px', 
              backgroundColor: '#ffffff' 
          }}
        >
          <div className="bg-white p-12 rounded-[2rem] w-[21.875rem] text-center transition-all duration-300">
            <img
              src={LoginIconImage}
              alt="Login Icon"
              className="w-20 h-20 mx-auto mb-6" 
            />
            <h2 className="text-2xl font-bold text-gray-800 mb-8">เข้าสู่ระบบ</h2>
            <form onSubmit={handleSubmit} className="text-left">
              <div className='mb-8'>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail or Username
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  isDark={true}
                  placeholder="example@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  isDark={true}
                  placeholder="********"
                />
              </div>
              <div className='mt-6'>
                <Button
                  type="submit"
                  className="w-full text-white font-semibold py-3 rounded-lg" 
                  variant="default" 
                >
                  เข้าสู่ระบบ
                </Button>
              </div>
              <p className="text-center text-xs text-gray-500 mt-4 cursor-pointer hover:text-gray-700">
                ลืมรหัสผ่าน ?
              </p>
              {error && (
                <div className="text-red-500 text-sm text-center mt-2">
                  {error}
                </div>
              )}
            </form>
            <p className="text-center text-xs text-gray-600 pt-4 mt-4 border-t border-gray-100">
              ยังไม่มีบัญชีใช่หรือไม่?{' '}
              <a
                href="/register"
                className="font-medium text-blue-500 hover:text-blue-600"
              >
                คลิกเพื่อลงทะเบียน
              </a>
            </p>
          </div>
        </div>
    </div>
  );
}

export default LoginPage;