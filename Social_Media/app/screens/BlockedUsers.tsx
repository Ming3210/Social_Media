import { getBlockedUsers, unblockUser, type BlockedUser } from '@/apis/block.api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BlockedUsers() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);
      const res = await getBlockedUsers();
      if (res.success && res.data) {
        setBlockedUsers(res.data);
      }
    } catch (error: any) {
      console.error('Fetch blocked users error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người bị chặn');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId: number) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn bỏ chặn người dùng này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Bỏ chặn',
        onPress: async () => {
          try {
            setProcessing((prev) => new Set(prev).add(userId));
            const res = await unblockUser(userId);
            if (res.success) {
              setBlockedUsers((prev) => prev.filter((user) => user.blockedUserId !== userId));
              Alert.alert('Thành công', 'Đã bỏ chặn người dùng');
            } else {
              // Handle case where user is not blocked
              const errorMessage = res.message || 'Người dùng này không bị chặn';
              if (errorMessage.includes('not blocked') || errorMessage.includes('không bị chặn')) {
                // Remove from list anyway if user is not blocked
                setBlockedUsers((prev) => prev.filter((user) => user.blockedUserId !== userId));
                Alert.alert('Thông báo', 'Người dùng này không bị chặn');
              } else {
                Alert.alert('Lỗi', errorMessage);
              }
            }
          } catch (error: any) {
            console.error('Unblock user error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Không thể bỏ chặn người dùng';
            
            // Handle case where user is not blocked (400 error)
            if (error.response?.status === 400 && (errorMessage.includes('not blocked') || errorMessage.includes('không bị chặn'))) {
              // Remove from list anyway if user is not blocked
              setBlockedUsers((prev) => prev.filter((user) => user.blockedUserId !== userId));
              Alert.alert('Thông báo', 'Người dùng này không bị chặn');
            } else {
              Alert.alert('Lỗi', errorMessage);
            }
          } finally {
            setProcessing((prev) => {
              const newSet = new Set(prev);
              newSet.delete(userId);
              return newSet;
            });
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text className="text-black font-semibold text-lg flex-1">Người dùng bị chặn</Text>
      </View>

      {/* List */}
      <ScrollView className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#0095f6" />
            <Text className="text-gray-600 mt-4">Đang tải...</Text>
          </View>
        ) : blockedUsers.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="ban-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-600 mt-4 text-center">
              Bạn chưa chặn người dùng nào
            </Text>
          </View>
        ) : (
          <View className="px-4 py-2">
            {blockedUsers.map((blockedUser, index) => {
              const userId = blockedUser.blockedUserId;
              const isProcessing = processing.has(userId);

              return (
                <View
                  key={`${userId}-${index}`}
                  className="flex-row items-center py-3 border-b border-gray-100"
                >
                  <Image
                    source={{
                      uri: 'https://i.pravatar.cc/150?img=1',
                    }}
                    className="w-12 h-12 rounded-full mr-3"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text className="text-black font-semibold text-sm">
                      {blockedUser.blockedUsername || `User ${userId}`}
                    </Text>
                    <Text className="text-gray-600 text-xs">
                      {blockedUser.blockedUsername ? `@${blockedUser.blockedUsername}` : `ID: ${userId}`}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      Chặn lúc: {new Date(blockedUser.blockedAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#0095f6" />
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleUnblock(userId)}
                      className="px-4 py-2 rounded-lg bg-[#0095f6]"
                    >
                      <Text className="text-white font-semibold text-sm">Bỏ chặn</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

