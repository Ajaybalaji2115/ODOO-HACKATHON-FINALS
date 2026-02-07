package com.example.skillforge.repository;

import com.example.skillforge.model.entity.PermanentlyDeletedUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PermanentlyDeletedUserRepository extends JpaRepository<PermanentlyDeletedUser, Long> {
    boolean existsByEmail(String email);
    Optional<PermanentlyDeletedUser> findByEmail(String email);
}
