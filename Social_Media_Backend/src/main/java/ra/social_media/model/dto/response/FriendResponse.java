package ra.social_media.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ra.social_media.model.entity.Friend;
import ra.social_media.utils.FriendStatus;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class FriendResponse {
    private Long requesterId;
    private Long receiverId;
    private FriendStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime acceptAt;

    public static FriendResponse from(Friend friend) {
        if (friend == null) {
            return null;
        }
        
        // Determine receiverId: the user who is NOT the requester
        Long receiverId = null;
        if (friend.getRequester() != null) {
            if (friend.getUser1() != null && !friend.getUser1().getId().equals(friend.getRequester().getId())) {
                receiverId = friend.getUser1().getId();
            } else if (friend.getUser2() != null && !friend.getUser2().getId().equals(friend.getRequester().getId())) {
                receiverId = friend.getUser2().getId();
            }
        }
        
        return FriendResponse.builder()
                .requesterId(friend.getRequester() != null ? friend.getRequester().getId() : null)
                .receiverId(receiverId)
                .status(friend.getStatus())
                .createdAt(friend.getCreatedAt())
                .acceptAt(friend.getAcceptedAt())
                .build();
    }
}
