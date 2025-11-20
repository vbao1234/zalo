# 🚀 Zalo Account Manager - Full Stack Solution

Hệ thống quản lý nhiều tài khoản Zalo trên cả Android và iOS với Backend API và Admin Dashboard.

## 📋 Tổng quan

Dự án này cung cấp giải pháp hoàn chỉnh để quản lý nhiều tài khoản Zalo của bạn:

- **Mobile App (React Native)**: Ứng dụng di động hỗ trợ Android và iOS
- **Backend API (NestJS)**: RESTful API với PostgreSQL database
- **Admin Dashboard (Next.js)**: Giao diện web quản trị

## 🎯 Tính năng chính

### Mobile App
- ✅ Quản lý nhiều tài khoản Zalo
- ✅ Chuyển đổi nhanh giữa các tài khoản
- ✅ Lưu trữ credentials an toàn (Encrypted Storage)
- ✅ Tích hợp Zalo SDK
- ✅ Session management
- ✅ Dashboard theo dõi hoạt động

### Backend API
- ✅ Authentication với JWT
- ✅ User management
- ✅ Device registration
- ✅ Session tracking
- ✅ PostgreSQL database
- ✅ RESTful API endpoints

### Admin Dashboard
- ✅ Quản lý users
- ✅ Theo dõi devices
- ✅ Giám sát sessions
- ✅ Thống kê & báo cáo
- ✅ Responsive design với Tailwind CSS

## 📦 Cấu trúc dự án

```
zalo-account-manager/
├── mobile/                 # React Native App
│   ├── src/
│   │   ├── screens/       # Màn hình
│   │   ├── services/      # API & Storage services
│   │   ├── navigation/    # Navigation setup
│   │   └── types/         # TypeScript types
│   └── package.json
├── backend/               # NestJS API
│   ├── src/
│   │   ├── modules/       # Feature modules
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── devices/
│   │   │   └── sessions/
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
├── admin-dashboard/       # Next.js Admin
│   ├── src/
│   │   ├── app/          # Next.js 14 App Router
│   │   └── services/     # API services
│   └── package.json
├── docker-compose.yml    # Docker setup
└── README.md
```

## 🛠️ Công nghệ sử dụng

### Mobile
- **React Native** 0.73
- **TypeScript**
- **React Navigation** 6
- **React Native Encrypted Storage**
- **Axios**
- **React Native Device Info**

### Backend
- **NestJS** 10
- **TypeORM**
- **PostgreSQL** 15
- **JWT Authentication**
- **bcrypt**

### Admin Dashboard
- **Next.js** 14 (App Router)
- **React** 18
- **TypeScript**
- **Tailwind CSS**
- **Axios**

## 🚀 Cài đặt & Chạy dự án

### Yêu cầu
- Node.js 18+
- Docker & Docker Compose
- React Native development environment
- PostgreSQL 15 (hoặc dùng Docker)

### 1. Backend API

```bash
# Di chuyển vào thư mục backend
cd backend

# Copy file .env
cp .env.example .env

# Cài đặt dependencies
npm install

# Chạy database với Docker
docker-compose up -d postgres

# Chạy backend
npm run start:dev
```

Backend sẽ chạy tại: `http://localhost:3000`

### 2. Admin Dashboard

```bash
# Di chuyển vào thư mục admin
cd admin-dashboard

# Cài đặt dependencies
npm install

# Tạo file .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local

# Chạy dashboard
npm run dev
```

Admin Dashboard sẽ chạy tại: `http://localhost:3001`

### 3. Mobile App

```bash
# Di chuyển vào thư mục mobile
cd mobile

# Cài đặt dependencies
npm install

# Cài đặt pods cho iOS
cd ios && pod install && cd ..

# Chạy Android
npm run android

# Hoặc chạy iOS
npm run ios
```

### 🐳 Chạy với Docker

Cách đơn giản nhất để chạy backend + admin:

```bash
# Từ thư mục gốc
docker-compose up -d
```

Services:
- Backend API: `http://localhost:3000`
- Admin Dashboard: `http://localhost:3001`
- PostgreSQL: `localhost:5432`

