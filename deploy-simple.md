# วิธี Deploy แบบง่ายที่สุด

## ขั้นตอนการ Deploy

### 1. เตรียมไฟล์ (เสร็จแล้ว)
✅ ไฟล์ที่สร้างไว้แล้ว:
- `Procfile` - คำสั่งเริ่มต้น
- `requirements.txt` - Python packages
- `runtime.txt` - Python version
- `render.yaml` - Render config
- `build.sh` - Build script

### 2. Deploy Backend (Django)

1. ไปที่ [Render Dashboard](https://dashboard.render.com)
2. คลิก "New +" → "Web Service"
3. เชื่อมต่อ GitHub repo
4. ตั้งค่า:
   - **Name**: `deafability-backend`
   - **Environment**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt
     cd deafability-frontend && npm install && CI=false npm run build
     cd .. && cp deafability-frontend/build/index.html deafability/templates/ && cp -r deafability-frontend/build/static deafability/staticfiles/ && python deafability/manage.py collectstatic --noinput
     ```
   - **Pre-Deploy Command**: 
     ```bash
     cd deafability && python manage.py migrate && python create_production_data.py
     ```
   - **Start Command**: 
     ```bash
     cd deafability && gunicorn deafability.wsgi:application --bind 0.0.0.0:$PORT
     ```

### 3. Deploy Frontend (React)

1. คลิก "New +" → "Static Site"
2. ตั้งค่า:
   - **Name**: `deafability-frontend`
   - **Build Command**: `cd deafability-frontend && npm install && npm run build`
   - **Publish Directory**: `deafability-frontend/build`

### 4. เชื่อมต่อ Frontend กับ Backend

1. ไปที่ไฟล์ `deafability-frontend/src/components/utils/api.js`
2. เปลี่ยน URL เป็น backend URL ของคุณ:
   ```javascript
   baseURL: "https://your-backend-name.onrender.com"
   ```

### 5. Deploy ใหม่

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## หมายเหตุ
- ใช้ SQLite เป็น default (ไม่ต้องตั้งค่า database)
- Frontend จะ build อัตโนมัติ
- Backend จะ migrate database อัตโนมัติ
- ใช้ WhiteNoise สำหรับ static files
