package ra.social_media.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import ra.social_media.exception.HttpNotFound;
import ra.social_media.exception.HttpUnAuthorized;
import ra.social_media.model.dto.response.BlockResponse;
import ra.social_media.model.entity.Block;
import ra.social_media.model.entity.Friend;
import ra.social_media.model.entity.User;
import ra.social_media.repository.BlockRepository;
import ra.social_media.repository.FriendRepository;
import ra.social_media.repository.UserRepository;
import ra.social_media.security.principal.UserPrincipal;
import ra.social_media.service.BlockService;
import ra.social_media.service.UserService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BlockServiceImpl implements BlockService {
    @Autowired
    private BlockRepository blockRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendRepository friendRepository;

    @Override
    public BlockResponse blockUser(Long blockedUserId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new HttpUnAuthorized("User not authenticated");
        }

        User currentUser = userService.getUserByUsername(userPrincipal.getUsername());
        Long currentUserId = currentUser.getId();

        if (currentUserId.equals(blockedUserId)) {
            throw new IllegalArgumentException("Cannot block yourself");
        }

        User blockedUser = userRepository.findById(blockedUserId)
                .orElseThrow(() -> new HttpNotFound("User not found"));

        if (blockRepository.existsByBlockerIdAndBlockedId(currentUserId, blockedUserId)) {
            throw new IllegalStateException("User already blocked");
        }

        Block blockedUserRecord = Block.builder()
                .blocker(currentUser)
                .blocked(blockedUser)
                .createdAt(LocalDateTime.now())
                .build();

        blockRepository.save(blockedUserRecord);

        // Xóa quan hệ bạn bè nếu có
        Optional<Friend> friendRelation = friendRepository
                .findByUser1IdAndUser2Id(currentUserId, blockedUserId)
                .or(() -> friendRepository.findByUser1IdAndUser2Id(blockedUserId, currentUserId));

        friendRelation.ifPresent(friendRepository::delete);

        return BlockResponse.from(blockedUserRecord);
    }


    @Override
    public BlockResponse unblockUser(Long blockedUserId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new HttpUnAuthorized("User not authenticated");
        }

        User currentUser = userService.getUserByUsername(userPrincipal.getUsername());
        Long currentUserId = currentUser.getId();

        Block blockedUserRecord = blockRepository
                .findByBlockerIdAndBlockedId(currentUserId, blockedUserId)
                .orElseThrow(() -> new HttpNotFound("User is not blocked"));

        BlockResponse response = BlockResponse.from(blockedUserRecord);

        blockRepository.delete(blockedUserRecord);

        return response;
    }


        @Override
        public List<BlockResponse> getBlockedUsers() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new HttpUnAuthorized("User not authenticated");
        }

        User currentUser = userService.getUserByUsername(userPrincipal.getUsername());
        Long currentUserId = currentUser.getId();

        List<Block> blockedUsers = blockRepository.findByBlockerId(currentUserId);

        return blockedUsers.stream()
                .map(bu -> BlockResponse.builder()
                        .blockerId(bu.getBlocked().getId())
                        .blockerUsername(currentUser.getUsername())
                        .blockedUserId(currentUserId)
                        .blockedUsername(bu.getBlocked().getUsername())
                        .blockedAt(bu.getCreatedAt())
                        .build())
                .toList();
    }
}
