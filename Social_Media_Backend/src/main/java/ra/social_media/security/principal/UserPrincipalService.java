package ra.social_media.security.principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import ra.social_media.model.entity.User;
import ra.social_media.repository.UserRepository;

@Service
public class UserPrincipalService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String loginInput) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(loginInput)
                .orElseGet(() -> userRepository.findByEmail(loginInput)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + loginInput))
                );

        return UserPrincipal.builder()
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .isActive(user.getStatus())
                .build();
    }
}
