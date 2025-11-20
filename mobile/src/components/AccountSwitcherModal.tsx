import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { AccountCard } from './AccountCard';
import AccountSwitcherService from '../services/AccountSwitcherService';
import { ZaloAccount } from '../services/AccountIsolationService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AccountSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
  onAddAccount: () => void;
  onAccountSwitch?: (account: ZaloAccount) => void;
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({
  visible,
  onClose,
  onAddAccount,
  onAccountSwitch,
}) => {
  const [accounts, setAccounts] = useState<ZaloAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<ZaloAccount | null>(null);
  const [switchingToId, setSwitchingToId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadAccounts();
    }
  }, [visible]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const allAccounts = await AccountSwitcherService.getAllAccountsSorted();
      const active = await AccountSwitcherService.getActiveAccount();
      setAccounts(allAccounts);
      setActiveAccount(active);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountPress = async (account: ZaloAccount) => {
    if (account.userId === activeAccount?.userId) {
      onClose();
      return;
    }

    try {
      setSwitchingToId(account.userId);
      const result = await AccountSwitcherService.switchAccount(account.userId);

      if (result.success) {
        setActiveAccount(result.toAccount);
        onAccountSwitch?.(result.toAccount);
        Alert.alert(
          'Thành công',
          `Đã chuyển sang tài khoản ${result.toAccount.displayName}`,
        );
        onClose();
      } else {
        Alert.alert('Lỗi', result.error || 'Không thể chuyển tài khoản');
      }
    } catch (error) {
      console.error('Failed to switch account:', error);
      Alert.alert('Lỗi', 'Không thể chuyển tài khoản');
    } finally {
      setSwitchingToId(null);
    }
  };

  const handleAccountLongPress = (account: ZaloAccount) => {
    Alert.alert(
      account.displayName,
      'Bạn muốn làm gì với tài khoản này?',
      [
        {
          text: 'Xóa tài khoản',
          style: 'destructive',
          onPress: () => handleRemoveAccount(account.userId),
        },
        {
          text: 'Hủy',
          style: 'cancel',
        },
      ],
    );
  };

  const handleRemoveAccount = async (userId: string) => {
    const account = accounts.find(acc => acc.userId === userId);
    if (!account) return;

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa tài khoản "${account.displayName}"? Hành động này không thể hoàn tác.`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await AccountSwitcherService.removeAccount(userId);
              await loadAccounts();
              Alert.alert('Thành công', 'Đã xóa tài khoản');
            } catch (error) {
              console.error('Failed to remove account:', error);
              Alert.alert('Lỗi', 'Không thể xóa tài khoản');
            }
          },
        },
      ],
    );
  };

  const renderAccountItem = ({ item }: { item: ZaloAccount }) => {
    const isActive = item.userId === activeAccount?.userId;
    const isSwitching = item.userId === switchingToId;

    return (
      <AccountCard
        account={item}
        isActive={isActive}
        onPress={() => handleAccountPress(item)}
        onLongPress={() => handleAccountLongPress(item)}
        loading={isSwitching}
      />
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {/* Handle Bar */}
              <View style={styles.handleBar} />

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Tài khoản</Text>
                <Text style={styles.subtitle}>
                  {accounts.length} tài khoản
                </Text>
              </View>

              {/* Account List */}
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
              ) : accounts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Chưa có tài khoản nào
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Thêm tài khoản Zalo để bắt đầu
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={accounts}
                  renderItem={renderAccountItem}
                  keyExtractor={item => item.userId}
                  style={styles.list}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                />
              )}

              {/* Add Account Button */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  onClose();
                  onAddAccount();
                }}
                activeOpacity={0.8}>
                <Text style={styles.addButtonIcon}>+</Text>
                <Text style={styles.addButtonText}>Thêm tài khoản</Text>
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.8}>
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#F5F6F7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
    paddingBottom: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#CED0D4',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1E21',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#65676B',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#65676B',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1E21',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#65676B',
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0084FF',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#0084FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#65676B',
  },
});
