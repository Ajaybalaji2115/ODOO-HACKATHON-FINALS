package com.example.skillforge.service;

public interface EmailService {
    void sendSimpleMessage(String to, String subject, String text);

    void sendEnrollmentNotification(String studentEmail, String studentName, String courseTitle, String instructorName);

    void sendCourseAnnouncement(String studentEmail, String studentName, String courseTitle, String instructorName,
            String subject, String message);

    void sendVerificationEmail(String to, String name, String code);
    
    void sendContactAdminEmail(String instructorEmail, String instructorName, String subject, String message);
}
