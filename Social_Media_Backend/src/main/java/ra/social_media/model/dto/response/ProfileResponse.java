package ra.social_media.model.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class ProfileResponse {
    private String displayName;
    private String bio;
    private String website;
    private String location;
    private String avatarUrl;

    private boolean isPrivate = false;

    private int followersCount = 0;

    private int followingCount = 0;

    private int postsCount = 0;
}
