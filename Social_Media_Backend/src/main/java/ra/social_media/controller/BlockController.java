package ra.social_media.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ra.social_media.model.dto.response.ApiDataResponse;
import ra.social_media.model.dto.response.BlockResponse;
import ra.social_media.service.BlockService;

import java.util.List;

@RestController
@RequestMapping("api/v1/block")
public class BlockController {

    @Autowired
    private BlockService blockService;

    @PostMapping("/block/{userId}")
    public ResponseEntity<ApiDataResponse<BlockResponse>> blockUser(@PathVariable Long userId) {
        BlockResponse response = blockService.blockUser(userId);
        ApiDataResponse<BlockResponse> apiResponse = new ApiDataResponse<>(
                true,
                response,
                "User blocked successfully",
                HttpStatus.OK
        );
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/unblock/{userId}")
    public ResponseEntity<ApiDataResponse<BlockResponse>> unblockUser(@PathVariable Long userId) {
        BlockResponse response = blockService.unblockUser(userId);
        ApiDataResponse<BlockResponse> apiResponse = new ApiDataResponse<>(
                true,
                response,
                "User unblocked successfully",
                HttpStatus.OK
        );
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/blocked")
    public ResponseEntity<ApiDataResponse<List<BlockResponse>>> getBlockedUsers() {
        List<BlockResponse> responses = blockService.getBlockedUsers();
        ApiDataResponse<List<BlockResponse>> apiResponse = new ApiDataResponse<>(
                true,
                responses,
                "Retrieved blocked users successfully",
                HttpStatus.OK
        );
        return ResponseEntity.ok(apiResponse);
    }
}
