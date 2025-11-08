import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import DeleteIcon from '../assets/Delete.png';

export const CreateCategoryModal = ({ isOpen, onClose, onConfirm, isSubmitting, error }) => {
    if (!isOpen) return null;

    // (State ภายใน Modal นี้ สำหรับเก็บค่าในฟอร์ม)
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({ name, description }); // (ส่งข้อมูล {name, desc} กลับไป)
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
                
                <h2 className="text-2xl font-bold mb-6">Create New Category</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name (Required) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category Name (Required)</label>
                        <Input 
                            type="text"
                            placeholder="เช่น Hardware, Software"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            isDark={true}
                            required
                        />
                    </div>
                    {/* Description (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                        <textarea
                            placeholder="คำอธิบายสั้นๆ..."
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="block w-full px-4 py-3 rounded-lg text-sm bg-[#f0f0f0] border-transparent ..."
                        ></textarea>
                    </div>

                    {error && ( <div className="text-red-500 text-sm text-center">{error}</div> )}

                    <div className="flex justify-end space-x-4 pt-4">
                        <Button type="button" variant="danger" onClick={onClose} disabled={isSubmitting}>
                            ยกเลิก
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? 'กำลังสร้าง...' : 'สร้าง'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const DeleteCategoryModal = ({ category, isOpen, onClose, onConfirm, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-sm mx-auto" style={{ backgroundColor: '#FCECEC' }}>
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                     <img src={DeleteIcon} alt="Delete" className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold mb-4">แน่ใจว่าจะลบ Category?</h2>
                <p className="text-gray-600 mb-2">
                    คุณกำลังจะลบ: <strong className="text-black">{category?.name}</strong>
                </p>
                <p className="text-red-600 font-semibold mb-8">
                    การกระทำนี้ไม่สามารถย้อนกลับได้!
                </p>
                <div className="flex justify-center space-x-4">
                    <Button variant="danger" onClick={onClose} disabled={isDeleting}>
                        ยกเลิก
                    </Button>
                    <Button variant="primary" onClick={onConfirm} disabled={isDeleting}>
                        {isDeleting ? 'กำลังลบ...' : 'ยืนยัน'}
                    </Button>
                </div>
            </div>
        </div>
    );
};


export const DeleteUserModal = ({ user, isOpen, onClose, onConfirm, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-sm mx-auto" style={{ backgroundColor: '#FCECEC' }}>
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                     <img src={DeleteIcon} alt="Delete" className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold mb-4">แน่ใจว่าจะลบ User?</h2>
                <p className="text-gray-600 mb-2">
                    คุณกำลังจะลบ: <strong className="text-black">{user?.name}</strong> ({user?.email})
                </p>
                <p className="text-red-600 font-semibold mb-8">
                    การกระทำนี้ไม่สามารถย้อนกลับได้!
                </p>
                <div className="flex justify-center space-x-4">
                    <Button variant="danger" onClick={onClose} disabled={isDeleting}>
                        ยกเลิก
                    </Button>
                    <Button variant="primary" onClick={onConfirm} disabled={isDeleting}>
                        {isDeleting ? 'กำลังลบ...' : 'ยืนยัน'}
                    </Button>
                </div>
            </div>
        </div>
    );
};