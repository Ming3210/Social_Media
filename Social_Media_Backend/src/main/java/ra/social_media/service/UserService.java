package ra.social_media.service;

import ra.social_media.model.dto.request.UserLogin;
import ra.social_media.model.dto.request.UserRegister;
import ra.social_media.model.dto.response.JWTResponse;
import ra.social_media.model.dto.response.UserRegisterResponse;
import ra.social_media.model.entity.User;

import java.util.List;

public interface UserService {
    UserRegisterResponse register(UserRegister userRegister);

    JWTResponse login(UserLogin userLogin);

    List<User> getAllUsers();

    User getUserByUsername(String username);
}
