package ra.social_media.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profiles")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Profile {

    @Id
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String displayName;
    private String bio;
    private String website;
    private String location;
    private String avatarUrl;

    @Column(nullable = false)
    private boolean isPrivate = false;

    @Column(nullable = false)
    private int followersCount = 0;

    @Column(nullable = false)
    private int followingCount = 0;

    @Column(nullable = false)
    private int postsCount = 0;
}
