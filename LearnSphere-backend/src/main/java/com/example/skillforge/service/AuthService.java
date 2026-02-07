package com.example.skillforge.service;

import com.example.skillforge.dto.request.LoginRequest;
import com.example.skillforge.dto.request.RegisterRequest;
import com.example.skillforge.dto.response.AuthResponse;
import com.example.skillforge.dto.response.RefreshTokenResponse;
import com.example.skillforge.exception.InvalidTokenException;
import com.example.skillforge.model.entity.Instructor;
import com.example.skillforge.model.entity.Student;
import com.example.skillforge.model.entity.User;
import com.example.skillforge.model.enums.Role;
import com.example.skillforge.repository.StudentRepository;
import com.example.skillforge.repository.UserRepository;
import com.example.skillforge.security.JwtService;
import com.example.skillforge.service.EmailService;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import java.io.IOException;

/**
 * \n * Service handling authentication operations: login, register, and token
 * refresh\n
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final StudentRepository studentRepository;
    private final EmailService emailService;
    private final com.example.skillforge.repository.PermanentlyDeletedUserRepository permanentlyDeletedUserRepository;
    // Inject UserActivityService
    private final UserActivityService userActivityService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Force role to STUDENT for public registration
        request.setRole(Role.STUDENT);
        return createNewUser(request);
    }

    @Transactional
    public AuthResponse createUser(RegisterRequest request) {
        // Allow any role (Admin/Instructor/Student) - controlled by Controller
        return createNewUser(request);
    }

    private String generateVerificationCode() {
        // Generate 6 digit code
        return String.valueOf(new java.util.Random().nextInt(900000) + 100000);
    }

    private AuthResponse createNewUser(RegisterRequest request) {
        if (permanentlyDeletedUserRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("This email is permanently banned from the platform.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create User
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setPhone(request.getPhone());
        user.setBio(request.getBio());
        user.setIsActive(true);
        
        // OTP Setup
        String otp = generateVerificationCode();
        user.setVerificationCode(otp);
        user.setVerificationCodeExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        user.setVerified(false);

        // Create role-specific profile with proper mapping
        if (request.getRole() == Role.STUDENT) {
            Student student = new Student();
            student.setUser(user); // Set bidirectional relationship
            user.setStudent(student);
        } else if (request.getRole() == Role.INSTRUCTOR) {
            Instructor instructor = new Instructor();
            instructor.setUser(user); // Set bidirectional relationship
            instructor.setSpecialization(request.getSpecialization());
            user.setInstructor(instructor);
        }

        // Save user (cascade will save Student/Instructor)
        user = userRepository.save(user);

        // Send OTP Email
        emailService.sendVerificationEmail(user.getEmail(), user.getName(), otp);
        
        log.info("User registered. OTP sent to: {}", user.getEmail());

        return AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .message("Account created. Please verify your email.") 
                .build();
    }

    /** \n * Authenticate user and generate JWT tokens\n */
    public AuthResponse login(LoginRequest request) {
        try {
            log.info("Login attempt for email: {}", request.getEmail());

            // Check if user exists first
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> {
                        log.error("User not found with email: {}", request.getEmail());
                        return new RuntimeException("User not found with email: " + request.getEmail());
                    });
            
            // Check Verification
            // Check Verification
            if (!user.isVerified()) {
                // Check if code is expired - if so, resend it automatically
                if (user.getVerificationCodeExpiry() == null || 
                    user.getVerificationCodeExpiry().isBefore(java.time.LocalDateTime.now())) {
                    
                    String otp = generateVerificationCode();
                    user.setVerificationCode(otp);
                    user.setVerificationCodeExpiry(java.time.LocalDateTime.now().plusMinutes(15));
                    userRepository.save(user); // Validate this save doesn't break transaction
                    
                    try {
                        emailService.sendVerificationEmail(user.getEmail(), user.getName(), otp);
                        log.info("Expired OTP regenerated and sent for user: {}", user.getEmail());
                        throw new RuntimeException("Account not verified. A new verification code has been sent to your email.");
                    } catch (Exception e) {
                        log.error("Failed to send OTP", e);
                         throw new RuntimeException("Account not verified. Failed to resend verification code.");
                    }
                }
                
                throw new RuntimeException("Account not verified. Please verify your email.");
            }

            log.info("User found: {}, attempting authentication", user.getEmail());

            // Authenticate user credentials
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String accessToken = jwtService.generateToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            Student student = studentRepository.findByUserId(user.getId()).orElse(null);

            // Log activity
            try {
                userActivityService.logActivity(user.getId());
            } catch (Exception e) {
                log.error("Failed to log activity for user: {}", user.getId(), e);
            }

            log.info("User logged in successfully: {}", user.getEmail());

            return AuthResponse.builder()
                    .token(accessToken)
                    .refreshToken(refreshToken)
                    .userId(user.getId())
                    .studentId(student != null ? student.getId() : null)
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .build();

        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            log.error("Invalid password for email: {}", request.getEmail());
            throw new RuntimeException("Invalid email or password");
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public AuthResponse googleLogin(String idToken) {
        try {
            // Verify token with Google
            OkHttpClient client = new OkHttpClient();
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;

            Request request = new Request.Builder()
                    .url(url)
                    .build();

            okhttp3.Response response = client.newCall(request).execute();
            if (!response.isSuccessful()) {
                throw new RuntimeException("Invalid Google token");
            }

            // Parse response
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(response.body().string());

            String email = jsonNode.get("email").asText();
            String name = jsonNode.get("name").asText();
            String picture = jsonNode.has("picture") ? jsonNode.get("picture").asText() : null;

            log.info("Google login attempt for email: {}", email);

            // Check if user exists
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                // Check blacklist before creating new user
                if (permanentlyDeletedUserRepository.existsByEmail(email)) {
                    throw new RuntimeException("This email is permanently banned from the platform.");
                }

                // Create new user
                user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
                user.setRole(Role.STUDENT);
                user.setProfileImage(picture);
                user.setIsActive(true);
                user.setVerified(true); // Google Login is auto-verified

                // Create student profile
                Student student = new Student();
                student.setUser(user);
                user.setStudent(student);

                user = userRepository.save(user);
                log.info("New user created via Google: {}", email);
            } else {
                 // Ensure verified if they subsequently login with Google
                 if (!user.isVerified()) {
                     user.setVerified(true);
                     userRepository.save(user);
                 }
            }

            // Generate tokens
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String accessToken = jwtService.generateToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            // Get student ID if applicable
            Long studentId = null;
            if (user.getRole() == Role.STUDENT) {
                Student student = studentRepository.findByUserId(user.getId()).orElse(null);
                if (student != null) {
                    studentId = student.getId();
                }
            }

            log.info("Google login successful for: {}", email);

            return AuthResponse.builder()
                    .token(accessToken)
                    .refreshToken(refreshToken)
                    .userId(user.getId())
                    .studentId(studentId)
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .build();

        } catch (IOException e) {
            log.error("Error verifying Google token", e);
            throw new RuntimeException("Failed to verify Google token");
        }
    }
    
    public void verifyAccount(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isVerified()) {
             throw new RuntimeException("Account already verified");
        }

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
            throw new RuntimeException("Invalid verification code");
        }

        if (user.getVerificationCodeExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Verification code expired");
        }

        user.setVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);
        userRepository.save(user);
    }
    
    public void resendVerificationCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.isVerified()) {
            throw new RuntimeException("Account already verified");
        }
        
        String otp = generateVerificationCode();
        user.setVerificationCode(otp);
        user.setVerificationCodeExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);
        
        emailService.sendVerificationEmail(user.getEmail(), user.getName(), otp);
    }

    /** \n * Refresh access token using valid refresh token\n */
    public RefreshTokenResponse refreshToken(String refreshToken) {
        try {
            // Extract username from refresh token
            String username = jwtService.extractUsername(refreshToken);

            if (username == null) {
                throw new InvalidTokenException("Invalid refresh token");
            }

            // Load user details
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Validate refresh token
            if (!jwtService.isTokenValid(refreshToken, userDetails)) {
                throw new InvalidTokenException("Invalid or expired refresh token");
            }

            // Generate new tokens
            String newAccessToken = jwtService.generateToken(userDetails);
            String newRefreshToken = jwtService.generateRefreshToken(userDetails);

            log.info("Token refreshed successfully for user: {}", username);

            return RefreshTokenResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .build();

        } catch (ExpiredJwtException e) {
            log.error("Refresh token expired");
            throw new InvalidTokenException("Refresh token has expired. Please login again.");
        } catch (Exception e) {
            log.error("Error refreshing token: {}", e.getMessage());
            throw new InvalidTokenException("Invalid refresh token");
        }
    }

    /**
     * Send password reset link to user email
     */
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        String token = java.util.UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15)); // 15 mins expiry
        userRepository.save(user);

        String resetLink = "http://localhost:5173/reset-password?token=" + token;

        // Use a simple template for the email
        String emailContent = String.format(
                "<html>" +
                        "<body>" +
                        "<h2>Reset Your Password</h2>" +
                        "<p>Hello %s,</p>" +
                        "<p>You have requested to reset your password. Click the link below to set a new password:</p>"
                        +
                        "<p><a href=\"%s\" style=\"background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;\">Reset Password</a></p>"
                        +
                        "<p>This link will expire in 15 minutes.</p>" +
                        "<p>If you didn't request this, you can safely ignore this email.</p>" +
                        "<p>Best regards,<br>LearnSphere-Platform Team</p>" +
                        "</body>" +
                        "</html>",
                user.getName(), resetLink);

        emailService.sendSimpleMessage(email, "LearnSphere-Platform - Password Reset Request", emailContent);

        log.info("Password reset email sent to: {}", email);
    }

    /**
     * Reset password using valid token
     */
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        log.info("Password reset successfully for user: {}", user.getEmail());
    }
}
