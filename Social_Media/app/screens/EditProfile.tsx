import { getProfile, updateProfile, type ProfileData } from '@/apis/profile.api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Form state
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    website: '',
    location: '',
  });
  const [selectedAvatar, setSelectedAvatar] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);

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
        setEditForm({
          displayName: res.data.displayName || '',
          bio: res.data.bio || '',
          website: res.data.website || '',
          location: res.data.location || '',
        });
      }
    } catch (error: any) {
      console.error('Fetch profile error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to upload photos!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedAvatar({
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.fileName || `avatar_${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera permissions to take photos!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedAvatar({
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.fileName || `avatar_${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
  };

  const handleShowImagePickerOptions = () => {
    Alert.alert(
      'Chọn ảnh đại diện',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Thư viện ảnh', onPress: handlePickImage },
        { text: 'Chụp ảnh', onPress: handleTakePhoto },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      const payload: any = { ...editForm };

      if (selectedAvatar) {
        payload.avatarFile = selectedAvatar;
      }

      const res = await updateProfile(payload);
      if (res.success && res.data) {
        setProfile(res.data);
        setSelectedAvatar(null);
        Alert.alert('Thành công', 'Đã cập nhật profile');
        router.back();
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật profile';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0095f6" />
          <Text className="text-white mt-4">Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-3 border-b border-[#1f2937]">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white font-semibold text-lg">Edit profile</Text>
          <TouchableOpacity onPress={handleUpdateProfile} disabled={updating}>
            {updating ? (
              <ActivityIndicator size="small" color="#0095f6" />
            ) : (
              <Text className="text-[#0095f6] font-semibold text-base">Done</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 py-6">
            {/* Profile Picture Section */}
            <View className="flex-row items-center gap-4 mb-8">
              <TouchableOpacity onPress={handleShowImagePickerOptions}>
                {selectedAvatar ? (
                  <Image
                    source={{ uri: selectedAvatar.uri }}
                    className="w-24 h-24 rounded-full"
                    resizeMode="cover"
                  />
                ) : profile?.avatarUrl ? (
                  <Image
                    source={{ uri: profile.avatarUrl }}
                    className="w-24 h-24 rounded-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-24 h-24 rounded-full bg-[#1a1a1a] border-2 border-[#363636] items-center justify-center">
                    <Ionicons name="person" size={48} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base mb-1">
                  {profile?.displayName || 'Username'}
                </Text>
                <TouchableOpacity
                  onPress={handleShowImagePickerOptions}
                  className="mt-2"
                >
                  <Text className="text-[#0095f6] text-sm font-semibold">
                    Change photo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Website Field */}
            <View className="mb-4">
              <Text className="text-white font-semibold text-sm mb-2">Website</Text>
              <TextInput
                className="bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-[#363636]"
                placeholder="Website"
                placeholderTextColor="#9ca3af"
                value={editForm.website}
                onChangeText={(text) => setEditForm({ ...editForm, website: text })}
                keyboardType="url"
                autoCapitalize="none"
              />
              <Text className="text-gray-400 text-xs mt-2">
                Editing your links is only available on mobile. Visit the Instagram app
                and edit your profile to change the websites in your bio.
              </Text>
            </View>

            {/* Bio Field */}
            <View className="mb-4">
              <Text className="text-white font-semibold text-sm mb-2">Bio</Text>
              <TextInput
                className="bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-[#363636]"
                placeholder="Bio"
                placeholderTextColor="#9ca3af"
                value={editForm.bio}
                onChangeText={(text) => setEditForm({ ...editForm, bio: text })}
                multiline
                numberOfLines={4}
                maxLength={150}
                textAlignVertical="top"
              />
              <Text className="text-gray-400 text-xs mt-2 text-right">
                {editForm.bio.length} / 150
              </Text>
            </View>

            {/* Display Name Field */}
            <View className="mb-4">
              <Text className="text-white font-semibold text-sm mb-2">Display Name</Text>
              <TextInput
                className="bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-[#363636]"
                placeholder="Display Name"
                placeholderTextColor="#9ca3af"
                value={editForm.displayName}
                onChangeText={(text) => setEditForm({ ...editForm, displayName: text })}
              />
            </View>

            {/* Location Field */}
            <View className="mb-4">
              <Text className="text-white font-semibold text-sm mb-2">Location</Text>
              <TextInput
                className="bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-[#363636]"
                placeholder="Location"
                placeholderTextColor="#9ca3af"
                value={editForm.location}
                onChangeText={(text) => setEditForm({ ...editForm, location: text })}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

