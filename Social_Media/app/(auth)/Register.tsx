import { register as registerApi } from '@/apis/auth.api';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !phoneNumber || !fullName || !password || !confirmPassword) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ các trường.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mật khẩu không khớp', 'Vui lòng kiểm tra lại.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Mật khẩu quá ngắn', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    try {
      setLoading(true);
      await registerApi({ username, email, phoneNumber, fullName, password });
      Alert.alert('Đăng ký thành công', 'Hãy đăng nhập để tiếp tục.');
      router.replace('/Login');
    } catch (err: any) {
      console.error('Register error:', err);
      
      let errorMessage = 'Lỗi không xác định';
      
      if (err.response) {
        // Server trả về lỗi
        errorMessage = err.response.data?.message || 
                      err.response.data?.error || 
                      `Lỗi ${err.response.status}: ${err.response.statusText}`;
      } else if (err.request) {
        // Request được gửi nhưng không nhận được response (network error)
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc địa chỉ server.';
      } else {
        // Lỗi khác
        errorMessage = err.message || 'Đã xảy ra lỗi khi đăng ký';
      }
      
      Alert.alert('Đăng ký thất bại', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Instagram */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Instagram</Text>
            <Text style={styles.subtitle}>
              Đăng ký để xem ảnh và video từ bạn bè.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <TextInput
              placeholder="Tên đăng nhập"
              placeholderTextColor="#8e8e8e"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
              style={styles.input}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#8e8e8e"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
            <TextInput
              placeholder="Số điện thoại"
              placeholderTextColor="#8e8e8e"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.input}
            />
            <TextInput
              placeholder="Họ và tên"
              placeholderTextColor="#8e8e8e"
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
            />
            <TextInput
              placeholder="Mật khẩu"
              placeholderTextColor="#8e8e8e"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
            <TextInput
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor="#8e8e8e"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
            />

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Đăng ký</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.termsText}>
              Bằng cách đăng ký, bạn đồng ý với{' '}
              <Text style={styles.termsLink}>Điều khoản</Text>,{' '}
              <Text style={styles.termsLink}>Chính sách dữ liệu</Text> và{' '}
              <Text style={styles.termsLink}>Chính sách Cookie</Text> của chúng tôi.
            </Text>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>HOẶC</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity style={styles.facebookButton}>
              <Text style={styles.facebookButtonText}>Đăng nhập bằng Facebook</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Bạn đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/Login')}>
            <Text style={styles.footerLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 51,
    fontWeight: '300',
    color: '#000',
    letterSpacing: 1,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#8e8e8e',
    textAlign: 'center',
    fontWeight: '400',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 14,
    marginBottom: 12,
    color: '#262626',
  },
  registerButton: {
    backgroundColor: '#0095f6',
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#8e8e8e',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 16,
  },
  termsLink: {
    color: '#0095f6',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#dbdbdb',
  },
  dividerText: {
    marginHorizontal: 20,
    color: '#8e8e8e',
    fontSize: 12,
    fontWeight: '600',
  },
  facebookButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  facebookButtonText: {
    color: '#385185',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#dbdbdb',
    paddingHorizontal: 40,
  },
  footerText: {
    color: '#8e8e8e',
    fontSize: 14,
  },
  footerLink: {
    color: '#0095f6',
    fontSize: 14,
    fontWeight: '600',
  },
});
