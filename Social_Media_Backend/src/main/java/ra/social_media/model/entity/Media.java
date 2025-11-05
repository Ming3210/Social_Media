package ra.social_media.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ra.social_media.utils.MediaType;

import java.time.LocalDateTime;

@Entity
@Table(name = "media")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @ManyToOne
    @JoinColumn(name = "post_id", insertable = false, updatable = false)
    private Post post;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    @Column(name = "media_type", nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private MediaType mediaType;

    private Integer width;

    private Integer height;

    @Column(name = "order_in_post", nullable = false)
    private int orderInPost;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
};