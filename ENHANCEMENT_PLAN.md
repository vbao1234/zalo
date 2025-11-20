# 🚀 Enhancement Plan - Multi-Account Zalo Manager

## 📋 Executive Summary

**Decision:** KHÔNG sử dụng `multizlogin` hay `VirtualApp`

**Lý do:** Kiến trúc hiện tại **đã tốt hơn** - chỉ cần enhance để có trải nghiệm multi-account hoàn hảo.

**Timeline:** 2-4 tuần

**Effort:** Medium (enhance existing code, không cần rewrite)

---

## ❌ Tại sao KHÔNG dùng VirtualApp/multizlogin?

### VirtualApp Issues:

| Problem | Impact |
|---------|--------|
| Android-only | Mất iOS support |
| Native code | Không tương thích RN |
| Phức tạp | Viết lại toàn bộ app |
| Maintenance | Rất khó maintain |
| Detection | Zalo có thể block |
| Performance | Resource-intensive |

### multizlogin Issues:

| Problem | Impact |
|---------|--------|
| Unknown quality | Rủi ro cao |
| Possibly abandoned | Không có support |
| ToS violations | Legal risk |
| No documentation | Khó integrate |

---

## ✅ Giải pháp: Enhance HYBRID MODE

### Current Architecture (Đã rất tốt!)

```
┌─────────────────────┐
│  React Native App   │  ← Cross-platform (iOS + Android)
│  (TypeScript)       │
└──────────┬──────────┘
           │
           │ REST API
           ▼
┌─────────────────────┐
│   Backend (NestJS)  │  ← Session management
│   + PostgreSQL      │  ← Device tracking
└─────────────────────┘  ← User switching
```

**Điểm mạnh:**
- ✅ Cross-platform
- ✅ Scalable (server-side)
- ✅ Cloud sync
- ✅ Clean architecture

**Điểm cần enhance:**
- 🔧 Zalo token management
- 🔧 Account isolation
- 🔧 Better switching UX

---

## 📐 Enhancement Architecture

### New Components:

```
┌─────────────────────────────────────────┐
│        React Native App                 │
│  ┌───────────────────────────────────┐  │
│  │  Account Isolation Service        │  │ ← NEW
│  │  - Clear Zalo cache              │  │
│  │  - Load user context             │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Enhanced Zalo SDK Wrapper        │  │ ← ENHANCED
│  │  - Token management              │  │
│  │  - Auto-refresh                  │  │
│  └───────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│         Backend (NestJS)                 │
│  ┌────────────────────────────────────┐  │
│  │  Zalo Tokens Module               │  │ ← NEW
│  │  - Store tokens per user          │  │
│  │  - Auto-refresh expired tokens    │  │
│  │  - Token CRUD operations          │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │  Enhanced Sessions Module         │  │ ← ENHANCED
│  │  - Include Zalo token info        │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## 📅 Implementation Roadmap

### Phase 1: Backend Token Management (Week 1)

#### 1.1 Create Zalo Tokens Module

```bash
cd backend
nest g module modules/zalo-tokens
nest g service modules/zalo-tokens
nest g controller modules/zalo-tokens
```

#### 1.2 Create Entity

```typescript
// backend/src/modules/zalo-tokens/entities/zalo-token.entity.ts

@Entity('zalo_tokens')
export class ZaloToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'text' })
  accessToken: string;

  @Column({ type: 'text' })
  refreshToken: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'json', nullable: true })
  zaloUserInfo: any; // Zalo user ID, name, avatar, etc.

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 1.3 Implement Service

```typescript
// backend/src/modules/zalo-tokens/zalo-tokens.service.ts

@Injectable()
export class ZaloTokensService {
  constructor(
    @InjectRepository(ZaloToken)
    private tokensRepository: Repository<ZaloToken>,
  ) {}

  // Save tokens after Zalo login
  async saveTokens(userId: string, tokens: SaveTokensDto): Promise<ZaloToken> {
    const existing = await this.findByUser(userId);

    if (existing) {
      return this.tokensRepository.save({
        ...existing,
        ...tokens,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
      });
    }

    return this.tokensRepository.save({
      userId,
      ...tokens,
      expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
    });
  }

  // Get valid token (auto-refresh if expired)
  async getValidToken(userId: string): Promise<string> {
    const token = await this.findByUser(userId);

    if (!token) {
      throw new NotFoundException('Zalo token not found');
    }

    // Check if expired
    if (new Date() >= token.expiresAt) {
      return this.refreshToken(userId);
    }

    return token.accessToken;
  }

  // Refresh expired token
  async refreshToken(userId: string): Promise<string> {
    const token = await this.findByUser(userId);

    // Call Zalo OAuth API to refresh
    const newTokens = await this.callZaloRefreshAPI(token.refreshToken);

    await this.saveTokens(userId, newTokens);

    return newTokens.accessToken;
  }

  private async callZaloRefreshAPI(refreshToken: string): Promise<any> {
    // Implement Zalo OAuth refresh logic
    // https://developers.zalo.me/docs/api/official-account-api/tai-lieu/xac-thuc-va-uy-quyen-post-28
  }
}
```

