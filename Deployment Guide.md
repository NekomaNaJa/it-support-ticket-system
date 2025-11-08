# 🚀 Deployment Guide (IT Support Ticket System)

คู่มือนี้อธิบายขั้นตอนการติดตั้ง (Deploy) โปรเจกต์ IT Support Ticket System (Laravel + React) ขึ้นสู่ Production Server (เช่น VPS Ubuntu 22.04)

## 1. ⚙️ Prerequisites (สิ่งที่ Server ต้องมี)

* **Server:** VPS (เช่น DigitalOcean, Linode) ที่ใช้ Ubuntu 22.04
* **Web Server:** Nginx
* **Database:** MySQL (หรือ MariaDB)
* **Software:**
    * 'git'
    * 'php' (เวอร์ชันที่ตรงกับ Laravel ของคุณ เช่น 8.1+) พร้อม Extensions (เช่น 'php-mysql', 'php-fpm', 'php-mbstring', 'php-xml')
    * 'composer'
    * 'node.js' (เวอร์ชัน LTS) และ 'npm'
    * 'supervisor' (สำหรับรัน Queue Worker)

---

## 2. 🔧 Backend Deployment (Laravel)

ขั้นตอนเหล่านี้จะทำใน Server ของคุณ

### 2.1. Clone และ ติดตั้ง
1.  Clone โปรเจกต์ของคุณไปยัง 'directory' ที่ต้องการ (เช่น '/var/www/it-support-backend'):
    ---bash
    git clone https://github.com/NekomaNaJa/it-support-ticket-system /var/www/it-support-backend
    cd /var/www/it-support-backend
    ---

2.  ติดตั้ง Dependencies (สำหรับ Production):
    ---bash
    composer install --no-dev --optimize-autoloader
    ---

3.  ตั้งค่าสิทธิ์ (Permissions) ให้ Laravel เขียนไฟล์ Log และ Cache ได้:
    ---bash
    sudo chown -R www-data:www-data storage bootstrap/cache
    sudo chmod -R 775 storage bootstrap/cache
    ---

### 2.2. ตั้งค่า Environment (.env)
1.  คัดลอกไฟล์ '.env.example' ไปเป็น '.env':
    ---bash
    cp .env.example .env
    ---

2.  สร้าง App Key:
    ---bash
    php artisan key:generate
    ---

3.  **แก้ไขไฟล์ '.env':**
    ---env
    # (สำคัญ!) ปิด Debug Mode
    APP_ENV=production
    APP_DEBUG=false
    APP_URL=[https://api.your-domain.com](https://api.your-domain.com) # (Domain ของ Backend)

    # (ตั้งค่า Database บน Server จริง)
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_DATABASE=it_support_prod # (ใช้ DB ชื่อใหม่)
    DB_USERNAME=prod_user       # (อย่าใช้ 'root')
    DB_PASSWORD=[Your-Secure-Password]

    # (สำคัญ!) ตั้งค่า CORS และ Sanctum
    # (นี่คือ Domain ที่ React App ของคุณจะอยู่)
    FRONTEND_URL=[https://app.your-domain.com](https://app.your-domain.com) 
    SANCTUM_STATEFUL_DOMAINS=app.your-domain.com
    ---

### 2.3. Migrate และ Optimize
1.  รัน Migration (สร้างตารางใน Database จริง):
    *(ใช้ '--force' เพราะเป็น Production)*
    ---bash
    php artisan migrate --force
    ---

2.  สร้าง Storage Link (สำหรับไฟล์แนบ):
    ---bash
    php artisan storage:link
    ---

3.  "Cache" Config และ Routes เพื่อความเร็วสูงสุด:
    ---bash
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    ---

### 2.4. ตั้งค่า Queue Worker (สำหรับ Audit Log)
ระบบ Audit Log ของเราใช้ Events/Listeners ซึ่งควรทำงานเบื้องหลัง (Queue)

1.  ติดตั้ง Supervisor:
    ---bash
    sudo apt-get install supervisor
    ---

2.  สร้าง Config file ใหม่:
    ---bash
    sudo nano /etc/supervisor/conf.d/it-support-queue.conf
    ---

3.  **วางโค้ดนี้** ลงในไฟล์ (แก้ไข 'path' ให้ถูกต้อง):
    ---ini
    [program:it-support-queue]
    process_name=%(program_name)s_%(process_num)02d
    command=php /var/www/it-support-backend/artisan queue:work --sleep=3 --tries=3
    autostart=true
    autorestart=true
    user=www-data
    numprocs=1
    redirect_stderr=true
    stdout_logfile=/var/www/it-support-backend/storage/logs/supervisor.log
    ---

4.  สั่งให้ Supervisor อ่าน Config ใหม่:
    ---bash
    sudo supervisorctl reread
    sudo supervisorctl update
    sudo supervisorctl start it-support-queue:*
    ---

## 3. ⚛️ Frontend Deployment (React)
1.  Clone หรือ 'cd' ไปยังโฟลเดอร์ 'frontend':
    ---bash
    cd /var/www/it-support-frontend
    ---

2.  ติดตั้ง Dependencies:
    ---bash
    npm install
    ---

3.  สร้างไฟล์ '.env.production' (สำหรับ Production Build):
    ---bash
    nano .env.production
    ---

4.  **เพิ่ม 1 บรรทัดนี้** (ชี้ไปที่ API Domain ของคุณ):
    ---env
    VITE_API_BASE_URL=[https://api.your-domain.com](https://api.your-domain.com)
    ---

5.  **Build** โปรเจกต์:
    ---bash
    npm run build
    ---

    * คำสั่งนี้จะสร้างโฟลเดอร์ 'dist' ซึ่งมีไฟล์ Static (HTML/CSS/JS) ที่ Optimize แล้ว

## 4. 🌐 Nginx Configuration (Web Server)
เราจะตั้งค่า Nginx ให้ "ชี้" Domain ไปยังโฟลเดอร์ที่ถูกต้อง (แยก Frontend และ Backend)

1.  สร้าง Config file ใหม่:
    ---bash
    sudo nano /etc/nginx/sites-available/it-support
    ---

2.  **วางโค้ดนี้** (แก้ไข 'server_name'):

    ---nginx
    # Server 1: Frontend (React App)
    # (ชี้ไปที่ 'dist' folder)
    server {
        listen 80;
        server_name app.your-domain.com;
        root /var/www/it-support-frontend/dist;
        index index.html;

        location / {
            # (สำคัญ!) "หลอก" ให้ React Router ทำงาน
            try_files $uri /index.html;
        }
    }

    # Server 2: Backend (Laravel API)
    # (ชี้ไปที่ 'public' folder)
    server {
        listen 80;
        server_name api.your-domain.com;
        root /var/www/it-support-backend/public;
        index index.php;

        location / {
            try_files $uri $uri/ /index.php?$query_string;
        }

        # (ส่ง .php request ไปให้ PHP-FPM)
        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            # (แก้เวอร์ชัน PHP ให้ตรงกับที่คุณติดตั้ง)
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock; 
        }

        location ~ /\.ht {
            deny all;
        }
    }
    
3.  เปิดใช้งาน Config นี้ และ Restart Nginx:
    ---bash
    sudo ln -s /etc/nginx/sites-available/it-support /etc/nginx/sites-enabled/
    sudo nginx -t # (ทดสอบว่า Config ไม่ผิด)
    sudo systemctl restart nginx
    ---

4.  (แนะนำ) ติดตั้ง SSL (HTTPS) ด้วย Certbot (Let's Encrypt):
    ---bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d app.your-domain.com -d api.your-domain.com
    ---