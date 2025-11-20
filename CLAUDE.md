# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack Zalo Account Manager system with three main components:
- **Mobile App** (React Native 0.73): Android/iOS app for managing multiple Zalo accounts
- **Backend API** (NestJS 10): RESTful API with PostgreSQL 15
- **Admin Dashboard** (Next.js 14): Web admin interface using App Router

## Development Commands

### Backend (NestJS)
```bash
cd backend
npm install
cp .env.example .env          # Configure database & JWT settings
npm run start:dev             # Development server (port 3000)
npm run build                 # Production build
npm run start:prod            # Production server
npm run lint                  # Lint TypeScript files
npm test                      # Run tests
```

### Admin Dashboard (Next.js)
```bash
cd admin-dashboard
npm install
npm run dev                   # Development server (port 3001)
npm run build                 # Production build
npm run start                 # Production server
npm run lint                  # Next.js linting
```

### Mobile App (React Native)
```bash
cd mobile
npm install
cd ios && pod install && cd ..   # iOS only

npm start                        # Metro bundler
npm run android                  # Run on Android
npm run ios                      # Run on iOS
npm run lint                     # ESLint
npm test                         # Jest tests
```

### Docker
```bash
docker-compose up -d             # Start all services (backend, admin, postgres)
docker-compose ps                # Check services status
docker-compose logs backend      # View backend logs
docker-compose down              # Stop all services
```

## Architecture

### Backend Module Structure (NestJS)

**app.module.ts** - Main application module:
- Configures TypeORM with PostgreSQL connection (line 20-33)
- Registers JWT authentication globally (line 35-42)
- Imports all feature modules
- **CRITICAL**: `synchronize: true` (line 30) auto-creates tables - only safe for development

**Feature Modules** (in `src/modules/`):
- `auth/`: JWT authentication, login/register with bcrypt
- `users/`: User entity and management
- `devices/`: Device registration, tracking, and dynamic ownership updates
- `sessions/`: Session lifecycle management with auto-cleanup

**Database Relations (HYBRID MODE)**:
```
User (1) ←→ (N) Device    # User can login on multiple devices
Device (1) ←→ (N) Session  # Device can have multiple user sessions
User (1) ←→ (N) Session    # User can have multiple active sessions

Key: device.userId is DYNAMIC and changes based on current active user
```

### Mobile App Architecture (React Native)

