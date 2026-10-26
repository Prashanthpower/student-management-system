
package com.studentmanagement.service;

import com.studentmanagement.entity.Student;
import com.studentmanagement.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    // Create a new student
    public Student createStudent(Student student) {
        if (studentRepository.existsByEmail(student.getEmail())) {
            throw new DuplicateEmailException(
                    "A student with this email already exists");
        }

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
    public Student updateStudent(Long id, Student updatedStudent) {
        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() ->
                        new StudentNotFoundException(
                                "Student not found with ID: " + id));

        if (studentRepository.existsByEmailAndIdNot(updatedStudent.getEmail(), id)) {
            throw new DuplicateEmailException(
                    "Another student already uses this email");
        }

        existingStudent.setName(updatedStudent.getName());
        existingStudent.setEmail(updatedStudent.getEmail());
        existingStudent.setDepartment(updatedStudent.getDepartment());
        existingStudent.setYear(updatedStudent.getYear());

        return studentRepository.save(existingStudent);
    }

    // Delete a student
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new StudentNotFoundException(
                    "Student not found with ID: " + id);
        }

        studentRepository.deleteById(id);
    }
}
