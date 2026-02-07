package com.example.skillforge.service.impl;

import com.example.skillforge.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender emailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    @Override
    public void sendSimpleMessage(String to, String subject, String text) {
        try {
            log.info("Sending email to: {}", to);
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, true); // true = html

            emailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public void sendEnrollmentNotification(String studentEmail, String studentName, String courseTitle,
            String instructorName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(studentEmail);
            message.setSubject("Welcome to " + courseTitle + "!");

            String emailBody = String.format(
                    "Dear %s,\n\n" +
                            "Congratulations! You have been successfully enrolled in the course:\n\n" +
                            "📚 Course: %s\n" +
                            "👨‍🏫 Instructor: %s\n\n" +
                            "You can now access the course materials and start learning.\n\n" +
                            "Log in to your LearnSphere account to get started:\n" +
                            "http://localhost:5173/dashboard\n\n" +
                            "Happy Learning!\n\n" +
                            "Best regards,\n" +
                            "LearnSphere Team",
                    studentName,
                    courseTitle,
                    instructorName);

            message.setText(emailBody);
            emailSender.send(message);

            log.info("Enrollment notification sent to: {}", studentEmail);
        } catch (Exception e) {
            log.error("Failed to send enrollment notification to {}: {}", studentEmail, e.getMessage());
            // Don't throw exception - enrollment should succeed even if email fails
        }
    }

    @Override
    public void sendCourseAnnouncement(String studentEmail, String studentName, String courseTitle,
            String instructorName, String subject, String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(studentEmail);
            mailMessage.setSubject(subject);

            String emailBody = String.format(
                    "Dear %s,\n\n" +
                            "%s\n\n" +
                            "---\n" +
                            "Course: %s\n" +
                            "Instructor: %s\n\n" +
                            "Best regards,\n" +
                            "LearnSphere Team",
                    studentName,
                    message,
                    courseTitle,
                    instructorName);

            mailMessage.setText(emailBody);
            emailSender.send(mailMessage);

            log.info("Course announcement sent to: {}", studentEmail);
        } catch (Exception e) {
            log.error("Failed to send announcement to {}: {}", studentEmail, e.getMessage());
            // Don't throw exception - continue sending to other students
        }
    }
}
