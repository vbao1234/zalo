# 🤖 HƯỚNG DẪN CÀI ĐẶT ANDROID DEVELOPMENT TOOLS

## 📋 TỔNG QUAN

Để build APK cho dự án Zalo Account Manager, bạn cần:
1. ✅ **Java JDK 11** (BẮT BUỘC)
2. ✅ **Android Command Line Tools** (BẮT BUỘC)
3. ✅ **Android SDK Packages** (BẮT BUỘC)

---

## 🚀 BƯỚC 1: CÀI ĐẶT JAVA JDK 11 (MANUAL)

### Download Java JDK 11
- **Link:** https://adoptium.net/temurin/releases/?version=11
- Chọn: **Windows x64 .msi installer**
- Kích thước: ~150 MB

### Cài đặt
1. Chạy file .msi vừa download
2. Next → Next → Install
3. Ghi nhớ đường dẫn cài đặt (ví dụ: `C:\Program Files\Eclipse Adoptium\jdk-11.0.xx`)

### Set Environment Variables
```
1. Nhấn Win + R, gõ: sysdm.cpl
2. Tab "Advanced" → "Environment Variables"
3. Trong "System variables":
   - Click "New"
   - Variable name: JAVA_HOME
   - Variable value: C:\Program Files\Eclipse Adoptium\jdk-11.0.xx
   - Click OK

4. Tìm biến "Path", click "Edit"
   - Click "New"
   - Thêm: %JAVA_HOME%\bin
   - Click OK → OK → OK
```

### Verify
Mở Command Prompt MỚI:
```bash
java -version
# Phải thấy: openjdk version "11.x.x"
```

✅ **XEM NHƯ HOÀN THÀNH KHI thấy java version!**

---

## 🚀 BƯỚC 2: CÀI ĐẶT ANDROID COMMAND LINE TOOLS (TỰ ĐỘNG)

### Chạy script tự động

**Cách 1: PowerShell (Khuyến nghị)**
```powershell
# Mở PowerShell với quyền Administrator
# (Right-click Start → Windows PowerShell (Admin))

cd C:\zalo-account-manager
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup-android-tools.ps1
```

**Cách 2: Nếu lỗi ExecutionPolicy**
```powershell
PowerShell -ExecutionPolicy Bypass -File .\setup-android-tools.ps1
```

### Script sẽ tự động:
- ✅ Download Android Command Line Tools (~150 MB)
- ✅ Giải nén vào `C:\Android\`
- ✅ Cấu trúc lại thư mục đúng chuẩn
- ✅ Set ANDROID_HOME environment variable
- ✅ Thêm vào PATH

### Thời gian: ~5-10 phút

---

## 🚀 BƯỚC 3: CÀI ĐẶT ANDROID SDK PACKAGES (TỰ ĐỘNG)

**⚠️ LƯU Ý: MỞ LẠI PowerShell/Command Prompt MỚI sau Bước 2!**

### Chạy script cài SDK
```powershell
cd C:\zalo-account-manager
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup-android-sdk.ps1
```

### Script sẽ tự động cài:
- ✅ platform-tools (adb, fastboot)
- ✅ Android 13 (API 33) + Build Tools
- ✅ Android 12 (API 31) + Build Tools
- ✅ Accept all licenses

### Dung lượng: ~2-3 GB
### Thời gian: 10-20 phút (tùy mạng)

### Verify
Mở Command Prompt MỚI:
```bash
adb version
# Phải thấy: Android Debug Bridge version...
```

✅ **XEM NHƯ HOÀN THÀNH KHI thấy adb version!**

---

## 🔍 TROUBLESHOOTING

### Lỗi 1: "sdkmanager not found"
**Giải pháp:**
- Đảm bảo đã chạy `setup-android-tools.ps1` thành công
- Mở lại Command Prompt/PowerShell MỚI
- Check ANDROID_HOME: `echo %ANDROID_HOME%`

### Lỗi 2: "Java not found" khi chạy sdkmanager
**Giải pháp:**
- Cài Java JDK 11 (Bước 1)
- Set JAVA_HOME đúng
- Mở lại Command Prompt MỚI

### Lỗi 3: "Script execution disabled"
**Giải pháp:**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Lỗi 4: Download bị gián đoạn
**Giải pháp:**
- Xóa thư mục `C:\Android`
- Chạy lại `setup-android-tools.ps1`

---

## ✅ KIỂM TRA HOÀN CHỈNH

Sau khi cài đặt xong, mở Command Prompt MỚI và kiểm tra:

```bash
# 1. Check Java
java -version
# ✅ Phải thấy: openjdk version "11.x.x"

# 2. Check Android Home
echo %ANDROID_HOME%
# ✅ Phải thấy: C:\Android

# 3. Check ADB
adb version
# ✅ Phải thấy: Android Debug Bridge version...

# 4. Check sdkmanager
sdkmanager --version
# ✅ Phải thấy: version number
```

**NẾU TẤT CẢ 4 LỆNH ĐỀU CHẠY → BẠN ĐÃ SETUP XONG!** 🎉

---

## 📂 CẤU TRÚC THƯ MỤC SAU KHI CÀI

```
C:\Android\
  ├── cmdline-tools\
  │   └── latest\
  │       ├── bin\
  │       │   ├── sdkmanager.bat
  │       │   └── avdmanager.bat
  │       └── lib\
  ├── platform-tools\
  │   ├── adb.exe
  │   └── fastboot.exe
  ├── platforms\
  │   ├── android-33\
  │   └── android-31\
  └── build-tools\
      ├── 33.0.0\
      └── 31.0.0\
```

---

## 🎯 BƯỚC TIẾP THEO

Sau khi setup xong Android tools, bạn có thể:
1. ✅ Setup Docker Desktop + Backend
2. ✅ Config mobile app
3. ✅ Build APK
4. ✅ Test trên điện thoại

**Hãy thông báo cho tôi khi bạn đã verify xong tất cả 4 lệnh ở trên!** 🚀

---

## 📞 HỖ TRỢ

Nếu gặp lỗi trong quá trình cài đặt, hãy:
1. Copy toàn bộ thông báo lỗi
2. Gửi cho tôi để được hỗ trợ
3. Hoặc tham khảo: https://developer.android.com/tools
