import EncryptedStorage from 'react-native-encrypted-storage';
import { Account } from '../types';

export class SecureStorageService {
  private static ACCOUNTS_KEY = 'zalo_accounts';
  private static CURRENT_ACCOUNT_KEY = 'current_account';

  static async saveAccount(account: Account): Promise<void> {
    try {
      const accounts = await this.getAllAccounts();
      const updated = [...accounts.filter(a => a.id !== account.id), account];
      await EncryptedStorage.setItem(
        this.ACCOUNTS_KEY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error('Error saving account:', error);
      throw error;
    }
  }

  static async getAllAccounts(): Promise<Account[]> {
    try {
      const data = await EncryptedStorage.getItem(this.ACCOUNTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting accounts:', error);
      return [];
    }
  }

  static async getCurrentAccount(): Promise<Account | null> {
    try {
      const data = await EncryptedStorage.getItem(this.CURRENT_ACCOUNT_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting current account:', error);
      return null;
    }
  }

  static async setCurrentAccount(account: Account): Promise<void> {
    await EncryptedStorage.setItem(
      this.CURRENT_ACCOUNT_KEY,
      JSON.stringify(account)
    );
  }

  static async deleteAccount(accountId: string): Promise<void> {
    const accounts = await this.getAllAccounts();
    const filtered = accounts.filter(a => a.id !== accountId);
    await EncryptedStorage.setItem(
      this.ACCOUNTS_KEY,
      JSON.stringify(filtered)
    );
  }

  static async clearAll(): Promise<void> {
    await EncryptedStorage.clear();
  }
}
