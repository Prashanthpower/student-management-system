package com.studentmanagement.service;

import com.studentmanagement.dto.MarkEntryRequest;
import com.studentmanagement.entity.Mark;
import com.studentmanagement.entity.Student;
import com.studentmanagement.entity.Subject;
import com.studentmanagement.repository.MarkRepository;
import com.studentmanagement.repository.StudentRepository;
import com.studentmanagement.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MarkService {

    private final MarkRepository markRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;

    public MarkService(MarkRepository markRepository,
                       StudentRepository studentRepository,
                       SubjectRepository subjectRepository) {
        this.markRepository = markRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
    }

    public List<Mark> getAllMarks() {
        return markRepository.findAll();
    }

    public List<Mark> getMarksByStudent(Long studentId) {
        return markRepository.findByStudentId(studentId);
    }

    public List<Mark> getMarksBySubject(Long subjectId) {
        return markRepository.findBySubjectId(subjectId);
    }

    @Transactional
    public Mark enterMark(MarkEntryRequest request) {
        if (request.getMarksObtained() > request.getMaxMarks()) {
            throw new IllegalArgumentException("Marks obtained cannot exceed maximum marks: " + request.getMaxMarks());
        }

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + request.getStudentId()));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + request.getSubjectId()));

        Mark mark = new Mark(
                student,
                subject,
                request.getExamType(),
                request.getMarksObtained(),
                request.getMaxMarks(),
                request.getRemarks()
        );

        return markRepository.save(mark);
    }

    @Transactional
    public Mark updateMark(Long id, MarkEntryRequest request) {
        if (request.getMarksObtained() > request.getMaxMarks()) {
            throw new IllegalArgumentException("Marks obtained cannot exceed maximum marks: " + request.getMaxMarks());
        }

        Mark existing = markRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mark record not found: " + id));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + request.getSubjectId()));

        existing.setSubject(subject);
        existing.setExamType(request.getExamType());
        existing.setMaxMarks(request.getMaxMarks());
        existing.setMarksObtained(request.getMarksObtained());
        existing.setRemarks(request.getRemarks());

        return markRepository.save(existing);
    }

    @Transactional
    public void deleteMark(Long id) {
        markRepository.deleteById(id);
    }
}
