import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  ActivityIndicator,
} from 'react-native';
import AccountSwitcherService from '../services/AccountSwitcherService';
import { ZaloAccount } from '../services/AccountIsolationService';

interface QuickSwitchButtonProps {
  onPress?: () => void;
  onAccountChange?: (account: ZaloAccount) => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const QuickSwitchButton: React.FC<QuickSwitchButtonProps> = ({
  onPress,
  onAccountChange,
  position = 'bottom-right',
}) => {
  const [activeAccount, setActiveAccount] = useState<ZaloAccount | null>(null);
  const [switching, setSwitching] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  React.useEffect(() => {
    loadActiveAccount();
  }, []);

  const loadActiveAccount = async () => {
    try {
      const account = await AccountSwitcherService.getActiveAccount();
      setActiveAccount(account);
    } catch (error) {
      console.error('Failed to load active account:', error);
    }
  };

  const handleQuickSwitch = async () => {
    try {
      setSwitching(true);

      // Animate button press
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const result = await AccountSwitcherService.switchToNextAccount();

      if (result?.success) {
        setActiveAccount(result.toAccount);
        onAccountChange?.(result.toAccount);
      }
    } catch (error) {
      console.error('Quick switch failed:', error);
    } finally {
      setSwitching(false);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      handleQuickSwitch();
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getPositionStyle = () => {
    const base = { position: 'absolute' as const };
    switch (position) {
      case 'bottom-right':
        return { ...base, bottom: 20, right: 20 };
      case 'bottom-left':
        return { ...base, bottom: 20, left: 20 };
      case 'top-right':
        return { ...base, top: 20, right: 20 };
      case 'top-left':
        return { ...base, top: 20, left: 20 };
      default:
        return { ...base, bottom: 20, right: 20 };
    }
  };

  if (!activeAccount) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyle(),
        { transform: [{ scale: scaleAnim }] },
      ]}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        disabled={switching}
        activeOpacity={0.8}>
        {switching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
          </View>
        ) : (
          <>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {activeAccount.avatar ? (
                <Image
                  source={{ uri: activeAccount.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitials}>
                    {getInitials(activeAccount.displayName)}
                  </Text>
                </View>
              )}
            </View>

            {/* Switch Icon */}
            <View style={styles.switchIcon}>
              <Text style={styles.switchIconText}>⇄</Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 999,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#0084FF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00C851',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  switchIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
