package com.studentmanagement.repository;

import com.studentmanagement.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    boolean existsByCode(String code);

    Optional<Subject> findByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    List<Subject> findByDepartmentCode(String departmentCode);

    List<Subject> findByDepartmentCodeAndSemester(String departmentCode, int semester);
}
