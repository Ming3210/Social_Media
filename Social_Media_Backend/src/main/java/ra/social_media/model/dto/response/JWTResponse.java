package ra.social_media.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JWTResponse {
    private String username;
    private String fullName;
    private String email;
    private Boolean isActive;
    private String accessToken;
    private String refreshToken;
}