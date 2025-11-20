# 📱 Hướng dẫn Build APK - Zalo Account Manager

## 📋 Yêu cầu

- **Node.js** 18+
- **JDK** 17 hoặc 21
- **Android SDK** (Android Studio hoặc command-line tools)
- **Backend deployed** trên Railway hoặc server khác

---

## 🚀 Các bước Build APK

### Bước 1: Deploy Backend lên Railway

Trước khi build APK, bạn cần deploy backend và lấy public URL.

#### Sử dụng Railway CLI:

```powershell
# Login vào Railway
railway login

# Khởi tạo project mới
cd backend
railway init

# Thêm PostgreSQL database
railway add --database postgres

# Deploy backend
railway up

# Tạo public domain
railway domain
```

Railway sẽ trả về URL dạng: `https://your-app-name.up.railway.app`

**📌 Lưu lại URL này!**

---

### Bước 2: Cập nhật Production API URL

Mở file `mobile/src/config/api.config.ts` và cập nhật:

```typescript
export const API_CONFIG = {
  // ...

  // Cập nhật URL này với URL Railway của bạn
  PRODUCTION_API_URL: 'https://your-app-name.up.railway.app',

  // ...
};
```

**⚠️ QUAN TRỌNG:**
- URL không có dấu `/` ở cuối
- Phải là HTTPS (Railway tự động cung cấp SSL)
- Có thể test URL bằng cách truy cập: `https://your-url.up.railway.app/health`

---

### Bước 3: Cài đặt Dependencies

```bash
cd mobile
npm install
```

---

### Bước 4: Build APK Release

```bash
cd mobile/android
./gradlew clean assembleRelease
```

**⏱️ Thời gian:** 5-10 phút cho lần build đầu tiên

**📍 File APK sẽ được tạo tại:**
```
mobile/android/app/build/outputs/apk/release/app-release.apk
```

---

### Bước 5: Kiểm tra APK

```bash
# Kiểm tra APK đã tồn tại
ls mobile/android/app/build/outputs/apk/release/

# Kiểm tra kích thước file
du -h mobile/android/app/build/outputs/apk/release/app-release.apk
```

**📊 Kích thước dự kiến:** 20-40 MB (có ProGuard minification)

---

## 📦 Cài đặt APK lên điện thoại

### Cách 1: Qua USB (ADB)

```bash
# Kết nối điện thoại qua USB và enable USB debugging
adb install mobile/android/app/build/outputs/apk/release/app-release.apk
```

### Cách 2: Chuyển file trực tiếp

1. Copy file `app-release.apk` vào điện thoại (qua USB, Bluetooth, hoặc cloud)
2. Mở file APK trên điện thoại
3. Cho phép "Install from Unknown Sources" nếu được hỏi
4. Nhấn "Install"

---

## 🔧 Troubleshooting

### Lỗi: "Gradle download failed"

```bash
# Xóa Gradle cache và thử lại
rm -rf ~/.gradle/wrapper/dists
cd mobile/android
./gradlew clean assembleRelease
```

### Lỗi: "SDK not found"

Set `ANDROID_HOME` environment variable:

**Windows:**
```powershell
$env:ANDROID_HOME="C:\Users\YourName\AppData\Local\Android\Sdk"
```

**Mac/Linux:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
```

### Lỗi: "Keystore not found"

Tạo lại signing key:

```bash
cd mobile/android
keytool -genkeypair -v -storetype PKCS12 \
  -keystore app/zalo-release-key.keystore \
  -alias zalo-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass zalo2024release -keypass zalo2024release \
  -dname "CN=Zalo Account Manager, OU=Mobile, O=VBao, L=Hanoi, ST=Hanoi, C=VN"
```

### App không kết nối được backend

1. Kiểm tra Production API URL trong `mobile/src/config/api.config.ts`
2. Đảm bảo backend đang chạy: `curl https://your-url.up.railway.app/health`
3. Kiểm tra CORS settings trong backend `main.ts`
4. Rebuild APK sau khi thay đổi URL

---

## 🔄 Rebuild APK sau khi thay đổi

Nếu bạn thay đổi:
- Production API URL
- App version
- Code logic

Cần rebuild APK:

```bash
cd mobile/android
./gradlew clean
./gradlew assembleRelease
```

---

## 📝 Thông tin Build

### App Information:
- **Package Name:** `com.zaloaccountmanager`
- **App Name:** Zalo Manager
- **Version Code:** 1
- **Version Name:** 1.0.0

### Signing Key Information:
- **Keystore:** `mobile/android/app/zalo-release-key.keystore`
- **Alias:** `zalo-key-alias`
- **Password:** `zalo2024release` (store & key)
- **Validity:** 10,000 days (~27 years)

**🔒 BẢO MẬT:**
- **KHÔNG** commit file `.keystore` vào Git
- **KHÔNG** chia sẻ password publicly
- Backup file keystore ở nơi an toàn

---

## 🎯 Checklist trước khi phát hành

- [ ] Backend đã deploy lên Railway/production
- [ ] Đã cập nhật `PRODUCTION_API_URL` đúng
- [ ] Đã test backend API (curl hoặc Postman)
- [ ] Đã build APK release thành công
- [ ] Đã test APK trên thiết bị thật
- [ ] App kết nối được backend production
- [ ] Tất cả tính năng hoạt động bình thường
- [ ] Đã backup signing keystore

---

## 📚 Tài liệu tham khảo

- [React Native - Publishing to Google Play Store](https://reactnative.dev/docs/signed-apk-android)
- [Railway Deployment Guide](https://docs.railway.app/)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)

---

## 🆘 Cần hỗ trợ?

Mở issue trên GitHub hoặc liên hệ: vbao89660@gmail.com

---

**Happy Building! 🎉**
