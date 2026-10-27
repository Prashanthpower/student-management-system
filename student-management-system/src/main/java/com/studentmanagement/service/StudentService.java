package com.studentmanagement.service;

import com.studentmanagement.entity.Role;
import com.studentmanagement.entity.Student;
import com.studentmanagement.entity.User;
import com.studentmanagement.repository.StudentRepository;
import com.studentmanagement.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    public static final String DEFAULT_STUDENT_PASSWORD = "abc@123";

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentService(StudentRepository studentRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Create a new student and automatically provision their student portal login (email + "abc@123")
    @Transactional
    public Student createStudent(Student student) {
        String email = student.getEmail().trim().toLowerCase();
        student.setEmail(email);

        if (studentRepository.existsByEmail(email)) {
            throw new DuplicateEmailException("A student with this email already exists: " + email);
        }

        // Check if a user account exists with this email
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User(
                    email, // Login username is their email
                    email,
                    passwordEncoder.encode(DEFAULT_STUDENT_PASSWORD),
                    Role.ROLE_STUDENT
            );
            user = userRepository.save(user);
        }

        student.setUser(user);
        return studentRepository.save(student);
    }

    // Get all students
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // Get a student by ID
    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    // Update an existing student
    @Transactional
    public Student updateStudent(Long id, Student updatedStudent) {
        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with ID: " + id));

        String newEmail = updatedStudent.getEmail().trim().toLowerCase();

        if (studentRepository.existsByEmailAndIdNot(newEmail, id)) {
            throw new DuplicateEmailException("Another student already uses this email: " + newEmail);
        }

        existingStudent.setName(updatedStudent.getName().trim());
        existingStudent.setDepartment(updatedStudent.getDepartment().trim());
        existingStudent.setYear(updatedStudent.getYear());

        // Update email and linked user credentials if email changed
        if (!existingStudent.getEmail().equalsIgnoreCase(newEmail)) {
            existingStudent.setEmail(newEmail);
            if (existingStudent.getUser() != null) {
                User user = existingStudent.getUser();
                user.setEmail(newEmail);
                user.setUsername(newEmail);
                userRepository.save(user);
            }
        }

        return studentRepository.save(existingStudent);
    }

    // Delete a student
    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with ID: " + id));

        User linkedUser = student.getUser();
        studentRepository.delete(student);

        if (linkedUser != null) {
            userRepository.delete(linkedUser);
        }
    }
}
