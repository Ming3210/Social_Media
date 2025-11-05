import axiosInstance from '@/utils/axiosInstance';

export interface ProfileData {
  displayName: string;
  bio: string;
  website: string;
  location: string;
  avatarUrl: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  private: boolean;
}

export interface ProfileResponse {
  success: boolean;
  data: ProfileData;
  message: string;
  httpStatus: string;
}

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string;
  website?: string;
  location?: string;
  avatarUrl?: string;
  avatarFile?: {
    uri: string;
    type: string;
    name: string;
  };
  private?: boolean;
}

// GET profile
export const getProfile = async (): Promise<ProfileResponse> => {
  const res = await axiosInstance.get('/profile');
  return res.data;
};

// UPDATE profile
export const updateProfile = async (
  payload: UpdateProfilePayload
): Promise<ProfileResponse> => {
  // Tạo FormData vì backend yêu cầu multipart/form-data
  // FormData có sẵn trong React Native
  const formData = new FormData();
  
  // Chỉ thêm các field có giá trị
  if (payload.displayName !== undefined) {
    formData.append('displayName', payload.displayName);
  }
  if (payload.bio !== undefined) {
    formData.append('bio', payload.bio);
  }
  if (payload.website !== undefined) {
    formData.append('website', payload.website);
  }
  if (payload.location !== undefined) {
    formData.append('location', payload.location);
  }
  // Nếu có file ảnh mới, upload file
  if (payload.avatarFile) {
    formData.append('avatar', {
      uri: payload.avatarFile.uri,
      type: payload.avatarFile.type || 'image/jpeg',
      name: payload.avatarFile.name || 'avatar.jpg',
    } as any);
  } else if (payload.avatarUrl !== undefined) {
    // Nếu chỉ có URL (không có file mới)
    formData.append('avatarUrl', payload.avatarUrl);
  }
  if (payload.private !== undefined) {
    formData.append('private', payload.private.toString());
  }
  
  const res = await axiosInstance.put('/profile/update', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

