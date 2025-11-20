# Testing Zalo Tokens API Endpoints

This guide shows how to test the new Zalo Tokens module endpoints.

## Prerequisites

1. Backend server running: `cd backend && npm run start:dev`
2. PostgreSQL database running
3. User account created and logged in (to get JWT token)

## Step 1: Register and Login

First, create a user account and get a JWT token:

```bash
# Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Login to get JWT token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Save the `accessToken` from the response - you'll need it for all subsequent requests!**

## Step 2: Save Zalo Tokens

After the user logs in with Zalo SDK on mobile app, save the tokens:

```bash
curl -X POST http://localhost:3000/zalo-tokens/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "accessToken": "zalo_access_token_from_sdk",
    "refreshToken": "zalo_refresh_token_from_sdk",
    "expiresIn": 86400,
    "zaloUserInfo": {
      "id": "1234567890",
      "name": "Nguyen Van A",
      "avatar": "https://example.com/avatar.jpg",
      "phone": "0912345678"
    }
  }'
```

**Expected Response:**
```json
{
  "message": "Zalo tokens saved successfully",
  "expiresAt": "2025-11-21T19:00:00.000Z"
}
```

## Step 3: Get Current Valid Token

Get the current valid Zalo access token (auto-refreshes if expired):

```bash
curl -X GET http://localhost:3000/zalo-tokens/current \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "accessToken": "zalo_access_token_from_sdk",
  "message": "Token is valid"
}
```

## Step 4: Get Token Details

Get metadata about the stored Zalo token (doesn't expose actual tokens):

```bash
curl -X GET http://localhost:3000/zalo-tokens/details \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "userId": "user-uuid-here",
  "zaloUserInfo": {
    "id": "1234567890",
    "name": "Nguyen Van A",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "0912345678"
  },
  "expiresAt": "2025-11-21T19:00:00.000Z",
  "isActive": true,
  "createdAt": "2025-11-20T19:00:00.000Z",
  "updatedAt": "2025-11-20T19:00:00.000Z"
}
```

## Step 5: Manually Refresh Token

Force a token refresh (useful for testing):

```bash
curl -X POST http://localhost:3000/zalo-tokens/refresh \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "accessToken": "refreshed_1732131600000",
  "message": "Token refreshed successfully"
}
```

**Note:** Currently uses mock refresh API - will return `refreshed_<timestamp>` format.

## Step 6: Revoke Tokens

Soft delete - marks tokens as inactive but keeps in database:

```bash
curl -X POST http://localhost:3000/zalo-tokens/revoke \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "message": "Zalo tokens revoked successfully"
}
```

## Step 7: Delete Tokens

Hard delete - completely removes tokens from database:

```bash
curl -X DELETE http://localhost:3000/zalo-tokens \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "message": "Zalo tokens deleted successfully"
}
```

## Testing Auto-Refresh Feature

To test automatic token refresh when expired:

1. Save tokens with short expiration:
```bash
curl -X POST http://localhost:3000/zalo-tokens/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "accessToken": "test_token",
    "refreshToken": "test_refresh",
    "expiresIn": 5
  }'
```

2. Wait 6 seconds

3. Get current token - should auto-refresh:
```bash
curl -X GET http://localhost:3000/zalo-tokens/current \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

4. Check backend console logs - should see:
```
Token expired for user <user-id>, refreshing...
⚠️  Using mock Zalo refresh API - implement actual API call in production
```

## Error Scenarios

### 1. Token Not Found
```bash
curl -X GET http://localhost:3000/zalo-tokens/current \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```
**Response (404):**
```json
{
  "statusCode": 404,
  "message": "Zalo token not found for this user"
}
```

### 2. Token Revoked
```bash
# First revoke
curl -X POST http://localhost:3000/zalo-tokens/revoke \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Then try to get token
curl -X GET http://localhost:3000/zalo-tokens/current \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```
**Response (400):**
```json
{
  "statusCode": 400,
  "message": "Zalo token has been revoked"
}
```

### 3. Missing Authorization
```bash
curl -X GET http://localhost:3000/zalo-tokens/current
```
**Response (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## Database Verification

Check the `zalo_tokens` table in PostgreSQL:

```sql
-- Connect to database
psql -U postgres -d zalo_account_manager

-- View all tokens
SELECT id, "userId", "expiresAt", "isActive", "createdAt"
FROM zalo_tokens;

-- View token with user info
SELECT zt.*, zt."zaloUserInfo"->>'name' as zalo_name
FROM zalo_tokens zt
WHERE zt."isActive" = true;
```

## Next Steps

Once Phase 1 backend is tested and working:

1. **Phase 2: Mobile Integration**
   - Create AccountIsolationService to store tokens per user
   - Enhanced Zalo SDK wrapper to get tokens after login
   - Account switcher service to manage multiple accounts

2. **Implement Real Zalo OAuth API**
   - Replace mock refresh API in `zalo-tokens.service.ts:153`
   - Add Zalo API error handling
   - Test with real Zalo tokens from mobile app

## Troubleshooting

### Backend won't start
```bash
cd backend
npm install
npm run start:dev
```

### Database connection error
Check `.env` file has correct PostgreSQL credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=zalo_account_manager
```

### Table not created
With `synchronize: true` in `app.module.ts`, TypeORM should auto-create the `zalo_tokens` table. Check backend logs for errors.
