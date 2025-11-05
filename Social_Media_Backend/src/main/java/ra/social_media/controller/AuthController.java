package ra.social_media.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ra.social_media.model.dto.request.UserLogin;
import ra.social_media.model.dto.request.UserRegister;
import ra.social_media.model.dto.response.ApiDataResponse;
import ra.social_media.model.dto.response.JWTResponse;
import ra.social_media.model.dto.response.UserRegisterResponse;
import ra.social_media.model.entity.User;
import ra.social_media.service.UserService;

@RestController
@RequestMapping("api/v1/auth")
public class AuthController {

    @Autowired
    private UserService userService;
    @PostMapping("/register")
    public ResponseEntity<ApiDataResponse<UserRegisterResponse>> register(@Valid @RequestBody UserRegister userRegister) {
        return new ResponseEntity<>(new ApiDataResponse<>(true, userService.register(userRegister), "success", HttpStatus.OK), HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiDataResponse<JWTResponse>> login(@Valid @RequestBody UserLogin userLogin) {
        return new ResponseEntity<>(new ApiDataResponse<>(true,userService.login(userLogin), "success",  HttpStatus.OK), HttpStatus.OK);
    }



}
