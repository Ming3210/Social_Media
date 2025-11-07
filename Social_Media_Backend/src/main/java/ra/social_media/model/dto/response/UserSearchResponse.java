package ra.social_media.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ra.social_media.utils.FriendStatus;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class UserSearchResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String displayName;
    private String bio;
    private String avatarUrl;
    
    // Relationship information
    private FriendStatus friendStatus; // ACCEPTED, PENDING, REJECTED, or null if no relationship
    private Long requesterId; // ID of the user who sent the request (if status is PENDING)
    private Long receiverId; // ID of the user who received the request (if status is PENDING)
    private LocalDateTime createdAt; // When the relationship was created
    private LocalDateTime acceptAt; // When the relationship was accepted (if ACCEPTED)
    private Boolean isRequestSent; // True if current user sent the request
    private Boolean isRequestReceived; // True if current user received the request
}

