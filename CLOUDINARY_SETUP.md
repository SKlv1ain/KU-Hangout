# คู่มือการ Setup และทดสอบ Cloudinary Image Upload

## 📋 Prerequisites

- Python 3.10+
- PostgreSQL database running
- Cloudinary account (Free tier)

---

## 🚀 Step 1: ติดตั้ง Requirements

### 1.1 ตรวจสอบว่า packages ติดตั้งแล้ว

```bash
cd backend
pip install -r requirements.txt
```

### 1.2 ตรวจสอบ packages ที่เกี่ยวข้อง

```bash
x
```

ควรเห็น:
- `cloudinary`
- `django-cloudinary-storage`

---

## 🔑 Step 2: ตั้งค่า Cloudinary Credentials

### 2.1 สร้าง Cloudinary Account (ถ้ายังไม่มี)

1. ไปที่ https://cloudinary.com/users/register/free
2. สมัคร Free tier (ไม่ต้องใช้บัตรเครดิต)
3. หลังจากสมัครเสร็จ จะได้ Dashboard

### 2.2 ดึง Cloudinary Credentials

1. ไปที่ Dashboard: https://cloudinary.com/console
2. คลิกที่ "Account Details" หรือดูที่ Dashboard
3. คัดลอก:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2.3 สร้างไฟล์ `.env`

```bash
# จาก root directory ของโปรเจค
cp .env.example .env
```

### 2.4 แก้ไข `.env` file

เปิดไฟล์ `.env` และใส่ credentials:

```env
# Cloudinary Configuration
USE_CLOUDINARY=True
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# Database (ใส่ค่าที่มีอยู่แล้ว)
POSTGRES_DB=ku_hangout_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
```

⚠️ **สำคัญ**: อย่า commit `.env` file เข้า git!

---

## 🗄️ Step 3: ตรวจสอบ Database Migrations

### 3.1 ตรวจสอบ migrations

```bash
cd backend
python manage.py showmigrations plans
```

### 3.2 Run migrations (ถ้ายังไม่ได้ run)

```bash
python manage.py migrate
```

ควรเห็น migration สำหรับ `PlanImage` model

---

## ⚙️ Step 4: ตรวจสอบ Settings

### 4.1 ตรวจสอบ `settings.py`

เปิด `backend/backend/settings.py` และตรวจสอบว่า:

1. ✅ มี `cloudinary` และ `cloudinary_storage` ใน `INSTALLED_APPS`
2. ✅ มี `CLOUDINARY_STORAGE` configuration
3. ✅ มี `USE_CLOUDINARY` flag

### 4.2 ตรวจสอบว่า settings ถูกโหลด

```bash
cd backend
python manage.py shell
```

```python
from django.conf import settings
print("USE_CLOUDINARY:", settings.USE_CLOUDINARY)
print("CLOUD_NAME:", settings.CLOUDINARY_STORAGE.get('CLOUD_NAME', 'Not set'))
```

ถ้าเห็น `Not set` แสดงว่า `.env` ไม่ถูกโหลด

---

## 🧪 Step 5: ทดสอบ Backend

### 5.1 Start Backend Server

```bash
cd backend
python manage.py runserver
```

### 5.2 ทดสอบ API Endpoint

#### 5.2.1 สร้าง Plan พร้อม Images (ใช้ Postman หรือ curl)

**Method**: POST  
**URL**: `http://localhost:8000/plans/create/`  
**Headers**:
```
Authorization: Bearer <your_jwt_token>
Content-Type: multipart/form-data
```

**Body** (form-data):
```
title: Test Plan with Images
description: Testing Cloudinary upload
location: Test Location
event_time: 2024-12-31T12:00:00Z
max_people: 10
tags: ["Food", "Travel"]
images: [เลือกไฟล์รูปภาพ 1]
images: [เลือกไฟล์รูปภาพ 2]
images: [เลือกไฟล์รูปภาพ 3]
```

#### 5.2.2 ตรวจสอบ Response

Response ควรมี:
```json
{
  "message": "Plan created successfully",
  "plan": {
    "id": 1,
    "title": "Test Plan with Images",
    "images": [
      {
        "id": 1,
        "image_url": "https://res.cloudinary.com/your-cloud/image/upload/...",
        "uploaded_at": "2024-11-14T..."
      }
    ]
  }
}
```

