import UserRegister from '@/interface/userRegister';
import axiosInstance from '@/utils/axiosInstance';

export interface User {
  id: number;
  username: string;
  displayName?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface AllUsersResponse {
  success: boolean;
  data: User[];
  message: string;
  httpStatus: string;
}

export const login = async (username: string, password: string) => {
  // Backend yêu cầu field "login" thay vì "username"
  const requestBody = { login: username.trim(), password };
  
  const res = await axiosInstance.post('/auth/login', requestBody);
  return res.data;
};

export const register = async (user: UserRegister) => {
  const res = await axiosInstance.post('/auth/register', {
    username: user.username,
    password: user.password,
    phoneNumber: user.phoneNumber,
    email: user.email,
    fullName: user.fullName,
  });
  return res.data;
};

// GET /api/v1/auth/all - Get all users
export const getAllUsers = async (): Promise<AllUsersResponse> => {
  const res = await axiosInstance.get('/auth/all');
  return res.data;
};
