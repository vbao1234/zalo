# ✅ APK Build Setup - Hoàn thành!

## 📋 Đã chuẩn bị sẵn sàng

Tất cả cấu hình cần thiết để build APK đã được thiết lập. Dưới đây là tổng kết:

---

## 🎯 Đã hoàn thành

### 1. ✅ Android Project Structure
- Đã khởi tạo thư mục `mobile/android/` đầy đủ
- Cấu hình build.gradle cho release
- Thiết lập ProGuard minification

### 2. ✅ API Configuration
- File: `mobile/src/config/api.config.ts`
- Hỗ trợ switch Development/Production environment
- **TODO**: Cập nhật `PRODUCTION_API_URL` sau khi deploy backend

### 3. ✅ Signing Key
- Location: `mobile/android/app/zalo-release-key.keystore`
- Store Password: `zalo2024release`
- Key Alias: `zalo-key-alias`
- Key Password: `zalo2024release`
- Validity: 10,000 days (~27 years)

### 4. ✅ App Configuration
- Package: `com.zaloaccountmanager`
- App Name: "Zalo Manager"
- Version: 1.0.0 (versionCode: 1)

### 5. ✅ Dependencies
- Node packages: Installed (943 packages)
- Gradle wrapper: Configured

### 6. ✅ Documentation
- `BUILD_APK_GUIDE.md`: Hướng dẫn chi tiết đầy đủ
- `QUICK_BUILD_APK.md`: Hướng dẫn nhanh

---

## ⚠️ Vấn đề phát hiện: JDK Version Mismatch

**Lỗi**: Hệ thống đang dùng JDK 21, nhưng Gradle 7.5.1 chỉ support tới JDK 18.

**Giải pháp**:

### Option 1: Cài đặt JDK 17 (Khuyến nghị)

1. Download JDK 17:
   - https://adoptium.net/temurin/releases/?version=17

2. Set JAVA_HOME:
   ```powershell
   # Windows PowerShell
   $env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot"
   $env:PATH="$env:JAVA_HOME\bin;$env:PATH"

   # Verify
   java -version  # Should show "17.x.x"
   ```

3. Build APK:
   ```powershell
   cd mobile\android
   .\gradlew.bat clean assembleRelease
   ```

### Option 2: Build với Android Studio

1. Mở Android Studio
2. File → Open → chọn `mobile/android/`
3. Build → Generate Signed Bundle/APK → APK
4. Chọn keystore: `app/zalo-release-key.keystore`
5. Nhập passwords (đều là `zalo2024release`)
6. Chọn build variant: release
7. Finish

APK sẽ được tạo tại:
`mobile/android/app/release/app-release.apk`

### Option 3: Sử dụng npx react-native (Nếu có React Native CLI global)

```powershell
cd mobile
npx react-native run-android --variant=release
```

---

## 🚀 Các bước tiếp theo

### Bước 1: Deploy Backend lên Railway

```powershell
# Đã có Railway account: vbao01 (vbao89660@gmail.com)

# Login
railway login

# Link hoặc tạo project mới
cd backend
railway init
railway add --database postgres
railway up
railway domain
```

**Lưu lại Public URL**: `https://your-app-name.up.railway.app`

---

### Bước 2: Cập nhật Production API URL

Mở `mobile/src/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  DEVELOPMENT_API_URL: 'http://10.0.2.2:3000',

  // Thay đổi URL này:
  PRODUCTION_API_URL: 'https://your-app-name.up.railway.app',

  TIMEOUT: 30000,
};
```

---

### Bước 3: Build APK

**Với JDK 17** (sau khi cài):

```powershell
cd mobile\android
.\gradlew.bat clean assembleRelease
```

**Hoặc với Android Studio**:
- Mở `mobile/android/`
- Build → Generate Signed Bundle/APK

**File APK**: `mobile\android\app\build\outputs\apk\release\app-release.apk`

---

### Bước 4: Cài đặt APK

**Via ADB**:
```powershell
adb install mobile\android\app\build\outputs\apk\release\app-release.apk
```

**Hoặc**:
1. Copy file APK vào điện thoại
2. Mở file và cài đặt
3. Enable "Install from Unknown Sources" nếu được hỏi

---

## 📂 Files quan trọng đã tạo

```
mobile/
├── android/                       # Android native project
│   ├── app/
│   │   ├── build.gradle          # Build config với signing
│   │   └── zalo-release-key.keystore  # Signing key ⚠️ BACKUP!
│   └── gradle/wrapper/
│       └── gradle-wrapper.properties  # Gradle 7.5.1
├── src/
│   └── config/
│       └── api.config.ts         # API URL configuration
└── package.json

Docs:
├── BUILD_APK_GUIDE.md            # Chi tiết đầy đủ
├── QUICK_BUILD_APK.md            # Hướng dẫn nhanh
└── BUILD_SETUP_COMPLETE.md       # File này
```

---

## 🔒 BẢO MẬT - QUAN TRỌNG!

1. **Keystore File** (`zalo-release-key.keystore`):
   - ⚠️ **KHÔNG** commit vào Git
   - ⚠️ **PHẢI** backup ở nơi an toàn
   - ⚠️ **CẦN** để update app sau này trên Google Play

2. **.gitignore đã được cập nhật**:
   ```
   *.keystore
   *.jks
   ```

3. **Passwords**:
   - Lưu passwords ở nơi an toàn
   - Đừng share publicly

---

## 🐛 Troubleshooting

### "Gradle build failed"
1. Kiểm tra JDK version: `java -version` (cần 17 hoặc 18)
2. Clear Gradle cache:
   ```powershell
   cd mobile\android
   .\gradlew.bat clean
   rm -r .gradle
   ```

### "Plugin not found"
```powershell
cd mobile
rm -rf node_modules
npm install
```

### "Keystore not found"
- Keystore đã được tạo tại: `mobile/android/app/zalo-release-key.keystore`
- Nếu mất, cần tạo lại (nhưng không thể update app cũ trên Play Store)

### App không kết nối backend
1. Kiểm tra `PRODUCTION_API_URL` trong `api.config.ts`
2. Test backend: `curl https://your-url/health`
3. Rebuild APK sau khi thay đổi URL

---

## 📞 Support

- Email: vbao89660@gmail.com
- Railway Account: vbao01

---

## ✅ Checklist Build APK

- [x] Android project initialized
- [x] Signing key generated
- [x] Build configuration setup
- [x] API config created
- [ ] Backend deployed to Railway
- [ ] Production URL updated in api.config.ts
- [ ] JDK 17 installed (or use Android Studio)
- [ ] APK built successfully
- [ ] APK tested on device

---

**Tất cả đã sẵn sàng! Chỉ cần:**
1. Deploy backend lên Railway
2. Cập nhật Production URL
3. Build APK (với JDK 17 hoặc Android Studio)

**Good luck! 🚀**
