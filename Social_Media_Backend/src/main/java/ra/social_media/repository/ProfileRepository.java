package ra.social_media.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ra.social_media.model.entity.Profile;
import ra.social_media.model.entity.User;

import java.util.Optional;
@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    Optional<Profile> findByDisplayName(String displayName);

    Optional<Profile> findByUser_Username(String userUsername);

    Optional<Profile> findByUserId(Long userId);
}
