import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { SecureStorageService } from '../services/storage';
import { ZaloService } from '../services/zalo';
import { Account } from '../types';

export default function AccountListScreen({ navigation }: any) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const allAccounts = await SecureStorageService.getAllAccounts();
      const current = await SecureStorageService.getCurrentAccount();
      setAccounts(allAccounts);
      setCurrentAccount(current);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách tài khoản');
    }
  };

  const switchAccount = async (account: Account) => {
    setLoading(true);
    try {
      if (currentAccount) {
        await ZaloService.logout();
      }

      await SecureStorageService.setCurrentAccount(account);
      setCurrentAccount(account);

      navigation.navigate('Dashboard', { account });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chuyển tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (accountId: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa tài khoản này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await SecureStorageService.deleteAccount(accountId);
            loadAccounts();
          },
        },
      ]
    );
  };

  const renderAccount = ({ item }: { item: Account }) => (
    <TouchableOpacity
      style={[
        styles.accountCard,
        currentAccount?.id === item.id && styles.activeCard,
      ]}
      onPress={() => switchAccount(item)}
      onLongPress={() => deleteAccount(item.id)}
    >
      <Image
        source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
        style={styles.avatar}
      />
      <View style={styles.accountInfo}>
        <Text style={styles.displayName}>{item.displayName}</Text>
        <Text style={styles.username}>@{item.username}</Text>
        <Text style={styles.lastLogin}>
          Đăng nhập: {new Date(item.lastLogin).toLocaleString('vi-VN')}
        </Text>
      </View>
      {currentAccount?.id === item.id && (
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>Đang dùng</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tài khoản Zalo</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddAccount')}
        >
          <Text style={styles.addButtonText}>+ Thêm</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={accounts}
        renderItem={renderAccount}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Chưa có tài khoản nào. Nhấn "Thêm" để bắt đầu!
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0068FF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#0068FF',
    fontWeight: 'bold',
  },
  list: {
    padding: 15,
  },
  accountCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: '#0068FF',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  accountInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  lastLogin: {
    fontSize: 12,
    color: '#999',
  },
  activeBadge: {
    backgroundColor: '#0068FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});
