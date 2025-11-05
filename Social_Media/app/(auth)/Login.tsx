import { login } from '@/apis/auth.api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(username, password);
      const accessToken =
        res.accessToken ||
        res.access_token ||
        res.token ||
        res.data?.accessToken;
      const refreshToken =
        res.refreshToken || res.refresh_token || res.data?.refreshToken;

      if (!accessToken) {
        Alert.alert('Đăng nhập thất bại', 'Server không trả về token.');
        return;
      }

      await AsyncStorage.setItem('accessToken', accessToken);
      if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);

      router.replace('/screens/Home');
    } catch (err: any) {
      Alert.alert('Đăng nhập thất bại', 'Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a141e]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 36 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Ngôn ngữ */}
          <Text className="text-gray-400 text-xs text-center mb-10">English (US)</Text>

          {/* Logo Instagram */}
          <View className="items-center mb-10">
          <Image
            source={require('../../assets/images/R.png')}
            className="w-40 h-40"
            resizeMode="contain"
          />
          </View>

          {/* Form */}
          <View className="w-full">
            <TextInput
              className="border border-[#304254] rounded-lg px-4 py-3 text-sm text-white mb-3"
              placeholder="Username, email or mobile number"
              placeholderTextColor="#9ca3af"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              className="border border-[#304254] rounded-lg px-4 py-3 text-sm text-white mb-3"
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              value={password}
              secureTextEntry
              onChangeText={setPassword}
            />

            {/* Log in button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={`rounded-full py-3 mt-2 ${
                loading ? 'bg-[#1f6feb]/70' : 'bg-[#0095f6]'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-semibold text-sm">
                  Log in
                </Text>
              )}
            </TouchableOpacity>

            {/* Forgot password */}
            <TouchableOpacity className="mt-4">
              <Text className="text-[#b0b9c3] text-center text-sm">
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-6 w-full">
            <View className="flex-1 h-px bg-[#304254]" />
            <Text className="text-gray-500 mx-4 text-xs font-semibold">OR</Text>
            <View className="flex-1 h-px bg-[#304254]" />
          </View>

          {/* Create new account */}
          <TouchableOpacity
            onPress={() => router.push('/Register')}
            className="border border-[#304254] rounded-full px-4 py-3 w-full mt-2"
          >
            <Text className="text-[#0095f6] text-center font-medium text-sm">
              Create new account
            </Text>
          </TouchableOpacity>

          {/* Footer Meta */}
          <View className="absolute bottom-10 w-full flex items-center">
            <Image
              source={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Meta_Platforms_Inc._logo.svg',
              }}
              style={{ width: 50, height: 20, tintColor: '#9ca3af' }}
              resizeMode="contain"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
