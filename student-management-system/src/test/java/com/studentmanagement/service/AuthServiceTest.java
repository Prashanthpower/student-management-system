package com.studentmanagement.service;

import com.studentmanagement.dto.*;
import com.studentmanagement.entity.Role;
import com.studentmanagement.entity.Student;
import com.studentmanagement.entity.User;
import com.studentmanagement.repository.StudentRepository;
import com.studentmanagement.repository.UserRepository;
import com.studentmanagement.security.jwt.JwtUtils;
import com.studentmanagement.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(authenticationManager, userRepository, studentRepository, passwordEncoder, jwtUtils);
    }

    @Test
    void authenticate_success() {
        LoginRequest request = new LoginRequest("admin", "Admin@123");
        UserDetailsImpl userDetails = new UserDetailsImpl(
                1L, "admin", "admin@example.com", "hash", true, null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(jwtUtils.generateJwtToken(auth)).thenReturn("mock-jwt-token");

        LoginResponse response = authService.authenticate(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals("admin", response.getUsername());
        assertEquals("ROLE_ADMIN", response.getRole());
    }

    @Test
    void createStudentAccount_success() {
        Student student = new Student("Bob", "bob@example.com", "CSE", 2);
        when(studentRepository.findById(10L)).thenReturn(Optional.of(student));
        when(userRepository.existsByUsername("bob_student")).thenReturn(false);
        when(userRepository.existsByEmail("bob@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encodedSecret");

        User savedUser = new User("bob_student", "bob@example.com", "encodedSecret", Role.ROLE_STUDENT);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        RegisterStudentAccountRequest req = new RegisterStudentAccountRequest("bob_student", "secret123");
        UserProfileResponse response = authService.createStudentAccount(10L, req);

        assertNotNull(response);
        assertEquals("bob_student", response.getUsername());
        assertEquals("ROLE_STUDENT", response.getRole());
        assertNotNull(student.getUser());
        verify(studentRepository).save(student);
    }

    @Test
    void createStudentAccount_alreadyHasAccount_throwsException() {
        Student student = new Student("Bob", "bob@example.com", "CSE", 2);
        student.setUser(new User("bob_user", "bob@example.com", "hash", Role.ROLE_STUDENT));

        when(studentRepository.findById(10L)).thenReturn(Optional.of(student));

        RegisterStudentAccountRequest req = new RegisterStudentAccountRequest("bob_new", "secret123");
        assertThrows(IllegalArgumentException.class, () -> authService.createStudentAccount(10L, req));
    }

    @Test
    void changePassword_success() {
        User user = new User("user1", "user1@example.com", "oldHash", Role.ROLE_STUDENT);
        when(userRepository.findByUsername("user1")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldPass", "oldHash")).thenReturn(true);
        when(passwordEncoder.encode("newPass123")).thenReturn("newHash");

        ChangePasswordRequest request = new ChangePasswordRequest("oldPass", "newPass123");
        authService.changePassword("user1", request);

        assertEquals("newHash", user.getPassword());
        verify(userRepository).save(user);
    }

    @Test
    void changePassword_wrongCurrentPassword_throwsBadCredentialsException() {
        User user = new User("user1", "user1@example.com", "oldHash", Role.ROLE_STUDENT);
        when(userRepository.findByUsername("user1")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPass", "oldHash")).thenReturn(false);

        ChangePasswordRequest request = new ChangePasswordRequest("wrongPass", "newPass123");
        assertThrows(BadCredentialsException.class, () -> authService.changePassword("user1", request));
    }
}
