import { getAllFriends, removeFriend, type User } from '@/apis/friend.api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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

export default function AllFriends() {
  const router = useRouter();
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Set<number>>(new Set());

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const res = await getAllFriends();
      if (res.success && res.data) {
        setFriends(res.data);
      } else {
        setFriends([]);
      }
    } catch (error: any) {
      console.error('Fetch friends error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách bạn bè');
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch friends when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFriends();
    }, [])
  );

  const handleRemoveFriend = async (userId: number) => {
    if (!userId || userId === undefined || isNaN(userId)) {
      Alert.alert('Lỗi', 'ID người dùng không hợp lệ');
      return;
    }

    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa bạn bè này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            setProcessing((prev) => new Set(prev).add(userId));
            const res = await removeFriend(userId);
            if (res.success) {
              setFriends((prev) => prev.filter((friend) => friend.id !== userId));
              Alert.alert('Thành công', 'Đã xóa bạn bè');
            } else {
              // Handle case where user is not a friend
              const errorMessage = res.message || 'Không thể xóa bạn bè';
              if (errorMessage.includes('not a friend') || errorMessage.includes('không phải bạn bè')) {
                // Remove from list anyway if user is not a friend
                setFriends((prev) => prev.filter((friend) => friend.id !== userId));
                Alert.alert('Thông báo', 'Người dùng này không phải bạn bè');
              } else {
                Alert.alert('Lỗi', errorMessage);
              }
            }
          } catch (error: any) {
            console.error('Remove friend error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Không thể xóa bạn bè';
            
            // Handle case where user is not a friend (400 error)
            if (error.response?.status === 400 && (errorMessage.includes('not a friend') || errorMessage.includes('không phải bạn bè'))) {
              // Remove from list anyway if user is not a friend
              setFriends((prev) => prev.filter((friend) => friend.id !== userId));
              Alert.alert('Thông báo', 'Người dùng này không phải bạn bè');
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
        <Text className="text-black font-semibold text-lg flex-1">Tất cả bạn bè</Text>
        <Text className="text-gray-600 text-sm">{friends.length} bạn bè</Text>
      </View>

      {/* Friends List */}
      <ScrollView className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#0095f6" />
            <Text className="text-gray-600 mt-4">Đang tải...</Text>
          </View>
        ) : friends.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="people-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-600 mt-4 text-center">
              Bạn chưa có bạn bè nào
            </Text>
          </View>
        ) : (
          <View className="px-4 py-2">
            {friends.map((friend, index) => (
              <View
                key={friend.id || `friend-${index}`}
                className="flex-row items-center py-3 border-b border-gray-100"
              >
                <Image
                  source={{
                    uri: friend.avatarUrl || 'https://i.pravatar.cc/150?img=1',
                  }}
                  className="w-12 h-12 rounded-full mr-3"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <Text className="text-black font-semibold text-sm">
                    {friend.displayName || friend.username}
                  </Text>
                  <Text className="text-gray-600 text-xs">@{friend.username}</Text>
                  {friend.bio && (
                    <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
                      {friend.bio}
                    </Text>
                  )}
                </View>
                <View className="flex-row items-center gap-2">
                  {processing.has(friend.id!) ? (
                    <ActivityIndicator size="small" color="#0095f6" />
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleRemoveFriend(friend.id!)}
                      className="px-4 py-2 rounded-lg bg-gray-200"
                    >
                      <Text className="text-black font-semibold text-sm">Xóa</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

