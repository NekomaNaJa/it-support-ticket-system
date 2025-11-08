# นี่คือรายการ API Endpoints ทั้งหมดที่ใช้ในโปรเจกต์นี้ (จำเป็นต้องมี Authorization: Bearer <token> ใน Header สำหรับทุก Route ที่ไม่ใช่ Public)

### Authentication (การยืนยันตัวตน)
Method      Endpoint        Description             Access
POST        /api/register   ลงทะเบียนผู้ใช้ใหม่          Public
POST        /api/login      ล็อกอินเพื่อรับ Token        Public
POST        /api/logout     ล็อกเอาท์ (ทำลาย Token)   Authenticated
GET         /api/user       ดึงข้อมูล User ที่ล็อกอินอยู่   Authenticated

### Tickets (ระบบ Ticket)
Method      Endpoint                    Description                                                             Access
GET         /api/tickets                (Smart API) ดึง ""My Tickets"" (User) หรือ ""All Tickets"" (Staff)"       User, Staff
POST        /api/tickets                สร้าง Ticket ใหม่ (พร้อมไฟล์แนบ)                                           User
GET         /api/tickets/{id}           (Smart API) ดึง Ticket 1 ชิ้น (เช็ก Role/Ownership)                         User (Owner), Staff
PUT         /api/tickets/{id}           อัปเดต Ticket 1 ชิ้น (เฉพาะ Text)                                          User (Owner)
DELETE      /api/tickets/{id}           ลบ Ticket (พร้อมไฟล์แนบ)                                                 User (Owner)
PATCH       /api/tickets/{id}/assign    (Toggle) รับ/ปล่อยงาน Ticket                                              Staff
PATCH       /api/tickets/{id}/status    "อัปเดต Status (Open, Closed, ฯลฯ)"                                      Staff

### Comments (ความคิดเห็น)
Method      Endpoint        Description             Access
POST        /api/comments   เพิ่มความคิดเห็นใน Ticket   Authenticated

### Attachments (ไฟล์แนบ - Polymorphic)
Method      Endpoint                Description                             Access
POST        /api/attachments        อัปโหลดไฟล์แนบ (สำหรับ Ticket หรือ KB)     Authenticated
DELETE      /api/attachments/{id}   ลบไฟล์แนบ (เช็กสิทธิ์เจ้าของ)                 Authenticated (Owner)

### Knowledge Base (คลังความรู้)
Method      Endpoint                    Description                             Access
GET         /api/knowledge-base         ดึงบทความทั้งหมด (พร้อม attachments)       Authenticated
POST        /api/knowledge-base         สร้างบทความใหม่ (พร้อมไฟล์แนบ)             Staff, Admin
GET         /api/knowledge-base/{id}    ดึงบทความ 1 ชิ้น (สำหรับหน้า Detail/Edit)   Authenticated
PUT         /api/knowledge-base/{id}    อัปเดตบทความ 1 ชิ้น (เฉพาะ Text)           Staff, Admin

### Admin: Management (การจัดการ - Admin)
Method      Endpoint                Description                                                         Access
GET         /api/admin/users        ดึง User ทั้งหมด (พร้อม Stats)                                         Admin
GET         /api/admin/users/{id}   ดึง User 1 คน (สำหรับหน้า Edit)                                        Admin
PUT         /api/admin/users/{id}   "อัปเดต User (Name, Email, Role)"                                    Admin
DELETE      /api/admin/users/{id}   ลบ User (พร้อมลบ Ticket/Comment ที่เกี่ยวข้อง)                           Admin
GET         /api/admin/categories   "(Smart API) ดึง Categories (Admin: พร้อม Stats, User: เฉพาะชื่อ)"      Authenticated
POST        /api/categories         สร้าง Category ใหม่                                                   Admin
GET         /api/categories/{id}    ดึง Category 1 อัน (สำหรับหน้า Edit)                                   Staff, Admin
PUT         /api/categories/{id}    "อัปเดต Category (Name, Description)"                                Admin
DELETE      /api/categories/{id}    ลบ Category (ถ้าไม่ถูกใช้งาน)                                           Admin

### Admin: Dashboard (สถิติ)
Method      Endpoint                    Description                                     Access
GET         /api/admin/dashboard-stats  "ดึงสถิติทั้งหมด (Status, Priority) สำหรับกราฟ"      Admin