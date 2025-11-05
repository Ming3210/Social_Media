package ra.social_media.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import ra.social_media.model.dto.request.ProfileRequest;
import ra.social_media.model.dto.response.ProfileResponse;
import ra.social_media.model.entity.Profile;
import ra.social_media.model.entity.User;
import ra.social_media.repository.ProfileRepository;
import ra.social_media.repository.UserRepository;
import ra.social_media.security.principal.UserPrincipal;
import ra.social_media.service.ProfileService;

@Service
public class ProfileServiceImpl implements ProfileService {
    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Override
    public ProfileResponse getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new RuntimeException("Không thể xác định người dùng hiện tại");
        }

        Profile profile = profileRepository.findByUser_Username(userPrincipal.getUsername())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        return ProfileResponse.builder()
                .displayName(profile.getDisplayName())
                .bio(profile.getBio())
                .website(profile.getWebsite())
                .location(profile.getLocation())
                .avatarUrl(profile.getAvatarUrl())
                .isPrivate(profile.isPrivate())
                .followersCount(profile.getFollowersCount())
                .followingCount(profile.getFollowingCount())
                .postsCount(profile.getPostsCount())
                .build();
    }



    @Override
    public ProfileResponse updateProfile(ProfileRequest profileRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new RuntimeException("Không thể xác định người dùng hiện tại");
        }

        Profile profile = profileRepository.findByUser_Username(userPrincipal.getUsername())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        if (profileRequest.getAvatar() != null && !profileRequest.getAvatar().isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(profileRequest.getAvatar());
            profile.setAvatarUrl(imageUrl);
        }

        profile.setDisplayName(profileRequest.getDisplayName());
        profile.setBio(profileRequest.getBio());
        profile.setWebsite(profileRequest.getWebsite());
        profile.setLocation(profileRequest.getLocation());
        profile.setPrivate(profileRequest.isPrivate());

        profileRepository.save(profile);

        return ProfileResponse.builder()
                .displayName(profile.getDisplayName())
                .bio(profile.getBio())
                .website(profile.getWebsite())
                .location(profile.getLocation())
                .avatarUrl(profile.getAvatarUrl())
                .isPrivate(profile.isPrivate())
                .followersCount(profile.getFollowersCount())
                .followingCount(profile.getFollowingCount())
                .postsCount(profile.getPostsCount())
                .build();
    }


}
