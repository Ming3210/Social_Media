import UserRegister from '@/interface/userRegister';
import axiosInstance from '@/utils/axiosInstance';

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
    email: user.email,
    fullName: user.fullName,
  });
  return res.data;
};
