/**
 * API Configuration
 * Cập nhật PRODUCTION_API_URL sau khi deploy backend lên Railway
 */

export const API_CONFIG = {
  // Development API URL (localhost)
  DEVELOPMENT_API_URL: 'http://10.0.2.2:3000', // Android emulator
  // DEVELOPMENT_API_URL: 'http://localhost:3000', // iOS simulator

  // Production API URL (Railway hoặc server khác)
  // Cập nhật URL này sau khi deploy backend
  PRODUCTION_API_URL: 'https://your-backend.up.railway.app',

  // Timeout cho API calls (ms)
  TIMEOUT: 30000,
};

// Chọn API URL dựa trên environment
// Mặc định sử dụng PRODUCTION_API_URL cho APK release
export const API_URL = __DEV__
  ? API_CONFIG.DEVELOPMENT_API_URL
  : API_CONFIG.PRODUCTION_API_URL;
