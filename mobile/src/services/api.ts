import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import { API_URL, API_CONFIG } from '../config/api.config';

export class APIService {
  private static instance = axios.create({
    baseURL: API_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  static async registerDevice() {
    const deviceId = await DeviceInfo.getUniqueId();
    const deviceInfo = {
      deviceId,
      brand: await DeviceInfo.getBrand(),
      model: await DeviceInfo.getModel(),
      osVersion: await DeviceInfo.getSystemVersion(),
      platform: await DeviceInfo.getPlatform(),
    };

    const response = await this.instance.post('/device/register', deviceInfo);
    return response.data;
  }

  static async login(credentials: { username: string; password: string }) {
    const deviceId = await DeviceInfo.getUniqueId();
    const response = await this.instance.post('/auth/login', {
      ...credentials,
      deviceId,
    });
    return response.data;
  }

  static async getAccounts(deviceId: string) {
    const response = await this.instance.get(`/accounts/${deviceId}`);
    return response.data;
  }

  static async syncAccount(account: any) {
    const response = await this.instance.post('/accounts/sync', account);
    return response.data;
  }

  static async startSession(accountId: string) {
    const deviceId = await DeviceInfo.getUniqueId();
    const response = await this.instance.post('/session/start', {
      accountId,
      deviceId,
    });
    return response.data;
  }

  static async endSession(accountId: string) {
    const response = await this.instance.post('/session/end', { accountId });
    return response.data;
  }

  /**
   * HYBRID MODE: Switch user trên cùng device
   * Tự động end session cũ và start session mới
   */
  static async switchAccount(currentUserId: string, newUserId: string) {
    const deviceId = await DeviceInfo.getUniqueId();
    const response = await this.instance.post('/session/switch', {
      currentUserId,
      newUserId,
      deviceId,
    });
    return response.data;
  }

  /**
   * HYBRID MODE: Lấy tất cả sessions của user trên các devices
   */
  static async getUserSessions(userId: string) {
    const response = await this.instance.get(`/session/user/${userId}`);
    return response.data;
  }

  /**
   * HYBRID MODE: Lấy tất cả sessions trên device này (multi-user)
   */
  static async getDeviceSessions() {
    const deviceId = await DeviceInfo.getUniqueId();
    const response = await this.instance.get(`/session/device/${deviceId}`);
    return response.data;
  }

  /**
   * Set authentication token for API requests
   */
  static setAuthToken(token: string) {
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authentication token
   */
  static clearAuthToken() {
    delete this.instance.defaults.headers.common['Authorization'];
  }

  /**
   * Switch session (calls backend to notify about account switch)
   */
  static async switchSession(currentUserId: string, newUserId: string) {
    const deviceId = await DeviceInfo.getUniqueId();
    const response = await this.instance.post('/session/switch', {
      currentUserId,
      newUserId,
      deviceId,
    });
    return response.data;
  }

  // ========== Zalo Tokens API ==========

  /**
   * Save Zalo OAuth tokens to backend after login
   */
  static async saveZaloTokens(data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    zaloUserInfo?: {
      id?: string;
      name?: string;
      avatar?: string;
      phone?: string;
    };
  }) {
    const response = await this.instance.post('/zalo-tokens/save', data);
    return response.data;
  }

  /**
   * Get current valid Zalo token (auto-refreshes if expired)
   */
  static async getCurrentZaloToken() {
    const response = await this.instance.get('/zalo-tokens/current');
    return response.data;
  }

  /**
   * Get Zalo token details (no actual tokens exposed)
   */
  static async getZaloTokenDetails() {
    const response = await this.instance.get('/zalo-tokens/details');
    return response.data;
  }

  /**
   * Manually refresh Zalo token
   */
  static async refreshZaloToken() {
    const response = await this.instance.post('/zalo-tokens/refresh');
    return response.data;
  }

  /**
   * Revoke Zalo tokens (soft delete)
   */
  static async revokeZaloTokens() {
    const response = await this.instance.post('/zalo-tokens/revoke');
    return response.data;
  }

  /**
   * Delete Zalo tokens (hard delete)
   */
  static async deleteZaloTokens() {
    const response = await this.instance.delete('/zalo-tokens');
    return response.data;
  }
}
