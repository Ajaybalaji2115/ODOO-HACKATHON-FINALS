package com.example.skillforge.service;

import com.example.skillforge.model.entity.Review;
import com.example.skillforge.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public List<Review> getReviewsForCourse(Long courseId) {
        return reviewRepository.findByCourseIdOrderByCreatedAtDesc(courseId);
    }

    public Review addReview(Review review) {
        // Check if already reviewed (optional, but good practice)
        Optional<Review> existing = reviewRepository.findByStudentIdAndCourseId(review.getStudentId(), review.getCourseId());
        if (existing.isPresent()) {
            throw new RuntimeException("You have already reviewed this course.");
        }
        return reviewRepository.save(review);
    }
}
