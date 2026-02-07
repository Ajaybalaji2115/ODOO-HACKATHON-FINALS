package com.example.skillforge.dto.request;

import com.example.skillforge.model.enums.DifficultyLevel;
import com.example.skillforge.model.enums.CourseVisibility;
import com.example.skillforge.model.enums.AccessRule;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CourseRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Difficulty level is required")
    private DifficultyLevel difficultyLevel;

    private String thumbnailUrl;
    private Integer duration;

    @NotBlank(message = "Category is required")
    private String category;

    private String tags;
    private Long courseAdminUserId;

    @NotNull(message = "Visibility is required")
    private CourseVisibility visibility;

    @NotNull(message = "Access rule is required")
    private AccessRule accessRule;

    private Double price; // Optional, required only when accessRule = ON_PAYMENT

    private Boolean isPublished;
}
