import { getAllUsers } from '@/apis/auth.api';
import { blockUser } from '@/apis/block.api';
import {
  cancelFriendRequest,
  getAllFriends,
  getReceivedRequests,
  getSentRequests,
  removeFriend,
  sendFriendRequest,
  type User,
} from '@/apis/friend.api';
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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Query keys
const QUERY_KEYS = {
  allUsers: ['allUsers'] as const,
  sentRequests: ['sentRequests'] as const,
  receivedRequests: ['receivedRequests'] as const,
  friends: ['friends'] as const,
};

export default function SearchFriends() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [processingUserIds, setProcessingUserIds] = useState<Set<number>>(new Set());

  // Fetch all data using useQuery
  const { data: usersRes, isLoading: loadingUsers } = useQuery({
    queryKey: QUERY_KEYS.allUsers,
    queryFn: async () => {
      const res = await getAllUsers();
      return res;
    },
  });

  const { data: sentRes } = useQuery({
    queryKey: QUERY_KEYS.sentRequests,
    queryFn: async () => {
      try {
        return await getSentRequests();
      } catch (error) {
        console.error('Get sent requests error:', error);
        return { success: true, data: [] };
      }
    },
  });

  const { data: receivedRes } = useQuery({
    queryKey: QUERY_KEYS.receivedRequests,
    queryFn: async () => {
      try {
        return await getReceivedRequests();
      } catch (error) {
        console.error('Get received requests error:', error);
        return { success: true, data: [] };
      }
    },
  });

  const { data: friendsRes } = useQuery({
    queryKey: QUERY_KEYS.friends,
    queryFn: async () => {
      try {
        return await getAllFriends();
      } catch (error) {
        console.error('Get all friends error:', error);
        return { success: true, data: [] };
      }
    },
  });

  // Process and combine data
  const allUsers = useMemo(() => {
    if (!usersRes?.success || !usersRes.data) return [];

    const sentRequestIds = new Set(
      sentRes?.success && sentRes.data
        ? sentRes.data.map((req) => Number(req.receiverId))
        : []
    );
    const receivedRequestIds = new Set(
      receivedRes?.success && receivedRes.data
        ? receivedRes.data.map((req) => Number(req.requesterId))
        : []
    );

    // Determine current user ID from sent/received requests
    let currentUserId: number | null = null;
    if (sentRes?.success && sentRes.data && sentRes.data.length > 0) {
      currentUserId = Number(sentRes.data[0].requesterId);
    } else if (receivedRes?.success && receivedRes.data && receivedRes.data.length > 0) {
      currentUserId = Number(receivedRes.data[0].receiverId);
    }
    
    // Nếu vẫn chưa có currentUserId, thử lấy từ friends data
    // Tìm user ID xuất hiện nhiều nhất trong friends data (có thể là current user)
    if (currentUserId === null && friendsRes?.success && friendsRes.data && friendsRes.data.length > 0) {
      const userIdCounts = new Map<number, number>();
      friendsRes.data.forEach((friend: any) => {
        const requesterId = Number(friend.requesterId);
        const receiverId = Number(friend.receiverId);
        
        userIdCounts.set(requesterId, (userIdCounts.get(requesterId) || 0) + 1);
        userIdCounts.set(receiverId, (userIdCounts.get(receiverId) || 0) + 1);
      });
      
      // Tìm user ID xuất hiện nhiều nhất (có thể là current user)
      let maxCount = 0;
      let mostFrequentUserId: number | null = null;
      userIdCounts.forEach((count, userId) => {
        if (count > maxCount) {
          maxCount = count;
          mostFrequentUserId = userId;
        }
      });
      
      if (mostFrequentUserId !== null) {
        currentUserId = mostFrequentUserId;
      }
    }

    // Process friends data - friendsRes.data is FriendRequest[] with requesterId and receiverId
    const friendIds = new Set<number>();
    if (friendsRes?.success && friendsRes.data && currentUserId !== null) {
      friendsRes.data.forEach((friend: any) => {
        const requesterId = Number(friend.requesterId);
        const receiverId = Number(friend.receiverId);
        
        // If current user is requester, receiver is friend
        if (requesterId === currentUserId) {
          friendIds.add(receiverId);
        }
        // If current user is receiver, requester is friend
        else if (receiverId === currentUserId) {
          friendIds.add(requesterId);
        }
      });
    }

    // Debug log
    if (friendsRes?.success && friendsRes.data) {
      console.log('Friends data:', friendsRes.data);
      console.log('Current user ID:', currentUserId);
      console.log('Friend IDs:', Array.from(friendIds));
    }

    return usersRes.data.map((user) => {
      const userId = Number(user.id);
      const isFriend = friendIds.has(userId);
      
      // Debug log for specific user
      if (isFriend) {
        console.log(`User ${userId} is a friend`);
      }
      
      return {
        ...user,
        id: userId,
        _isRequestSent: sentRequestIds.has(userId),
        _isRequestReceived: receivedRequestIds.has(userId),
        _isFriend: isFriend,
      };
    });
  }, [usersRes, sentRes, receivedRes, friendsRes]);

  // Filter users based on search query
  const users = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    return allUsers
      .filter((user) => {
        const username = user.username?.toLowerCase() || '';
        const displayName = user.displayName?.toLowerCase() || '';
        const fullName = user.fullName?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';

        return (
          username.includes(query) ||
          displayName.includes(query) ||
          fullName.includes(query) ||
          email.includes(query)
        );
      })
      .map((user) => {
        const isFriend = (user as any)._isFriend || false;
        const isRequestSent = (user as any)._isRequestSent || false;
        const isRequestReceived = (user as any)._isRequestReceived || false;
        
        // Debug log
        if (isFriend) {
          console.log(`Filtered user ${user.id} is a friend`);
        }
        
        return {
          id: user.id,
          username: user.username || '',
          displayName: user.displayName || user.fullName || user.username || '',
          avatarUrl: user.avatarUrl || '',
          bio: user.bio,
          isFriend,
          isRequestSent,
          isRequestReceived,
        };
      });
  }, [searchQuery, allUsers]);

  // Mutations
  const sendRequestMutation = useMutation({
    mutationFn: async (userId: number) => {
      if (!userId || userId === undefined || isNaN(userId)) {
        throw new Error('ID người dùng không hợp lệ');
      }
      return await sendFriendRequest(userId);
    },
    onMutate: async (userId) => {
      setProcessingUserIds((prev) => new Set(prev).add(userId));
      
      // Optimistic update: Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.sentRequests });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.receivedRequests });
      
      // Snapshot the previous value
      const previousSentRequests = queryClient.getQueryData(QUERY_KEYS.sentRequests);
      const previousReceivedRequests = queryClient.getQueryData(QUERY_KEYS.receivedRequests);
      
      // Get current user ID from sent requests or received requests
      let currentUserId: number | null = null;
      const sentData = previousSentRequests as any;
      const receivedData = previousReceivedRequests as any;
      
      if (sentData?.success && sentData.data && sentData.data.length > 0) {
        currentUserId = Number(sentData.data[0].requesterId);
      } else if (receivedData?.success && receivedData.data && receivedData.data.length > 0) {
        currentUserId = Number(receivedData.data[0].receiverId);
      }
      
      if (!currentUserId) {
        // If we can't determine current user ID, just return without optimistic update
        return { previousSentRequests, previousReceivedRequests };
      }
      
      // Optimistically update the cache
      queryClient.setQueryData(QUERY_KEYS.sentRequests, (old: any) => {
        if (!old?.success) return old;
        
        const oldData = old.data || [];
        
        // Check if request already exists
        const exists = oldData.some((req: any) => Number(req.receiverId) === userId);
        if (exists) return old;
        
        // Add new request optimistically
        const newRequest = {
          requesterId: currentUserId,
          receiverId: userId,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        };
        
        return {
          ...old,
          data: [...oldData, newRequest],
        };
      });
      
      return { previousSentRequests, previousReceivedRequests, currentUserId };
    },
    onSuccess: (data) => {
      // Invalidate queries to refetch data and ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sentRequests });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allUsers });
      
      // If status is ACCEPTED (auto-accept when profile is not private), invalidate friends query
      if (data?.data?.status === 'ACCEPTED') {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friends });
        Alert.alert('Thành công', 'Đã kết bạn thành công!');
      } else {
        Alert.alert('Thành công', 'Đã gửi lời mời kết bạn');
      }
    },
    onError: (error: any, userId, context) => {
      console.error('Send request error:', error);
      // Rollback optimistic update
      if (context?.previousSentRequests) {
        queryClient.setQueryData(QUERY_KEYS.sentRequests, context.previousSentRequests);
      }
      if (context?.previousReceivedRequests) {
        queryClient.setQueryData(QUERY_KEYS.receivedRequests, context.previousReceivedRequests);
      }
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể gửi lời mời');
    },
    onSettled: (data, __, userId) => {
      setProcessingUserIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sentRequests });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allUsers });
      
      // If status is ACCEPTED, also invalidate friends query
      if (data?.data?.status === 'ACCEPTED') {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friends });
      }
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: async (userId: number) => {
      if (!userId || userId === undefined || isNaN(userId)) {
        throw new Error('ID người dùng không hợp lệ');
      }
      return await cancelFriendRequest(userId);
    },
    onMutate: async (userId) => {
      setProcessingUserIds((prev) => new Set(prev).add(userId));
      
      // Optimistic update: Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.sentRequests });
      
      // Snapshot the previous value
      const previousSentRequests = queryClient.getQueryData(QUERY_KEYS.sentRequests);
      
      // Optimistically update the cache
      queryClient.setQueryData(QUERY_KEYS.sentRequests, (old: any) => {
        if (!old?.success || !old?.data) return old;
        
        // Remove the request optimistically
        return {
          ...old,
          data: old.data.filter((req: any) => Number(req.receiverId) !== userId),
        };
      });
      
      return { previousSentRequests };
    },
    onSuccess: () => {
      // Invalidate queries to refetch data and ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sentRequests });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allUsers });
      Alert.alert('Thành công', 'Đã hủy lời mời kết bạn');
    },
    onError: (error: any, userId, context) => {
      console.error('Cancel request error:', error);
      // Rollback optimistic update
      if (context?.previousSentRequests) {
        queryClient.setQueryData(QUERY_KEYS.sentRequests, context.previousSentRequests);
      }
      Alert.alert('Lỗi', 'Không thể hủy lời mời');
    },
    onSettled: (_, __, userId) => {
      setProcessingUserIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sentRequests });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allUsers });
    },
  });

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
      setProcessingUserIds((prev) => new Set(prev).add(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friends });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sentRequests });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receivedRequests });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allUsers });
      Alert.alert('Thành công', 'Đã xóa bạn bè');
    },
    onError: (error: any) => {
      console.error('Remove friend error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể xóa bạn bè';
      Alert.alert('Lỗi', errorMessage);
    },
    onSettled: (_, __, userId) => {
      setProcessingUserIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      if (!userId || userId === undefined || isNaN(userId)) {
        throw new Error('ID người dùng không hợp lệ');
      }
      return await blockUser(userId);
    },
    onMutate: (userId) => {
      setProcessingUserIds((prev) => new Set(prev).add(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allUsers });
      Alert.alert('Thành công', 'Đã chặn người dùng');
    },
    onError: (error: any) => {
      console.error('Block user error:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể chặn người dùng');
    },
    onSettled: (_, __, userId) => {
      setProcessingUserIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    },
  });

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Refetch all queries when screen comes into focus
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allUsers });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sentRequests });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receivedRequests });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friends });
      // Force refetch
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.friends });
    }, [queryClient])
  );

  const handleSendRequest = (userId: number) => {
    if (!userId || userId === undefined || isNaN(userId)) {
      Alert.alert('Lỗi', 'ID người dùng không hợp lệ');
      return;
    }
    sendRequestMutation.mutate(userId);
  };

  const handleCancelRequest = (userId: number) => {
    if (!userId || userId === undefined || isNaN(userId)) {
      Alert.alert('Lỗi', 'ID người dùng không hợp lệ');
      return;
    }
    cancelRequestMutation.mutate(userId);
  };

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

  const handleBlockUser = (userId: number) => {
    if (!userId || userId === undefined || isNaN(userId)) {
      Alert.alert('Lỗi', 'ID người dùng không hợp lệ');
      return;
    }

    Alert.alert('Xác nhận', 'Bạn có chắc muốn chặn người dùng này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Chặn',
        style: 'destructive',
        onPress: () => blockUserMutation.mutate(userId),
      },
    ]);
  };

  const isProcessing = (userId: number) => {
    return processingUserIds.has(userId);
  };

  const renderUserAction = (user: User) => {
    if (!user.id || user.id === undefined || isNaN(user.id)) {
      return null;
    }

    if (isProcessing(user.id)) {
      return <ActivityIndicator size="small" color="#0095f6" />;
    }

    if (user.isFriend) {
      return (
        <TouchableOpacity
          onPress={() => handleRemoveFriend(user.id!)}
          className="px-4 py-2 rounded-lg bg-gray-200"
        >
          <Text className="text-black font-semibold text-sm">Bạn bè</Text>
        </TouchableOpacity>
      );
    }

    if (user.isRequestSent) {
      return (
        <TouchableOpacity
          onPress={() => handleCancelRequest(user.id!)}
          className="px-4 py-2 rounded-lg bg-gray-200"
        >
          <Text className="text-black font-semibold text-sm">Đã gửi</Text>
        </TouchableOpacity>
      );
    }

    if (user.isRequestReceived) {
      return (
        <View className="px-4 py-2 rounded-lg bg-gray-200">
          <Text className="text-gray-600 font-semibold text-sm">Đã nhận lời mời</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => handleSendRequest(user.id!)}
        className="px-4 py-2 rounded-lg bg-[#0095f6]"
      >
        <Text className="text-white font-semibold text-sm">Thêm bạn</Text>
      </TouchableOpacity>
    );
  };

  const loading = loadingUsers;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text className="text-black font-semibold text-lg flex-1">Tìm kiếm bạn bè</Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-2">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-black"
            placeholder="Tìm kiếm theo tên hoặc username..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      <ScrollView className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#0095f6" />
            <Text className="text-gray-600 mt-4">Đang tìm kiếm...</Text>
          </View>
        ) : users.length === 0 && searchQuery.trim() ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="search-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-600 mt-4 text-center">
              Không tìm thấy người dùng nào
            </Text>
          </View>
        ) : users.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="search-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-600 mt-4 text-center">
              Nhập tên hoặc username để tìm kiếm
            </Text>
          </View>
        ) : (
          <View className="px-4 py-2">
            {users.map((user, index) => (
              <View
                key={user.id || `user-${index}`}
                className="flex-row items-center py-3 border-b border-gray-100"
              >
                <Image
                  source={{
                    uri: user.avatarUrl || 'https://i.pravatar.cc/150?img=1',
                  }}
                  className="w-12 h-12 rounded-full mr-3"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <Text className="text-black font-semibold text-sm">
                    {user.displayName || user.username}
                  </Text>
                  <Text className="text-gray-600 text-xs">@{user.username}</Text>
                  {user.bio && (
                    <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
                      {user.bio}
                    </Text>
                  )}
                </View>
                <View className="flex-row items-center gap-2">
                  {renderUserAction(user)}
                  <TouchableOpacity
                    onPress={() => {
                      if (!user.id || user.id === undefined || isNaN(user.id)) {
                        Alert.alert('Lỗi', 'ID người dùng không hợp lệ');
                        return;
                      }
                      Alert.alert(
                        'Tùy chọn',
                        'Bạn muốn làm gì?',
                        [
                          { text: 'Hủy', style: 'cancel' },
                          {
                            text: 'Chặn',
                            style: 'destructive',
                            onPress: () => handleBlockUser(user.id!),
                          },
                        ]
                      );
                    }}
                    disabled={isProcessing(user.id!) || !user.id || user.id === undefined || isNaN(user.id)}
                    className="p-2"
                  >
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={20}
                      color={isProcessing(user.id) ? '#9ca3af' : '#000000'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
