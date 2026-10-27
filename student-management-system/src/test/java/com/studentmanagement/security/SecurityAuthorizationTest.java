package com.studentmanagement.security;

import com.studentmanagement.dto.AttendanceSummaryResponse;
import com.studentmanagement.entity.Role;
import com.studentmanagement.entity.Student;
import com.studentmanagement.entity.User;
import com.studentmanagement.repository.StudentRepository;
import com.studentmanagement.repository.UserRepository;
import com.studentmanagement.security.jwt.JwtUtils;
import com.studentmanagement.security.services.UserDetailsImpl;
import com.studentmanagement.service.AttendanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "app.jwt.secret=TestSecretKeyForJwtSigningMustBeAtLeast256BitsLong2026!",
        "app.jwt.expiration-ms=3600000",
        "app.cors.allowed-origins=http://localhost:5173",
        "app.data-initializer.enabled=false",
        "spring.datasource.url=jdbc:h2:mem:securitytest;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class SecurityAuthorizationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @MockitoBean
    private AttendanceService attendanceService;

    private String studentToken;
    private String adminToken;
    private Long authenticatedStudentId;
    private Long anotherStudentId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        studentRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Seed admin user in database
        User adminUser = new User("admin", "admin@studentmanagement.com", "encodedPassword", Role.ROLE_ADMIN);
        userRepository.save(adminUser);

        UserDetailsImpl adminDetails = new UserDetailsImpl(
                adminUser.getId(),
                adminUser.getUsername(),
                adminUser.getEmail(),
                adminUser.getPassword(),
                true,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
        UsernamePasswordAuthenticationToken adminAuth = new UsernamePasswordAuthenticationToken(
                adminDetails, null, adminDetails.getAuthorities()
        );
        adminToken = "Bearer " + jwtUtils.generateJwtToken(adminAuth);

        // 2. Seed student user & record in database
        User studentUser = new User("student1", "student1@college.edu", "encodedPassword", Role.ROLE_STUDENT);
        userRepository.save(studentUser);

        Student student1 = new Student("Alice Student", "student1@college.edu", "CSE", 2);
        student1.setUser(studentUser);
        student1 = studentRepository.save(student1);
        authenticatedStudentId = student1.getId();

        // Seed another student without user account to test private record isolation
        Student student2 = new Student("Bob Student", "student2@college.edu", "ECE", 3);
        student2 = studentRepository.save(student2);
        anotherStudentId = student2.getId();

        UserDetailsImpl studentDetails = new UserDetailsImpl(
                studentUser.getId(),
                studentUser.getUsername(),
                studentUser.getEmail(),
                studentUser.getPassword(),
                true,
                authenticatedStudentId,
                List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );
        UsernamePasswordAuthenticationToken studentAuth = new UsernamePasswordAuthenticationToken(
                studentDetails, null, studentDetails.getAuthorities()
        );
        studentToken = "Bearer " + jwtUtils.generateJwtToken(studentAuth);
    }

    @Test
    @DisplayName("Unauthenticated request to protected endpoints is rejected with 401")
    void unauthenticatedRequest_rejected() throws Exception {
        mockMvc.perform(get("/api/students"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/reports/summary"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/student-portal/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Student cannot access student management admin endpoints (403 Forbidden)")
    void student_cannotAccessStudentManagement() throws Exception {
        mockMvc.perform(get("/api/students")
                        .header("Authorization", studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/students/" + authenticatedStudentId)
                        .header("Authorization", studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/students")
                        .header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Hacker\",\"email\":\"hacker@test.com\",\"department\":\"CSE\",\"year\":2}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/students/" + authenticatedStudentId)
                        .header("Authorization", studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Student cannot access institutional reports (403 Forbidden)")
    void student_cannotAccessReports() throws Exception {
        mockMvc.perform(get("/api/reports/summary")
                        .header("Authorization", studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/reports/department-stats")
                        .header("Authorization", studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/reports/students/csv")
                        .header("Authorization", studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Student cannot access marks management admin endpoints (403 Forbidden)")
    void student_cannotAccessMarksManagement() throws Exception {
        mockMvc.perform(get("/api/marks")
                        .header("Authorization", studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/marks?studentId=" + authenticatedStudentId)
                        .header("Authorization", studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Student cannot access global attendance records (403 Forbidden)")
    void student_cannotAccessGlobalAttendance() throws Exception {
        mockMvc.perform(get("/api/attendance")
                        .header("Authorization", studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/attendance")
                        .header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"studentId\":" + authenticatedStudentId + ",\"subjectId\":1,\"status\":\"PRESENT\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Student cannot view another student's attendance summary (403 Forbidden)")
    void student_cannotViewAnotherStudentAttendanceSummary() throws Exception {
        // Attempting to query another student's attendance summary
        mockMvc.perform(get("/api/attendance/summary/" + anotherStudentId)
                        .header("Authorization", studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Student CAN view their own attendance summary (200 OK)")
    void student_canViewOwnAttendanceSummary() throws Exception {
        AttendanceSummaryResponse summary = new AttendanceSummaryResponse(
                authenticatedStudentId, "Alice Student", 20L, 18L, 2L, 0L, 90.0
        );
        when(attendanceService.getStudentAttendanceSummary(eq(authenticatedStudentId))).thenReturn(summary);

        mockMvc.perform(get("/api/attendance/summary/" + authenticatedStudentId)
                        .header("Authorization", studentToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Student cannot modify subjects or departments (403 Forbidden)")
    void student_cannotModifyCurriculum() throws Exception {
        mockMvc.perform(post("/api/departments")
                        .header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"BIO\",\"name\":\"Biotech\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/subjects")
                        .header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"BI101\",\"title\":\"Intro Bio\",\"credits\":3}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Student cannot provision student login accounts (403 Forbidden)")
    void student_cannotCreateStudentAccounts() throws Exception {
        mockMvc.perform(post("/api/auth/students/" + anotherStudentId + "/create-account")
                        .header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"newuser\",\"password\":\"Pass@123\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin CAN access student management and reports (200 OK)")
    void admin_canAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/students")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/reports/summary")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk());

        AttendanceSummaryResponse summary = new AttendanceSummaryResponse(
                anotherStudentId, "Bob Student", 20L, 18L, 2L, 0L, 90.0
        );
        when(attendanceService.getStudentAttendanceSummary(eq(anotherStudentId))).thenReturn(summary);

        mockMvc.perform(get("/api/attendance/summary/" + anotherStudentId)
                        .header("Authorization", adminToken))
                .andExpect(status().isOk());
    }
}
