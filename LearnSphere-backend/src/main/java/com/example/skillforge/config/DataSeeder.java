package com.example.skillforge.config;

import com.example.skillforge.model.entity.User;
import com.example.skillforge.model.enums.Role;
import com.example.skillforge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.countByRole(Role.ADMIN) == 0) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("selvaraj06061974@gmail.com");
            admin.setPassword(passwordEncoder.encode("Ganesh@2006"));
            admin.setRole(Role.ADMIN);
            admin.setIsActive(true);
            admin.setVerified(true);
            userRepository.save(admin);
            System.out.println("Default Admin created: admin@learnsphere.com / admin123");
        }
    }
}
