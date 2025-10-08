# การ Deploy บน Render

## วิธี Deploy แบบง่าย

### 1. เตรียมไฟล์ที่จำเป็น
ไฟล์เหล่านี้ถูกสร้างไว้แล้ว:
- `Procfile` - สำหรับกำหนดคำสั่งเริ่มต้น
- `requirements.txt` - Python dependencies
- `runtime.txt` - Python version
- `render.yaml` - Render configuration
- `build.sh` - Build script สำหรับ React

### 2. Deploy Backend (Django API)

1. เข้าไปที่ [Render Dashboard](https://dashboard.render.com)
2. คลิก "New +" → "Web Service"
3. เชื่อมต่อ GitHub repository
4. ตั้งค่า:
   - **Name**: `deafability-backend`
   - **Environment**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt
     cd deafability-frontend && npm install && npm run build
     cd .. && python deafability/manage.py collectstatic --noinput
     ```
   - **Start Command**: 
     ```bash
     cd deafability && python manage.py migrate && gunicorn deafability.wsgi:application --bind 0.0.0.0:$PORT
     ```

5. เพิ่ม Environment Variables:
   - `DEBUG`: `False`
   - `SECRET_KEY`: สร้างใหม่ (หรือใช้ generate)
   - `ALLOWED_HOSTS`: `your-app-name.onrender.com`

6. คลิก "Create Web Service"

### 3. Deploy Frontend (React)

1. ใน Render Dashboard คลิก "New +" → "Static Site"
2. ตั้งค่า:
   - **Name**: `deafability-frontend`
   - **Build Command**: `cd deafability-frontend && npm install && npm run build`
   - **Publish Directory**: `deafability-frontend/build`

3. คลิก "Create Static Site"

### 4. เชื่อมต่อ Frontend กับ Backend

1. ไปที่ไฟล์ `deafability-frontend/src/components/utils/api.js`
2. อัปเดต API URL เป็น backend URL ของคุณ:
   ```javascript
   const API_BASE_URL = 'https://your-backend-name.onrender.com/api';
   ```

3. Deploy ใหม่

### 5. ตั้งค่า Database (ถ้าต้องการ)

1. ใน Render Dashboard คลิก "New +" → "PostgreSQL"
2. ตั้งค่า database
3. เพิ่ม Environment Variables ใน backend:
   - `DB_NAME`: ชื่อ database
   - `DB_USER`: username
   - `DB_PASSWORD`: password
   - `DB_HOST`: host URL
   - `DB_PORT`: 5432

## คำสั่ง Deploy แบบง่าย

```bash
# 1. Push code ไป GitHub
git add .
git commit -m "Prepare for Render deployment"
git push origin main

# 2. ไปที่ Render Dashboard และสร้าง services ตามขั้นตอนข้างต้น
```

## หมายเหตุ

- Render จะใช้ SQLite เป็น default ถ้าไม่ตั้งค่า PostgreSQL
- Frontend จะ build อัตโนมัติเมื่อ deploy
- Backend จะ migrate database อัตโนมัติ
- Static files จะถูก serve โดย WhiteNoise
