import axiosInstance from '@/utils/axiosInstance';

export interface BlockedUser {
  blockerId: number;
  blockerUsername: string;
  blockedUserId: number;
  blockedUsername: string;
  blockedAt: string;
}

export interface BlockedUsersResponse {
  success: boolean;
  data: BlockedUser[];
  message: string;
  httpStatus: string;
}

export interface BlockResponse {
  success: boolean;
  data: any;
  message: string;
  httpStatus: string;
}

// POST /api/v1/block/block/{userId}
export const blockUser = async (userId: number): Promise<BlockResponse> => {
  const res = await axiosInstance.post(`/block/block/${userId}`);
  return res.data;
};

// GET /api/v1/block/blocked
export const getBlockedUsers = async (): Promise<BlockedUsersResponse> => {
  const res = await axiosInstance.get('/block/blocked');
  return res.data;
};

// DELETE /api/v1/block/unblock/{userId}
export const unblockUser = async (userId: number): Promise<BlockResponse> => {
  const res = await axiosInstance.delete(`/block/unblock/${userId}`);
  return res.data;
};

