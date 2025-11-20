import { NativeModules } from 'react-native';

const { ZaloModule } = NativeModules;

export class ZaloService {
  static async initialize(appId: string): Promise<void> {
    if (ZaloModule) {
      await ZaloModule.initialize(appId);
    } else {
      throw new Error('Zalo Module not available');
    }
  }

  static async login(): Promise<{ accessToken: string; userId: string }> {
    try {
      const result = await ZaloModule.login();
      return result;
    } catch (error) {
      console.error('Zalo login error:', error);
      throw error;
    }
  }

  static async getUserInfo(accessToken: string): Promise<any> {
    try {
      const userInfo = await ZaloModule.getUserInfo(accessToken);
      return userInfo;
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      await ZaloModule.logout();
    } catch (error) {
      console.error('Zalo logout error:', error);
      throw error;
    }
  }

  static async refreshToken(refreshToken: string): Promise<string> {
    try {
      const newToken = await ZaloModule.refreshToken(refreshToken);
      return newToken;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }
}