## 📱 Cấu hình Mobile App

### Android

Thêm Zalo SDK vào `android/app/build.gradle`:

```gradle
dependencies {
    implementation 'com.zing.zalo.zalosdk:core:+'
    implementation 'com.zing.zalo.zalosdk:auth:+'
    implementation 'com.zing.zalo.zalosdk:openapi:+'
}
```

### iOS

Thêm Zalo SDK vào `ios/Podfile`:

```ruby
pod 'ZaloSDK'
```

## 🔑 API Endpoints

### Authentication
```
POST /auth/login          # Đăng nhập
POST /auth/register       # Đăng ký user mới
POST /auth/refresh        # Refresh token
```

### Devices
```
POST /device/register              # Đăng ký device mới
GET  /device/:deviceId            # Lấy thông tin device
POST /device/:deviceId/assign-user # Gán user cho device
POST /device/status/update        # Cập nhật trạng thái
```

### Sessions
```
POST /session/start    # Bắt đầu session
POST /session/end      # Kết thúc session
POST /session/refresh  # Refresh session
```

## 🗄️ Database Schema

### Users Table
```sql
- id (UUID, PK)
- username (String, Unique)
- password (String, Hashed)
- displayName (String)
- avatar (String, Nullable)
- email (String, Nullable)
- phone (String, Nullable)
- isActive (Boolean)
- createdAt (Timestamp)
- updatedAt (Timestamp)
```

### Devices Table
```sql
- id (UUID, PK)
- deviceId (String, Unique)
- brand (String)
- model (String)
- osVersion (String)
- platform (String)
- userId (UUID, FK)
- isActive (Boolean)
- createdAt (Timestamp)
- updatedAt (Timestamp)
```

### Sessions Table
```sql
- id (UUID, PK)
- userId (UUID, FK)
- deviceId (UUID, FK)
- accessToken (String)
- refreshToken (String)
- expiresAt (Timestamp)
- isActive (Boolean)
- startedAt (Timestamp)
- endedAt (Timestamp, Nullable)
- createdAt (Timestamp)
- updatedAt (Timestamp)
```

## 🔐 Bảo mật

- ✅ JWT Authentication
- ✅ Password hashing với bcrypt
- ✅ Encrypted storage trên mobile
- ✅ HTTPS/TLS ready
- ✅ SQL injection protection (TypeORM)
- ✅ CORS configuration

## 📝 Usage Flow

1. **Admin tạo user** trên Dashboard
2. **User nhận credentials** (username/password)
3. **User cài đặt Mobile App**
4. **Device tự động register** khi mở app lần đầu
5. **User login** với credentials từ admin
6. **Tích hợp Zalo**: Login qua Zalo SDK
7. **Quản lý accounts**: Switch giữa nhiều tài khoản
8. **Session tracking**: Tất cả hoạt động được log

## 🐛 Troubleshooting

### Backend không kết nối được database
```bash
# Kiểm tra PostgreSQL đang chạy
docker ps | grep postgres

# Xem logs
docker logs zalo_postgres
```

### Mobile app không kết nối được backend
- Kiểm tra API_URL trong `mobile/src/services/api.ts`
- Với Android emulator, dùng `10.0.2.2` thay vì `localhost`
- Với iOS simulator, dùng `localhost`

### Build mobile app bị lỗi
```bash
# Clear cache
cd mobile
npm start -- --reset-cache

# Rebuild Android
cd android && ./gradlew clean && cd ..
npm run android

# Rebuild iOS
cd ios && pod install && cd ..
npm run ios
```

## 📚 Documentation

- [Mobile App Guide](./docs/MOBILE.md)
- [Backend API Docs](./docs/BACKEND.md)
- [Admin Dashboard Guide](./docs/ADMIN.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Được tạo bởi Claude & Bảo

## ⚠️ Disclaimer

Dự án này được tạo ra cho mục đích học tập và quản lý tài khoản cá nhân. 
Vui lòng tuân thủ Terms of Service của Zalo khi sử dụng.

---

**Happy Coding! 🚀**
