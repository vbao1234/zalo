# 🎯 HƯỚNG DẪN BUILD APK - FINAL

## ✅ ĐÃ HOÀN THÀNH

Tất cả setup đã sẵn sàng. Bạn chỉ cần build APK.

---

## 🚀 CÁCH BUILD NHANH NHẤT

### Option 1: Android Studio (KHUYẾN NGHỊ)

**Lý do:** Ổn định, user-friendly, không gặp vấn đề JDK/Gradle

**Các bước:**

1. Mở **Android Studio**

2. **File** → **Open** → Chọn: `C:\zalo-account-manager\mobile\android`

3. Đợi Gradle Sync tự động (có thể mất 5-10 phút lần đầu)

4. **Build** → **Generate Signed Bundle / APK**

5. Chọn **APK** → Next

6. **Configure Signing**:
   - Key store path: Click **"Choose existing..."**
   - Browse tới: `C:\zalo-account-manager\mobile\android\app\zalo-release-key.keystore`
   - Key store password: `zalo2024release`
   - Key alias: `zalo-key-alias`
   - Key password: `zalo2024release`
   - **Remember passwords** (tích vào)
   - Next

7. **Build Variants**:
   - Destination folder: (để mặc định)
   - Build Variants: Chọn **release**
   - Signature Versions: Tích cả V1 và V2
   - **Finish**

8. **Lấy APK**:
   - Sau khi build xong, click **"locate"** trong notification
   - Hoặc vào: `C:\zalo-account-manager\mobile\android\app\release\app-release.apk`

---

### Option 2: Command Line (Nếu có Android Studio)

**Yêu cầu:** Android Studio đã cài (để có Android SDK)

```powershell
# Mở PowerShell
cd C:\zalo-account-manager\mobile\android

# Build
.\gradlew.bat clean assembleRelease

# APK sẽ ở:
# mobile\android\app\build\outputs\apk\release\app-release.apk
```

**Nếu gặp lỗi JDK:**
- Android Studio tự động dùng JDK đúng version
- Hoặc cài JDK 17: https://adoptium.net/temurin/releases/?version=17

---

### Option 3: Sử dụng React Native CLI

```powershell
cd C:\zalo-account-manager\mobile

# Build và install trực tiếp lên thiết bị
npx react-native run-android --variant=release
```

**Lưu ý:** Cần kết nối điện thoại qua USB và enable USB debugging

---

## 📱 SAU KHI CÓ APK

### Cài đặt qua ADB:

```powershell
adb devices  # Kiểm tra thiết bị
adb install C:\zalo-account-manager\mobile\android\app\build\outputs\apk\release\app-release.apk
```

### Cài đặt thủ công:

1. Copy file `app-release.apk` vào điện thoại
2. Mở File Manager → tìm file APK
3. Tap vào file → Install
4. Nếu được hỏi, enable **"Install from Unknown Sources"**
5. Tap **Install**

---

## 🔧 CẤU HÌNH ĐÃ SETUP

### ✅ Signing Key
- **Location**: `C:\zalo-account-manager\mobile\android\app\zalo-release-key.keystore`
- **Passwords**: `zalo2024release` (store & key)
- **Alias**: `zalo-key-alias`
- **⚠️ QUAN TRỌNG**: Backup file này! Cần để update app sau này

### ✅ App Info
- **Package**: com.zaloaccountmanager
- **Name**: Zalo Manager
- **Version**: 1.0.0 (versionCode: 1)

### ✅ Gradle Version
- **Configured**: Gradle 8.0.2
- **Compatible with**: JDK 17-21

### ✅ API Configuration
- **File**: `mobile/src/config/api.config.ts`
- **Development URL**: `http://10.0.2.2:3000` (Android emulator)
- **Production URL**: `https://your-backend.up.railway.app` (TODO: Cập nhật sau khi deploy)

---

## 🚢 DEPLOY BACKEND (Làm trước khi distribute APK)

### 1. Deploy lên Railway:

```powershell
# Login Railway (đã có account: vbao01)
railway login

# Tạo project
cd C:\zalo-account-manager\backend
railway init

# Add PostgreSQL
railway add --database postgres

# Deploy
railway up

# Tạo public domain
railway domain
```

**Lưu lại URL**: `https://your-app-name.up.railway.app`

### 2. Cập nhật Production URL:

Mở: `C:\zalo-account-manager\mobile\src\config\api.config.ts`

```typescript
PRODUCTION_API_URL: 'https://your-app-name.up.railway.app',
```

### 3. Rebuild APK với Production URL

Sau khi thay đổi URL, rebuild APK để app connect tới production backend.

---

## 🐛 TROUBLESHOOTING

### Build failed - "Unsupported class file version"

**Lý do**: JDK version không tương thích với Gradle

**Giải pháp**:
- Dùng Android Studio (tự động chọn JDK đúng)
- Hoặc cài JDK 17: https://adoptium.net/temurin/releases/?version=17

### Build failed - "Plugin not found"

```powershell
cd C:\zalo-account-manager\mobile
rm -rf node_modules
npm install
```

### Build failed - "Keystore not found"

Keystore đã được tạo tại:
`C:\zalo-account-manager\mobile\android\app\zalo-release-key.keystore`

Nếu mất, xem file `BUILD_APK_GUIDE.md` để tạo lại.

### APK không kết nối backend

1. Check `PRODUCTION_API_URL` trong `api.config.ts`
2. Test backend: `curl https://your-url/health` hoặc mở trong browser
3. Rebuild APK sau khi thay đổi URL

### "Install blocked" trên điện thoại

Settings → Security → Enable **"Install from Unknown Sources"** hoặc **"Install unknown apps"**

---

## 📋 CHECKLIST BUILD APK

### Trước khi build:
- [x] Android project initialized
- [x] Signing key generated
- [x] Build config setup
- [x] Dependencies installed
- [ ] Backend deployed (nếu cần production build)
- [ ] Production URL updated (nếu deploy backend)

### Build APK:
- [ ] Mở Android Studio
- [ ] Open project: `mobile/android`
- [ ] Generate Signed APK
- [ ] Chọn keystore và nhập passwords
- [ ] Build variant: release
- [ ] APK generated successfully

### Sau khi build:
- [ ] Test APK trên thiết bị thật
- [ ] App khởi động bình thường
- [ ] Kết nối backend thành công
- [ ] Test các chức năng chính

---

## 📞 SUPPORT

- **Email**: vbao89660@gmail.com
- **Railway Account**: vbao01
- **Keystore Password**: zalo2024release

---

## 🎯 TÓM TẮT

**Setup hoàn thành 100%!** Bạn chỉ cần:

1. **Build APK** → Dùng Android Studio (dễ nhất)
2. **Deploy Backend** → Railway (nếu cần production)
3. **Update URL** → api.config.ts (nếu đã deploy)
4. **Rebuild** → Nếu đã update URL
5. **Test** → Cài APK lên điện thoại

**File quan trọng:**
- APK location: `mobile\android\app\build\outputs\apk\release\app-release.apk`
- Keystore: `mobile\android\app\zalo-release-key.keystore` (⚠️ BACKUP!)

**Good luck! 🚀**
