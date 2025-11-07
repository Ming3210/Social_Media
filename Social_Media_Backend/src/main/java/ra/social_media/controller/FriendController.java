package ra.social_media.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ra.social_media.model.dto.response.ApiDataResponse;
import ra.social_media.model.dto.response.FriendResponse;
import ra.social_media.model.dto.response.UserSearchResponse;
import ra.social_media.service.FriendService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/friends")
public class FriendController {
    @Autowired
    private FriendService friendService;

    @GetMapping("/search")
    public ResponseEntity<ApiDataResponse<List<UserSearchResponse>>> searchFriendByPhoneNumber(
            @RequestParam(required = false, defaultValue = "") String phoneNumber) {
        List<UserSearchResponse> responses = friendService.searchFriendByPhoneNumber(phoneNumber);
        ApiDataResponse<List<UserSearchResponse>> apiResponse = new ApiDataResponse<>(
                true,
                responses,
                "Search completed successfully",
                HttpStatus.OK
        );
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/request/{receiverId}")
    public ResponseEntity<ApiDataResponse<FriendResponse>> sendFriendRequest(@PathVariable Long receiverId) {
        FriendResponse response = friendService.sendFriendRequest(receiverId);
        ApiDataResponse<FriendResponse> apiResponse = new ApiDataResponse<>(
                true,
                response,
                "Friend request sent successfully",
                HttpStatus.CREATED
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }


    @PutMapping("/accept/{requesterId}")
    public ResponseEntity<ApiDataResponse<FriendResponse>> acceptFriendRequest(@PathVariable Long requesterId) {
        FriendResponse response = friendService.acceptFriendRequest(requesterId);
        ApiDataResponse<FriendResponse> apiResponse = new ApiDataResponse<>(
                true,
                response,
                "Friend request accepted successfully",
                HttpStatus.OK
        );
        return ResponseEntity.ok(apiResponse);
    }


    @PutMapping("/reject/{requesterId}")
    public ResponseEntity<ApiDataResponse<FriendResponse>> rejectFriendRequest(@PathVariable Long requesterId) {
        FriendResponse response = friendService.rejectFriendRequest(requesterId);
        ApiDataResponse<FriendResponse> apiResponse = new ApiDataResponse<>(
                true,
                response,
                "Friend request rejected successfully",
                HttpStatus.OK
        );
        return ResponseEntity.ok(apiResponse);
    }


    @DeleteMapping("/cancel/{receiverId}")
    public ResponseEntity<ApiDataResponse<FriendResponse>> cancelFriendRequest(@PathVariable Long receiverId) {
        FriendResponse response = friendService.cancelFriendRequest(receiverId);
        ApiDataResponse<FriendResponse> apiResponse = new ApiDataResponse<>(
                true,
                response,
                "Friend request cancelled successfully",
                HttpStatus.OK
        );
        return ResponseEntity.ok(apiResponse);
    }


    @DeleteMapping("/{friendUserId}")
    public ResponseEntity<ApiDataResponse<FriendResponse>> unfriend(@PathVariable Long friendUserId) {
        FriendResponse response = friendService.unfriend(friendUserId);
        ApiDataResponse<FriendResponse> apiResponse = new ApiDataResponse<>(
                true,
                response,
                "Unfriend successfully",
                HttpStatus.OK
        );
        return ResponseEntity.ok(apiResponse);
    }



    @GetMapping("/requests/received")
    public ResponseEntity<ApiDataResponse<List<FriendResponse>>> getReceivedFriendRequests() {
        List<FriendResponse> responses = friendService.getReceivedFriendRequests();
        ApiDataResponse<List<FriendResponse>> apiResponse = new ApiDataResponse<>(
                true,
                responses,
                "Retrieved received friend requests successfully",
                HttpStatus.OK
        );
        return ResponseEntity.ok(apiResponse);
    }


    @GetMapping("/requests/sent")
    public ResponseEntity<ApiDataResponse<List<FriendResponse>>> getSentFriendRequests() {
        List<FriendResponse> responses = friendService.getSentFriendRequests();
        ApiDataResponse<List<FriendResponse>> apiResponse = new ApiDataResponse<>(
                true,
                responses,
                "Retrieved sent friend requests successfully",
                HttpStatus.OK
        );
        return ResponseEntity.ok(apiResponse);
    }

}
