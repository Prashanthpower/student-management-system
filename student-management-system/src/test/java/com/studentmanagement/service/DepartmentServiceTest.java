package com.studentmanagement.service;

import com.studentmanagement.entity.Department;
import com.studentmanagement.repository.DepartmentRepository;
import com.studentmanagement.repository.StudentRepository;
import com.studentmanagement.repository.SubjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private SubjectRepository subjectRepository;

    private DepartmentService departmentService;

    @BeforeEach
    void setUp() {
        departmentService = new DepartmentService(departmentRepository, studentRepository, subjectRepository);
    }

    @Test
    void createDepartment_success() {
        Department dept = new Department("CSE", "Computer Science", "Desc");
        when(departmentRepository.existsByCode("CSE")).thenReturn(false);
        when(departmentRepository.save(dept)).thenReturn(dept);

        Department result = departmentService.createDepartment(dept);
        assertNotNull(result);
        assertEquals("CSE", result.getCode());
    }

    @Test
    void createDepartment_duplicateCode_throwsException() {
        Department dept = new Department("CSE", "Computer Science", "Desc");
        when(departmentRepository.existsByCode("CSE")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> departmentService.createDepartment(dept));
    }

    @Test
    void deleteDepartment_withEnrolledStudents_throwsException() {
        Department dept = new Department("CSE", "Computer Science", "Desc");
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(dept));
        when(studentRepository.existsByDepartment("CSE")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> departmentService.deleteDepartment(1L));
        verify(departmentRepository, never()).delete(any());
    }

    @Test
    void deleteDepartment_safe_success() {
        Department dept = new Department("CSE", "Computer Science", "Desc");
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(dept));
        when(studentRepository.existsByDepartment("CSE")).thenReturn(false);
        when(subjectRepository.findByDepartmentCode("CSE")).thenReturn(Collections.emptyList());

        assertDoesNotThrow(() -> departmentService.deleteDepartment(1L));
        verify(departmentRepository).delete(dept);
    }
}