#### 1.4 Create Controller

```typescript
// backend/src/modules/zalo-tokens/zalo-tokens.controller.ts

@Controller('zalo-tokens')
@UseGuards(JwtAuthGuard)
export class ZaloTokensController {
  constructor(private readonly tokensService: ZaloTokensService) {}

  @Post('save')
  async saveTokens(@Body() dto: SaveTokensDto, @Request() req) {
    return this.tokensService.saveTokens(req.user.id, dto);
  }

  @Get('current')
  async getCurrentUserToken(@Request() req) {
    return this.tokensService.getValidToken(req.user.id);
  }

  @Post('refresh')
  async refreshToken(@Request() req) {
    return this.tokensService.refreshToken(req.user.id);
  }

  @Delete()
  async revokeToken(@Request() req) {
    return this.tokensService.revokeTokens(req.user.id);
  }
}
```

#### 1.5 Update Database

```typescript
// Add to app.module.ts entities array
entities: [User, Device, Session, ZaloToken],
```

#### 1.6 Testing

```bash
# Start backend
npm run start:dev

# Test endpoints with Postman
POST /zalo-tokens/save
GET  /zalo-tokens/current
POST /zalo-tokens/refresh
```

---

### Phase 2: Mobile Account Isolation (Week 2)

#### 2.1 Create Account Isolation Service

```typescript
// mobile/src/services/accountIsolation.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

class AccountIsolationService {
  private currentUserId: string | null = null;

  // Switch storage context to different user
  async switchContext(newUserId: string): Promise<void> {
    console.log(`Switching context from ${this.currentUserId} to ${newUserId}`);

    // Step 1: Clear current Zalo cache
    await this.clearZaloCache();

    // Step 2: Save current user context (if any)
    if (this.currentUserId) {
      await this.saveUserContext(this.currentUserId);
    }

    // Step 3: Load new user context
    await this.loadUserContext(newUserId);

    this.currentUserId = newUserId;
  }

  // Clear all Zalo-related data
  private async clearZaloCache(): Promise<void> {
    const zaloKeys = await AsyncStorage.getAllKeys();
    const zaloRelatedKeys = zaloKeys.filter(key =>
      key.startsWith('zalo_') ||
      key.startsWith('@zalo') ||
      key.includes('zalo')
    );

    if (zaloRelatedKeys.length > 0) {
      await AsyncStorage.multiRemove(zaloRelatedKeys);
    }

    // Clear WebView cookies (if using WebView for Zalo)
    // await CookieManager.clearAll();
  }

  // Save current user's Zalo state
  private async saveUserContext(userId: string): Promise<void> {
    // Get all Zalo-related data
    const zaloKeys = await AsyncStorage.getAllKeys();
    const zaloData: Record<string, string> = {};

    for (const key of zaloKeys) {
      if (key.startsWith('zalo_')) {
        const value = await AsyncStorage.getItem(key);
        if (value) zaloData[key] = value;
      }
    }

    // Store with user prefix
    await EncryptedStorage.setItem(
      `user_context_${userId}`,
      JSON.stringify(zaloData)
    );
  }

  // Load user's Zalo state
  private async loadUserContext(userId: string): Promise<void> {
    const contextJson = await EncryptedStorage.getItem(`user_context_${userId}`);

    if (contextJson) {
      const context = JSON.parse(contextJson);

      // Restore Zalo data
      for (const [key, value] of Object.entries(context)) {
        await AsyncStorage.setItem(key, value as string);
      }
    }
  }

  // Get current user ID
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }
}

export default new AccountIsolationService();
```

#### 2.2 Enhanced Zalo SDK Wrapper

```typescript
// mobile/src/services/zalo.enhanced.ts

import { APIService } from './api';
import accountIsolation from './accountIsolation';

class EnhancedZaloService {
  private currentAccessToken: string | null = null;

  // Initialize Zalo SDK with tokens from backend
  async initializeWithUser(userId: string): Promise<void> {
    try {
      // Get valid token from backend (auto-refreshes if expired)
      const response = await APIService.instance.get('/zalo-tokens/current');
      const { accessToken, zaloUserInfo } = response.data;

      this.currentAccessToken = accessToken;

      // Initialize Zalo SDK with token
      // await ZaloSDK.initialize(accessToken);

      console.log('Zalo initialized for user:', zaloUserInfo);
    } catch (error) {
      console.error('Failed to initialize Zalo:', error);
      throw error;
    }
  }

  // Login with Zalo and save tokens
  async login(): Promise<any> {
    try {
      // Call Zalo SDK login
      // const result = await ZaloSDK.login();

      // Mock result for now
      const result = {
        accessToken: 'zalo_access_token_xxx',
        refreshToken: 'zalo_refresh_token_xxx',
        expiresIn: 86400, // 24 hours
        zaloUserId: 'zalo_user_123',
      };

      // Save tokens to backend
      await APIService.instance.post('/zalo-tokens/save', {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        zaloUserInfo: {
          id: result.zaloUserId,
        },
      });

      this.currentAccessToken = result.accessToken;

      return result;
    } catch (error) {
      console.error('Zalo login failed:', error);
      throw error;
    }
  }

  // Logout and clear tokens
  async logout(): Promise<void> {
    try {
      // Revoke tokens on backend
      await APIService.instance.delete('/zalo-tokens');

      // Call Zalo SDK logout
      // await ZaloSDK.logout();

      this.currentAccessToken = null;
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // Get current access token
  getAccessToken(): string | null {
    return this.currentAccessToken;
  }
}

export default new EnhancedZaloService();
```

