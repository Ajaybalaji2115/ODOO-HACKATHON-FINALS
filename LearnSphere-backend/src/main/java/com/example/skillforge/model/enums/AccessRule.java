package com.example.skillforge.model.enums;

/**
 * Enum to define who can enroll/access a course
 */
public enum AccessRule {
    OPEN, // Anyone can enroll and start learning
    ON_INVITATION, // Only invited users can enroll
    ON_PAYMENT // Users must pay to enroll
}
