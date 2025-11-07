import { getAllUsers } from '@/apis/auth.api';
import { getAllFriends, removeFriend, type FriendRequest } from '@/apis/friend.api';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
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

interface FriendUser {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
}

const QUERY_KEYS = {
  allUsers: ['allUsers'] as const,
  friends: ['friends'] as const,
};

export default function AllFriends() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState<Set<number>>(new Set());

  // Fetch all users
  const { data: usersRes } = useQuery({
    queryKey: QUERY_KEYS.allUsers,
    queryFn: async () => {
      const res = await getAllUsers();
      return res;
    },
  });

  // Fetch friends (returns FriendRequest[] with requesterId and receiverId)
  const { data: friendsRes, isLoading: loadingFriends } = useQuery({
    queryKey: QUERY_KEYS.friends,
    queryFn: async () => {
      const res = await getAllFriends();
      return res;
    },
  });

  // Get sent requests to determine current user ID
  const { data: sentRes } = useQuery({
    queryKey: ['sentRequests'],
    queryFn: async () => {
      try {
        const { getSentRequests } = await import('@/apis/friend.api');
        return await getSentRequests();
      } catch (error) {
        return { success: true, data: [] };
      }
    },
  });

  // Get received requests as fallback to determine current user ID
  const { data: receivedRes } = useQuery({
    queryKey: ['receivedRequests'],
    queryFn: async () => {
      try {
        const { getReceivedRequests } = await import('@/apis/friend.api');
        return await getReceivedRequests();
      } catch (error) {
        return { success: true, data: [] };
      }
    },
  });

  // Determine current user ID from sent/received requests or from friends data
  const currentUserId = useMemo(() => {
    // Try from sent requests
    if (sentRes?.success && sentRes.data && sentRes.data.length > 0) {
      return Number(sentRes.data[0].requesterId);
    }
    // Try from received requests
    if (receivedRes?.success && receivedRes.data && receivedRes.data.length > 0) {
      return Number(receivedRes.data[0].receiverId);
    }
    // Try from friends data
    if (friendsRes?.success && friendsRes.data && friendsRes.data.length > 0) {
      const firstFriend = friendsRes.data[0];
      // We need to determine which one is current user
      // Since we don't know, we'll use the first requesterId as fallback
      return Number(firstFriend.requesterId);
    }
    return null;
  }, [sentRes, receivedRes, friendsRes]);

  // Process friends: map FriendRequest[] to FriendUser[]
  const friends = useMemo(() => {
    if (!friendsRes?.success || !friendsRes.data || !usersRes?.success || !usersRes.data || !currentUserId) {
      return [];
    }

    const friendIds = new Set<number>();
    const friendRequests = friendsRes.data;

    // Extract friend IDs from FriendRequest[]
    friendRequests.forEach((friend: FriendRequest) => {
      const requesterId = Number(friend.requesterId);
      const receiverId = Number(friend.receiverId);

      if (requesterId === currentUserId) {
        friendIds.add(receiverId);
      } else if (receiverId === currentUserId) {
        friendIds.add(requesterId);
      }
    });

    // Map friend IDs to User objects
    const friendUsers: FriendUser[] = [];
    friendIds.forEach((friendId) => {
      const user = usersRes.data.find((u) => Number(u.id) === friendId);
      if (user) {
        friendUsers.push({
          id: Number(user.id),
          username: user.username || '',
          displayName: user.displayName || user.fullName || user.username || '',
          avatarUrl: user.avatarUrl || '',
          bio: user.bio,
        });
      }
    });

    return friendUsers;
  }, [friendsRes, usersRes, currentUserId]);

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friends });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allUsers });
    }, [queryClient])
  );

  // Remove friend mutation
  const removeFriendMutation = useMutation({
    mutationFn: async (userId: number) => {
      if (!userId || userId === undefined || isNaN(userId)) {
        throw new Error('ID người dùng không hợp lệ');
      }
      const res = await removeFriend(userId);
      if (!res.success) {
        throw new Error(res.message || 'Không thể xóa bạn bè');
      }
      return res;
    },
    onMutate: (userId) => {
      setProcessing((prev) => new Set(prev).add(userId));
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friends });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allUsers });
      Alert.alert('Thành công', 'Đã xóa bạn bè');
    },
    onError: (error: any) => {
      console.error('Remove friend error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể xóa bạn bè';
      
      // Handle case where user is not a friend (400 error)
      if (error.response?.status === 400) {
        // Still invalidate to refresh the list
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friends });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allUsers });
        
        if (errorMessage.includes('not a friend') || errorMessage.includes('không phải bạn bè') || errorMessage.includes('not found')) {
          Alert.alert('Thông báo', 'Người dùng này không phải bạn bè');
        } else {
          Alert.alert('Lỗi', errorMessage);
        }
      } else {
        Alert.alert('Lỗi', errorMessage);
      }
    },
    onSettled: (_, __, userId) => {
      setProcessing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    },
  });

  const handleRemoveFriend = (userId: number) => {
    if (!userId || userId === undefined || isNaN(userId)) {
      Alert.alert('Lỗi', 'ID người dùng không hợp lệ');
      return;
    }

    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa bạn bè này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => removeFriendMutation.mutate(userId),
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
        {loadingFriends ? (
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
                    {friend.displayName || friend.username || 'Người dùng'}
                  </Text>
                  <Text className="text-gray-600 text-xs">@{friend.username || 'unknown'}</Text>
                  {friend.bio && (
                    <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
                      {friend.bio}
                    </Text>
                  )}
                </View>
                <View className="flex-row items-center gap-2">
                  {processing.has(friend.id) ? (
                    <ActivityIndicator size="small" color="#0095f6" />
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleRemoveFriend(friend.id)}
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

