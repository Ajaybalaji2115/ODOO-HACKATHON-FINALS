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

            helper.setFrom(fromEmail, "LearnSphereSystem");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, true); // true = html

            emailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send email to {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public void sendEnrollmentNotification(String studentEmail, String studentName, String courseTitle,
            String instructorName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("LearnSphereSystem <" + fromEmail + ">");
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
            mailMessage.setFrom("LearnSphereSystem <" + fromEmail + ">");
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
    @Override
    public void sendVerificationEmail(String to, String name, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("LearnSphereSystem <" + fromEmail + ">");
            message.setTo(to);
            message.setSubject("Verify Your Account - LearnSphere-Platform");
            
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "Thank you for registering with LearnSphere-Platform. Please use the verification code below to activate your account:\n\n" +
                "VERIFICATION CODE: %s\n\n" +
                "This code will expire in 15 minutes.\n\n" +
                "If you did not create an account, please ignore this email.\n\n" +
                "Best regards,\n" +
                "LearnSphere Team",
                name, code
            );
            
            message.setText(emailBody);
            emailSender.send(message);
            log.info("Verification email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send verification email");
        }
    }

    @Override
    public void sendContactAdminEmail(String instructorEmail, String instructorName, String subject, String messageContent) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("LearnSphereSystem <" + fromEmail + ">");
            // Hardcoded Admin Email for MVP
            message.setTo("selvaraj06061974@gmail.com"); 
            message.setSubject("Instructor Query: " + subject);
            
            String emailBody = String.format(
                "Dear Admin,\n\n" +
                "You have received a new message from an Instructor.\n\n" +
                "Instructor: %s (%s)\n\n" +
                "Subject: %s\n\n" +
                "Message:\n%s\n\n" +
                "---\n" +
                "LearnSphere System",
                instructorName, instructorEmail, subject, messageContent
            );
            
            message.setText(emailBody);
            emailSender.send(message);
            log.info("Contact Admin email sent from: {}", instructorEmail);
        } catch (Exception e) {
            log.error("Failed to send contact admin email from {}: {}", instructorEmail, e.getMessage());
            throw new RuntimeException("Failed to send email to admin");
        }
    }
}
