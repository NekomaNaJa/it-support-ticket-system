import React from 'react';

function Button({ children, className = '', variant = 'primary', onClick, type }) { 
    
    // *** แก้ไข: ลบ h-[48px] ออกจาก baseStyle ***
    const baseStyle = 
        "w-full flex justify-center items-center rounded-[10px] text-base font-semibold shadow-md focus:outline-none transition-all duration-200";

    let variantStyle = '';
    
    // *** แก้ไข: py-4 (1rem) จะควบคุมความสูง และขยายตาม 125% ***
    let paddingStyle = 'py-4 px-4'; 

    if (variant === 'primary') {
        variantStyle = "bg-[#83c9f4] text-white hover:bg-[#6eb8e8]";
    } else if (variant === 'danger') {
        variantStyle = "bg-[#ff6961] text-white hover:bg-[#e8574c]";
    } else if (variant === 'default') {
         variantStyle = "bg-[#83c9f4] text-white hover:bg-[#6eb8e8]";
    }
    
    return (
        <button
            onClick={onClick}
            type={type}
            className={`${baseStyle} ${variantStyle} ${paddingStyle} ${className}`} 
        >
            {children}
        </button>
    );
}

export default Button;