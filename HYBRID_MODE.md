# 🔄 HYBRID MODE - Multi-Device & Multi-User Architecture

## Tổng quan

Hệ thống Zalo Account Manager đã được nâng cấp lên **HYBRID MODE**, hỗ trợ đồng thời:
- **Multi-Device**: 1 user có thể login trên nhiều devices
- **Multi-User**: 1 device có thể có nhiều users và switch qua lại

## 🎯 Quyết định thiết kế

### 1. Không giới hạn devices per user
- User có thể login trên smartphone, tablet, máy tính... đồng thời
- Mỗi device có session riêng
- Backend tracking tất cả devices của user

### 2. Không giới hạn users per device
- Device có thể lưu và switch giữa nhiều users
- Ví dụ: Gia đình dùng chung 1 tablet, mỗi người 1 account

### 3. Dynamic Device Ownership
- `device.userId` luôn là user đang active
- Khi switch user, `device.userId` tự động cập nhật
- History được lưu trong `device.metadata`

### 4. Tự động cleanup sessions
- Khi switch user trên device, session cũ tự động ended
- Không có conflict sessions
- User có thể login lại bình thường

## 📊 Database Schema (không đổi)

```sql
users
├── id (UUID, PK)
├── username
├── password (hashed)
└── ...

devices
├── id (UUID, PK)
├── deviceId (Unique)
├── userId (FK → users.id)  ← DYNAMIC!
├── brand, model, platform
├── metadata (JSONB)         ← Lưu history
└── ...

sessions
├── id (UUID, PK)
├── userId (FK → users.id)
├── deviceId (FK → devices.id)
├── isActive (Boolean)
├── startedAt, endedAt
└── ...
```

**Quan hệ:**
- User ← 1:N → Device (1 user nhiều devices)
- Device ← 1:N → Session (1 device nhiều sessions)
- User ← 1:N → Session (1 user nhiều sessions)

## 🔧 Thay đổi Backend

### 1. Auth Service (`auth.service.ts`)

**Đã xóa:**
```typescript
// ❌ REMOVED
if (existingSession && existingSession.deviceId !== deviceId) {
  throw new UnauthorizedException('User already logged in on another device');
}
```

**Đã thêm:**
```typescript
// ✅ ADDED
// End sessions cũ trên device này
await this.sessionsService.endUserSessionsOnDevice(user.id, device.id);

// Update device owner động
await this.devicesService.updateDeviceOwner(deviceId, user.id);
```

### 2. Devices Service (`devices.service.ts`)

**Đã xóa:**
```typescript
// ❌ REMOVED
if (existingAssignment && existingAssignment.id !== device.id) {
  throw new BadRequestException('User already assigned to another device');
}
```

**Đã thêm:**
```typescript
// ✅ ADDED
async updateDeviceOwner(deviceId: string, userId: string) {
  device.userId = userId;
  device.metadata = {
    ...device.metadata,
    previousOwner: previousUserId,
    lastOwnerChange: new Date().toISOString(),
  };
}

async getDeviceUsers(deviceId: string) {
  // Trả về danh sách users đã dùng device này
}

async getUserDevices(userId: string) {
  // Trả về danh sách devices của user
}
```

### 3. Sessions Service (`sessions.service.ts`)

**Đã sửa:**
```typescript
async startSession(userId: string, deviceId: string) {
  // ✅ Tự động end sessions cũ
  await this.endUserSessionsOnDevice(userId, deviceId);

  // Tạo session mới
  const session = this.sessionsRepository.create({...});
}
```

**Đã thêm:**
```typescript
async endUserSessionsOnDevice(userId: string, deviceId: string) {
  // End tất cả sessions của user trên device cụ thể
}

async getUserSessions(userId: string) {
  // Lấy tất cả sessions của user (cross-device)
}

async getDeviceSessions(deviceId: string) {
  // Lấy tất cả sessions trên device (multi-user)
}
```

### 4. Sessions Controller (`sessions.controller.ts`)

**Endpoint mới:**
```typescript
POST /session/switch
Body: { currentUserId, newUserId, deviceId }
Response: { message, previousUser, currentUser, session }

GET /session/user/:userId
Response: { userId, sessions[], totalDevices }

GET /session/device/:deviceId
Response: { deviceId, sessions[], totalUsers }
```

## 📱 Thay đổi Mobile App

### Mobile API Service (`mobile/src/services/api.ts`)

**Đã thêm:**
```typescript
static async switchAccount(currentUserId: string, newUserId: string) {
  const deviceId = await DeviceInfo.getUniqueId();
  const response = await this.instance.post('/session/switch', {
    currentUserId,
    newUserId,
    deviceId,
  });
  return response.data;
}

static async getUserSessions(userId: string) {
  // Xem user đang login trên bao nhiêu devices
}

static async getDeviceSessions() {
  // Xem device này có bao nhiêu users
}
```

## 🔄 Flow hoạt động

### Scenario 1: User login trên nhiều devices

```
UserA login trên Device1
  ↓
Backend:
  - End UserA's old sessions on Device1
  - Update Device1.userId = UserA
  - Create Session1 (UserA, Device1, active)
  ↓
UserA login trên Device2
  ↓
Backend:
  - End UserA's old sessions on Device2
  - Update Device2.userId = UserA
  - Create Session2 (UserA, Device2, active)
  ↓
Result:
  - Device1: UserA active
  - Device2: UserA active
  - UserA có 2 sessions active
```

