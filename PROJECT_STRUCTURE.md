# 📁 Cấu trúc dự án chi tiết

```
zalo-account-manager/
│
├── 📱 mobile/                              # React Native Mobile App
│   ├── android/                            # Android native code
│   ├── ios/                                # iOS native code
│   ├── src/
│   │   ├── screens/                        # Màn hình
│   │   │   ├── AccountListScreen.tsx      # Danh sách tài khoản
│   │   │   ├── AddAccountScreen.tsx       # Thêm tài khoản mới
│   │   │   └── DashboardScreen.tsx        # Dashboard
│   │   ├── services/                       # Business logic
│   │   │   ├── api.ts                     # Backend API calls
│   │   │   ├── storage.ts                 # Local storage
│   │   │   └── zalo.ts                    # Zalo SDK integration
│   │   ├── navigation/                     # Navigation setup
│   │   │   └── AppNavigator.tsx
│   │   └── types/                          # TypeScript types
│   │       └── index.ts
│   ├── App.tsx                             # Root component
│   └── package.json
│
├── 🖥️ backend/                             # NestJS Backend API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/                       # Authentication
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── login.dto.ts
│   │   │   ├── users/                      # User management
│   │   │   │   └── entities/
│   │   │   │       └── user.entity.ts
│   │   │   ├── devices/                    # Device management
│   │   │   │   ├── devices.controller.ts
│   │   │   │   ├── devices.service.ts
│   │   │   │   ├── entities/
│   │   │   │   │   └── device.entity.ts
│   │   │   │   └── dto/
│   │   │   │       └── register-device.dto.ts
│   │   │   └── sessions/                   # Session management
│   │   │       ├── sessions.controller.ts
│   │   │       ├── sessions.service.ts
│   │   │       └── entities/
│   │   │           └── session.entity.ts
│   │   ├── app.module.ts                   # Main module
│   │   └── main.ts                         # Bootstrap
│   ├── .env.example                        # Environment template
│   ├── Dockerfile                          # Docker config
│   └── package.json
│
├── 🌐 admin-dashboard/                     # Next.js Admin Dashboard
│   ├── src/
│   │   ├── app/                            # Next.js 14 App Router
│   │   │   ├── page.tsx                   # Homepage (Dashboard)
│   │   │   ├── users/                      # User management
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx                  # Root layout
│   │   │   └── globals.css                 # Global styles
│   │   └── services/                       # API services
│   │       └── api.ts                      # Backend API calls
│   ├── tailwind.config.js                  # Tailwind CSS config
│   ├── postcss.config.js                   # PostCSS config
│   ├── Dockerfile                          # Docker config
│   └── package.json
│
├── 📄 docs/                                # Documentation
│   ├── MOBILE.md                           # Mobile app guide
│   ├── BACKEND.md                          # Backend API docs
│   ├── ADMIN.md                            # Admin dashboard guide
│   └── DEPLOYMENT.md                       # Deployment guide
│
├── 🐳 docker-compose.yml                   # Docker Compose setup
├── 📖 README.md                            # Main documentation
├── 🚀 QUICKSTART.md                        # Quick start guide
└── 📁 PROJECT_STRUCTURE.md                 # This file

```

## 🎯 File quan trọng cần biết

### Mobile App
- **App.tsx**: Entry point của app
- **AppNavigator.tsx**: Setup navigation
- **AccountListScreen.tsx**: Màn hình chính
- **services/storage.ts**: Quản lý local storage an toàn
- **services/api.ts**: Gọi Backend API
- **services/zalo.ts**: Tích hợp Zalo SDK

### Backend
- **app.module.ts**: Main module, config TypeORM
- **main.ts**: Bootstrap server
- **auth.service.ts**: Logic đăng nhập, JWT
- **devices.service.ts**: Quản lý devices
- **sessions.service.ts**: Quản lý sessions

### Admin Dashboard  
- **app/page.tsx**: Homepage với stats
- **app/users/page.tsx**: Quản lý users
- **services/api.ts**: API calls đến backend

## 🔄 Data Flow

```
Mobile App
    ↓ (Login request)
Backend API
    ↓ (Store session)
PostgreSQL Database
    ↑ (Read data)
Admin Dashboard
```

## 🛠️ Tech Stack Summary

| Component | Technologies |
|-----------|-------------|
| Mobile | React Native, TypeScript, Encrypted Storage |
| Backend | NestJS, TypeORM, PostgreSQL, JWT |
| Admin | Next.js 14, Tailwind CSS, React |
| DevOps | Docker, Docker Compose |

## 📦 Packages chính

### Mobile (mobile/package.json)
- react-native: ^0.73.0
- @react-navigation/native: ^6.1.9
- react-native-encrypted-storage: ^4.0.3
- react-native-device-info: ^10.11.0
- axios: ^1.6.2

### Backend (backend/package.json)
- @nestjs/core: ^10.3.0
- @nestjs/typeorm: ^10.0.1
- typeorm: ^0.3.19
- pg: ^8.11.3
- @nestjs/jwt: ^10.2.0
- bcrypt: ^5.1.1

### Admin (admin-dashboard/package.json)
- next: 14.0.4
- react: ^18.2.0
- tailwindcss: ^3.3.0
- axios: ^1.6.2

## 🎨 Color Palette

- Primary: #0068FF (Zalo Blue)
- Success: #4CAF50
- Danger: #D32F2F
- Background: #F5F5F5
- White: #FFFFFF
- Text: #333333

## 📱 Screen Flow (Mobile)

```
AccountListScreen
    ├─→ AddAccountScreen
    │       ├─→ Backend Login
    │       └─→ Zalo SDK Login
    └─→ DashboardScreen
            ├─→ View Stats
            ├─→ End Session
            └─→ Back to List
```

## 🔐 Security Features

1. **JWT Authentication**: Backend sử dụng JWT tokens
2. **Encrypted Storage**: Mobile lưu credentials an toàn
3. **Password Hashing**: bcrypt cho passwords
4. **CORS Protection**: Backend config CORS
5. **SQL Injection Protection**: TypeORM ORM
6. **HTTPS Ready**: Production setup

## 🚀 Deployment Targets

- **Mobile**: Google Play Store, Apple App Store
- **Backend**: Heroku, Railway, DigitalOcean, AWS
- **Admin**: Vercel, Netlify, AWS Amplify
- **Database**: AWS RDS, DigitalOcean Managed DB

## 📊 Database Schema Overview

```
users
├── id (UUID)
├── username (Unique)
├── password (Hashed)
├── displayName
└── ... more fields

devices
├── id (UUID)
├── deviceId (Unique)
├── userId (FK → users.id)
├── brand, model, osVersion
└── ... more fields

sessions
├── id (UUID)
├── userId (FK → users.id)
├── deviceId (FK → devices.id)
├── accessToken, refreshToken
└── ... more fields
```

## 💡 Tips

- **Development**: Dùng `docker-compose up -d` để chạy nhanh
- **Mobile Debug**: React Native Debugger
- **API Testing**: Postman hoặc curl
- **Database**: pgAdmin 4 hoặc DBeaver

---

**Happy Coding! 🎉**
