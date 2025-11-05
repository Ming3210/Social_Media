package ra.social_media.model.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ProfileRequest {
    @Schema(type = "string", format = "binary", description = "Ảnh đại diện (file upload)")
    private MultipartFile avatar;
    private String displayName;
    private String bio;
    private String website;
    private String location;

    private boolean isPrivate = false;


}
