# 🌐 Setup Ngrok cho Backend Local

## Tại sao dùng Ngrok?

- ✅ Tạo **public HTTPS URL** cho backend local
- ✅ Mobile app có thể kết nối qua internet
- ✅ **Không cần deploy** lên Railway để test
- ✅ Miễn phí cho development/testing
- ✅ Hỗ trợ HTTPS tự động

---

## 📥 Cài đặt Ngrok

### Cách 1: Download từ website

1. Truy cập: https://ngrok.com/download
2. Download Ngrok cho Windows
3. Giải nén file `ngrok.exe` vào thư mục bất kỳ (ví dụ: `C:\ngrok\`)

### Cách 2: Dùng Chocolatey (nếu đã cài)

```powershell
choco install ngrok
```

### Cách 3: Dùng npm

```powershell
npm install -g ngrok
```

---

## 🔑 Đăng ký tài khoản Ngrok (Miễn phí)

1. Truy cập: https://dashboard.ngrok.com/signup
2. Đăng ký tài khoản (miễn phí)
3. Lấy **Authtoken** tại: https://dashboard.ngrok.com/get-started/your-authtoken
4. Cấu hình authtoken:

```powershell
ngrok config add-authtoken YOUR_TOKEN_HERE
```

**Lưu ý:** Authtoken chỉ cần setup 1 lần duy nhất.

---

## 🚀 Sử dụng Ngrok với Backend

### Bước 1: Chạy Backend Local

```powershell
# Terminal 1: Chạy backend
cd C:\zalo-account-manager\backend
npm run start:dev
```

Backend sẽ chạy tại: `http://localhost:3000`

### Bước 2: Chạy Ngrok

```powershell
# Terminal 2: Chạy ngrok
ngrok http 3000
```

**Output sẽ hiển thị:**

```
ngrok

Session Status                online
Account                       your-email@gmail.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xxxx-yyyy-zzzz.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Public URL:** `https://xxxx-yyyy-zzzz.ngrok-free.app` ← Copy URL này!

---

## 📱 Cấu hình Mobile App với Ngrok URL

### Bước 3: Cập nhật API URL

Mở file: `C:\zalo-account-manager\mobile\src\config\api.config.ts`

```typescript
export const API_CONFIG = {
  DEVELOPMENT_API_URL: 'http://10.0.2.2:3000',

  // Thay đổi URL này bằng Ngrok URL
  PRODUCTION_API_URL: 'https://xxxx-yyyy-zzzz.ngrok-free.app',

  TIMEOUT: 30000,
};
```

**Lưu ý:**
- **KHÔNG** thêm `/` ở cuối URL
- Ngrok URL thay đổi mỗi lần restart (free plan)
- Nếu restart ngrok, phải rebuild APK với URL mới

---

## 🔄 Workflow Development với Ngrok

### Quy trình làm việc:

```
┌─────────────────┐
│ 1. Start Backend│  npm run start:dev (Terminal 1)
└────────┬────────┘
         │
┌────────▼────────┐
│ 2. Start Ngrok  │  ngrok http 3000 (Terminal 2)
└────────┬────────┘
         │
┌────────▼────────┐
│ 3. Copy URL     │  https://xxxx.ngrok-free.app
└────────┬────────┘
         │
┌────────▼────────┐
│ 4. Update URL   │  mobile/src/config/api.config.ts
└────────┬────────┘
         │
┌────────▼────────┐
│ 5. Build APK    │  Android Studio hoặc gradlew
└────────┬────────┘
         │
┌────────▼────────┐
│ 6. Test App     │  Cài APK lên điện thoại
└─────────────────┘
```

### Giữ backend và ngrok chạy liên tục:

```powershell
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Ngrok
ngrok http 3000
```

**Để 2 terminals này chạy** khi đang test/develop app.

---

## 🎯 Test Backend qua Ngrok

### Kiểm tra backend hoạt động:

```powershell
# Mở browser hoặc dùng curl
curl https://xxxx-yyyy-zzzz.ngrok-free.app/health

# Hoặc test với Postman
```

### Xem logs/requests:

Ngrok cung cấp **Web Interface** tại: http://127.0.0.1:4040

- Xem tất cả HTTP requests
- Response times
- Headers, body, etc.

---

## ⚙️ Ngrok Advanced (Optional)

### Cố định subdomain (Paid plan)

```powershell
ngrok http 3000 --subdomain=mybackend
# URL sẽ là: https://mybackend.ngrok.io
```

### Custom domain (Paid plan)

```powershell
ngrok http 3000 --hostname=api.yourdomain.com
```

### Cấu hình file ngrok.yml

Tạo file `C:\Users\YourName\.ngrok2\ngrok.yml`:

```yaml
version: "2"
authtoken: YOUR_TOKEN_HERE
tunnels:
  zalo-backend:
    proto: http
    addr: 3000
    bind_tls: true
```

Chạy với config:

```powershell
ngrok start zalo-backend
```

---

## 🆚 So sánh: Ngrok vs Nginx vs Railway

| Feature | Ngrok | Nginx (Local) | Railway |
|---------|-------|---------------|---------|
| **Public Access** | ✅ Yes (HTTPS) | ❌ Chỉ LAN | ✅ Yes (HTTPS) |
| **Setup** | ⚡ 2 phút | 🔧 Phức tạp | ⚡ 5 phút |
| **Cost** | 🆓 Free (dev) | 🆓 Free | 💰 $5/month |
| **Mobile Testing** | ✅ Dễ dàng | ⚠️ Cùng Wifi | ✅ Dễ dàng |
| **Production** | ❌ No | ❌ No | ✅ Yes |
| **HTTPS** | ✅ Auto | 🔧 Cần setup | ✅ Auto |

**Kết luận:**
- **Development/Testing**: Dùng **Ngrok** 🏆
- **Production**: Dùng **Railway**
- **Nginx local**: Chỉ dùng khi cần custom routing phức tạp

---

## 🐛 Troubleshooting

### "Tunnel not found"

```powershell
# Đăng ký authtoken lại
ngrok config add-authtoken YOUR_TOKEN
```

### Ngrok URL không truy cập được

1. Kiểm tra backend đang chạy: `curl http://localhost:3000`
2. Kiểm tra firewall không block ngrok
3. Restart ngrok

### "ERR_NGROK_108: Tunnel limit exceeded"

- Free plan chỉ cho 1 tunnel đồng thời
- Đóng các ngrok instances khác

### Mobile app không connect

1. Check URL trong `api.config.ts` (không có `/` cuối)
2. Test backend: `curl https://your-ngrok-url.ngrok-free.app`
3. Rebuild APK sau khi thay đổi URL

---

## 📝 Quick Reference

### Start Development:

```powershell
# Terminal 1
cd backend
npm run start:dev

# Terminal 2
ngrok http 3000

# Copy Ngrok URL
# Update mobile/src/config/api.config.ts
# Build APK
```

### Stop Development:

```powershell
# Ctrl+C trong cả 2 terminals
```

---

## 🎯 Next Steps

1. ✅ Cài đặt Ngrok
2. ✅ Chạy backend local
3. ✅ Start ngrok và lấy URL
4. ✅ Cập nhật URL trong `api.config.ts`
5. ✅ Build APK với Android Studio
6. ✅ Test app trên điện thoại

---

**Ngrok URL sẽ thay đổi mỗi lần restart (free plan)**

Nếu muốn URL cố định → Upgrade Ngrok Pro hoặc deploy lên Railway!

---

## 📞 Support

- Ngrok Docs: https://ngrok.com/docs
- Dashboard: https://dashboard.ngrok.com/

**Happy Testing! 🚀**
