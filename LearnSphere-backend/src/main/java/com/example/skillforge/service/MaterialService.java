package com.example.skillforge.service;

import com.example.skillforge.exception.ResourceNotFoundException;
import com.example.skillforge.model.entity.Material;
import com.example.skillforge.model.entity.Topic;
import com.example.skillforge.model.entity.MaterialAttachment;
import com.example.skillforge.model.enums.MaterialType;
import com.example.skillforge.repository.MaterialRepository;
import com.example.skillforge.repository.TopicRepository;
import com.example.skillforge.repository.MaterialAttachmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final TopicRepository topicRepository;
    private final S3StorageService s3StorageService;
    private final CourseService courseService;
    private final MaterialAttachmentRepository attachmentRepository;

    @Transactional
    public Material uploadFileMaterial(
            Long topicId,
            String title,
            String description,
            MaterialType materialType,
            MultipartFile file,
            String responsible,
            Integer durationMinutes,
            Boolean allowDownload) throws IOException {

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));

        // Upload to S3
        String fileUrl = s3StorageService.uploadFile(file, "materials");

        Material material = new Material();
        material.setTopic(topic);
        material.setTitle(title);
        material.setDescription(description);
        material.setMaterialType(materialType);
        material.setFileName(file.getOriginalFilename());
        material.setFilePath(fileUrl);
        material.setFileSize(file.getSize());
        material.setMimeType(file.getContentType());

        // Removed duplicate lines here

        material.setResponsible(responsible);
        material.setDurationMinutes(durationMinutes);
        material.setAllowDownload(allowDownload != null ? allowDownload : false);

        materialRepository.save(material);

        topic.setMaterialsCount(topic.getMaterials().size());
        topicRepository.save(topic);

        courseService.recalculateCourseDuration(topic.getCourse().getId());

        return material;
    }

    @Transactional
    public Material createLinkMaterial(Long topicId, String title, String description, String externalUrl,
            String responsible, Integer durationMinutes, Boolean allowDownload) {

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));

        Material material = new Material();
        material.setTopic(topic);
        material.setTitle(title);
        material.setDescription(description);
        material.setMaterialType(MaterialType.LINK);
        material.setExternalUrl(externalUrl);
        // Removed duplicate line here
        material.setResponsible(responsible);
        material.setDurationMinutes(durationMinutes);
        material.setAllowDownload(allowDownload != null ? allowDownload : false);

        materialRepository.save(material);

        topic.setMaterialsCount(topic.getMaterials().size());
        topicRepository.save(topic);

        courseService.recalculateCourseDuration(topic.getCourse().getId());

        return material;
    }

    public List<Material> getMaterialsByTopic(Long topicId) {

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));

        return topic.getMaterials();
    }

    @Transactional
    public void deleteMaterial(Long materialId) {

        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));

        if (material.getFilePath() != null)
            s3StorageService.deleteFile(material.getFilePath());

        Topic topic = material.getTopic();
        topic.getMaterials().remove(material);
        materialRepository.delete(material);

        topic.setMaterialsCount(topic.getMaterials().size());
        topicRepository.save(topic);

        courseService.recalculateCourseDuration(topic.getCourse().getId());
    }

    @Transactional
    public Material updateMaterial(Long id, String title, String description, MaterialType type, MultipartFile file,
            String link, String responsible, Integer durationMinutes, Boolean allowDownload) throws IOException {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));

        if (title != null)
            material.setTitle(title);
        if (description != null)
            material.setDescription(description);
        if (responsible != null)
            material.setResponsible(responsible);
        if (durationMinutes != null)
            material.setDurationMinutes(durationMinutes);
        if (allowDownload != null)
            material.setAllowDownload(allowDownload);

        if (type != null) {
            material.setMaterialType(type);
        }

        // Handle file update
        if (file != null && !file.isEmpty()) {
            // Delete old file if exists
            if (material.getFilePath() != null) {
                s3StorageService.deleteFile(material.getFilePath());
            }
            String fileUrl = s3StorageService.uploadFile(file, "materials");
            material.setFilePath(fileUrl);
            material.setFileName(file.getOriginalFilename());
            material.setFileSize(file.getSize());
            material.setMimeType(file.getContentType());
            material.setExternalUrl(null); // Clear URL if switching to file
        }

        // Handle link update
        if (link != null && !link.isEmpty()) {
            // Delete old file if exists
            if (material.getFilePath() != null) {
                s3StorageService.deleteFile(material.getFilePath());
                material.setFilePath(null);
                material.setFileName(null);
                material.setFileSize(null);
                material.setMimeType(null);
            }
            material.setExternalUrl(link);
        }

        return materialRepository.save(material);
    }

    @Transactional
    public MaterialAttachment addAttachment(Long materialId, MultipartFile file,
            String link) throws IOException {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));

        MaterialAttachment attachment = new MaterialAttachment();
        attachment.setMaterial(material);

        if (file != null && !file.isEmpty()) {
            String fileUrl = s3StorageService.uploadFile(file, "attachments");
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFileUrl(fileUrl);
            attachment.setFileSize(file.getSize());
            attachment.setMimeType(file.getContentType());
        } else if (link != null && !link.isEmpty()) {
            attachment.setExternalUrl(link);
            attachment.setFileName("External Link");
        } else {
            throw new IllegalArgumentException("Either file or link must be provided");
        }

        return attachmentRepository.save(attachment);
    }

    @Transactional
    public void deleteAttachment(Long attachmentId) {
        MaterialAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

        if (attachment.getFileUrl() != null) {
            s3StorageService.deleteFile(attachment.getFileUrl());
        }

        attachmentRepository.delete(attachment);
    }

    @Transactional
    public void updateMaterialDetails(Long materialId, String responsible, Integer duration, Boolean allowDownload) {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));

        if (responsible != null)
            material.setResponsible(responsible);
        if (duration != null)
            material.setDurationMinutes(duration);
        if (allowDownload != null)
            material.setAllowDownload(allowDownload);

        materialRepository.save(material);
    }
}
