import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ZaloService } from '../services/zalo';
import { APIService } from '../services/api';
import { SecureStorageService } from '../services/storage';
import { Account } from '../types';
import DeviceInfo from 'react-native-device-info';

export default function AddAccountScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddAccount = async () => {
    if (!username || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      // 1. Login với backend
      const loginResult = await APIService.login({ username, password });
      
      // 2. Login với Zalo SDK
      await ZaloService.initialize('YOUR_ZALO_APP_ID');
      const zaloAuth = await ZaloService.login();
      
      // 3. Lấy thông tin user từ Zalo
      const userInfo = await ZaloService.getUserInfo(zaloAuth.accessToken);
      
      // 4. Tạo account object
      const deviceId = await DeviceInfo.getUniqueId();
      const account: Account = {
        id: loginResult.accountId,
        username,
        displayName: userInfo.name,
        avatar: userInfo.picture?.data?.url,
        encryptedToken: loginResult.token,
        deviceId,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      // 5. Lưu vào local storage
      await SecureStorageService.saveAccount(account);
      
      // 6. Sync với backend
      await APIService.syncAccount(account);

      Alert.alert('Thành công', 'Đã thêm tài khoản thành công!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Add account error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể thêm tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleZaloDirectLogin = async () => {
    setLoading(true);
    try {
      // Login trực tiếp bằng Zalo SDK
      await ZaloService.initialize('YOUR_ZALO_APP_ID');
      const zaloAuth = await ZaloService.login();
      const userInfo = await ZaloService.getUserInfo(zaloAuth.accessToken);
      
      const deviceId = await DeviceInfo.getUniqueId();
      const account: Account = {
        id: zaloAuth.userId,
        username: userInfo.id,
        displayName: userInfo.name,
        avatar: userInfo.picture?.data?.url,
        encryptedToken: zaloAuth.accessToken,
        deviceId,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      await SecureStorageService.saveAccount(account);
      
      Alert.alert('Thành công', 'Đã thêm tài khoản Zalo!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đăng nhập Zalo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Thêm tài khoản</Text>
        <View style={{ width: 80 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Đăng nhập qua Backend</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Tên đăng nhập"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAddAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Thêm tài khoản</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>HOẶC</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.zaloButton, loading && styles.buttonDisabled]}
          onPress={handleZaloDirectLogin}
          disabled={loading}
        >
          <Text style={styles.zaloButtonText}>
            🔵 Đăng nhập trực tiếp qua Zalo
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          💡 Lưu ý: Mỗi thiết bị chỉ có thể thêm tài khoản của chính bạn
        </Text>
      </View>
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
  backButton: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#0068FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 14,
  },
  zaloButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0068FF',
  },
  zaloButtonText: {
    color: '#0068FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
