# Google Maps API Setup Guide

## การตั้งค่า Google Maps API Key

### 1. สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend/`

### 2. เพิ่ม API Key ในไฟล์ `.env`

คุณสามารถใช้ได้ทั้งสองแบบ:

**แบบที่ 1: ใช้ VITE_ prefix (แนะนำสำหรับ Vite)**
```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**แบบที่ 2: ใช้ REACT_APP_ prefix (ตามที่คุณต้องการ)**
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**⚠️ สำคัญ:** Component จะตรวจสอบทั้งสองแบบอัตโนมัติ แต่ถ้าใช้ `REACT_APP_` prefix ต้อง restart dev server หลังจากเพิ่ม API key

### 3. Restart Development Server

**⚠️ จำเป็นต้อง restart** หลังจากเพิ่ม API key:
```bash
# หยุด server (Ctrl+C) แล้วรันใหม่
npm run dev
```

### 4. ตรวจสอบว่า API Key ทำงาน

- เปิด Create Plan Dialog
- พิมพ์ในช่อง Location
- ควรเห็น Google Places Autocomplete dropdown
- ถ้าไม่เห็น ให้ตรวจสอบ Console สำหรับ error messages

## Troubleshooting

### Error: `NoApiKeys`
- ตรวจสอบว่า API key ถูกเพิ่มในไฟล์ `.env` แล้ว
- **ต้อง restart dev server** หลังจากเพิ่ม API key
- ตรวจสอบว่า API key ไม่มีช่องว่างหรืออักขระพิเศษ

### Error: `ERR_BLOCKED_BY_CLIENT`
- ปัญหานี้เกิดจาก browser extension (เช่น ad blocker) ที่บล็อก Google Maps requests
- วิธีแก้: ปิด ad blocker หรือเพิ่มเว็บไซต์ใน whitelist
- **ไม่ใช่ปัญหาของ code**

### Warning: `Autocomplete is deprecated`
- Google แนะนำให้ใช้ `PlaceAutocompleteElement` แทน แต่ยังสามารถใช้ `Autocomplete` ได้
- Component ยังใช้ `Autocomplete` อยู่เพราะ `@react-google-maps/api` ยังไม่รองรับ `PlaceAutocompleteElement` อย่างเต็มที่
- จะไม่กระทบการใช้งานในปัจจุบัน

## หมายเหตุ

- Component จะตรวจสอบทั้ง `VITE_GOOGLE_MAPS_API_KEY` และ `REACT_APP_GOOGLE_MAPS_API_KEY` โดยอัตโนมัติ
- ถ้าไม่มี API key หรือ Google Maps script โหลดไม่สำเร็จ Component จะ fallback กลับไปใช้ Input ปกติ
- ไฟล์ `.env` ควรถูก ignore โดย git (ตรวจสอบใน `.gitignore`)

## Google Cloud Console Configuration

ตรวจสอบให้แน่ใจว่า:
1. ✅ **Places API** ถูก enable แล้ว (สำคัญมาก!)
2. ✅ API Key มีการตั้งค่า restrictions ที่เหมาะสม (แนะนำให้ restrict ด้วย HTTP referrer)
3. ✅ Billing account ถูกเปิดใช้งาน
4. ✅ API Key ไม่มี restrictions ที่บล็อก localhost (สำหรับ development)

