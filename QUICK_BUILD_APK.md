# ⚡ Quick Build APK - Zalo Account Manager

Hướng dẫn nhanh để build APK release. Xem `BUILD_APK_GUIDE.md` để biết chi tiết đầy đủ.

---

## 🚀 Các bước nhanh

### 1. Deploy Backend (chỉ làm 1 lần)

```bash
railway login
cd backend
railway init
railway add --database postgres
railway up
railway domain
```

**Lưu lại Public URL:** `https://your-app.up.railway.app`

---

### 2. Cập nhật API URL

Mở file `mobile/src/config/api.config.ts`:

```typescript
PRODUCTION_API_URL: 'https://your-app.up.railway.app',  // ← Thay đổi URL này
```

---

### 3. Build APK

```bash
cd mobile
npm install

cd android
./gradlew clean assembleRelease
```

**File APK:**
`mobile/android/app/build/outputs/apk/release/app-release.apk`

---

## 📱 Cài đặt APK

### Qua ADB:
```bash
adb install mobile/android/app/build/outputs/apk/release/app-release.apk
```

### Hoặc:
1. Copy file `app-release.apk` vào điện thoại
2. Mở file và cài đặt
3. Cho phép "Install from Unknown Sources" nếu được hỏi

---

## 🔄 Rebuild sau khi thay đổi

Sau khi thay đổi code hoặc URL:

```bash
cd mobile/android
./gradlew clean
./gradlew assembleRelease
```

---

## 📋 Thông tin quan trọng

### App Info:
- **Package:** com.zaloaccountmanager
- **Name:** Zalo Manager
- **Version:** 1.0.0 (code: 1)

### Signing Key:
- **Location:** `mobile/android/app/zalo-release-key.keystore`
- **Password:** `zalo2024release`
- **Alias:** `zalo-key-alias`

**⚠️ QUAN TRỌNG:**
- Không commit file `.keystore` vào Git
- Backup file keystore ở nơi an toàn
- Không đổi password hoặc xóa keystore (cần để update app sau này)

---

## 🐛 Troubleshooting

### "Gradle download failed"
```bash
rm -rf ~/.gradle/wrapper/dists
cd mobile/android && ./gradlew clean assembleRelease
```

### "Plugin not found"
```bash
cd mobile
rm -rf node_modules
npm install
cd android && ./gradlew clean assembleRelease
```

### App không kết nối backend
- Kiểm tra `PRODUCTION_API_URL` trong `api.config.ts`
- Test backend: `curl https://your-url.up.railway.app/health`
- Rebuild APK sau khi thay đổi URL

---

## 📞 Liên hệ

Email: vbao89660@gmail.com
