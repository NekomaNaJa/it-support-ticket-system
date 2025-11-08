import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api'; // <-- 1. Import แค่ apiClient
import Button from '../components/Button';
import Input from '../components/Input';
import RegisterIconImage from '../assets/RegisterIcon.png'; 
import { useAuth } from '../context/AuthContext'; // (เตรียมไว้สำหรับขั้นตอนต่อไป)

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
        setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
        return;
    }
    if (password !== passwordConfirmation) {
        setError("การยืนยันรหัสผ่านไม่ตรงกัน");
        return;
    }

    try {
      // --- *** 2. นี่คือการแก้ไขที่สำคัญ *** ---
      
      // ใช้ apiClient (ตัวเดียว) เรียก Register (ต้องเพิ่ม /api)
      const response = await apiClient.post('/register', { 
        name: name,
        email: email,
        password: password,
        password_confirmation: passwordConfirmation,
      });

      console.log('Registration successful:', response.data.user);
      
      // --- 3. (สำคัญ) เรายังไม่ Login ให้ผู้ใช้หลังสมัคร ---
      // (เราจะส่ง Token กลับมา แต่ยังไม่ Login เพื่อความปลอดภัย)
      setSuccess("ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ");
      
      setTimeout(() => {
        navigate('/login'); 
      }, 2000); 

    } catch (err) {
      console.error('Registration failed:', err);
      if (err.response && err.response.data.errors) {
        setError(Object.values(err.response.data.errors).flat().join(' '));
      } else if (err.response && err.response.status === 419) {
        setError("CSRF token mismatch. Please refresh the page and try again."); // <-- เพิ่ม Error 419
      } else {
        setError(err.response?.data?.message || 'ลงทะเบียนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      }
    }
  };
  
  const handleCancel = () => {
    navigate('/login');
  };

  // ... (โค้ด JSX ของ return (...) ทั้งหมดเหมือนเดิม ไม่ต้องแก้ไข) ...
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#edf4f5' }}>
        <div 
          className="p-4 w-full max-w-[25rem] shadow-xl border border-gray-200 flex justify-center items-center"
          style={{ 
              borderRadius: '61px', 
              backgroundColor: '#ffffff' 
          }}
        >
          <div className="bg-white p-12 rounded-[2rem] w-[25rem] text-center transition-all duration-300">
            <img
              src={RegisterIconImage}
              alt="Register Icon"
              className="w-20 h-20 mx-auto mb-6" 
            />
            <h2 className="text-2xl font-bold text-gray-800 mb-8">สร้างสมาชิก</h2>
            <form onSubmit={handleSubmit} className="text-left">
              <div className='mb-4'>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ-สกุล
                </label>
                <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required isDark={true} placeholder="Grade A" />
              </div>
              <div className='mb-4'>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required isDark={true} placeholder="GradeA@gmail.com" />
              </div>
              <div className='mb-4'>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required isDark={true} placeholder="********"/>
              </div>
              <div className='mb-4'>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <Input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required isDark={true} placeholder="********"/>
              </div>
              {success && (
                <div className="text-green-600 text-sm text-center mt-4 mb-2">
                  {success}
                </div>
              )}
              {error && (
                <div className="text-red-500 text-sm text-center mt-4 mb-2">
                  {error}
                </div>
              )}
              <div className='mt-8 mb-2'> 
                <Button
                  type="submit"
                  className="w-full text-white font-semibold py-3 rounded-lg" 
                  variant="primary" 
                >
                  สมัครสมาชิก
                </Button>
              </div>
              <div> 
                <Button
                  type="button"
                  onClick={handleCancel}
                  className="w-full text-white font-semibold py-3 rounded-lg" 
                  variant="danger" 
                >
                  ← ย้อนกลับ
                </Button>
              </div>
            </form>
          </div>
        </div>
    </div>
  );
}

export default RegisterPage;