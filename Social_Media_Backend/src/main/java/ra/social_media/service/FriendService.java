package ra.social_media.service;

import ra.social_media.model.dto.response.FriendResponse;
import ra.social_media.model.dto.response.UserSearchResponse;
import ra.social_media.model.entity.Friend;

import java.util.List;

public interface FriendService {
    FriendResponse sendFriendRequest(Long receiverId);
    FriendResponse acceptFriendRequest(Long requesterId);
    FriendResponse rejectFriendRequest(Long requesterId);
    FriendResponse cancelFriendRequest(Long receiverId);
    FriendResponse unfriend(Long friendUserId);
    List<UserSearchResponse> searchFriendByPhoneNumber(String phoneNumber);


    List<FriendResponse> getSentFriendRequests();

    List<FriendResponse> getReceivedFriendRequests();
}
