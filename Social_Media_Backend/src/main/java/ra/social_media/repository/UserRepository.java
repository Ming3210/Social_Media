package ra.social_media.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ra.social_media.model.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByPhoneNumber(String phoneNumber);

    Optional<User> findAllByPhoneNumber(String phoneNumber);

    Optional<User> findByPhoneNumberContainingIgnoreCase(String phoneNumber);

    List<User> findByPhoneNumberContaining(String phoneNumber);
}
