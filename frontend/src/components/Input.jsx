import React from 'react';

function Input({ isDark = false, ...props }) {
    
  // *** แก้ไข: ลบ h-[48px] ออก และใช้ py-3 (Padding Y) เพื่อกำหนดความสูงแทน ***
  // py-3 (0.75rem) จะขยายตาม 125%
  const baseStyle =
    "block w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all duration-200";
    
  // (โค้ดที่เหลือเหมือนเดิม)
  const darkStyle = "bg-[#f0f0f0] border-transparent text-gray-800 placeholder-gray-500";
  const lightStyle = "bg-white border border-gray-300 text-gray-900";

  return (
    <input
      {...props}
      className={`${baseStyle} ${isDark ? darkStyle : lightStyle}`}
    />
  );
}

export default Input;