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
        return FriendResponse.builder()
                .requesterId(friend.getRequester() != null ? friend.getRequester().getId() : null)
                .receiverId(friend.getUser2() != null ? friend.getUser2().getId() : 
                          (friend.getUser1() != null && friend.getRequester() != null && 
                           !friend.getUser1().getId().equals(friend.getRequester().getId())) ? 
                          friend.getUser1().getId() : null)
                .status(friend.getStatus())
                .createdAt(friend.getCreatedAt())
                .acceptAt(friend.getAcceptedAt())
                .build();
    }
}
