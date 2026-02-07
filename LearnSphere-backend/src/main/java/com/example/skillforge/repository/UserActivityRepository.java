package com.example.skillforge.repository;

import com.example.skillforge.model.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {
    Optional<UserActivity> findByUserIdAndDate(Long userId, LocalDate date);
    java.util.List<com.example.skillforge.model.UserActivity> findByUserIdAndDateBetween(Long userId, java.time.LocalDate startDate, java.time.LocalDate endDate);
    
    void deleteByUser_Id(Long userId);
    
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT ua.date FROM UserActivity ua WHERE ua.user.id = :userId")
    List<LocalDate> findActivityDatesByUserId(Long userId);
}
