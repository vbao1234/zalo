import axios from 'axios';
import DeviceInfo from 'react-native-device-info';

const API_URL = 'http://localhost:3000';

export class APIService {
  private static instance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
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
}
