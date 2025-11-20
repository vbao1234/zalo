import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Account } from '../types';
import { ZaloService } from '../services/zalo';
import { APIService } from '../services/api';
import { SecureStorageService } from '../services/storage';

interface DashboardScreenProps {
  route: {
    params: {
      account: Account;
    };
  };
  navigation: any;
}

export default function DashboardScreen({ route, navigation }: DashboardScreenProps) {
  const { account } = route.params;
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      // Start session với backend
      await APIService.startSession(account.id);
      setSessionActive(true);
      setSessionStartTime(new Date());
    } catch (error) {
      console.error('Initialize session error:', error);
    }
  };

  const handleEndSession = async () => {
    Alert.alert(
      'Kết thúc phiên',
      'Bạn có chắc muốn kết thúc phiên làm việc?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Kết thúc',
          style: 'destructive',
          onPress: async () => {
            try {
              await APIService.endSession(account.id);
              await ZaloService.logout();
              setSessionActive(false);
              navigation.navigate('AccountList');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể kết thúc phiên');
            }
          },
        },
      ]
    );
  };

  const handleBackToAccountList = () => {
    navigation.navigate('AccountList');
  };

  const getSessionDuration = () => {
    if (!sessionStartTime) return '00:00:00';
    
    const now = new Date();
    const diff = now.getTime() - sessionStartTime.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToAccountList}>
          <Text style={styles.backButton}>← Tài khoản</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={{ width: 80 }} />
      </View>

      <View style={styles.profileCard}>
        <Image
          source={{ uri: account.avatar || 'https://via.placeholder.com/80' }}
          style={styles.avatar}
        />
        <Text style={styles.displayName}>{account.displayName}</Text>
        <Text style={styles.username}>@{account.username}</Text>
        
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, sessionActive && styles.statusDotActive]} />
          <Text style={styles.statusText}>
            {sessionActive ? 'Đang hoạt động' : 'Không hoạt động'}
          </Text>
        </View>
      </View>

      {sessionActive && (
        <View style={styles.sessionCard}>
          <Text style={styles.sessionTitle}>Thời gian phiên làm việc</Text>
          <Text style={styles.sessionTime}>{getSessionDuration()}</Text>
          <Text style={styles.sessionInfo}>
            Bắt đầu: {sessionStartTime?.toLocaleString('vi-VN')}
          </Text>
        </View>
      )}

      <View style={styles.actionsCard}>
        <Text style={styles.sectionTitle}>Hành động</Text>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📊</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Xem thống kê</Text>
            <Text style={styles.actionSubtitle}>Lịch sử hoạt động</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>⚙️</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Cài đặt</Text>
            <Text style={styles.actionSubtitle}>Tùy chỉnh tài khoản</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>💾</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Sao lưu</Text>
            <Text style={styles.actionSubtitle}>Backup dữ liệu</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleEndSession}
        >
          <Text style={styles.actionIcon}>🚪</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, styles.dangerText]}>
              Kết thúc phiên
            </Text>
            <Text style={styles.actionSubtitle}>Đăng xuất khỏi tài khoản</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Thông tin thiết bị</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Device ID:</Text>
          <Text style={styles.infoValue}>{account.deviceId}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tạo lúc:</Text>
          <Text style={styles.infoValue}>
            {new Date(account.createdAt).toLocaleString('vi-VN')}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Đăng nhập cuối:</Text>
          <Text style={styles.infoValue}>
            {new Date(account.lastLogin).toLocaleString('vi-VN')}
          </Text>
        </View>
      </View>
    </ScrollView>
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
  backButton: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionCard: {
    backgroundColor: '#E3F2FD',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  sessionTitle: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 8,
  },
  sessionTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0D47A1',
    marginBottom: 8,
  },
  sessionInfo: {
    fontSize: 12,
    color: '#1976D2',
  },
  actionsCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  dangerButton: {
    backgroundColor: '#FFEBEE',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  dangerText: {
    color: '#D32F2F',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  actionArrow: {
    fontSize: 24,
    color: '#999',
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    marginBottom: 30,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
});
