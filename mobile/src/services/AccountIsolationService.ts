import EncryptedStorage from 'react-native-encrypted-storage';
import { APIService } from './api';

/**
 * Account data structure stored locally
 */
export interface ZaloAccount {
  userId: string; // Backend user ID
  zaloUserId: string; // Zalo user ID
  displayName: string;
  avatar?: string;
  phone?: string;
  email?: string;
  accessToken: string; // Backend JWT token
  zaloAccessToken?: string; // Zalo OAuth token (optional - backend manages this)
  isActive: boolean;
  lastUsed: Date;
  createdAt: Date;
}

/**
 * Service to manage isolated Zalo accounts in the app
 * Each account has its own credentials, tokens, and storage
 */
export class AccountIsolationService {
  private static ACCOUNTS_KEY = 'zalo_accounts';
  private static ACTIVE_ACCOUNT_KEY = 'active_account_id';
  private static instance: AccountIsolationService;

  private constructor() {}

  static getInstance(): AccountIsolationService {
    if (!AccountIsolationService.instance) {
      AccountIsolationService.instance = new AccountIsolationService();
    }
    return AccountIsolationService.instance;
  }

  /**
   * Get all stored accounts
   */
  async getAllAccounts(): Promise<ZaloAccount[]> {
    try {
      const accountsJson = await EncryptedStorage.getItem(this.ACCOUNTS_KEY);
      if (!accountsJson) {
        return [];
      }
      const accounts: ZaloAccount[] = JSON.parse(accountsJson);
      // Convert date strings back to Date objects
      return accounts.map(acc => ({
        ...acc,
        lastUsed: new Date(acc.lastUsed),
        createdAt: new Date(acc.createdAt),
      }));
    } catch (error) {
      console.error('Failed to get accounts:', error);
      return [];
    }
  }

  /**
   * Get active account
   */
  async getActiveAccount(): Promise<ZaloAccount | null> {
    try {
      const activeId = await EncryptedStorage.getItem(this.ACTIVE_ACCOUNT_KEY);
      if (!activeId) {
        return null;
      }
      const accounts = await this.getAllAccounts();
      return accounts.find(acc => acc.userId === activeId) || null;
    } catch (error) {
      console.error('Failed to get active account:', error);
      return null;
    }
  }

  /**
   * Add or update account
   */
  async saveAccount(account: ZaloAccount): Promise<void> {
    try {
      const accounts = await this.getAllAccounts();
      const existingIndex = accounts.findIndex(
        acc => acc.userId === account.userId,
      );

      if (existingIndex >= 0) {
        // Update existing account
        accounts[existingIndex] = {
          ...account,
          lastUsed: new Date(),
        };
      } else {
        // Add new account
        accounts.push({
          ...account,
          isActive: false,
          lastUsed: new Date(),
          createdAt: new Date(),
        });
      }

      await EncryptedStorage.setItem(
        this.ACCOUNTS_KEY,
        JSON.stringify(accounts),
      );

      console.log(
        `Account saved: ${account.displayName} (${account.userId})`,
      );
    } catch (error) {
      console.error('Failed to save account:', error);
      throw error;
    }
  }

  /**
   * Set active account and notify backend about switch
   */
  async setActiveAccount(userId: string): Promise<void> {
    try {
      const accounts = await this.getAllAccounts();
      const account = accounts.find(acc => acc.userId === userId);

      if (!account) {
        throw new Error('Account not found');
      }

      // Get current active account
      const currentActive = await this.getActiveAccount();

      // Mark all accounts as inactive
      const updatedAccounts = accounts.map(acc => ({
        ...acc,
        isActive: acc.userId === userId,
        lastUsed: acc.userId === userId ? new Date() : acc.lastUsed,
      }));

      await EncryptedStorage.setItem(
        this.ACCOUNTS_KEY,
        JSON.stringify(updatedAccounts),
      );
      await EncryptedStorage.setItem(this.ACTIVE_ACCOUNT_KEY, userId);

      // Update API service with new token
      APIService.setAuthToken(account.accessToken);

      // Notify backend about account switch (if there was a previous active account)
      if (currentActive && currentActive.userId !== userId) {
        try {
          // Call backend session switch endpoint
          await APIService.switchSession(currentActive.userId, userId);
          console.log(
            `Switched from ${currentActive.displayName} to ${account.displayName}`,
          );
        } catch (error) {
          console.error('Failed to notify backend about switch:', error);
          // Don't throw - local switch succeeded even if backend notification failed
        }
      }

      console.log(`Active account set: ${account.displayName}`);
    } catch (error) {
      console.error('Failed to set active account:', error);
      throw error;
    }
  }

  /**
   * Remove account from storage
   */
  async removeAccount(userId: string): Promise<void> {
    try {
      const accounts = await this.getAllAccounts();
      const filteredAccounts = accounts.filter(acc => acc.userId !== userId);

      await EncryptedStorage.setItem(
        this.ACCOUNTS_KEY,
        JSON.stringify(filteredAccounts),
      );

      // If removed account was active, clear active account
      const activeId = await EncryptedStorage.getItem(this.ACTIVE_ACCOUNT_KEY);
      if (activeId === userId) {
        await EncryptedStorage.removeItem(this.ACTIVE_ACCOUNT_KEY);

        // Set first account as active if available
        if (filteredAccounts.length > 0) {
          await this.setActiveAccount(filteredAccounts[0].userId);
        }
      }

      console.log(`Account removed: ${userId}`);
    } catch (error) {
      console.error('Failed to remove account:', error);
      throw error;
    }
  }

  /**
   * Clear all accounts (logout all)
   */
  async clearAllAccounts(): Promise<void> {
    try {
      await EncryptedStorage.removeItem(this.ACCOUNTS_KEY);
      await EncryptedStorage.removeItem(this.ACTIVE_ACCOUNT_KEY);
      console.log('All accounts cleared');
    } catch (error) {
      console.error('Failed to clear accounts:', error);
      throw error;
    }
  }

  /**
   * Check if user already has account saved
   */
  async hasAccount(userId: string): Promise<boolean> {
    const accounts = await this.getAllAccounts();
    return accounts.some(acc => acc.userId === userId);
  }

  /**
   * Get account by user ID
   */
  async getAccountById(userId: string): Promise<ZaloAccount | null> {
    const accounts = await this.getAllAccounts();
    return accounts.find(acc => acc.userId === userId) || null;
  }

  /**
   * Update account's Zalo access token after backend refresh
   */
  async updateZaloToken(
    userId: string,
    zaloAccessToken: string,
  ): Promise<void> {
    try {
      const accounts = await this.getAllAccounts();
      const accountIndex = accounts.findIndex(acc => acc.userId === userId);

      if (accountIndex >= 0) {
        accounts[accountIndex].zaloAccessToken = zaloAccessToken;
        await EncryptedStorage.setItem(
          this.ACCOUNTS_KEY,
          JSON.stringify(accounts),
        );
        console.log(`Zalo token updated for user: ${userId}`);
      }
    } catch (error) {
      console.error('Failed to update Zalo token:', error);
      throw error;
    }
  }

  /**
   * Get account count
   */
  async getAccountCount(): Promise<number> {
    const accounts = await this.getAllAccounts();
    return accounts.length;
  }

  /**
   * Sort accounts by last used (most recent first)
   */
  async getAccountsSortedByLastUsed(): Promise<ZaloAccount[]> {
    const accounts = await this.getAllAccounts();
    return accounts.sort(
      (a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime(),
    );
  }
}

// Export singleton instance
export default AccountIsolationService.getInstance();
