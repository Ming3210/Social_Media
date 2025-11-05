package ra.social_media.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserRegisterResponse {

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private Boolean status;
    private Instant createdAt;

    private String accessToken;
    private String refreshToken;
}
