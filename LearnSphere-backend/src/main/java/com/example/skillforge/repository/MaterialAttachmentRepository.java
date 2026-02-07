package com.example.skillforge.repository;

import com.example.skillforge.model.entity.MaterialAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialAttachmentRepository extends JpaRepository<MaterialAttachment, Long> {
    List<MaterialAttachment> findByMaterialId(Long materialId);
}
