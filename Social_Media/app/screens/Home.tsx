import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const handleLike = (postId: number) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Stories data
  const stories = [
    { id: 'your_story', username: 'Your Story', avatar: 'https://i.pravatar.cc/150?img=1', isLive: false },
    { id: 'karennne', username: 'karennne', avatar: 'https://i.pravatar.cc/150?img=2', isLive: true },
    { id: 'zackjohn', username: 'zackjohn', avatar: 'https://i.pravatar.cc/150?img=3', isLive: false },
    { id: 'kieron_d', username: 'kieron_d', avatar: 'https://i.pravatar.cc/150?img=4', isLive: false },
    { id: 'craig', username: 'craig_', avatar: 'https://i.pravatar.cc/150?img=5', isLive: false },
  ];

  const posts = [
    {
      id: 1,
      username: 'joshua_l',
      avatar: 'https://i.pravatar.cc/150?img=6',
      image: 'https://picsum.photos/400/400?random=1',
      images: [
        'https://picsum.photos/400/400?random=1',
        'https://picsum.photos/400/400?random=2',
        'https://picsum.photos/400/400?random=3',
      ],
      likes: 44686,
      likedBy: 'craig_love',
      location: 'Tokyo, Japan',
      caption: 'The game in Japan was amazing and I want to share some photos.',
      time: '2 giờ trước',
      verified: true,
    },
    {
      id: 2,
      username: 'username_2',
      avatar: 'https://i.pravatar.cc/150?img=2',
      image: 'https://picsum.photos/400/400?random=4',
      images: ['https://picsum.photos/400/400?random=4'],
      likes: 5678,
      likedBy: 'user1',
      location: null,
      caption: 'Chia sẻ khoảnh khắc đẹp của ngày hôm nay! ✨',
      time: '5 giờ trước',
      verified: false,
    },
    {
      id: 3,
      username: 'username_3',
      avatar: 'https://i.pravatar.cc/150?img=3',
      image: 'https://picsum.photos/400/400?random=5',
      images: ['https://picsum.photos/400/400?random=5'],
      likes: 9876,
      likedBy: 'user2',
      location: null,
      caption: 'Cuộc sống là những khoảnh khắc đáng nhớ! 📸',
      time: '1 ngày trước',
      verified: false,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity>
          <Ionicons name="camera-outline" size={24} color="#000000" />
        </TouchableOpacity>
        <Text className="text-2xl font-light tracking-wide text-black" style={{ fontFamily: 'Instagram' }}>
          Instagram
        </Text>
        <View className="flex-row gap-4">
          <TouchableOpacity className="relative">
            <Ionicons name="heart-outline" size={24} color="#000000" />
            <View className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="paper-plane-outline" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000000" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stories Section */}
        <View className="border-b border-gray-200 pb-3 bg-white">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12, gap: 16 }}
          >
            {stories.map((story) => (
              <TouchableOpacity key={story.id} className="items-center mr-2">
                <View className="relative">
                  <View className="w-16 h-16 rounded-full border-2 border-gray-300 p-0.5">
                    <Image
                      source={{ uri: story.avatar }}
                      className="w-full h-full rounded-full"
                      resizeMode="cover"
                    />
                  </View>
                  {story.isLive && (
                    <View className="absolute -bottom-1 left-0 right-0 bg-red-500 rounded px-1.5 py-0.5">
                      <Text className="text-white text-[8px] font-bold text-center">LIVE</Text>
                    </View>
                  )}
                  {story.id === 'your_story' && (
                    <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0095f6] rounded-full border-2 border-white items-center justify-center">
                      <Ionicons name="add" size={12} color="#ffffff" />
                    </View>
                  )}
                </View>
                <Text className="text-black text-xs mt-1" style={{ maxWidth: 70 }}>
                  {story.username}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Posts */}
        {posts.map((post) => (
          <View key={post.id} className="mb-6 border-b border-gray-200 pb-4 bg-white">
            {/* Post Header */}
            <View className="flex-row justify-between items-center px-4 py-3">
              <View className="flex-row items-center gap-3">
                <Image
                  source={{ uri: post.avatar }}
                  className="w-8 h-8 rounded-full"
                />
                <View>
                  <View className="flex-row items-center gap-1">
                    <Text className="text-black font-semibold text-sm">
                      {post.username}
                    </Text>
                    {post.verified && (
                      <Ionicons name="checkmark-circle" size={14} color="#0095f6" />
                    )}
                  </View>
                  {post.location && (
                    <Text className="text-gray-600 text-xs">{post.location}</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color="#000000" />
              </TouchableOpacity>
            </View>

            {/* Post Image */}
            <View className="w-full bg-gray-100 relative">
              <Image
                source={{ uri: post.images[0] }}
                className="w-full aspect-square"
                resizeMode="cover"
              />
              {post.images.length > 1 && (
                <View className="absolute top-2 right-2 bg-black/70 rounded px-2 py-1">
                  <Text className="text-white text-xs font-semibold">
                    {1}/{post.images.length}
                  </Text>
                </View>
              )}
            </View>

            {/* Post Actions */}
            <View className="flex-row justify-between items-center px-4 py-3">
              <View className="flex-row gap-4">
                <TouchableOpacity onPress={() => handleLike(post.id)}>
                  <Ionicons
                    name={likedPosts.has(post.id) ? 'heart' : 'heart-outline'}
                    size={24}
                    color={likedPosts.has(post.id) ? '#ef4444' : '#000000'}
                  />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="chatbubble-outline" size={24} color="#000000" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="paper-plane-outline" size={24} color="#000000" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity>
                <Ionicons name="bookmark-outline" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            {/* Post Content */}
            <View className="px-4">
              <Text className="text-black font-semibold text-sm mb-2">
                Liked by <Text className="font-semibold">{post.likedBy}</Text> and{' '}
                <Text className="font-semibold">{post.likes.toLocaleString()} others</Text>
              </Text>
              <View className="flex-row flex-wrap mb-2">
                <Text className="text-black font-semibold text-sm mr-2">
                  {post.username}
                </Text>
                <Text className="text-black text-sm flex-1">{post.caption}</Text>
              </View>
              <Text className="text-gray-500 text-xs mt-1">
                {post.time}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
