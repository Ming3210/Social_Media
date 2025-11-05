package ra.social_media.service;

import ra.social_media.model.dto.request.ProfileRequest;
import ra.social_media.model.dto.response.ProfileResponse;

public interface ProfileService {
    ProfileResponse getProfile();

    ProfileResponse updateProfile(ProfileRequest profileRequest);
}
