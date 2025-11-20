import { NativeModules, Platform } from 'react-native';
import { APIService } from './api';
import AccountIsolationService, { ZaloAccount } from './AccountIsolationService';

const { ZaloModule } = NativeModules;

/**
 * Zalo OAuth response from SDK
 */
export interface ZaloOAuthResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  userId: string; // Zalo user ID
  displayName: string;
  avatar?: string;
  phone?: string;
}

/**
 * Enhanced Zalo SDK wrapper with auto token management
 * Handles Zalo login, token refresh, and backend synchronization
 */
export class EnhancedZaloSDK {
  private static instance: EnhancedZaloSDK;

  private constructor() {}

  static getInstance(): EnhancedZaloSDK {
    if (!EnhancedZaloSDK.instance) {
      EnhancedZaloSDK.instance = new EnhancedZaloSDK();
    }
    return EnhancedZaloSDK.instance;
  }

  /**
   * Check if Zalo SDK is available
   */
  isAvailable(): boolean {
    return ZaloModule !== undefined && ZaloModule !== null;
  }

  /**
   * Login with Zalo SDK and save tokens to backend
   * Returns the complete account object
   */
  async loginWithZalo(backendJWT: string): Promise<ZaloAccount> {
    try {
      if (!this.isAvailable()) {
        throw new Error('Zalo SDK not available');
      }

      console.log('Starting Zalo OAuth login...');

      // Call Zalo SDK native module for OAuth login
      const zaloResult: ZaloOAuthResult = await ZaloModule.login();

      console.log('Zalo login successful:', {
        userId: zaloResult.userId,
        displayName: zaloResult.displayName,
        expiresIn: zaloResult.expiresIn,
      });

      // Set backend JWT token for API calls
      APIService.setAuthToken(backendJWT);

      // Save Zalo tokens to backend
      console.log('Saving Zalo tokens to backend...');
      await APIService.saveZaloTokens({
        accessToken: zaloResult.accessToken,
        refreshToken: zaloResult.refreshToken,
        expiresIn: zaloResult.expiresIn,
        zaloUserInfo: {
          id: zaloResult.userId,
          name: zaloResult.displayName,
          avatar: zaloResult.avatar,
          phone: zaloResult.phone,
        },
      });

      console.log('Zalo tokens saved to backend successfully');

      // Create account object
      const account: ZaloAccount = {
        userId: '', // Will be set by caller with backend user ID
        zaloUserId: zaloResult.userId,
        displayName: zaloResult.displayName,
        avatar: zaloResult.avatar,
        phone: zaloResult.phone,
        accessToken: backendJWT,
        zaloAccessToken: zaloResult.accessToken,
        isActive: true,
        lastUsed: new Date(),
        createdAt: new Date(),
      };

      return account;
    } catch (error) {
      console.error('Zalo login failed:', error);
      throw error;
    }
  }

  /**
   * Get current valid Zalo token from backend
   * Backend automatically refreshes if expired
   */
  async getValidZaloToken(): Promise<string> {
    try {
      const response = await APIService.getCurrentZaloToken();
      console.log('Got valid Zalo token from backend');
      return response.accessToken;
    } catch (error) {
      console.error('Failed to get valid Zalo token:', error);
      throw error;
    }
  }

  /**
   * Get Zalo token details (metadata only, no actual tokens)
   */
  async getZaloTokenDetails() {
    try {
      return await APIService.getZaloTokenDetails();
    } catch (error) {
      console.error('Failed to get Zalo token details:', error);
      throw error;
    }
  }

  /**
   * Manually refresh Zalo token
   */
  async refreshZaloToken(): Promise<string> {
    try {
      console.log('Manually refreshing Zalo token...');
      const response = await APIService.refreshZaloToken();
      console.log('Zalo token refreshed successfully');
      return response.accessToken;
    } catch (error) {
      console.error('Failed to refresh Zalo token:', error);
      throw error;
    }
  }

  /**
   * Logout from Zalo (revoke tokens on backend)
   */
  async logout(): Promise<void> {
    try {
      console.log('Revoking Zalo tokens on backend...');
      await APIService.revokeZaloTokens();
      console.log('Zalo tokens revoked successfully');

      // Call native Zalo SDK logout if available
      if (this.isAvailable() && ZaloModule.logout) {
        await ZaloModule.logout();
        console.log('Zalo SDK logout successful');
      }
    } catch (error) {
      console.error('Failed to logout from Zalo:', error);
      throw error;
    }
  }

  /**
   * Delete Zalo tokens completely (hard delete)
   */
  async deleteTokens(): Promise<void> {
    try {
      console.log('Deleting Zalo tokens from backend...');
      await APIService.deleteZaloTokens();
      console.log('Zalo tokens deleted successfully');
    } catch (error) {
      console.error('Failed to delete Zalo tokens:', error);
      throw error;
    }
  }

  /**
   * Call Zalo API with auto token refresh
   * If token is expired, automatically gets a fresh one from backend
   */
  async callZaloAPI(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    data?: any,
  ): Promise<any> {
    try {
      // Get valid token (backend auto-refreshes if needed)
      const accessToken = await this.getValidZaloToken();

      // Call Zalo API
      const url = `https://graph.zalo.me/v2.0/${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'access_token': accessToken,
        },
      };

      if (data && method === 'POST') {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          `Zalo API error: ${result.error?.message || 'Unknown error'}`,
        );
      }

      return result;
    } catch (error) {
      console.error('Zalo API call failed:', error);
      throw error;
    }
  }

  /**
   * Get Zalo user profile
   */
  async getUserProfile(): Promise<any> {
    return this.callZaloAPI('me', 'GET');
  }

  /**
   * Get Zalo friends list
   */
  async getFriendsList(offset: number = 0, count: number = 20): Promise<any> {
    return this.callZaloAPI(`me/friends?offset=${offset}&count=${count}`, 'GET');
  }

  /**
   * Send Zalo message
   */
  async sendMessage(recipientId: string, message: string): Promise<any> {
    return this.callZaloAPI('me/message', 'POST', {
      recipient: { user_id: recipientId },
      message: { text: message },
    });
  }

  /**
   * Get Zalo conversations
   */
  async getConversations(offset: number = 0, count: number = 20): Promise<any> {
    return this.callZaloAPI(
      `me/conversations?offset=${offset}&count=${count}`,
      'GET',
    );
  }

  /**
   * Check if user has valid Zalo token
   */
  async hasValidToken(): Promise<boolean> {
    try {
      const details = await this.getZaloTokenDetails();
      return details.isActive && new Date(details.expiresAt) > new Date();
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export default EnhancedZaloSDK.getInstance();
