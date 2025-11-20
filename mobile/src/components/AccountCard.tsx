import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ZaloAccount } from '../services/AccountIsolationService';

interface AccountCardProps {
  account: ZaloAccount;
  isActive?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  showOptions?: boolean;
  onRemove?: () => void;
  loading?: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  isActive = false,
  onPress,
  onLongPress,
  showOptions = false,
  onRemove,
  loading = false,
}) => {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatLastUsed = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isActive && styles.activeContainer,
        loading && styles.loadingContainer,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={loading}
      activeOpacity={0.7}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {account.avatar ? (
          <Image source={{ uri: account.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitials}>
              {getInitials(account.displayName)}
            </Text>
          </View>
        )}
        {isActive && (
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.name, isActive && styles.activeName]} numberOfLines={1}>
          {account.displayName}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {account.email || account.phone || account.zaloUserId}
        </Text>
        <Text style={styles.lastUsed}>
          {isActive ? 'Đang hoạt động' : formatLastUsed(account.lastUsed)}
        </Text>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="small" color="#0084FF" />
        </View>
      )}

      {/* Remove Button */}
      {showOptions && onRemove && !loading && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      )}

      {/* Active Indicator */}
      {isActive && !loading && (
        <View style={styles.activeIndicator}>
          <Text style={styles.activeIndicatorText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeContainer: {
    backgroundColor: '#E7F3FF',
    borderWidth: 2,
    borderColor: '#0084FF',
  },
  loadingContainer: {
    opacity: 0.6,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    backgroundColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  activeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E7F3FF',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C851',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1E21',
    marginBottom: 2,
  },
  activeName: {
    color: '#0084FF',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#65676B',
    marginBottom: 4,
  },
  lastUsed: {
    fontSize: 12,
    color: '#8A8D91',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  activeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  activeIndicatorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
