package com.studentmanagement.service;

import com.studentmanagement.entity.Role;
import com.studentmanagement.entity.Student;
import com.studentmanagement.entity.User;
import com.studentmanagement.repository.StudentRepository;
import com.studentmanagement.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private StudentService studentService;

    @BeforeEach
    void setUp() {
        studentService = new StudentService(studentRepository, userRepository, passwordEncoder);
    }

    @Test
    void createStudent_autoCreatesUserAccountWithDefaultPassword() {
        Student student = new Student("John Doe", "john@college.edu", "CSE", 1);

        when(studentRepository.existsByEmail("john@college.edu")).thenReturn(false);
        when(userRepository.findByEmail("john@college.edu")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(StudentService.DEFAULT_STUDENT_PASSWORD)).thenReturn("hashed_abc123");

        User savedUser = new User("john@college.edu", "john@college.edu", "hashed_abc123", Role.ROLE_STUDENT);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(studentRepository.save(student)).thenReturn(student);

        Student result = studentService.createStudent(student);

        assertNotNull(result);
        assertNotNull(result.getUser());
        assertEquals("john@college.edu", result.getUser().getUsername());
        assertEquals("hashed_abc123", result.getUser().getPassword());
        assertEquals(Role.ROLE_STUDENT, result.getUser().getRole());
        verify(userRepository).save(any(User.class));
        verify(studentRepository).save(student);
    }

    @Test
    void createStudent_duplicateEmail_throwsException() {
        Student student = new Student("John Doe", "john@college.edu", "CSE", 1);
        when(studentRepository.existsByEmail("john@college.edu")).thenReturn(true);

        assertThrows(DuplicateEmailException.class, () -> studentService.createStudent(student));
        verify(userRepository, never()).save(any());
    }

    @Test
    void deleteStudent_deletesStudentAndAssociatedUser() {
        Student student = new Student("John Doe", "john@college.edu", "CSE", 1);
        User user = new User("john@college.edu", "john@college.edu", "hash", Role.ROLE_STUDENT);
        student.setUser(user);

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        studentService.deleteStudent(1L);

        verify(studentRepository).delete(student);
        verify(userRepository).delete(user);
    }
}
