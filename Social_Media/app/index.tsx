import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Entry() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          router.replace('/screens/Home' as any);
        } else {
          router.replace('/Login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/Login');
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center">
          {/* Logo Instagram */}
          <View className="items-center mb-8">
            <Image
              source={require('../assets/images/R.png')}
              className="w-32 h-32"
              resizeMode="contain"
            />
          </View>
          
          {/* Loading Indicator */}
          <ActivityIndicator size="large" color="#0095f6" />
          
          {/* Loading Text */}
          <Text className="text-black text-sm mt-4 text-gray-600">
            Đang kiểm tra phiên đăng nhập...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}
