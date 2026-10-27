package com.studentmanagement.service;

import com.studentmanagement.entity.Department;
import com.studentmanagement.repository.DepartmentRepository;
import com.studentmanagement.repository.StudentRepository;
import com.studentmanagement.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;

    public DepartmentService(DepartmentRepository departmentRepository,
                             StudentRepository studentRepository,
                             SubjectRepository subjectRepository) {
        this.departmentRepository = departmentRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found with ID: " + id));
    }

    @Transactional
    public Department createDepartment(Department department) {
        String code = department.getCode().toUpperCase().trim();
        if (departmentRepository.existsByCode(code)) {
            throw new IllegalArgumentException("Department with code " + code + " already exists");
        }
        department.setCode(code);
        return departmentRepository.save(department);
    }

    @Transactional
    public Department updateDepartment(Long id, Department updated) {
        Department existing = getDepartmentById(id);
        String code = updated.getCode().toUpperCase().trim();

        if (departmentRepository.existsByCodeAndIdNot(code, id)) {
            throw new IllegalArgumentException("Another department already uses code: " + code);
        }

        existing.setCode(code);
        existing.setName(updated.getName().trim());
        existing.setDescription(updated.getDescription() != null ? updated.getDescription().trim() : null);

        return departmentRepository.save(existing);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department department = getDepartmentById(id);

        if (studentRepository.existsByDepartment(department.getCode())) {
            throw new IllegalArgumentException("Cannot delete department '" + department.getCode() + "' because students are enrolled in it.");
        }

        if (!subjectRepository.findByDepartmentCode(department.getCode()).isEmpty()) {
            throw new IllegalArgumentException("Cannot delete department '" + department.getCode() + "' because subjects are linked to it.");
        }

        departmentRepository.delete(department);
    }
}
