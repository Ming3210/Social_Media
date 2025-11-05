package ra.social_media.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ra.social_media.utils.DeviceType;

import java.time.LocalDateTime;

@Entity
@Table(name = "devices")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(name = "device_id", nullable = false, unique = true, length = 255)
    private String deviceId; // Unique device identifier

    @Column(name = "device_name", length = 255)
    private String deviceName; // e.g., "iPhone 14 Pro", "Samsung Galaxy S21"

    @Enumerated(EnumType.STRING)
    @Column(name = "device_type", nullable = false, length = 20)
    private DeviceType deviceType;

    @Column(name = "os_name", length = 100)
    private String osName; // e.g., "iOS", "Android", "Windows"

    @Column(name = "os_version", length = 50)
    private String osVersion;

    @Column(name = "app_version", length = 50)
    private String appVersion;

    @Column(name = "fcm_token", length = 500)
    private String fcmToken; // Firebase Cloud Messaging token for push notifications

    @Column(name = "last_active_at")
    private LocalDateTime lastActiveAt;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (lastActiveAt == null) {
            lastActiveAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

