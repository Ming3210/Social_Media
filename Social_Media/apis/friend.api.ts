import axiosInstance from '@/utils/axiosInstance';

export interface User {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  isFriend?: boolean;
  friendRequestStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'NONE';
  isRequestSent?: boolean;
  isRequestReceived?: boolean;
}

export interface FriendRequest {
  requesterId: number;
  receiverId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  acceptAt?: string;
}

export interface FriendSearchResponse {
  success: boolean;
  data: User[];
  message: string;
  httpStatus: string;
}

export interface FriendRequestsResponse {
  success: boolean;
  data: FriendRequest[];
  message: string;
  httpStatus: string;
}

export interface FriendResponse {
  success: boolean;
  data: any;
  message: string;
  httpStatus: string;
}

// GET /api/v1/friends/search
export const searchFriends = async (query?: string): Promise<FriendSearchResponse> => {
  const res = await axiosInstance.get('/friends/search', {
    params: query ? { query } : {},
  });
  return res.data;
};

// GET /api/v1/friends/requests/received
export const getReceivedRequests = async (): Promise<FriendRequestsResponse> => {
  const res = await axiosInstance.get('/friends/requests/received');
  return res.data;
};

// GET /api/v1/friends/requests/sent
export const getSentRequests = async (): Promise<FriendRequestsResponse> => {
  const res = await axiosInstance.get('/friends/requests/sent');
  return res.data;
};

// POST /api/v1/friends/request/{receiverId}
export const sendFriendRequest = async (receiverId: number): Promise<FriendResponse> => {
  const res = await axiosInstance.post(`/friends/request/${receiverId}`);
  return res.data;
};

// PUT /api/v1/friends/accept/{requesterId}
export const acceptFriendRequest = async (requesterId: number): Promise<FriendResponse> => {
  const res = await axiosInstance.put(`/friends/accept/${requesterId}`);
  return res.data;
};

// PUT /api/v1/friends/reject/{requesterId}
export const rejectFriendRequest = async (requesterId: number): Promise<FriendResponse> => {
  const res = await axiosInstance.put(`/friends/reject/${requesterId}`);
  return res.data;
};

// DELETE /api/v1/friends/cancel/{receiverId}
export const cancelFriendRequest = async (receiverId: number): Promise<FriendResponse> => {
  const res = await axiosInstance.delete(`/friends/cancel/${receiverId}`);
  return res.data;
};

// DELETE /api/v1/friends/{friendUserId}
export const removeFriend = async (friendUserId: number): Promise<FriendResponse> => {
  const res = await axiosInstance.delete(`/friends/${friendUserId}`);
  return res.data;
};

// GET /api/v1/friends/search - Get all friends (ACCEPTED status)
export const getAllFriends = async (): Promise<FriendSearchResponse> => {
  const res = await axiosInstance.get('/friends/search');
  return res.data;
};