#### 5.2.3 ตรวจสอบใน Cloudinary Dashboard

1. ไปที่ https://cloudinary.com/console
2. คลิก "Media Library"
3. ควรเห็นรูปภาพที่อัปโหลดใน folder `plan_images/`

---

## 🎨 Step 6: ทดสอบ Frontend Integration

### 6.1 Start Frontend

```bash
cd frontend
npm install  # ถ้ายังไม่ได้ install
npm run dev
```

### 6.2 ทดสอบการสร้าง Plan

1. เปิด browser ไปที่ `http://localhost:5173`
2. Login เข้าระบบ
3. คลิก "Create Plan"
4. กรอกข้อมูล plan
5. **อัปโหลดรูปภาพ** (เลือกไฟล์รูป)
6. คลิก "Create"

### 6.3 ตรวจสอบผลลัพธ์

1. ✅ Plan ถูกสร้างสำเร็จ
2. ✅ รูปภาพแสดงใน plan card
3. ✅ รูปภาพแสดงใน feed ของ account อื่น
4. ✅ รูปภาพมาจาก Cloudinary URLs (ตรวจสอบใน Network tab)

---

## 🐛 Troubleshooting

### ปัญหา: `USE_CLOUDINARY` เป็น `False`

**สาเหตุ**: `.env` ไม่ถูกโหลดหรือ `USE_CLOUDINARY` ไม่ได้ตั้งค่า

**แก้ไข**:
1. ตรวจสอบว่า `.env` อยู่ใน root directory
2. ตรวจสอบว่า `USE_CLOUDINARY=True` ใน `.env`
3. Restart Django server

### ปัญหา: `CLOUDINARY_CLOUD_NAME` เป็น `None`

**สาเหตุ**: Environment variables ไม่ถูกโหลด

**แก้ไข**:
```bash
# ตรวจสอบว่า .env ถูกโหลด
cd backend
python manage.py shell
```

```python
import os
from dotenv import load_dotenv
load_dotenv()
print(os.getenv('CLOUDINARY_CLOUD_NAME'))
```

### ปัญหา: Images ไม่แสดงใน Frontend

**สาเหตุ**: API ไม่ส่ง `images` field กลับมา

**แก้ไข**:
1. ตรวจสอบว่า serializer มี `images` field
2. ตรวจสอบว่า API response มี `images` array
3. ตรวจสอบ Network tab ใน browser console

### ปัญหา: Upload Failed (400 Bad Request)

**สาเหตุ**: FormData ไม่ถูกส่งหรือ format ไม่ถูกต้อง

**แก้ไข**:
1. ตรวจสอบว่า frontend ส่ง FormData (ไม่ใช่ JSON)
2. ตรวจสอบว่า field name เป็น `images` (plural)
3. ตรวจสอบว่า Content-Type เป็น `multipart/form-data`

---

## ✅ Checklist การทดสอบ

- [ ] Cloudinary credentials ถูกตั้งค่าใน `.env`
- [ ] `USE_CLOUDINARY=True` ใน `.env`
- [ ] Backend server รันได้
- [ ] API สร้าง plan พร้อม images ได้
- [ ] Images อัปโหลดไป Cloudinary สำเร็จ
- [ ] API ส่ง `images` array กลับมา
- [ ] Frontend ส่ง FormData ได้ถูกต้อง
- [ ] Frontend แสดงรูปภาพจาก Cloudinary URLs
- [ ] Account อื่นเห็นรูปภาพเดียวกัน

---

## 📚 Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Django Cloudinary Storage](https://github.com/klis87/django-cloudinary-storage)
- [Cloudinary Free Tier Limits](https://cloudinary.com/pricing)

---

## 🎉 Success!

ถ้าทุกอย่างทำงานได้ คุณจะเห็น:
- ✅ รูปภาพถูกอัปโหลดไป Cloudinary
- ✅ URLs ถูกเก็บใน database
- ✅ Frontend แสดงรูปภาพจาก Cloudinary
- ✅ ทุก account เห็นรูปภาพเดียวกัน

