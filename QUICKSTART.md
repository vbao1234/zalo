# 🚀 Quick Start Guide

## Chạy nhanh với Docker (Khuyến nghị)

### 1. Khởi động Backend + Admin Dashboard + Database

```bash
# Từ thư mục gốc
docker-compose up -d

# Kiểm tra services đang chạy
docker-compose ps
```

**Services:**
- Backend API: http://localhost:3000
- Admin Dashboard: http://localhost:3001
- PostgreSQL: localhost:5432

### 2. Tạo User đầu tiên

Mở trình duyệt tại: http://localhost:3001

- Click "Quản lý Users"
- Click "Thêm User"
- Điền thông tin:
  - Username: `user1`
  - Password: `password123`
  - Display Name: `User Test 1`
- Click "Tạo User"

### 3. Setup Mobile App

```bash
cd mobile
npm install

# Với Android
npm run android

# Với iOS  
cd ios && pod install && cd ..
npm run ios
```

### 4. Login trên Mobile

1. Mở app
2. Click "Thêm tài khoản"
3. Nhập:
   - Username: `user1`
   - Password: `password123`
4. Hoặc click "Đăng nhập trực tiếp qua Zalo"

---

## Chạy thủ công (Development)

### Backend

```bash
cd backend
npm install
cp .env.example .env

# Chạy PostgreSQL với Docker
docker run -d \
  --name zalo-postgres \
  -e POSTGRES_DB=zalo_account_manager \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine

# Chạy backend
npm run start:dev
```

### Admin Dashboard

```bash
cd admin-dashboard
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
npm run dev
```

### Mobile App

```bash
cd mobile
npm install

# Update API URL trong mobile/src/services/api.ts
# - Android emulator: http://10.0.2.2:3000
# - iOS simulator: http://localhost:3000  
# - Real device: http://YOUR_IP:3000

npm run android  # hoặc npm run ios
```

---

## Test Flow

1. **Tạo user** trên Admin Dashboard
2. **Login** trên Mobile App với credentials
3. **Switch** giữa các accounts
4. **Theo dõi** sessions trên Dashboard

---

## Troubleshooting

### Backend không connect được database
```bash
docker logs zalo-postgres
# Kiểm tra .env file có đúng credentials
```

### Mobile app không connect được backend
```bash
# Kiểm tra API_URL trong mobile/src/services/api.ts
# Android emulator phải dùng 10.0.2.2 thay vì localhost
```

### Build mobile app lỗi
```bash
cd mobile
npm start -- --reset-cache
cd android && ./gradlew clean
```

---

## Production Deployment

Xem [DEPLOYMENT.md](./docs/DEPLOYMENT.md) để deploy lên:
- Backend: Heroku, Railway, DigitalOcean
- Admin: Vercel, Netlify
- Mobile: Google Play Store, Apple App Store

---

**Gặp vấn đề?** Mở issue trên GitHub!
