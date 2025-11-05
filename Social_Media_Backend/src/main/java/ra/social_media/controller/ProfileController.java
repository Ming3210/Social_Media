package ra.social_media.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ra.social_media.model.dto.request.ProfileRequest;
import ra.social_media.model.dto.response.ApiDataResponse;
import ra.social_media.model.dto.response.ProfileResponse;
import ra.social_media.service.ProfileService;

@RestController
@RequestMapping("api/v1/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;


    @GetMapping
    public ResponseEntity<ApiDataResponse<ProfileResponse>> getProfile() {
        return new ResponseEntity<>(new ApiDataResponse<>(true, profileService.getProfile(), "success", HttpStatus.OK), HttpStatus.OK);
    }


    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiDataResponse<ProfileResponse>> updateProfile(
            @ModelAttribute ProfileRequest profileRequest
    ) {
        ProfileResponse updatedProfile = profileService.updateProfile(profileRequest);
        return ResponseEntity.ok(new ApiDataResponse<>(true, updatedProfile, "success", HttpStatus.OK));
    }

}
