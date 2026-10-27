package com.studentmanagement.config;

import com.studentmanagement.entity.Department;
import com.studentmanagement.entity.Role;
import com.studentmanagement.entity.Subject;
import com.studentmanagement.entity.User;
import com.studentmanagement.repository.DepartmentRepository;
import com.studentmanagement.repository.SubjectRepository;
import com.studentmanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
        name = "app.data-initializer.enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Value("${app.admin.email:admin@studentmanagement.com}")
    private String adminEmail;

    @Value("${app.admin.default-password:Admin@123}")
    private String defaultAdminPassword;

    @Value("${app.admin.sync-password-from-env:false}")
    private boolean syncPasswordFromEnv;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private org.springframework.core.env.Environment environment;

    public DataInitializer(UserRepository userRepository,
                           DepartmentRepository departmentRepository,
                           SubjectRepository subjectRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.subjectRepository = subjectRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (environment != null) {
            boolean isProd = java.util.Arrays.stream(environment.getActiveProfiles())
                    .anyMatch(p -> p.equalsIgnoreCase("prod") || p.equalsIgnoreCase("production"));
            if (isProd && "Admin@123".equals(defaultAdminPassword)) {
                logger.error("CRITICAL SECURITY RISK: Running with default admin password 'Admin@123' in production! Configure ADMIN_PASSWORD environment variable immediately!");
            }
        }

        // 1. Initialize admin user if absent, or sync password from environment if configured
        userRepository.findByUsername(adminUsername).ifPresentOrElse(
                admin -> {
                    if (syncPasswordFromEnv && !passwordEncoder.matches(defaultAdminPassword, admin.getPassword())) {
                        admin.setPassword(passwordEncoder.encode(defaultAdminPassword));
                        userRepository.save(admin);
                        logger.info("Admin password synchronized with configured environment credential.");
                    }
                },
                () -> {
                    User admin = new User(
                            adminUsername,
                            adminEmail,
                            passwordEncoder.encode(defaultAdminPassword),
                            Role.ROLE_ADMIN
                    );
                    userRepository.save(admin);
                    logger.info("==================================================");
                    logger.info("Admin account initialized successfully!");
                    logger.info("Username: {}", adminUsername);
                    logger.info("Email: {}", adminEmail);
                    logger.info("==================================================");
                }
        );

        // 2. Initialize default departments if none exist
        if (departmentRepository.count() == 0) {
            Department cse = departmentRepository.save(new Department("CSE", "Computer Science & Engineering", "Computing, Software and Systems"));
            Department ece = departmentRepository.save(new Department("ECE", "Electronics & Communication Engineering", "Hardware, Communications and Embedded"));
            Department mech = departmentRepository.save(new Department("MECH", "Mechanical Engineering", "Mechanics, Design and Manufacturing"));
            Department civil = departmentRepository.save(new Department("CIVIL", "Civil Engineering", "Structures, Infrastructure and Planning"));

            // 3. Initialize foundational subjects
            subjectRepository.saveAll(List.of(
                    new Subject("CS101", "Data Structures & Algorithms", 4, 2, "CSE", cse),
                    new Subject("CS102", "Database Management Systems", 3, 3, "CSE", cse),
                    new Subject("CS103", "Operating Systems", 3, 4, "CSE", cse),
                    new Subject("CS104", "Computer Networks", 3, 4, "CSE", cse),
                    new Subject("EC101", "Digital Logic Design", 4, 2, "ECE", ece),
                    new Subject("EC102", "Signals and Systems", 3, 3, "ECE", ece),
                    new Subject("ME101", "Thermodynamics", 4, 2, "MECH", mech),
                    new Subject("CE101", "Fluid Mechanics", 3, 2, "CIVIL", civil)
            ));

            logger.info("Default departments and foundational subjects seeded successfully!");
        }
    }
}
