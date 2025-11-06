import {
  acceptFriendRequest,
  getReceivedRequests,
  getSentRequests,
  rejectFriendRequest,
  searchFriends,
  type FriendRequest,
  type User,
} from '@/apis/friend.api';
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

type TabType = 'received' | 'sent';

export default function FriendRequests() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('received');
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [userMap, setUserMap] = useState<Map<number, User>>(new Map());
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let requests: FriendRequest[] = [];
      
      if (activeTab === 'received') {
        const res = await getReceivedRequests();
        if (res.success && res.data) {
          requests = res.data;
          setReceivedRequests(requests);
        }
      } else {
        const res = await getSentRequests();
        if (res.success && res.data) {
          requests = res.data;
          setSentRequests(requests);
        }
      }

      // Fetch user info for all unique user IDs
      const userIds = new Set<number>();
      requests.forEach((req) => {
        if (activeTab === 'received') {
          userIds.add(req.requesterId);
        } else {
          userIds.add(req.receiverId);
        }
      });

      // Fetch user info using search API (empty query might return all or we can search by ID)
      // For now, we'll try to fetch user info - if search doesn't support ID, we'll show IDs
      const newUserMap = new Map<number, User>();
      for (const userId of userIds) {
        try {
          // Try to get user info - this might need backend support
          // For now, we'll create a minimal user object
          const searchRes = await searchFriends('');
          if (searchRes.success && searchRes.data) {
            const user = searchRes.data.find((u) => u.id === userId);
            if (user) {
              newUserMap.set(userId, user);
            }
          }
        } catch (error) {
          // If we can't fetch user info, we'll show ID
          console.log('Could not fetch user info for ID:', userId);
        }
      }
      setUserMap(newUserMap);
    } catch (error: any) {
      console.error('Fetch requests error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách lời mời');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requesterId: number) => {
    try {
      setProcessing((prev) => new Set(prev).add(requesterId));
      const res = await acceptFriendRequest(requesterId);
      if (res.success) {
        setReceivedRequests((prev) =>
          prev.filter((req) => req.requesterId !== requesterId)
        );
        Alert.alert('Thành công', 'Đã chấp nhận lời mời kết bạn');
      }
    } catch (error: any) {
      console.error('Accept request error:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể chấp nhận lời mời');
    } finally {
      setProcessing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requesterId);
        return newSet;
      });
    }
  };

  const handleReject = async (requesterId: number) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn từ chối lời mời này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Từ chối',
        style: 'destructive',
        onPress: async () => {
          try {
            setProcessing((prev) => new Set(prev).add(requesterId));
            const res = await rejectFriendRequest(requesterId);
            if (res.success) {
              setReceivedRequests((prev) =>
                prev.filter((req) => req.requesterId !== requesterId)
              );
              Alert.alert('Thành công', 'Đã từ chối lời mời');
            }
          } catch (error: any) {
            console.error('Reject request error:', error);
            Alert.alert('Lỗi', 'Không thể từ chối lời mời');
          } finally {
            setProcessing((prev) => {
              const newSet = new Set(prev);
              newSet.delete(requesterId);
              return newSet;
            });
          }
        },
      },
    ]);
  };

  const requests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text className="text-black font-semibold text-lg flex-1">Lời mời kết bạn</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-200">
        <TouchableOpacity
          className={`flex-1 items-center py-3 border-b-2 ${
            activeTab === 'received' ? 'border-black' : 'border-transparent'
          }`}
          onPress={() => setActiveTab('received')}
        >
          <Text
            className={`font-semibold ${
              activeTab === 'received' ? 'text-black' : 'text-gray-500'
            }`}
          >
            Đã nhận ({receivedRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 items-center py-3 border-b-2 ${
            activeTab === 'sent' ? 'border-black' : 'border-transparent'
          }`}
          onPress={() => setActiveTab('sent')}
        >
          <Text
            className={`font-semibold ${
              activeTab === 'sent' ? 'text-black' : 'text-gray-500'
            }`}
          >
            Đã gửi ({sentRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#0095f6" />
            <Text className="text-gray-600 mt-4">Đang tải...</Text>
          </View>
        ) : requests.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="person-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-600 mt-4 text-center">
              {activeTab === 'received'
                ? 'Không có lời mời nào'
                : 'Bạn chưa gửi lời mời nào'}
            </Text>
          </View>
        ) : (
          <View className="px-4 py-2">
            {requests.map((request, index) => {
              const userId = activeTab === 'received' ? request.requesterId : request.receiverId;
              const user = userMap.get(userId);
              const isProcessing = processing.has(userId);

              return (
                <View
                  key={`${userId}-${index}`}
                  className="flex-row items-center py-3 border-b border-gray-100"
                >
                  <Image
                    source={{
                      uri: user?.avatarUrl || 'https://i.pravatar.cc/150?img=1',
                    }}
                    className="w-12 h-12 rounded-full mr-3"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text className="text-black font-semibold text-sm">
                      {user?.displayName || user?.username || `User ${userId}`}
                    </Text>
                    <Text className="text-gray-600 text-xs">
                      {user?.username ? `@${user.username}` : `ID: ${userId}`}
                    </Text>
                    {user?.bio && (
                      <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
                        {user.bio}
                      </Text>
                    )}
                  </View>
                  {activeTab === 'received' && (
                    <View className="flex-row gap-2">
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#0095f6" />
                      ) : (
                        <>
                          <TouchableOpacity
                            onPress={() => handleReject(userId)}
                            className="px-4 py-2 rounded-lg bg-gray-200"
                          >
                            <Text className="text-black font-semibold text-sm">Từ chối</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleAccept(userId)}
                            className="px-4 py-2 rounded-lg bg-[#0095f6]"
                          >
                            <Text className="text-white font-semibold text-sm">Chấp nhận</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  )}
                  {activeTab === 'sent' && (
                    <View className="px-4 py-2 rounded-lg bg-gray-200">
                      <Text className="text-gray-600 font-semibold text-sm">Đang chờ</Text>
                    </View>
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

