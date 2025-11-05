import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, Text, View } from 'react-native';

export default function Entry() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          router.replace('/screens');
        } else {
          router.replace('/Login');
        }
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <View style={{ alignItems: 'center', gap: 8 }}>
          <ActivityIndicator />
          <Text>Đang kiểm tra phiên đăng nhập...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}
