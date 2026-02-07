package com.example.skillforge.service;

import com.example.skillforge.model.entity.CourseProgress;
import com.example.skillforge.model.entity.Topic;
import com.example.skillforge.model.entity.TopicProgress;
import com.example.skillforge.repository.CourseProgressRepository;
import com.example.skillforge.repository.TopicProgressRepository;
import com.example.skillforge.repository.TopicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TopicProgressService {

    private final TopicProgressRepository topicProgressRepository;
    private final TopicRepository topicRepository;
    private final CourseProgressRepository courseProgressRepository;
    private final CourseProgressService courseProgressService;
    private final com.example.skillforge.repository.TopicMaterialProgressRepository topicMaterialProgressRepository;
    private final com.example.skillforge.repository.MaterialRepository materialRepository;

    public TopicProgressService(TopicProgressRepository topicProgressRepository,
                                TopicRepository topicRepository,
                                CourseProgressRepository courseProgressRepository, 
                                CourseProgressService courseProgressService,
                                com.example.skillforge.repository.TopicMaterialProgressRepository topicMaterialProgressRepository,
                                com.example.skillforge.repository.MaterialRepository materialRepository) {
        this.topicProgressRepository = topicProgressRepository;
        this.topicRepository = topicRepository;
        this.courseProgressRepository = courseProgressRepository;
        this.courseProgressService = courseProgressService;
        this.topicMaterialProgressRepository = topicMaterialProgressRepository;
        this.materialRepository = materialRepository;
    }

    /**
     * Mark a topic as completed for a student, and recalculate the parent course progress.
     * Returns the saved TopicProgress.
     */
    @Transactional
    public TopicProgress markTopicCompleted(Long studentId, Long topicId) {
        Optional<Topic> topicOpt = topicRepository.findById(topicId);
        if (topicOpt.isEmpty()) {
            throw new IllegalArgumentException("Topic not found: " + topicId);
        }
        Topic topic = topicOpt.get();

        TopicProgress tp = topicProgressRepository.findByStudentIdAndTopicId(studentId, topicId)
                .orElseGet(() -> {
                    TopicProgress t = new TopicProgress();
                    t.setStudentId(studentId);
                    t.setTopicId(topicId);
                    return t;
                });

        tp.setCompleted(true);
        tp.setCompletedAt(LocalDateTime.now());
        TopicProgress saved = topicProgressRepository.save(tp);

        // Recalculate course progress
        // recalcAndSaveCourseProgress(studentId, topic.getCourse().getId());
        courseProgressService.updateProgress(studentId, topic.getCourse().getId(), topicId);

        return saved;
    }

    /**
     * Recalculates the course progress percent and updates/creates CourseProgress row.
     * Logic: completed topics / total topics * 100 (rounded to nearest int).
     */
    @Transactional
    public void recalcAndSaveCourseProgress(Long studentId, Long courseId) {
        List<Topic> topics = topicRepository.findByCourseId(courseId);
        if (topics == null || topics.isEmpty()) {
            // no topics -> set 0 or 100? we set 0 to be safe
            Optional<CourseProgress> cpEmpty = courseProgressRepository.findByStudentIdAndCourseId(studentId, courseId);
            CourseProgress cp = cpEmpty.orElseGet(CourseProgress::new);
            cp.setStudentId(studentId);
            cp.setCourseId(courseId);
            cp.setProgressPercent(0);
            cp.setLastUpdated(LocalDateTime.now());
            courseProgressRepository.save(cp);
            return;
        }

        int total = topics.size();
        int completed = 0;
        Long lastCompletedTopicId = null;

        for (Topic t : topics) {
            // FIX: Check if the topic is actually COMPLETED, not just if a record exists
            Optional<TopicProgress> tpOpt = topicProgressRepository.findByStudentIdAndTopicId(studentId, t.getId());
            if (tpOpt.isPresent() && Boolean.TRUE.equals(tpOpt.get().getCompleted())) {
                completed++;
                lastCompletedTopicId = t.getId();
            }
        }

        int percent = Math.toIntExact(Math.round((completed * 100.0) / total));

        Optional<CourseProgress> cpOpt = courseProgressRepository.findByStudentIdAndCourseId(studentId, courseId);
        CourseProgress cp = cpOpt.orElseGet(CourseProgress::new);
        cp.setStudentId(studentId);
        cp.setCourseId(courseId);
        cp.setProgressPercent(percent);
        cp.setLastUpdated(LocalDateTime.now());

        // NOTE: your CourseProgress entity (as you provided) doesn't declare lastTopicId or skillScore fields.
        // If you have those fields in your entity, set them here; otherwise skip to avoid compilation errors.

        courseProgressRepository.save(cp);
    }


    @Transactional
    public TopicProgress markCompleted(Long studentId, Long topicId) {

        TopicProgress tp = topicProgressRepository
                .findByStudentIdAndTopicId(studentId, topicId)
                .orElseGet(TopicProgress::new);

        tp.setStudentId(studentId);
        tp.setTopicId(topicId);
        tp.setCompleted(true);
        tp.setCompletedAt(LocalDateTime.now());

        TopicProgress saved = topicProgressRepository.save(tp);

        // --- NEW IMPORTANT PART: update course progress ---
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        Long courseId = topic.getCourse().getId();

        // courseProgressService handles logic + lastTopicId
        courseProgressService.updateProgress(studentId, courseId, topicId);

        return saved;
    }


    /**
     * Adds seconds to topic progress. Returns updated TopicProgress.
     * This is additive and idempotent-ish for small repeats (we rely on frontend to avoid double-send).
     */
    @Transactional
    public TopicProgress addTimeToTopic(Long studentId, Long topicId, long secondsToAdd) {
        if (secondsToAdd <= 0) return topicProgressRepository
                .findByStudentIdAndTopicId(studentId, topicId)
                .orElseGet(() -> {
                    TopicProgress tp = new TopicProgress();
                    tp.setStudentId(studentId);
                    tp.setTopicId(topicId);
                    return topicProgressRepository.save(tp);
                });

        TopicProgress tp = topicProgressRepository.findByStudentIdAndTopicId(studentId, topicId)
                .orElseGet(() -> {
                    TopicProgress newTp = new TopicProgress();
                    newTp.setStudentId(studentId);
                    newTp.setTopicId(topicId);
                    newTp.setTimeSpentSeconds(0L);
                    return newTp;
                });

        tp.setTimeSpentSeconds((tp.getTimeSpentSeconds() == null ? 0L : tp.getTimeSpentSeconds()) + secondsToAdd);
        tp.setLastUpdated(LocalDateTime.now());
        return topicProgressRepository.save(tp);
    }

    public List<TopicProgress> getProgressForStudent(Long studentId) {
        return topicProgressRepository.findByStudentId(studentId);
    }

    @Transactional
    public com.example.skillforge.model.entity.TopicMaterialProgress markMaterialCompleted(Long studentId, Long materialId) {
        // 1. Find Material to get Topic
        com.example.skillforge.model.entity.Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found"));
        Long topicId = material.getTopic().getId();

        // 2. Save TopicMaterialProgress
        com.example.skillforge.model.entity.TopicMaterialProgress tmp = topicMaterialProgressRepository
                .findByStudentIdAndMaterialId(studentId, materialId)
                .orElseGet(() -> {
                    com.example.skillforge.model.entity.TopicMaterialProgress t = new com.example.skillforge.model.entity.TopicMaterialProgress();
                    t.setStudentId(studentId);
                    t.setMaterialId(materialId);
                    return t;
                });
        
        if (!Boolean.TRUE.equals(tmp.getCompleted())) {
             tmp.setCompleted(true);
             tmp.setCompletedAt(LocalDateTime.now());
             tmp = topicMaterialProgressRepository.save(tmp);
        }

        // 3. Check if ALL materials in this topic are completed
        // Get all material IDs for topic
        List<Long> allMaterialIds = materialRepository.findMaterialIdsByTopicId(topicId);
        
        // Get all completed material IDs for student & topic
        // We can optimize this query in repo, but for now:
        List<com.example.skillforge.model.entity.TopicMaterialProgress> studentProgress = 
                topicMaterialProgressRepository.findByStudentIdAndMaterialIdIn(studentId, allMaterialIds);
        
        long completedCount = studentProgress.stream().filter(p -> Boolean.TRUE.equals(p.getCompleted())).count();

        // Note: studentProgress might miss materials that haven't been started yet (so they are not in DB).
        // If completedCount == allMaterialIds.size(), then all are done.
        
        boolean allDone = (completedCount == allMaterialIds.size());
        
        if (allDone) {
            markTopicCompleted(studentId, topicId);
        }

        return tmp;
    }

    public List<com.example.skillforge.model.entity.TopicMaterialProgress> getMaterialProgressForStudent(Long studentId) {
        return topicMaterialProgressRepository.findByStudentId(studentId);
    }
}
