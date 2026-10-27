package com.studentmanagement.repository;

import com.studentmanagement.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {
    List<Mark> findByStudentId(Long studentId);

    List<Mark> findBySubjectId(Long subjectId);

    List<Mark> findByStudentIdAndSubjectId(Long studentId, Long subjectId);
}
