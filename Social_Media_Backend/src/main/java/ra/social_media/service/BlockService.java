package ra.social_media.service;

import ra.social_media.model.dto.response.BlockResponse;

import java.util.List;

public interface BlockService {
    BlockResponse blockUser(Long blockedUserId);
    BlockResponse unblockUser(Long blockedUserId);

    List<BlockResponse> getBlockedUsers();
}
