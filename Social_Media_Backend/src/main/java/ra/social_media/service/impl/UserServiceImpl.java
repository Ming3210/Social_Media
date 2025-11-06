package ra.social_media.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ra.social_media.exception.HttpConflict;
import ra.social_media.exception.HttpUnAuthorized;
import ra.social_media.model.dto.request.UserLogin;
import ra.social_media.model.dto.request.UserRegister;
import ra.social_media.model.dto.response.JWTResponse;
import ra.social_media.model.dto.response.UserRegisterResponse;
import ra.social_media.model.entity.Profile;
import ra.social_media.model.entity.User;
import ra.social_media.repository.ProfileRepository;
import ra.social_media.repository.UserRepository;
import ra.social_media.security.jwt.JWTAuthFilter;
import ra.social_media.security.jwt.JWTProvider;
import ra.social_media.security.principal.UserPrincipal;
import ra.social_media.service.UserService;
import ra.social_media.model.entity.Profile;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JWTAuthFilter jWTAuthFilter;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private JWTProvider jwtProvider;

    @Autowired
    private AuthenticationManager authenticationManager;



    @Override
    public UserRegisterResponse register(UserRegister userRegister) {
        if(userRepository.findByUsername(userRegister.getUsername()).isPresent()) {
            throw new HttpConflict("Tên đăng nhập đã tồn tại");
        }
        if(userRepository.findByEmail(userRegister.getEmail()).isPresent()) {
            throw new HttpConflict("Email đã tồn tại");
        }
        User user = User.builder()
                .username(userRegister.getUsername())
                .passwordHash(passwordEncoder.encode(userRegister.getPassword()))
                .fullName(userRegister.getFullName())
                .email(userRegister.getEmail())
                .status(true)
                .phoneNumber(userRegister.getPhoneNumber())
                .createdAt(Instant.now())
                .lastSeenAt(Instant.now())
                .build();

        User savedUser = userRepository.save(user);

        Profile newProfile = Profile.builder()
                .user(savedUser)
                .bio("Chưa cập nhật")
                .displayName(userRegister.getUsername())
                .avatarUrl("https://static.vecteezy.com/system/resources/previews/036/280/651/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg")
                .location("Chưa cập nhật")
                .postsCount(0)
                .followersCount(0)
                .isPrivate(false)
                .location("Chưa cập nhật")
                .website("Chưa cập nhật")
                .id(savedUser.getId())
                .displayName(userRegister.getUsername())
                .build();

        profileRepository.save(newProfile);

        String accessToken = jwtProvider.generateAccessToken(savedUser.getUsername());
        String refreshToken = jwtProvider.generateRefreshToken(savedUser.getUsername());

        return UserRegisterResponse.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .status(savedUser.getStatus())
                .createdAt(savedUser.getCreatedAt())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }


    @Override
    public JWTResponse login(UserLogin userLogin) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userLogin.getLogin(), userLogin.getPassword())
            );

        } catch (AuthenticationException e) {
            throw new RuntimeException("Tên đăng nhập hoặc mật khẩu không đúng");
        }

        UserPrincipal user = (UserPrincipal) authentication.getPrincipal();
        String token = jwtProvider.generateAccessToken(user.getUsername());
        String refreshToken = jwtProvider.generateRefreshToken(user.getUsername());

        return JWTResponse.builder()
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .isActive(true)
                .accessToken(token)
                .refreshToken(refreshToken)
                .build();    }

    @Override
    public List<User> getAllUsers() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new HttpUnAuthorized("User not authenticated");
        }

        User currentUser = getUserByUsername(userPrincipal.getUsername());
        Long currentUserId = currentUser.getId();

        List<User> matchedUsers;


        matchedUsers = userRepository.findAll();

        matchedUsers = matchedUsers.stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .toList();

        return matchedUsers;

    }


    @Override
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

    }
}
