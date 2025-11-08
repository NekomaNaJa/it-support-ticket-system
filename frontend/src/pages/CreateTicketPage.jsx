import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import Button from '../components/Button';
import Input from '../components/Input'; // เรายังใช้ Input สำหรับ Text/Password
import { useAuth } from '../context/AuthContext';

// --- (1. เพิ่ม) กำหนดค่า Validation ตามเอกสาร ---
// 50 MB (คิดเป็น Bytes)
const MAX_FILE_SIZE = 50 * 1024 * 1024; 
const ALLOWED_FILE_TYPES = [
  'image/jpeg', // .jpg, .jpeg
  'image/png',  // .png
  'image/gif',  // .gif (เพิ่มตามคำขอของคุณ)
];

// --- (2. ใหม่) สร้าง String สำหรับ HTML 'accept' attribute ---
// นี่จะบอกให้หน้าต่าง "เลือกไฟล์" กรองเฉพาะไฟล์เหล่านี้
const fileAcceptString = ALLOWED_FILE_TYPES.join(',');
// ---------------------------------

function CreateTicketPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('');
  const [attachment, setAttachment] = useState(null); // State สำหรับเก็บไฟล์
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // (useEffect ดึง Categories เหมือนเดิม)
  useEffect(() => {
    apiClient.get('/categories')
      .then(response => {
        if (response.data && response.data.categories) {
          setCategories(response.data.categories);
        } else {
          setCategories(response.data);
        }
      })
      .catch(err => {
        console.error("Failed to fetch categories", err);
        setError("ไม่สามารถโหลดหมวดหมู่ได้");
      });
  }, []);

  // (handleCancel เหมือนเดิม)
  const handleCancel = () => {
    navigate(-1); 
  };

  // --- (ฟังก์ชันสำหรับตรวจสอบไฟล์ - อัปเดตข้อความ Error) ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    setError(null);
    setAttachment(null);

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError('ไฟล์มีขนาดใหญ่เกิน 50MB กรุณาเลือกไฟล์ใหม่');
        e.target.value = null; 
        return;
      }
      
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        // (อัปเดตข้อความ Error ให้ครบ)
        setError('ประเภทไฟล์ไม่ถูกต้อง (อนุญาตเฉพาะ: png, jpg, gif)'); 
        e.target.value = null; 
        return;
      }

      setAttachment(file);
    }
  };
  // ---------------------------------

  // (handleSubmit เหมือนเดิม)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category_id', categoryId);
    formData.append('priority', priority);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    try {
      await apiClient.post('/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLoading(false);
      navigate('/ticket-flow');

    } catch (err) {
      setLoading(false);
      console.error('Failed to create ticket:', err);
      if (err.response && err.response.data.errors) {
        setError(Object.values(err.response.data.errors).flat().join(' '));
      } else {
        setError('เกิดข้อผิดพลาดในการสร้าง Ticket');
      }
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#edf4f5' }}>
      {/* (TODO: เพิ่ม Navbar ที่นี่) */}
      
      <main className="p-8 max-w-4xl mx-auto w-full">
        
        {/* ปุ่ม "Back" */}
        <button onClick={handleCancel} className="text-gray-600 hover:text-gray-900 mb-4">
          &lt; Back to my Ticket
        </button>

        {/* กล่องฟอร์มหลัก */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          
          <h1 className="text-3xl font-bold text-gray-800">Create new Ticket</h1>
          <p className="text-gray-500 mb-8">กรอกรายละเอียดงานใหม่</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* หัวข้อ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">หัวข้อ</label>
              <Input 
                type="text" 
                placeholder="กรอกหัวข้อปัญหา" 
                isDark={true}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* รายละเอียด */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียด</label>
              <textarea
                placeholder="กรอกรายละเอียดปัญหา"
                className="block w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all duration-200 bg-[#f0f0f0] border-transparent text-gray-800 placeholder-gray-500"
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            {/* แถว Dropdowns (Category & Priority & File) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* หมวดหมู่ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่</label>
                <select 
                  className="block w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all duration-200 bg-[#f0f0f0] border-transparent text-gray-800 placeholder-gray-500"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* ระดับความสำคัญ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ระดับความสำคัญ</label>
                <select 
                  className="block w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all duration-200 bg-[#f0f0f0] border-transparent text-gray-800 placeholder-gray-500"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  required
                >
                  <option value="">เลือกระดับความสำคัญ</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              {/* --- (3. แก้ไข) ปุ่มแนบไฟล์ --- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">แนบไฟล์ (สูงสุด 50MB)</label>
                <input
                  type="file"
                  accept={fileAcceptString} // <-- *** นี่คือการแก้ไข ***
                  onChange={handleFileChange} 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg p-2.5"
                />
              </div>

            </div>

            {/* แสดง Error (รวม Error จากการ Upload) */}
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            {/* ปุ่ม Submit & Cancel */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="danger" 
                onClick={handleCancel}
                disabled={loading}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                variant="primary" 
                disabled={loading}
              >
                {loading ? 'กำลังสร้าง...' : 'ยืนยันการสร้าง'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateTicketPage;