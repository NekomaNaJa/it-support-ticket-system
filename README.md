# IT Support Ticket System

นี่คือโปรเจกต์ Full-Stack "IT Support Ticket System" ที่สร้างขึ้นเพื่อจัดการคำร้องขอ (Tickets) สำหรับแผนก IT Support
โปรเจกต์นี้ใช้สถาปัตยกรรมแบบ SPA (Single Page Application) โดยแบ่ง Frontend และ Backend ออกจากกันอย่างชัดเจน

## 🚀 Technology Stack (เทคโนโลยีที่ใช้)

* **Frontend:** React (Vite)
* **Backend:** PHP (Laravel Framework)
* **Database:** MySQL (หรือ MariaDB)
* **Authentication:** Laravel Sanctum (Token-based)
* **Key Features:**
    * Role-Based Access Control (RBAC): 'user', 'staff', 'admin'
    * Polymorphic Attachments (ไฟล์แนบที่รองรับหลาย Model)
    * Event-Driven Audit Logs (ระบบบันทึกการตรวจสอบ)
    * Real-time UI Updates (อัปเดต UI ทันทีหลัง Action)

---

## Setup & Installation (การติดตั้ง)

### 1. การติดตั้ง Backend (Laravel)

1.  **Clone Repository:**
    ---bash
    git clone [Your-Repo-URL]
    cd [Your-Project-Folder]/backend
    ---

2.  **ติดตั้ง Dependencies:**
    ---bash
    composer install
    ---

3.  **ตั้งค่า Environment:**
    * คัดลอกไฟล์ `.env.example` ไปเป็น `.env`
    * `php artisan key:generate`
    * ในไฟล์ `.env`, ตั้งค่าการเชื่อมต่อฐานข้อมูล (เช่น XAMPP):
        ---
        DB_CONNECTION=mysql
        DB_HOST=127.0.0.1
        DB_PORT=3306
        DB_DATABASE=it_support_ticket
        DB_USERNAME=root
        DB_PASSWORD=
        ---

    * (สำคัญ!) ตั้งค่า Domain สำหรับ Sanctum และ CORS:
        ---
        SANCTUM_STATEFUL_DOMAINS=localhost:5173
        FRONTEND_URL=http://localhost:5173
        ---

4.  **รัน Migration (สร้างฐานข้อมูล):**
    ---bash
    php artisan migrate:fresh
    ---

5.  **สร้าง Storage Link:**
    ---bash
    php artisan storage:link
    ---

6.  **รัน Backend Server:**
    ---bash
    php artisan serve
    ---

    * (เซิร์ฟเวอร์ Backend จะรันที่ `http://localhost:8000`)

### 2. การติดตั้ง Frontend (React)

1.  **เปิด Terminal ใหม่**
2.  **ไปยังโฟลเดอร์ Frontend:**
    ---bash
    cd [Your-Project-Folder]/frontend
    ---

3.  **ติดตั้ง Dependencies:**
    ---bash
    npm install
    ---

4.  **ติดตั้ง Recharts (สำหรับกราฟ Dashboard):**
    ---bash
    npm install recharts
    ---

5.  **ตั้งค่า Environment:**
    * สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend`
    * เพิ่ม 1 บรรทัดนี้ (เพื่อบอก React ว่า API อยู่ที่ไหน):
        ---
        VITE_API_BASE_URL=http://localhost:8000
        ---
        
6.  **รัน Frontend Server:**
    ---bash
    npm run dev
    ---

    * (เซิร์ฟเวอร์ Frontend (Vite) จะรันที่ `http://localhost:5173`)
    * เปิด `http://localhost:5173` ในเบราว์เซอร์เพื่อเริ่มใช้งาน