import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Xác định baseURL dựa trên platform
// Android emulator: 10.0.2.2 trỏ đến localhost của máy host
// iOS simulator và web: localhost hoạt động trực tiếp
// Thiết bị thật: cần thay bằng IP LAN của máy chạy backend (ví dụ: 192.168.1.xxx)
const getBaseURL = () => {
  // Sử dụng IP LAN cho tất cả platforms
  return 'http:/192.168.62.2:8080/api/v1';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    // Danh sách các endpoint không cần token (public endpoints)
    const publicEndpoints = ['/auth/login', '/auth/register'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    // Chỉ thêm token nếu không phải public endpoint
    if (!isPublicEndpoint) {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request để debug
    console.log('=== REQUEST ===');
    console.log('Method:', config.method?.toUpperCase());
    console.log('URL:', config.url);
    console.log('Full URL:', `${config.baseURL}${config.url}`);
    console.log('Headers:', JSON.stringify(config.headers, null, 2));
    console.log('Data:', JSON.stringify(config.data, null, 2));
    console.log('===============');
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);
axiosInstance.interceptors.response.use(
  (res) => {
    // Log successful response
    console.log('=== RESPONSE ===');
    console.log('Status:', res.status);
    console.log('URL:', res.config.url);
    console.log('Data:', JSON.stringify(res.data, null, 2));
    console.log('================');
    return res;
  },
  async (error) => {
    // Log error response
    if (error.response) {
      console.error('=== ERROR RESPONSE ===');
      console.error('Status:', error.response.status);
      console.error('URL:', error.config?.url);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('=====================');
    } else if (error.request) {
      console.error('=== ERROR REQUEST ===');
      console.error('No response received:', error.request);
      console.error('=====================');
    } else {
      console.error('=== ERROR ===');
      console.error('Error message:', error.message);
      console.error('================');
    }
    
    const originalRequest = error.config;
    
    // Xử lý refresh token khi nhận 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Tránh refresh nếu đang gọi refresh endpoint
      if (originalRequest.url?.includes('/auth/refresh')) {
        // Refresh token cũng hết hạn, cần logout
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        const refreshError = new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        (refreshError as any).isTokenExpired = true;
        return Promise.reject(refreshError);
      }
      
      originalRequest._retry = true;
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const res = await axios.post(
            `${getBaseURL()}/auth/refresh`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          
          // Kiểm tra response structure
          const responseData = res.data;
          let newAccessToken: string | null = null;
          
          if (responseData?.data?.accessToken) {
            // Format: { success: true, data: { accessToken: ... } }
            newAccessToken = responseData.data.accessToken;
          } else if (responseData?.accessToken) {
            // Format: { accessToken: ... }
            newAccessToken = responseData.accessToken;
          }
          
          if (newAccessToken) {
            await AsyncStorage.setItem('accessToken', newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            // Retry original request với token mới
            return axiosInstance(originalRequest);
          } else {
            throw new Error('Không nhận được access token mới');
          }
        } catch (refreshError: any) {
          console.error('Refresh token error:', refreshError);
          // Refresh token thất bại, xóa tokens và logout
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
          const tokenExpiredError = new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          (tokenExpiredError as any).isTokenExpired = true;
          return Promise.reject(tokenExpiredError);
        }
      } else {
        // Không có refresh token, cần logout
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        const tokenExpiredError = new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        (tokenExpiredError as any).isTokenExpired = true;
        return Promise.reject(tokenExpiredError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
