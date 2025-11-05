import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Reels() {
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());

  const handleLike = (reelId: number) => {
    setLikedReels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reelId)) {
        newSet.delete(reelId);
      } else {
        newSet.add(reelId);
      }
      return newSet;
    });
  };

  const reels = [
    {
      id: 1,
      username: 'reel_user_1',
      avatar: 'https://i.pravatar.cc/150?img=1',
      video: 'https://picsum.photos/400/600?random=1',
      likes: 1234,
      caption: 'Amazing reel content! 🔥',
    },
    {
      id: 2,
      username: 'reel_user_2',
      avatar: 'https://i.pravatar.cc/150?img=2',
      video: 'https://picsum.photos/400/600?random=2',
      likes: 5678,
      caption: 'Check this out! ✨',
    },
    {
      id: 3,
      username: 'reel_user_3',
      avatar: 'https://i.pravatar.cc/150?img=3',
      video: 'https://picsum.photos/400/600?random=3',
      likes: 9876,
      caption: 'Life is beautiful! 🌟',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-[#1f2937]">
        <Text className="text-xl font-semibold text-white">Reels</Text>
        <TouchableOpacity>
          <Ionicons name="camera-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Reels Feed */}
      <ScrollView
        pagingEnabled
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {reels.map((reel) => (
          <View
            key={reel.id}
            className="relative"
            style={{ height: SCREEN_HEIGHT - 100 }}
          >
            {/* Video/Image Placeholder */}
            <Image
              source={{ uri: reel.video }}
              className="w-full h-full"
              resizeMode="cover"
            />

            {/* Overlay Content */}
            <View className="absolute bottom-0 left-0 right-0 p-4">
              <View className="flex-row justify-between items-end">
                {/* Left Side - User Info & Caption */}
                <View className="flex-1 pr-4">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Image
                      source={{ uri: reel.avatar }}
                      className="w-8 h-8 rounded-full border-2 border-white"
                    />
                    <Text className="text-white font-semibold text-sm">
                      {reel.username}
                    </Text>
                  </View>
                  <Text className="text-white text-sm mb-2">{reel.caption}</Text>
                </View>

                {/* Right Side - Actions */}
                <View className="items-center gap-4">
                  <TouchableOpacity onPress={() => handleLike(reel.id)}>
                    <View className="items-center">
                      <Ionicons
                        name={likedReels.has(reel.id) ? 'heart' : 'heart-outline'}
                        size={32}
                        color={likedReels.has(reel.id) ? '#ef4444' : '#ffffff'}
                      />
                      <Text className="text-white text-xs mt-1">
                        {reel.likes.toLocaleString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <View className="items-center">
                      <Ionicons name="chatbubble-outline" size={32} color="#ffffff" />
                      <Text className="text-white text-xs mt-1">123</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <View className="items-center">
                      <Ionicons name="paper-plane-outline" size={32} color="#ffffff" />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons name="bookmark-outline" size={32} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons name="ellipsis-vertical" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

