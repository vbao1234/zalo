import AccountIsolationService, { ZaloAccount } from './AccountIsolationService';
import EnhancedZaloSDK from './EnhancedZaloSDK';
import { APIService } from './api';

/**
 * Account switch result
 */
export interface SwitchResult {
  success: boolean;
  fromAccount?: ZaloAccount;
  toAccount: ZaloAccount;
  error?: string;
}

/**
 * Service to handle seamless account switching
 * Manages the full flow: local storage update + backend notification + Zalo SDK context
 */
export class AccountSwitcherService {
  private static instance: AccountSwitcherService;
  private isSwitching: boolean = false;

  private constructor() {}

  static getInstance(): AccountSwitcherService {
    if (!AccountSwitcherService.instance) {
      AccountSwitcherService.instance = new AccountSwitcherService();
    }
    return AccountSwitcherService.instance;
  }

  /**
   * Switch to another account
   * Full flow:
   * 1. Check if switch is already in progress
   * 2. Get current and target accounts
   * 3. Update local storage (AccountIsolationService)
   * 4. Update API token
   * 5. Notify backend (session switch)
   * 6. Return result
   */
  async switchAccount(toUserId: string): Promise<SwitchResult> {
    if (this.isSwitching) {
      throw new Error('Account switch already in progress');
    }

    this.isSwitching = true;

    try {
      console.log(`Starting account switch to userId: ${toUserId}`);

      // Get current active account
      const fromAccount = await AccountIsolationService.getActiveAccount();

      // Get target account
      const toAccount = await AccountIsolationService.getAccountById(toUserId);

      if (!toAccount) {
        throw new Error(`Account not found: ${toUserId}`);
      }

      console.log('Switch details:', {
        from: fromAccount?.displayName || 'None',
        to: toAccount.displayName,
      });

      // Update local storage and API token
      // This also notifies backend via AccountIsolationService.setActiveAccount
      await AccountIsolationService.setActiveAccount(toUserId);

      console.log(`Account switch successful: ${toAccount.displayName}`);

      return {
        success: true,
        fromAccount: fromAccount || undefined,
        toAccount,
      };
    } catch (error) {
      console.error('Account switch failed:', error);
      return {
        success: false,
        toAccount: (await AccountIsolationService.getAccountById(toUserId))!,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      this.isSwitching = false;
    }
  }

  /**
   * Add a new account (after Zalo login)
   * Full flow:
   * 1. Register user with backend (or login)
   * 2. Login with Zalo SDK
   * 3. Save Zalo tokens to backend
   * 4. Save account locally
   * 5. Set as active account
   */
  async addAccount(credentials: {
    username: string;
    password: string;
  }): Promise<SwitchResult> {
    try {
      console.log('Adding new account...');

      // Step 1: Login with backend to get JWT token
      console.log('Logging in with backend...');
      const loginResponse = await APIService.login(credentials);
      const backendJWT = loginResponse.accessToken;
      const backendUserId = loginResponse.user.id;

      console.log('Backend login successful:', {
        userId: backendUserId,
        username: loginResponse.user.username,
      });

      // Step 2: Login with Zalo SDK
      console.log('Logging in with Zalo SDK...');
      const zaloAccount = await EnhancedZaloSDK.loginWithZalo(backendJWT);

      // Set backend user ID
      zaloAccount.userId = backendUserId;
      zaloAccount.email = loginResponse.user.email;

      // Step 3: Save account locally
      console.log('Saving account locally...');
      await AccountIsolationService.saveAccount(zaloAccount);

      // Step 4: Set as active account
      console.log('Setting as active account...');
      await AccountIsolationService.setActiveAccount(backendUserId);

      console.log('Account added successfully:', zaloAccount.displayName);

      return {
        success: true,
        toAccount: zaloAccount,
      };
    } catch (error) {
      console.error('Failed to add account:', error);
      throw error;
    }
  }

  /**
   * Remove account
   * Full flow:
   * 1. Revoke Zalo tokens on backend
   * 2. Remove from local storage
   * 3. If was active, switch to another account
   */
  async removeAccount(userId: string): Promise<void> {
    try {
      console.log(`Removing account: ${userId}`);

      const account = await AccountIsolationService.getAccountById(userId);
      if (!account) {
        throw new Error('Account not found');
      }

      // Set API token for this account
      APIService.setAuthToken(account.accessToken);

      // Revoke Zalo tokens on backend
      try {
        await EnhancedZaloSDK.logout();
        console.log('Zalo tokens revoked on backend');
      } catch (error) {
        console.warn('Failed to revoke tokens on backend:', error);
        // Continue with removal even if backend revocation fails
      }

      // Remove from local storage
      await AccountIsolationService.removeAccount(userId);

      console.log(`Account removed: ${account.displayName}`);
    } catch (error) {
      console.error('Failed to remove account:', error);
      throw error;
    }
  }

  /**
   * Get all accounts sorted by last used
   */
  async getAllAccountsSorted(): Promise<ZaloAccount[]> {
    return AccountIsolationService.getAccountsSortedByLastUsed();
  }

  /**
   * Get active account
   */
  async getActiveAccount(): Promise<ZaloAccount | null> {
    return AccountIsolationService.getActiveAccount();
  }

  /**
   * Check if account exists
   */
  async hasAccount(userId: string): Promise<boolean> {
    return AccountIsolationService.hasAccount(userId);
  }

  /**
   * Get account count
   */
  async getAccountCount(): Promise<number> {
    return AccountIsolationService.getAccountCount();
  }

  /**
   * Quick switch to next account (circular)
   */
  async switchToNextAccount(): Promise<SwitchResult | null> {
    try {
      const accounts = await this.getAllAccountsSorted();

      if (accounts.length <= 1) {
        console.log('Not enough accounts to switch');
        return null;
      }

      const currentAccount = await this.getActiveAccount();

      // Find current account index
      const currentIndex = currentAccount
        ? accounts.findIndex(acc => acc.userId === currentAccount.userId)
        : -1;

      // Get next account (circular)
      const nextIndex = (currentIndex + 1) % accounts.length;
      const nextAccount = accounts[nextIndex];

      console.log(`Quick switch: ${nextAccount.displayName}`);

      return await this.switchAccount(nextAccount.userId);
    } catch (error) {
      console.error('Quick switch failed:', error);
      return null;
    }
  }

  /**
   * Switch to previous account (circular)
   */
  async switchToPreviousAccount(): Promise<SwitchResult | null> {
    try {
      const accounts = await this.getAllAccountsSorted();

      if (accounts.length <= 1) {
        console.log('Not enough accounts to switch');
        return null;
      }

      const currentAccount = await this.getActiveAccount();

      // Find current account index
      const currentIndex = currentAccount
        ? accounts.findIndex(acc => acc.userId === currentAccount.userId)
        : -1;

      // Get previous account (circular)
      const prevIndex =
        currentIndex <= 0 ? accounts.length - 1 : currentIndex - 1;
      const prevAccount = accounts[prevIndex];

      console.log(`Quick switch back: ${prevAccount.displayName}`);

      return await this.switchAccount(prevAccount.userId);
    } catch (error) {
      console.error('Quick switch failed:', error);
      return null;
    }
  }

  /**
   * Refresh Zalo token for current account
   */
  async refreshCurrentAccountToken(): Promise<string> {
    try {
      const currentAccount = await this.getActiveAccount();

      if (!currentAccount) {
        throw new Error('No active account');
      }

      console.log('Refreshing token for current account...');

      // Backend handles token refresh
      const newToken = await EnhancedZaloSDK.refreshZaloToken();

      // Update local storage
      await AccountIsolationService.updateZaloToken(
        currentAccount.userId,
        newToken,
      );

      console.log('Token refreshed successfully');

      return newToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  }

  /**
   * Check if current account has valid Zalo token
   */
  async hasValidToken(): Promise<boolean> {
    try {
      return await EnhancedZaloSDK.hasValidToken();
    } catch (error) {
      return false;
    }
  }

  /**
   * Logout from all accounts
   */
  async logoutAll(): Promise<void> {
    try {
      console.log('Logging out from all accounts...');

      const accounts = await this.getAllAccountsSorted();

      // Revoke tokens for each account
      for (const account of accounts) {
        try {
          APIService.setAuthToken(account.accessToken);
          await EnhancedZaloSDK.logout();
          console.log(`Logged out: ${account.displayName}`);
        } catch (error) {
          console.warn(`Failed to logout ${account.displayName}:`, error);
        }
      }

      // Clear all local storage
      await AccountIsolationService.clearAllAccounts();

      console.log('All accounts logged out');
    } catch (error) {
      console.error('Failed to logout all:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default AccountSwitcherService.getInstance();
