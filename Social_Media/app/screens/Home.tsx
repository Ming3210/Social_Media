import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
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

  const posts = [
    {
      id: 1,
      username: 'username_1',
      avatar: 'https://i.pravatar.cc/150?img=1',
      image: 'https://picsum.photos/400/400?random=1',
      likes: 1234,
      caption: 'Đây là caption mẫu cho bài viết đầu tiên! 🌟',
      time: '2 giờ trước',
    },
    {
      id: 2,
      username: 'username_2',
      avatar: 'https://i.pravatar.cc/150?img=2',
      image: 'https://picsum.photos/400/400?random=2',
      likes: 5678,
      caption: 'Chia sẻ khoảnh khắc đẹp của ngày hôm nay! ✨',
      time: '5 giờ trước',
    },
    {
      id: 3,
      username: 'username_3',
      avatar: 'https://i.pravatar.cc/150?img=3',
      image: 'https://picsum.photos/400/400?random=3',
      likes: 9876,
      caption: 'Cuộc sống là những khoảnh khắc đáng nhớ! 📸',
      time: '1 ngày trước',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0a141e]" edges={['top']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-[#1f2937]">
        <Text className="text-2xl font-light tracking-wide text-white">
          Instagram
        </Text>
        <View className="flex-row gap-4">
          <TouchableOpacity>
            <Ionicons name="heart-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="chatbubble-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />
        }
      >
        {posts.map((post) => (
          <View key={post.id} className="mb-6 border-b border-[#1f2937] pb-4">
            {/* Post Header */}
            <View className="flex-row justify-between items-center px-4 py-3">
              <View className="flex-row items-center gap-3">
                <Image
                  source={{ uri: post.avatar }}
                  className="w-8 h-8 rounded-full"
                />
                <Text className="text-white font-semibold text-sm">
                  {post.username}
                </Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Post Image */}
            <View className="w-full bg-[#1f2937]">
              <Image
                source={{ uri: post.image }}
                className="w-full aspect-square"
                resizeMode="cover"
              />
            </View>

            {/* Post Actions */}
            <View className="flex-row justify-between items-center px-4 py-3">
              <View className="flex-row gap-4">
                <TouchableOpacity onPress={() => handleLike(post.id)}>
                  <Ionicons
                    name={likedPosts.has(post.id) ? 'heart' : 'heart-outline'}
                    size={24}
                    color={likedPosts.has(post.id) ? '#ef4444' : '#ffffff'}
                  />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="chatbubble-outline" size={24} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="paper-plane-outline" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity>
                <Ionicons name="bookmark-outline" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Post Content */}
            <View className="px-4">
              <Text className="text-white font-semibold text-sm mb-2">
                {post.likes.toLocaleString()} lượt thích
              </Text>
              <View className="flex-row flex-wrap mb-2">
                <Text className="text-white font-semibold text-sm mr-2">
                  {post.username}
                </Text>
                <Text className="text-white text-sm flex-1">{post.caption}</Text>
              </View>
              <Text className="text-gray-400 text-xs uppercase mt-1">
                {post.time}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
