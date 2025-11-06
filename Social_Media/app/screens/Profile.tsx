import { getProfile, type ProfileData } from '@/apis/profile.api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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

export default function Profile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved' | 'tagged'>('posts');
  const [hasPosts, setHasPosts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
      }
    } catch (error: any) {
      console.error('Fetch profile error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    router.push('/screens/EditProfile');
  };

  // Refetch profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
          router.replace('/Login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0095f6" />
          <Text className="text-black mt-4">Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = profile
    ? [
        { label: 'posts', value: profile.postsCount.toString() },
        { label: 'followers', value: profile.followersCount.toString() },
        { label: 'following', value: profile.followingCount.toString() },
      ]
    : [
        { label: 'posts', value: '0' },
        { label: 'followers', value: '0' },
        { label: 'following', value: '0' },
      ];

  const posts = hasPosts
    ? Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        image: `https://picsum.photos/200/200?random=${i + 1}`,
      }))
    : [];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity className="flex-row items-center gap-2">
          <Text className="text-black font-semibold text-lg">
            {profile?.displayName || 'Username'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#000000" />
        </TouchableOpacity>
        <View className="flex-row gap-5">
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="paper-plane-outline" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Section */}
        <View className="px-4 py-4">
          <View className="flex-row items-start gap-4 mb-4">
            {/* Profile Picture */}
            <View className="items-center">
              {profile?.avatarUrl ? (
                <Image
                  source={{ uri: profile.avatarUrl }}
                  className="w-24 h-24 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-gray-200 border-2 border-gray-300 items-center justify-center">
                  <Ionicons name="person" size={48} color="#9ca3af" />
                </View>
              )}
            </View>

            {/* Stats and Info */}
            <View className="flex-1">
              {/* Username */}
              <Text className="text-black font-semibold text-lg mb-4">
                {profile?.displayName || 'Username'}
              </Text>

              {/* Stats */}
              <View className="flex-row justify-around mb-4">
                {stats.map((stat) => (
                  <View key={stat.label} className="items-center">
                    <Text className="text-black font-semibold text-base">
                      {stat.value}
                    </Text>
                    <Text className="text-gray-600 text-xs uppercase">
                      {stat.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Bio and Info */}
          {profile && (
            <View className="mb-4">
              {profile.displayName && (
                <Text className="text-black font-semibold text-sm mb-1">
                  {profile.displayName}
                </Text>
              )}
              {profile.bio && (
                <Text className="text-black text-sm mb-1">{profile.bio}</Text>
              )}
              {profile.website && (
                <Text className="text-[#0095f6] text-sm mb-1">
                  {profile.website}
                </Text>
              )}
              {profile.location && (
                <Text className="text-gray-600 text-sm">{profile.location}</Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity
              className="flex-1 py-2.5 rounded-lg bg-gray-100 border border-gray-300"
              onPress={handleEditProfile}
            >
              <Text className="text-black text-center font-semibold text-sm">
                Edit profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 py-2.5 rounded-lg bg-gray-100 border border-gray-300">
              <Text className="text-black text-center font-semibold text-sm">
                View archive
              </Text>
            </TouchableOpacity>
          </View>

          {/* Friends & Block Actions */}
          <View className="flex-row gap-2 mb-2">
            <TouchableOpacity
              className="flex-1 py-2.5 rounded-lg bg-gray-100 border border-gray-300"
              onPress={() => router.push('/screens/SearchFriends')}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Ionicons name="search" size={16} color="#000000" />
                <Text className="text-black text-center font-semibold text-sm">
                  Tìm bạn
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-2.5 rounded-lg bg-gray-100 border border-gray-300"
              onPress={() => router.push('/screens/FriendRequests')}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Ionicons name="person-add" size={16} color="#000000" />
                <Text className="text-black text-center font-semibold text-sm">
                  Lời mời
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity
              className="flex-1 py-2.5 rounded-lg bg-gray-100 border border-gray-300"
              onPress={() => router.push('/screens/AllFriends')}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Ionicons name="people" size={16} color="#000000" />
                <Text className="text-black text-center font-semibold text-sm">
                  Tất cả bạn bè
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-2.5 rounded-lg bg-gray-100 border border-gray-300"
              onPress={() => router.push('/screens/BlockedUsers')}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Ionicons name="ban" size={16} color="#000000" />
                <Text className="text-black text-center font-semibold text-sm">
                  Đã chặn
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Content Tabs */}
          <View className="flex-row border-t border-gray-200 mt-2">
            <TouchableOpacity
              className={`flex-1 items-center py-3 border-t-2 ${
                activeTab === 'posts'
                  ? 'border-black'
                  : 'border-transparent'
              }`}
              onPress={() => setActiveTab('posts')}
            >
              <Ionicons
                name={activeTab === 'posts' ? 'grid' : 'grid-outline'}
                size={24}
                color={activeTab === 'posts' ? '#000000' : '#8e8e8e'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 items-center py-3 border-t-2 ${
                activeTab === 'reels'
                  ? 'border-black'
                  : 'border-transparent'
              }`}
              onPress={() => setActiveTab('reels')}
            >
              <Ionicons
                name={activeTab === 'reels' ? 'tv' : 'tv-outline'}
                size={24}
                color={activeTab === 'reels' ? '#000000' : '#8e8e8e'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 items-center py-3 border-t-2 ${
                activeTab === 'saved'
                  ? 'border-black'
                  : 'border-transparent'
              }`}
              onPress={() => setActiveTab('saved')}
            >
              <Ionicons
                name={activeTab === 'saved' ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={activeTab === 'saved' ? '#000000' : '#8e8e8e'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 items-center py-3 border-t-2 ${
                activeTab === 'tagged'
                  ? 'border-black'
                  : 'border-transparent'
              }`}
              onPress={() => setActiveTab('tagged')}
            >
              <Ionicons
                name={activeTab === 'tagged' ? 'person' : 'person-outline'}
                size={24}
                color={activeTab === 'tagged' ? '#000000' : '#8e8e8e'}
              />
            </TouchableOpacity>
          </View>

          {/* Content Area */}
          {hasPosts && posts.length > 0 ? (
            <View className="flex-row flex-wrap mt-2">
              {posts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  className="w-1/3 aspect-square p-0.5"
                >
                  <Image
                    source={{ uri: post.image }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center justify-center py-20">
              <View className="w-24 h-24 border-2 border-gray-300 rounded-full items-center justify-center mb-6">
                <Ionicons name="camera-outline" size={48} color="#9ca3af" />
              </View>
              <Text className="text-black font-bold text-xl mb-2">
                Share Photos
              </Text>
              <Text className="text-gray-600 text-sm text-center mb-6 px-8">
                When you share photos, they will appear on your profile.
              </Text>
              <TouchableOpacity
                className="bg-[#0095f6] px-6 py-3 rounded-lg"
                onPress={() => setHasPosts(true)}
              >
                <Text className="text-white font-semibold text-sm">
                  Share your first photo
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Logout Button - Hidden in menu */}
          <TouchableOpacity
            className="mt-6 mb-8 py-3 rounded-lg bg-red-600"
            onPress={handleLogout}
          >
            <Text className="text-white text-center font-semibold">
              Đăng xuất
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
