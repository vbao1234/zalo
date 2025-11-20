# ⚡ Ngrok Quick Start - Chạy ngay!

## 🚀 Cách nhanh nhất: Chạy script tự động

### Bước 1: Chạy script

```powershell
# Mở PowerShell trong thư mục gốc
cd C:\zalo-account-manager

# Chạy script
.\start-dev-with-ngrok.ps1
```

**Script sẽ tự động:**
1. ✅ Start backend (port 3000)
2. ✅ Cài ngrok (nếu chưa có)
3. ✅ Cấu hình authtoken
4. ✅ Start ngrok tunnel
5. ✅ Mở ngrok dashboard

---

### Bước 2: Lấy Ngrok URL

Trong cửa sổ **Ngrok** mới mở, tìm dòng:

```
Forwarding  https://xxxx-yyyy-zzzz.ngrok-free.app -> http://localhost:3000
```

**Copy URL:** `https://xxxx-yyyy-zzzz.ngrok-free.app`

---

### Bước 3: Cập nhật Mobile App

Mở file: `mobile/src/config/api.config.ts`

```typescript
export const API_CONFIG = {
  DEVELOPMENT_API_URL: 'http://10.0.2.2:3000',

  // Paste ngrok URL vào đây:
  PRODUCTION_API_URL: 'https://xxxx-yyyy-zzzz.ngrok-free.app',

  TIMEOUT: 30000,
};
```

**Lưu file!**

---

### Bước 4: Build APK

#### Option A: Android Studio (Khuyến nghị)

1. Mở Android Studio
2. File → Open → `C:\zalo-account-manager\mobile\android`
3. Build → Generate Signed Bundle/APK → APK
4. Keystore: `app/zalo-release-key.keystore`
5. Passwords: `zalo2024release`
6. Build variant: **release**

#### Option B: Command Line

```powershell
cd mobile\android
.\gradlew.bat clean assembleRelease
```

**APK location:** `mobile\android\app\build\outputs\apk\release\app-release.apk`

---

### Bước 5: Cài APK lên điện thoại

```powershell
# Via ADB
adb install mobile\android\app\build\outputs\apk\release\app-release.apk

# Hoặc copy file APK vào điện thoại và cài thủ công
```

---

## 📱 Test App

1. Mở app trên điện thoại
2. App sẽ kết nối tới backend qua ngrok URL
3. Backend logs sẽ hiện trong cửa sổ backend
4. Ngrok dashboard (http://127.0.0.1:4040) sẽ show tất cả requests

---

## 🔄 Khi cần restart

### Nếu restart máy tính:

```powershell
# Chạy lại script
.\start-dev-with-ngrok.ps1
```

### Nếu chỉ restart ngrok:

**Ngrok URL sẽ thay đổi!** Cần:
1. Lấy URL mới từ ngrok window
2. Cập nhật `api.config.ts`
3. Rebuild APK

---

## 💡 Tips

### Giữ Ngrok URL cố định (Paid plan)

```powershell
ngrok http 3000 --subdomain=mybackend
# URL: https://mybackend.ngrok.io (không đổi)
```

### Xem ngrok dashboard

Mở browser: http://127.0.0.1:4040

- Xem tất cả HTTP requests
- Response times
- Request/response body
- Replay requests

### Stop Development

- Đóng cửa sổ **Backend**
- Đóng cửa sổ **Ngrok**
- Hoặc Ctrl+C trong mỗi cửa sổ

---

## 🐛 Troubleshooting

### Backend không start

```powershell
cd backend
npm install
npm run start:dev
```

### Ngrok không connect

```powershell
# Cấu hình lại authtoken
ngrok config add-authtoken 2jtEAhW5i31190yXPSke6BWSO92_7vPpueF7ak4wBtHUUcMtC
```

### Mobile app không kết nối

1. Check URL trong `api.config.ts` (đúng format, không có `/` cuối)
2. Test backend: mở ngrok URL trong browser
3. Rebuild APK sau khi thay đổi URL

---

## 📋 Checklist

- [ ] Chạy script `start-dev-with-ngrok.ps1`
- [ ] Backend đang chạy (port 3000)
- [ ] Ngrok tunnel active
- [ ] Copy ngrok URL
- [ ] Update `api.config.ts`
- [ ] Build APK
- [ ] Install APK lên điện thoại
- [ ] Test app

---

## 🎯 Summary

**3 bước chính:**

1. **Run**: `.\start-dev-with-ngrok.ps1`
2. **Update**: Copy ngrok URL vào `api.config.ts`
3. **Build**: APK với Android Studio

**Xong! 🎉**

---

**Note:** Ngrok free plan URL sẽ thay đổi mỗi lần restart!
