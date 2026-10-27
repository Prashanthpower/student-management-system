package com.studentmanagement.service;

import com.studentmanagement.entity.Department;
import com.studentmanagement.entity.Subject;
import com.studentmanagement.repository.DepartmentRepository;
import com.studentmanagement.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final DepartmentRepository departmentRepository;

    public SubjectService(SubjectRepository subjectRepository, DepartmentRepository departmentRepository) {
        this.subjectRepository = subjectRepository;
        this.departmentRepository = departmentRepository;
    }

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    public Subject getSubjectById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found with ID: " + id));
    }

    public List<Subject> getSubjectsByDepartment(String departmentCode) {
        if (departmentCode == null || departmentCode.trim().isEmpty()) {
            return subjectRepository.findAll();
        }
        return subjectRepository.findByDepartmentCode(departmentCode.toUpperCase().trim());
    }

    @Transactional
    public Subject createSubject(Subject subject) {
        String code = subject.getCode().toUpperCase().trim();
        if (subjectRepository.existsByCode(code)) {
            throw new IllegalArgumentException("Subject code already exists: " + code);
        }
        subject.setCode(code);

        if (subject.getDepartmentCode() != null) {
            String deptCode = subject.getDepartmentCode().toUpperCase().trim();
            subject.setDepartmentCode(deptCode);
            departmentRepository.findByCode(deptCode).ifPresent(subject::setDepartment);
        }

        return subjectRepository.save(subject);
    }

    @Transactional
    public Subject updateSubject(Long id, Subject updated) {
        Subject existing = getSubjectById(id);
        String code = updated.getCode().toUpperCase().trim();

        if (subjectRepository.existsByCodeAndIdNot(code, id)) {
            throw new IllegalArgumentException("Another subject already uses code: " + code);
        }

        existing.setCode(code);
        existing.setName(updated.getName().trim());
        existing.setCredits(updated.getCredits());
        existing.setSemester(updated.getSemester());

        if (updated.getDepartmentCode() != null) {
            String deptCode = updated.getDepartmentCode().toUpperCase().trim();
            existing.setDepartmentCode(deptCode);
            departmentRepository.findByCode(deptCode).ifPresent(existing::setDepartment);
        }

        return subjectRepository.save(existing);
    }

    @Transactional
    public void deleteSubject(Long id) {
        Subject subject = getSubjectById(id);
        subjectRepository.delete(subject);
    }
}
