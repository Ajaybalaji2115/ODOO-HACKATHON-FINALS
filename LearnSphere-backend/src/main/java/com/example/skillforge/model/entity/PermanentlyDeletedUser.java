package com.example.skillforge.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "permanently_deleted_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PermanentlyDeletedUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(nullable = false)
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        deletedAt = LocalDateTime.now();
    }
}
