package com.example.skillforge.controller;

import com.example.skillforge.dto.request.CourseRequest;
import com.example.skillforge.dto.response.ApiResponse;
import com.example.skillforge.dto.response.CourseResponse;
import com.example.skillforge.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final com.example.skillforge.service.AdaptiveLearningService adaptiveLearningService;
    private final com.example.skillforge.service.CourseRecommendationService courseRecommendationService;

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(
            @Valid @RequestBody CourseRequest request,
            @RequestParam Long instructorId) {
        CourseResponse course = courseService.createCourse(request, instructorId);
        return ResponseEntity.ok(ApiResponse.success("Course created successfully", course));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourse(
            @PathVariable Long id,
            @RequestParam(required = false) Long studentId) {
        CourseResponse course = courseService.getCourseById(id, studentId);
        return ResponseEntity.ok(ApiResponse.success("Course retrieved", course));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String durationRange,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Boolean published,
            @RequestParam(required = false) Long instructorId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Courses retrieved",
                        courseService.getAllCourses(
                                page, size, sortBy, direction,
                                difficulty, durationRange,
                                search, studentId, published, instructorId)));
    }

    @GetMapping("/published")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getPublishedCourses(
            @RequestParam(required = false) Long studentId) {
        List<CourseResponse> courses = courseService.getPublishedCourses(studentId);
        return ResponseEntity.ok(ApiResponse.success("Published courses retrieved", courses));
    }

    @GetMapping("/instructor/{instructorId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getInstructorCourses(
            @PathVariable Long instructorId) {
        List<CourseResponse> courses = courseService.getCoursesByInstructor(instructorId);
        return ResponseEntity.ok(ApiResponse.success("Instructor courses retrieved", courses));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request) {
        CourseResponse course = courseService.updateCourse(id, request);
        return ResponseEntity.ok(ApiResponse.success("Course updated successfully", course));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Boolean>> publishCourse(@PathVariable Long id) {
        boolean isPublished = courseService.togglePublish(id);
        String message = isPublished ? "Course published successfully" : "Course unpublished successfully";
        return ResponseEntity.ok(ApiResponse.success(message, isPublished));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.success("Course deleted successfully", null));
    }

    @PostMapping("/{id}/view")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> incrementViewCount(@PathVariable Long id) {
        courseService.incrementViewCount(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Upload course thumbnail image
     */
    @PostMapping("/{id}/upload-image")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, String>> uploadCourseImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Please select a file to upload");
                return ResponseEntity.badRequest().body(error);
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Only image files are allowed");
                return ResponseEntity.badRequest().body(error);
            }

            // Validate file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "File size must be less than 5MB");
                return ResponseEntity.badRequest().body(error);
            }

            // Upload to S3 and get URL
            String imageUrl = courseService.uploadCourseImage(id, file);

            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("message", "Image uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // Log full stack trace
            System.err.println("Error uploading image: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage() != null ? e.getMessage() : "Unknown error occurred");
            return ResponseEntity.badRequest().body(error);
        }
    }

    // --- Adaptive Learning & Recommendations ---

    @GetMapping("/{courseId}/next-step")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<com.example.skillforge.dto.response.TopicRecommendationResponse>> getNextStep(
            @PathVariable Long courseId,
            @RequestParam Long studentId) {
        // Return Topic with potentially specialized message based on progress
        return ResponseEntity.ok(ApiResponse.success(
                "Next step calculated",
                adaptiveLearningService.recommendNextTopic(studentId, courseId)));
    }

    @GetMapping("/{courseId}/recommendation")
    public ResponseEntity<ApiResponse<CourseResponse>> getNextCourseRecommendation(
            @PathVariable Long courseId,
            @RequestParam(required = false) Long studentId) {
        com.example.skillforge.model.entity.Course nextCourse = courseRecommendationService
                .recommendNextCourse(courseId, studentId);
        if (nextCourse == null) {
            return ResponseEntity.ok(ApiResponse.success("No specific recommendation found", null));
        }
        // Map to response (simplified mapping here, ideally use mapper)
        CourseResponse response = mapToResponse(nextCourse);
        return ResponseEntity.ok(ApiResponse.success("Next course recommendation", response));
    }

    @GetMapping("/potential-admins")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<java.util.List<java.util.Map<String, Object>>>> getPotentialCourseAdmins() {
        return ResponseEntity
                .ok(ApiResponse.success("Potential admins retrieved", courseService.getPotentialCourseAdmins()));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getDashboardRecommendations(@RequestParam Long studentId) {
        List<com.example.skillforge.model.entity.Course> courses = courseRecommendationService
                .recommendCoursesForDashboard(studentId);
        List<CourseResponse> response = courses.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Recommended courses", response));
    }

    private CourseResponse mapToResponse(com.example.skillforge.model.entity.Course course) {
        // Simple manual mapping or use existing mapper
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .difficultyLevel(course.getDifficultyLevel())
                .thumbnailUrl(course.getThumbnailUrl())
                // .instructorName(...) - skip complex fields for now or fetch properly
                .build();
    }
}
