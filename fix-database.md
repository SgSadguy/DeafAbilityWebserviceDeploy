# แก้ไขปัญหา Database และ API

## ปัญหาที่พบ:
1. Database หายไป (ไม่มีข้อมูล courses และ jobs)
2. หน้า /courses ไม่แสดงข้อมูล
3. Jobs API ไม่ทำงาน

## วิธีแก้ไข:

### 1. อัปเดต Build Command ใหม่:
```bash
pip install -r requirements.txt
cd deafability-frontend && npm install && CI=false npm run build
cd .. && cp deafability-frontend/build/index.html deafability/templates/ && cp -r deafability-frontend/build/static deafability/staticfiles/ && python deafability/manage.py collectstatic --noinput
```

### 2. อัปเดต Pre-Deploy Command:
```bash
cd deafability && python manage.py migrate && python create_production_data.py
```

### 3. อัปเดต Start Command:
```bash
cd deafability && gunicorn deafability.wsgi:application --bind 0.0.0.0:$PORT
```

### 4. Environment Variables ที่ต้องตั้ง:
- `DEBUG`: `False`
- `SECRET_KEY`: สร้างใหม่
- `ALLOWED_HOSTS`: `deafabilitywebservicedeploy.onrender.com`

### 5. Deploy ใหม่:
```bash
git add .
git commit -m "Fix database and API issues"
git push origin main
```

## หมายเหตุ:
- Script `create_production_data.py` จะสร้างข้อมูล courses และ jobs อัตโนมัติ
- ข้อมูลจะถูกสร้างใหม่ทุกครั้งที่ deploy
- ใช้ SQLite เป็น default database
