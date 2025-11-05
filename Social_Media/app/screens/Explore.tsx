import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 1, name: 'Tất cả', icon: 'grid-outline' },
    { id: 2, name: 'Reels', icon: 'play-circle-outline' },
    { id: 3, name: 'Ảnh', icon: 'image-outline' },
    { id: 4, name: 'Video', icon: 'videocam-outline' },
  ];

  const explorePosts = Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    image: `https://picsum.photos/200/200?random=${i + 1}`,
  }));

  return (
    <SafeAreaView className="flex-1 bg-[#0a141e]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-[#1f2937]">
        <Text className="text-2xl font-light tracking-wide text-white mb-4">
          Explore
        </Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-[#1f2937] rounded-lg px-3 py-2">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-white text-sm"
            placeholder="Search"
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b border-[#1f2937] py-3"
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            className="items-center mx-3 px-4 py-2 rounded-full bg-[#1f2937]"
          >
            <Ionicons name={category.icon as any} size={20} color="#ffffff" />
            <Text className="text-white text-xs mt-1">{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      <ScrollView className="flex-1">
        <View className="flex-row flex-wrap">
          {explorePosts.map((post) => (
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
      </ScrollView>
    </SafeAreaView>
  );
}