**screens/**:
- `AccountListScreen.tsx`: Main screen with account list and switching
- `AddAccountScreen.tsx`: Add account via credentials or Zalo SDK
- `DashboardScreen.tsx`: Active session dashboard with stats

**services/**:
- `api.ts`: Backend API communication via axios
  - **API_URL** (line 4): Default `http://localhost:3000`
  - **Android emulator**: Must use `http://10.0.2.2:3000`
  - **iOS simulator**: Use `http://localhost:3000`
  - **Physical device**: Use machine's local IP (e.g., `http://192.168.1.100:3000`)
- `storage.ts`: React Native Encrypted Storage for credentials
- `zalo.ts`: Zalo SDK integration wrapper

**navigation/**:
- `AppNavigator.tsx`: React Navigation stack setup

### Admin Dashboard Architecture (Next.js 14)

Uses **App Router** (not Pages Router):
- `src/app/page.tsx`: Dashboard homepage with statistics
- `src/app/users/page.tsx`: User management interface
- `src/app/layout.tsx`: Root layout with navigation
- `src/services/api.ts`: Backend API client
- Styled with Tailwind CSS

## Environment Configuration

### Backend (.env)
Critical variables:
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`: PostgreSQL connection
- `JWT_SECRET`: **Must be changed in production** (default is insecure)
- `PORT`: Backend server port (default: 3000)
- `ZALO_APP_ID`, `ZALO_APP_SECRET`: Zalo SDK credentials

### Admin Dashboard (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API endpoint (default: http://localhost:3000)

### Mobile App
- API URL is hardcoded in `mobile/src/services/api.ts` (line 4)
- Zalo SDK credentials in `mobile/src/config/zalo.config.ts`
- Update based on deployment environment

### Zalo SDK Configuration
**Current Zalo App Credentials:**
- **App ID**: `4311141813840171987`
- **App Secret**: `23MY8pJILjHcSlZc1Rs5`

**Important:**
- App ID is used in mobile app for SDK initialization
- App Secret is stored in backend `.env` only
- **Never expose App Secret in mobile app code**
- Zalo SDK is initialized in `mobile/App.tsx` on app startup
- See `mobile/ZALO_SDK_SETUP.md` for Android/iOS native setup

## Important Technical Details

### CORS Configuration
Backend (main.ts:10) allows origins:
- `http://localhost:3001` (admin dashboard)
- `http://localhost:19006` (Expo dev server)
- Update CORS origins when deploying to production

### Authentication Flow
1. Mobile app registers device on first launch (`POST /device/register`)
2. User logs in with credentials (`POST /auth/login`)
3. Backend returns JWT token
4. Mobile stores token in encrypted storage
5. All subsequent requests include JWT in `Authorization` header
6. Sessions track active Zalo account usage

### HYBRID MODE: Multi-Device & Multi-User Support

**Architecture Decision:** The system supports both:
- **Multi-Device**: 1 user → unlimited devices simultaneously
- **Multi-User**: 1 device → unlimited users with seamless switching

**Key Behaviors:**
- `device.userId` automatically updates to current active user
- When switching users on same device, old user's sessions are auto-ended
- No "user already logged in" or "device already assigned" restrictions

**Switch User Flow:**
1. Mobile: User selects different account from list
2. Mobile: Call `POST /session/switch` with `currentUserId`, `newUserId`, `deviceId`
3. Backend: End old user's sessions on this device
4. Backend: Update `device.userId` to new user
5. Backend: Save previous owner in `device.metadata`
6. Backend: Create new session for new user
7. Mobile: Update current account in local storage

**Removed Restrictions:**
- ❌ "User already logged in on another device" check (auth.service.ts)
- ❌ "User already assigned to another device" check (devices.service.ts)

**New Capabilities:**
- ✅ `POST /session/switch`: Seamless user switching
- ✅ `GET /session/user/:userId`: Track user across all devices
- ✅ `GET /session/device/:deviceId`: See all users on a device
- ✅ Auto-cleanup of sessions when switching users
- ✅ Dynamic device ownership with history tracking

### Security
- Passwords are hashed with bcrypt in `auth.service.ts`
- Mobile app uses React Native Encrypted Storage for credentials
- JWT tokens expire after 1 day (configured in app.module.ts:39)
- TypeORM protects against SQL injection

### Database Schema Auto-sync
- TypeORM configured with `synchronize: true` in development (app.module.ts:30)
- Automatically creates/updates database tables from entities
- **Never use in production** - use migrations instead

## API Endpoints

### Authentication
```
POST /auth/login          # Login with credentials
POST /auth/register       # Register new user
POST /auth/refresh        # Refresh JWT token
```

### Session Management (HYBRID MODE)
```
POST /session/start       # Start session (called by login)
POST /session/end         # End session (called by logout)
POST /session/switch      # Switch user on same device
POST /session/refresh     # Refresh session token
GET  /session/user/:userId       # Get all sessions of user (multi-device)
GET  /session/device/:deviceId   # Get all sessions on device (multi-user)
```

### Device Management (HYBRID MODE)
```
POST /device/register              # Register device on first launch
GET  /device/:deviceId            # Get device info and current owner
POST /device/:deviceId/assign-user # Admin assign user to device
POST /device/status/update        # Update device metadata
```

**Note:** Backend automatically updates `device.userId` during login/switch operations.

## Common Development Tasks

### Adding a New API Endpoint
1. Create/update controller in `backend/src/modules/[module]/`
2. Create/update service with business logic
3. Create DTO (Data Transfer Object) in `dto/` folder for validation
4. Update `mobile/src/services/api.ts` to call new endpoint
5. Update `admin-dashboard/src/services/api.ts` if needed

### Adding a New Database Entity
1. Create entity in `backend/src/modules/[module]/entities/`
2. Add to `app.module.ts` entities array (line 29)
3. Define relationships with `@OneToMany`, `@ManyToOne`, `@ManyToMany`
4. TypeORM will auto-create table on next server start (development only)

### Mobile App API URL Configuration
When testing mobile app, update API_URL in `mobile/src/services/api.ts` (line 4):
- **Android Emulator**: `http://10.0.2.2:3000`
- **iOS Simulator**: `http://localhost:3000`
- **Physical Device**: Your computer's local IP (e.g., `http://192.168.1.100:3000`)

### Setting up Zalo SDK Native Modules
The mobile app requires native Android/iOS setup:

1. **Initialize React Native project** (if android/ios folders don't exist):
   ```bash
   cd mobile
   npx react-native init ZaloAccountManager --directory . --skip-install
   ```

2. **Follow setup instructions** in `mobile/ZALO_SDK_SETUP.md`:
   - Android: Add Zalo SDK to gradle, configure AndroidManifest.xml
   - iOS: Add Zalo SDK to Podfile, configure Info.plist
   - Create native bridge modules (ZaloModule.java / ZaloModule.m)

3. **Rebuild app** after native changes:
   ```bash
   # Android
   cd android && ./gradlew clean && cd ..
   npm run android

   # iOS
   cd ios && pod install && cd ..
   npm run ios
   ```

### Running Full Stack Locally

**Quickest method:**
1. `docker-compose up -d` (starts postgres, backend, admin)
2. `cd mobile && npm run android` (or ios)

**Manual method:**
1. Start PostgreSQL (via Docker or local install)
2. `cd backend && npm run start:dev`
3. `cd admin-dashboard && npm run dev`
4. `cd mobile && npm run android` or `npm run ios`

## Testing HYBRID MODE

### Test Multi-Device Support
1. Create user via `POST /auth/register`
2. Login on Device1 via mobile app
3. Login same user on Device2 via mobile app
4. Call `GET /session/user/:userId` - should show 2 active sessions
5. Both devices can be active simultaneously

### Test Multi-User Support
1. Create 3 users: userA, userB, userC
2. Login userA on Device1 → Check `device.userId = userA`
3. Switch to userB via `POST /session/switch` → Check `device.userId = userB`
4. Check userA's session is ended (`isActive=false`)
5. Call `GET /session/device/:deviceId` → Should see sessions from both users

### Test Dynamic Ownership
1. Login userA on Device1
2. Login userB on Device1 (same device, different user)
3. Check that Device1's `userId` changed from userA to userB
4. Check that Device1's `metadata.previousOwner` contains userA's ID
5. Verify userA's session was auto-ended

## Deployment Notes

- **Database**: Disable `synchronize: true` in production, use TypeORM migrations
- **JWT_SECRET**: Generate secure random string for production
- **CORS**: Update allowed origins in main.ts to production domains
- **API URLs**: Update mobile app API_URL for production backend
- **Environment Variables**: Never commit .env files, use platform-specific secrets management
