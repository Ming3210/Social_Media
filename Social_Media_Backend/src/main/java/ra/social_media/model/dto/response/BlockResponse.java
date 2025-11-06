package ra.social_media.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ra.social_media.model.entity.Block;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlockResponse {
    private Long blockerId;
    private String blockerUsername;
    private Long blockedUserId;
    private String blockedUsername;
    private LocalDateTime blockedAt;

    public static BlockResponse from(Block block) {
        return BlockResponse.builder()
                .blockerId(block.getBlocker().getId())
                .blockerUsername(block.getBlocker().getUsername())
                .blockedUserId(block.getBlocked().getId())
                .blockedUsername(block.getBlocked().getUsername())
                .blockedAt(block.getCreatedAt())
                .build();
    }
    }