#### 2.3 Account Switcher Service

```typescript
// mobile/src/services/accountSwitcher.ts

import { APIService } from './api';
import accountIsolation from './accountIsolation';
import zaloService from './zalo.enhanced';
import storage from './storage';

class AccountSwitcher {
  async switchToAccount(newUserId: string): Promise<void> {
    const currentUserId = await storage.getCurrentUserId();

    if (currentUserId === newUserId) {
      console.log('Already on this account');
      return;
    }

    try {
      // Step 1: Logout from current Zalo session
      await zaloService.logout();

      // Step 2: Switch context (clear & load cache)
      await accountIsolation.switchContext(newUserId);

      // Step 3: Call backend to switch session
      const deviceId = await DeviceInfo.getUniqueId();
      await APIService.switchAccount(currentUserId, newUserId);

      // Step 4: Initialize Zalo for new user
      await zaloService.initializeWithUser(newUserId);

      // Step 5: Update local current user
      await storage.setCurrentUserId(newUserId);

      console.log('Successfully switched to user:', newUserId);
    } catch (error) {
      console.error('Account switch failed:', error);
      throw error;
    }
  }
}

export default new AccountSwitcher();
```

---

### Phase 3: UI/UX Improvements (Week 3)

#### 3.1 Account Switcher UI

```typescript
// mobile/src/components/AccountSwitcher.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import accountSwitcher from '../services/accountSwitcher';
import storage from '../services/storage';

export const AccountSwitcher: React.FC = () => {
  const [accounts, setAccounts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const savedAccounts = await storage.getSavedAccounts();
    const current = await storage.getCurrentUserId();
    setAccounts(savedAccounts);
    setCurrentUserId(current);
  };

  const handleSwitch = async (userId: string) => {
    setSwitching(true);
    try {
      await accountSwitcher.switchToAccount(userId);
      setCurrentUserId(userId);
      setShowModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to switch account');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={() => setShowModal(true)}>
        <Text>Switch Account</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide">
        <View>
          <Text>Select Account</Text>
          <FlatList
            data={accounts}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSwitch(item.userId)}
                disabled={switching || item.userId === currentUserId}
              >
                <Text>{item.displayName}</Text>
                {item.userId === currentUserId && <Text>(Current)</Text>}
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.userId}
          />
          <TouchableOpacity onPress={() => setShowModal(false)}>
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};
```

---

### Phase 4: Testing & Optimization (Week 4)

#### 4.1 Testing Checklist

- [ ] Backend token storage works
- [ ] Token auto-refresh works
- [ ] Mobile cache isolation works
- [ ] Account switching is seamless
- [ ] No data leakage between accounts
- [ ] Offline mode works
- [ ] Performance is acceptable

#### 4.2 Performance Optimization

```typescript
// Cache tokens in memory
private tokenCache = new Map<string, string>();

async getValidToken(userId: string): Promise<string> {
  // Check memory cache first
  if (this.tokenCache.has(userId)) {
    return this.tokenCache.get(userId)!;
  }

  // Fetch from database
  const token = await this.fetchFromDB(userId);
  this.tokenCache.set(userId, token);

  return token;
}
```

---

## 📊 Comparison: Before vs After

| Feature | Before | After Enhancement |
|---------|--------|------------------|
| **Account Switching** | Manual re-login | Seamless switch |
| **Zalo Tokens** | Not managed | Auto-refreshed |
| **Cache Isolation** | None | Full isolation |
| **Offline Support** | Limited | Full support |
| **Switch Speed** | ~30 seconds | ~2 seconds |
| **User Experience** | Clunky | Smooth |

---

## 🎯 Success Criteria

- ✅ Switch accounts in < 3 seconds
- ✅ No re-login required
- ✅ No data leakage between accounts
- ✅ Works offline
- ✅ Auto-refresh Zalo tokens
- ✅ Maintain cross-platform support

---

## 📚 Documentation to Update

After implementation:

1. **CLAUDE.md** - Add Zalo token management section
2. **API.md** - Document new endpoints
3. **MOBILE.md** - Document new services
4. **README.md** - Update features list

---

## 🚀 Ready to Start!

**Next step:** Begin Phase 1 - Backend Token Management

Run:
```bash
cd backend
nest g module modules/zalo-tokens
nest g service modules/zalo-tokens
nest g controller modules/zalo-tokens
```