### Scenario 2: Switch user trên cùng device

```
Device1: UserA đang active
  ↓
User chọn switch sang UserB
  ↓
Mobile: POST /session/switch
{
  currentUserId: "userA-id",
  newUserId: "userB-id",
  deviceId: "device1"
}
  ↓
Backend:
  1. End Session(UserA, Device1) → isActive=false
  2. Update Device1.userId = UserB
  3. Update Device1.metadata.previousOwner = UserA
  4. Create Session(UserB, Device1, active)
  ↓
Result:
  - Device1: UserB active
  - UserA's session ended
  - UserB có session mới
```

### Scenario 3: Multi-user trên cùng device

```
Device1: Tablet gia đình

UserA login (7:00 AM)
  → Device1.userId = UserA
  → Session1 (UserA, active)

UserB switch (12:00 PM)
  → Device1.userId = UserB
  → Session1 (UserA, inactive, ended 12:00)
  → Session2 (UserB, active)

UserC switch (6:00 PM)
  → Device1.userId = UserC
  → Session2 (UserB, inactive, ended 18:00)
  → Session3 (UserC, active)

History:
GET /session/device/device1
→ sessions: [Session1(UserA), Session2(UserB), Session3(UserC)]
→ totalUsers: 3
```

## 📊 Tracking & Analytics

### Query: User đang dùng bao nhiêu devices?

```typescript
GET /session/user/userA-id

Response: {
  userId: "userA-id",
  sessions: [
    { deviceId: "device1", isActive: true, startedAt: "..." },
    { deviceId: "device2", isActive: true, startedAt: "..." },
    { deviceId: "device3", isActive: false, endedAt: "..." }
  ],
  totalDevices: 2  // 2 active sessions
}
```

### Query: Device này có bao nhiêu users?

```typescript
GET /session/device/device1

Response: {
  deviceId: "device1",
  sessions: [
    { userId: "userA", user: {...}, isActive: false },
    { userId: "userB", user: {...}, isActive: false },
    { userId: "userC", user: {...}, isActive: true }
  ],
  totalUsers: 3
}
```

### Query: Device history

```typescript
const device = await Device.findOne({ deviceId: "ABC123" });

device.metadata = {
  previousOwner: "userB-id",
  lastOwnerChange: "2025-11-20T15:30:00Z",
  // ... other metadata
}

device.userId = "userC-id"  // Current owner
```

## 🎯 Use Cases thực tế

### 1. Gia đình dùng chung tablet
- Mỗi người có account riêng
- Switch giữa accounts khi dùng
- Mỗi người thấy data riêng của mình

### 2. User có nhiều thiết bị
- Smartphone cá nhân
- Tablet công ty
- Máy tính nhà
- Tất cả đồng bộ, login cùng lúc

### 3. Admin monitoring
- Xem user nào đang dùng device nào
- Track usage patterns
- Phát hiện devices lạ
- Remote logout khi cần

## 🔐 Security Considerations

### 1. Token Management
- Mỗi device có JWT token riêng
- Token không share giữa devices
- Expire theo thời gian (1 day access, 7 days refresh)

### 2. Session Cleanup
- Auto end sessions khi switch
- Không có orphan sessions
- Clear history khi cần

### 3. Device Fingerprinting
- DeviceId unique per device
- Tracking device info (brand, model, OS)
- Phát hiện changes

## 🧪 Testing Guide

### Test 1: Multi-Device
```bash
# Create users
POST /auth/register { username: "userA", password: "***" }

# Login on Device1
POST /auth/login { username: "userA", password: "***", deviceId: "device1" }

# Login on Device2
POST /auth/login { username: "userA", password: "***", deviceId: "device2" }

# Check sessions
GET /session/user/userA-id
→ Should return 2 active sessions
```

### Test 2: Multi-User
```bash
# Create users
POST /auth/register { username: "userA" }
POST /auth/register { username: "userB" }

# UserA login on Device1
POST /auth/login { username: "userA", deviceId: "device1" }

# Switch to UserB
POST /session/switch { currentUserId: "userA-id", newUserId: "userB-id", deviceId: "device1" }

# Check device owner
GET /device/device1
→ device.userId should be "userB-id"

# Check sessions
GET /session/device/device1
→ Should show both userA (inactive) and userB (active)
```

### Test 3: Device History
```bash
# Multiple switches
POST /session/switch (userA → userB)
POST /session/switch (userB → userC)
POST /session/switch (userC → userA)

# Check history
GET /device/device1
→ metadata should show previousOwner chain
```

## 🚀 Migration Notes

Nếu bạn đã có hệ thống cũ:

1. **Không cần migration database schema** - Schema không đổi
2. **Chỉ cần redeploy backend** - Code logic đã thay đổi
3. **Mobile app cần update** - Thêm switchAccount() method
4. **Test kỹ** trước khi deploy production

## 📝 Summary

**Before HYBRID MODE:**
- ❌ 1 user chỉ 1 device active
- ❌ 1 device chỉ 1 user active
- ❌ Không switch được user

**After HYBRID MODE:**
- ✅ 1 user → unlimited devices
- ✅ 1 device → unlimited users
- ✅ Switch user seamlessly
- ✅ Dynamic device ownership
- ✅ Auto cleanup sessions
- ✅ Full tracking & analytics

Hệ thống giờ linh hoạt và powerful hơn nhiều! 🎉
