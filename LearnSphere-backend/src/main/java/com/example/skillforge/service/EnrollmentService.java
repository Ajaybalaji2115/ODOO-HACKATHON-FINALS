
package com.example.skillforge.service;

import com.example.skillforge.dto.response.EnrollmentResponse;
import com.example.skillforge.model.entity.Course;
import com.example.skillforge.model.entity.Enrollment;
import com.example.skillforge.model.entity.Student;
import com.example.skillforge.repository.CourseRepository;
import com.example.skillforge.repository.EnrollmentRepository;
import com.example.skillforge.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.skillforge.model.entity.CourseProgress;
import com.example.skillforge.model.entity.User;
import com.example.skillforge.repository.CourseProgressRepository;
import com.example.skillforge.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

        private final EnrollmentRepository enrollmentRepository;
        private final StudentRepository studentRepository;
        private final CourseRepository courseRepository;
        private final CourseProgressRepository courseProgressRepository;
        private final UserRepository userRepository;
        private final EmailService emailService;

        /**
         * Enroll a student in a course
         */
        @Transactional
        public Enrollment enrollStudent(Long studentId, Long courseId) {

                if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
                        throw new RuntimeException("Student is already enrolled in this course");
                }

                Student student = studentRepository.findByUserId(studentId)
                                .orElseThrow(() -> new RuntimeException("Student not found"));

                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new RuntimeException("Course not found"));

                Enrollment enrollment = new Enrollment();
                enrollment.setStudent(student);
                enrollment.setCourse(course);
                enrollment.setCompletionPercentage(0);
                enrollment.setIsCompleted(false);
                enrollment.setEnrolledAt(LocalDateTime.now());
                enrollment.setLastAccessedAt(LocalDateTime.now());

                enrollment = enrollmentRepository.save(enrollment);

                course.setTotalEnrollments(course.getTotalEnrollments() + 1);
                courseRepository.save(course);

                student.setCoursesEnrolled(student.getCoursesEnrolled() + 1);
                studentRepository.save(student);

                // Initialize Course Progress for Dashboard Sync
                if (!courseProgressRepository.findByStudentIdAndCourseId(student.getId(), course.getId()).isPresent()) {
                        CourseProgress cp = new CourseProgress();
                        cp.setStudentId(student.getId());
                        cp.setCourseId(course.getId());
                        cp.setProgressPercent(0);

                        // Initialize optional fields to defaults
                        cp.setTotalTimeMinutes(0);
                        cp.setSkillScore(0);
                        cp.setLastTopicId(null);

                        cp.setLastUpdated(LocalDateTime.now());
                        courseProgressRepository.save(cp);
                }

                return enrollment;
        }

        /**
         * Get all enrollments for a student
         */
        public List<EnrollmentResponse> getStudentEnrollments(Long userId) {

                Student student = studentRepository.findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException("Student not found"));

                List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());

                return enrollments.stream()
                                .map(e -> EnrollmentResponse.builder()
                                                .id(e.getId())
                                                .courseId(e.getCourse().getId()) // ⭐ Important
                                                .studentId(e.getStudent().getId()) // ⭐ Important
                                                .courseTitle(e.getCourse().getTitle())
                                                .instructorName(e.getCourse().getInstructor().getUser().getName())
                                                .completionPercentage(e.getCompletionPercentage())
                                                .isCompleted(e.getIsCompleted())
                                                .enrolledAt(e.getEnrolledAt())
                                                .completedAt(e.getCompletedAt())
                                                .lastAccessedAt(e.getLastAccessedAt())
                                                .build())
                                .toList();
        }

        /**
         * Get enrollment by student + course
         */
        public EnrollmentResponse getEnrollment(Long userId, Long courseId) {

                Student student = studentRepository.findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException("Student not found"));

                Enrollment e = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

                return EnrollmentResponse.builder()
                                .id(e.getId())
                                .courseId(e.getCourse().getId())
                                .studentId(e.getStudent().getId())
                                .courseTitle(e.getCourse().getTitle())
                                .instructorName(e.getCourse().getInstructor().getUser().getName())
                                .completionPercentage(e.getCompletionPercentage())
                                .isCompleted(e.getIsCompleted())
                                .enrolledAt(e.getEnrolledAt())
                                .completedAt(e.getCompletedAt())
                                .lastAccessedAt(e.getLastAccessedAt())
                                .build();
        }

        /**
         * Update progress
         */
        @Transactional
        public EnrollmentResponse updateProgress(Long userId, Long courseId, Integer completionPercentage) {

                EnrollmentResponse existing = getEnrollment(userId, courseId);

                Enrollment enrollment = enrollmentRepository.findById(existing.getId())
                                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

                enrollment.setCompletionPercentage(completionPercentage);
                enrollment.setLastAccessedAt(LocalDateTime.now());

                if (completionPercentage >= 100) {
                        enrollment.setIsCompleted(true);
                        enrollment.setCompletedAt(LocalDateTime.now());
                }

                enrollmentRepository.save(enrollment);

                return getEnrollment(userId, courseId);
        }

        /**
         * Unenroll a student
         */
        @Transactional
        public void unenrollStudent(Long userId, Long courseId) {

                Student student = studentRepository.findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException("Student not found"));

                Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new RuntimeException("Course not found"));

                enrollmentRepository.delete(enrollment);

                course.setTotalEnrollments(Math.max(0, course.getTotalEnrollments() - 1));
                courseRepository.save(course);

                student.setCoursesEnrolled(Math.max(0, student.getCoursesEnrolled() - 1));
                studentRepository.save(student);
        }

        /**
         * Check if enrolled
         */
        public boolean isEnrolled(Long studentId, Long courseId) {
                return enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId);
        }

        /**
         * Get enrollments for a course
         */
        public List<EnrollmentResponse> getCourseEnrollments(Long courseId) {

                List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);

                return enrollments.stream()
                                .map(e -> EnrollmentResponse.builder()
                                                .id(e.getId())
                                                .courseId(e.getCourse().getId())
                                                .studentId(e.getStudent().getId())
                                                .courseTitle(e.getCourse().getTitle())
                                                .instructorName(e.getCourse().getInstructor().getUser().getName())
                                                .completionPercentage(e.getCompletionPercentage())
                                                .isCompleted(e.getIsCompleted())
                                                .enrolledAt(e.getEnrolledAt())
                                                .completedAt(e.getCompletedAt())
                                                .lastAccessedAt(e.getLastAccessedAt())
                                                .build())
                                .toList();
        }

        /**
         * Bulk enroll students by email
         */
        @Transactional
        public Map<String, Object> bulkEnrollByEmail(Long courseId, List<String> emails) {
                Map<String, Object> result = new HashMap<>();
                List<String> successfulEnrollments = new ArrayList<>();
                List<String> failedEnrollments = new ArrayList<>();

                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new RuntimeException("Course not found"));

                for (String email : emails) {
                        try {
                                // Find user by email
                                User user = userRepository.findByEmail(email.trim())
                                                .orElseThrow(() -> new RuntimeException("User not found: " + email));

                                // Check if user is a student
                                Student student = studentRepository.findByUserId(user.getId())
                                                .orElseThrow(() -> new RuntimeException(
                                                                "User is not a student: " + email));

                                // Check if already enrolled
                                if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
                                        failedEnrollments.add(email + " (already enrolled)");
                                        continue;
                                }

                                // Enroll the student
                                Enrollment enrollment = new Enrollment();
                                enrollment.setStudent(student);
                                enrollment.setCourse(course);
                                enrollment.setCompletionPercentage(0);
                                enrollment.setIsCompleted(false);
                                enrollment.setEnrolledAt(LocalDateTime.now());
                                enrollment.setLastAccessedAt(LocalDateTime.now());
                                enrollmentRepository.save(enrollment);

                                // Update course enrollment count
                                course.setTotalEnrollments(course.getTotalEnrollments() + 1);

                                // Update student stats
                                student.setCoursesEnrolled(student.getCoursesEnrolled() + 1);
                                studentRepository.save(student);

                                // Initialize Course Progress
                                if (!courseProgressRepository
                                                .findByStudentIdAndCourseId(student.getId(), course.getId())
                                                .isPresent()) {
                                        CourseProgress cp = new CourseProgress();
                                        cp.setStudentId(student.getId());
                                        cp.setCourseId(course.getId());
                                        cp.setProgressPercent(0);
                                        cp.setTotalTimeMinutes(0);
                                        cp.setSkillScore(0);
                                        cp.setLastTopicId(null);
                                        cp.setLastUpdated(LocalDateTime.now());
                                        courseProgressRepository.save(cp);
                                }

                                // Send enrollment notification email
                                try {
                                        emailService.sendEnrollmentNotification(
                                                        user.getEmail(),
                                                        user.getName(),
                                                        course.getTitle(),
                                                        course.getInstructor().getUser().getName());
                                } catch (Exception emailEx) {
                                        System.err.println("Failed to send email to " + email + ": "
                                                        + emailEx.getMessage());
                                        // Continue even if email fails
                                }

                                successfulEnrollments.add(email);
                        } catch (Exception e) {
                                failedEnrollments.add(email + " (" + e.getMessage() + ")");
                        }
                }

                // Save course with updated enrollment count
                courseRepository.save(course);

                result.put("success", true);
                result.put("totalProcessed", emails.size());
                result.put("successCount", successfulEnrollments.size());
                result.put("failedCount", failedEnrollments.size());
                result.put("successfulEnrollments", successfulEnrollments);
                result.put("failedEnrollments", failedEnrollments);
                result.put("message", String.format("Enrolled %d out of %d students",
                                successfulEnrollments.size(), emails.size()));

                return result;
        }

        /**
         * Contact all enrolled students in a course
         */
        @Transactional(readOnly = true)
        public Map<String, Object> contactCourseAttendees(Long courseId, String subject, String message) {
                Map<String, Object> result = new HashMap<>();
                List<String> successfulEmails = new ArrayList<>();
                List<String> failedEmails = new ArrayList<>();

                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new RuntimeException("Course not found"));

                // Get all enrollments for this course
                List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);

                if (enrollments.isEmpty()) {
                        result.put("success", false);
                        result.put("message", "No students enrolled in this course");
                        return result;
                }

                String instructorName = course.getInstructor().getUser().getName();
                String courseTitle = course.getTitle();

                for (Enrollment enrollment : enrollments) {
                        try {
                                Student student = enrollment.getStudent();
                                User user = student.getUser();

                                emailService.sendCourseAnnouncement(
                                                user.getEmail(),
                                                user.getName(),
                                                courseTitle,
                                                instructorName,
                                                subject,
                                                message);

                                successfulEmails.add(user.getEmail());
                        } catch (Exception e) {
                                failedEmails.add(enrollment.getStudent().getUser().getEmail() + " (" + e.getMessage()
                                                + ")");
                        }
                }

                result.put("success", true);
                result.put("totalStudents", enrollments.size());
                result.put("successCount", successfulEmails.size());
                result.put("failedCount", failedEmails.size());
                result.put("successfulEmails", successfulEmails);
                result.put("failedEmails", failedEmails);
                result.put("message", String.format("Email sent to %d out of %d students",
                                successfulEmails.size(), enrollments.size()));

                return result;
        }
}
