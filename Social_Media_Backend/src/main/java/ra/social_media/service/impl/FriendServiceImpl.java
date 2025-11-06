package ra.social_media.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import ra.social_media.exception.HttpConflict;
import ra.social_media.exception.HttpNotFound;
import ra.social_media.exception.HttpUnAuthorized;
import ra.social_media.model.dto.response.FriendResponse;
import ra.social_media.model.entity.Friend;
import ra.social_media.model.entity.Profile;
import ra.social_media.model.entity.User;
import ra.social_media.repository.FriendRepository;
import ra.social_media.repository.ProfileRepository;
import ra.social_media.repository.UserRepository;
import ra.social_media.security.principal.UserPrincipal;
import ra.social_media.service.FriendService;
import ra.social_media.service.UserService;
import ra.social_media.utils.FriendStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FriendServiceImpl implements FriendService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendRepository friendRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ProfileRepository profileRepository;


    @Override
    public FriendResponse sendFriendRequest(Long receiverId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new HttpUnAuthorized("User not authenticated");
        }
        User sender = userService.getUserByUsername(userPrincipal.getUsername());
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new HttpNotFound("Receiver not found"));

        if (sender.getId().equals(receiverId))
            throw new IllegalArgumentException("Cannot send friend request to yourself");

        Optional<Friend> existing = friendRepository
                .findByUser1IdAndUser2Id(sender.getId(), receiverId)
                .or(() -> friendRepository.findByUser1IdAndUser2Id(receiverId, sender.getId()));

        if (existing.isPresent())
            throw new IllegalStateException("Friend request already exists");

        Profile receiverProfile = profileRepository.findByUserId(receiverId)
                .orElseThrow(() -> new HttpNotFound("Receiver profile not found"));
        FriendStatus statusFix = FriendStatus.ACCEPTED;
        if (receiverProfile.isPrivate()) {
            statusFix = FriendStatus.PENDING;
        }


        Friend friend = Friend.builder()
                .user1(sender)
                .user2(receiver)
                .requester(sender)
                .status(statusFix)
                .createdAt(LocalDateTime.now())
                .build();

        friendRepository.save(friend);

        return FriendResponse.from(friend);
    }
    @Override
    public FriendResponse acceptFriendRequest(Long requesterId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new HttpUnAuthorized("User not authenticated");
        }

        User currentUser = userService.getUserByUsername(userPrincipal.getUsername());
        Long currentUserId = currentUser.getId();

        // Tìm friend request trong cả 2 hướng
        Friend friend = friendRepository
                .findByUser1IdAndUser2Id(requesterId, currentUserId)
                .or(() -> friendRepository.findByUser1IdAndUser2Id(currentUserId, requesterId))
                .orElseThrow(() -> new HttpNotFound("Friend request not found"));

        // Verify người gửi request phải là requesterId
        if (!friend.getRequester().getId().equals(requesterId)) {
            throw new HttpUnAuthorized("Invalid requester");
        }

        friend.setStatus(FriendStatus.ACCEPTED);
        friend.setAcceptedAt(LocalDateTime.now());
        friendRepository.save(friend);

        return FriendResponse.from(friend);
    }

    @Override
    public FriendResponse rejectFriendRequest(Long requesterId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new HttpUnAuthorized("User not authenticated");
        }

        User currentUser = userService.getUserByUsername(userPrincipal.getUsername());
        Long currentUserId = currentUser.getId();

        Friend friend = friendRepository
                .findByUser1IdAndUser2Id(requesterId, currentUserId)
                .or(() -> friendRepository.findByUser1IdAndUser2Id(currentUserId, requesterId))
                .orElseThrow(() -> new HttpNotFound("Friend request not found"));

        friend.setStatus(FriendStatus.REJECTED);
        friendRepository.save(friend);

        return FriendResponse.from(friend);
    }

    @Override
    public FriendResponse cancelFriendRequest(Long receiverId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new HttpUnAuthorized("User not authenticated");
        }

        User currentUser = userService.getUserByUsername(userPrincipal.getUsername());
        Long currentUserId = currentUser.getId();

        Friend friend = friendRepository
                .findByUser1IdAndUser2Id(currentUserId, receiverId)
                .or(() -> friendRepository.findByUser1IdAndUser2Id(receiverId, currentUserId))
                .orElseThrow(() -> new HttpNotFound("Friend request not found"));

        if (friend.getStatus() != FriendStatus.PENDING)
            throw new IllegalStateException("Cannot cancel non-pending request");

        // Verify người hủy phải là người gửi request
        if (!friend.getRequester().getId().equals(currentUserId)) {
            throw new HttpUnAuthorized("You can only cancel your own requests");
        }

        friend.setStatus(FriendStatus.REJECTED);
        friendRepository.save(friend);

        return FriendResponse.from(friend);
    }

    @Override
    public FriendResponse unfriend(Long friendUserId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new HttpUnAuthorized("User not authenticated");
        }

        User currentUser = userService.getUserByUsername(userPrincipal.getUsername());
        Long currentUserId = currentUser.getId();

        Friend friend = friendRepository
                .findByUser1IdAndUser2Id(currentUserId, friendUserId)
                .or(() -> friendRepository.findByUser1IdAndUser2Id(friendUserId, currentUserId))
                .orElseThrow(() -> new HttpNotFound("Friend relation not found"));

        friendRepository.delete(friend);

        return FriendResponse.builder()
                .receiverId(friendUserId)
                .status(FriendStatus.REJECTED)
                .build();
    }


    @Override
    public List<FriendResponse> searchFriendByPhoneNumber(String phoneNumber) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new HttpUnAuthorized("User not authenticated");
        }

        User currentUser = userService.getUserByUsername(userPrincipal.getUsername());
        Long currentUserId = currentUser.getId();

        List<User> matchedUsers;

        // Nếu phoneNumber rỗng hoặc null, lấy tất cả users
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            matchedUsers = userRepository.findAll();
        } else {
            matchedUsers = userRepository.findByPhoneNumberContaining(phoneNumber);
        }

        // Loại bỏ chính user hiện tại
        matchedUsers = matchedUsers.stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .toList();

        if (matchedUsers.isEmpty()) {
            throw new HttpNotFound("No users found");
        }

        return matchedUsers.stream()
                .map(targetUser -> {
                    // CHỈ TÌM QUAN HỆ BẠN BÈ VỚI STATUS = ACCEPTED
                    Optional<Friend> friendRelation =
                            friendRepository.findByUser1IdAndUser2IdAndStatus(currentUserId, targetUser.getId(), FriendStatus.ACCEPTED)
                                    .or(() -> friendRepository.findByUser1IdAndUser2IdAndStatus(targetUser.getId(), currentUserId, FriendStatus.ACCEPTED));

                    return friendRelation.map(friend -> {
                        Long receiverId = friend.getUser1().getId().equals(currentUserId)
                                ? friend.getUser2().getId()
                                : friend.getUser1().getId();

                        return FriendResponse.builder()
                                .requesterId(friend.getRequester().getId())
                                .receiverId(receiverId)
                                .status(friend.getStatus())
                                .createdAt(friend.getCreatedAt())
                                .acceptAt(friend.getAcceptedAt())
                                .build();
                    });
                })
                .filter(Optional::isPresent)  // CHỈ LẤY NHỮNG NGƯỜI ĐÃ LÀ BẠN (ACCEPTED)
                .map(Optional::get)
                .toList();
    }
    @Override
    public List<FriendResponse> getSentFriendRequests() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new HttpUnAuthorized("User not authenticated");
        }

        User currentUser = userService.getUserByUsername(userPrincipal.getUsername());
        Long currentUserId = currentUser.getId();

        List<Friend> friendRequests = friendRepository
                .findSentRequestsByUserIdAndStatus(currentUserId, FriendStatus.PENDING);

        return friendRequests.stream()
                .map(FriendResponse::from)
                .toList();
    }

    @Override
    public List<FriendResponse> getReceivedFriendRequests() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new HttpUnAuthorized("User not authenticated");
        }

        User currentUser = userService.getUserByUsername(userPrincipal.getUsername());
        Long currentUserId = currentUser.getId();

        List<Friend> friendRequests = friendRepository
                .findReceivedRequestsByUserIdAndStatus(currentUserId, FriendStatus.PENDING);

        return friendRequests.stream()
                .map(FriendResponse::from)
                .toList();
    }
}
