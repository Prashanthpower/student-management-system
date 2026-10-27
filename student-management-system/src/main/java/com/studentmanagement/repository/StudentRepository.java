
package com.studentmanagement.repository;

import com.studentmanagement.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    Optional<Student> findByEmail(String email);

    Optional<Student> findByUserId(Long userId);

    Optional<Student> findByUserUsername(String username);

    boolean existsByDepartment(String department);

    long countByDepartment(String department);
}
