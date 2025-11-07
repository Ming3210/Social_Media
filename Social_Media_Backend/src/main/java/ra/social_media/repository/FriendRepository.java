package ra.social_media.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ra.social_media.model.entity.Friend;
import ra.social_media.utils.FriendStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRepository extends JpaRepository<Friend, Friend.FriendId> {
    Optional<Friend> findByUser1IdAndUser2Id(Long user1Id, Long user2Id);
    Optional<Friend> findByUser1IdAndUser2IdAndStatus(Long user1Id, Long user2Id, FriendStatus status);
    boolean existsByUser1IdAndUser2Id(Long user1Id, Long user2Id);

    @Query("""
        SELECT f FROM Friend f
        WHERE (f.user1.id = :userId OR f.user2.id = :userId)
          AND f.status = 'ACCEPTED'
    """)
    List<Friend> findAllFriendsOfUser(@Param("userId") Long userId);

    List<Friend> findByUser2IdAndStatus(Long user2Id, FriendStatus status);

    List<Friend> findByUser1IdAndStatus(Long user1Id, FriendStatus status);

    // Lấy tất cả friend requests mà userId nhận được
    @Query("SELECT f FROM Friend f WHERE " +
            "((f.user1.id = :userId AND f.requester.id != :userId) OR " +
            "(f.user2.id = :userId AND f.requester.id != :userId)) " +
            "AND f.status = :status")
    List<Friend> findReceivedRequestsByUserIdAndStatus(@Param("userId") Long userId,
                                                       @Param("status") FriendStatus status);

    // Lấy tất cả friend requests mà userId đã gửi
    @Query("SELECT f FROM Friend f WHERE f.requester.id = :userId AND f.status = :status")
    List<Friend> findSentRequestsByUserIdAndStatus(@Param("userId") Long userId,
                                                   @Param("status") FriendStatus status);
}
