package com.studentmanagement.service;

import com.studentmanagement.dto.MarkEntryRequest;
import com.studentmanagement.entity.Mark;
import com.studentmanagement.entity.Student;
import com.studentmanagement.entity.Subject;
import com.studentmanagement.repository.MarkRepository;
import com.studentmanagement.repository.StudentRepository;
import com.studentmanagement.repository.SubjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MarkServiceTest {

    @Mock
    private MarkRepository markRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private SubjectRepository subjectRepository;

    private MarkService markService;

    @BeforeEach
    void setUp() {
        markService = new MarkService(markRepository, studentRepository, subjectRepository);
    }

    @Test
    void enterMark_success_calculatesGrade() {
        Student student = new Student("Bob", "bob@example.com", "CSE", 2);
        Subject subject = new Subject("CS101", "Data Structures", 4, 2, "CSE", null);

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(subjectRepository.findById(10L)).thenReturn(Optional.of(subject));

        Mark mark = new Mark(student, subject, "Final Exam", 88.0, 100.0, "Great work");
        when(markRepository.save(any(Mark.class))).thenReturn(mark);

        MarkEntryRequest req = new MarkEntryRequest(1L, 10L, "Final Exam", 88.0, 100.0, "Great work");
        Mark result = markService.enterMark(req);

        assertNotNull(result);
        assertEquals("A", result.getGrade());
        assertEquals(88.0, result.getMarksObtained());
    }

    @Test
    void enterMark_obtainedExceedsMax_throwsException() {
        MarkEntryRequest req = new MarkEntryRequest(1L, 10L, "Final Exam", 105.0, 100.0, "Invalid");
        assertThrows(IllegalArgumentException.class, () -> markService.enterMark(req));
        verify(markRepository, never()).save(any());
    }

    @Test
    void calculateGrade_allBrackets() {
        assertEquals("A+", Mark.calculateGrade(95, 100));
        assertEquals("A", Mark.calculateGrade(85, 100));
        assertEquals("B+", Mark.calculateGrade(75, 100));
        assertEquals("B", Mark.calculateGrade(65, 100));
        assertEquals("C", Mark.calculateGrade(55, 100));
        assertEquals("F", Mark.calculateGrade(45, 100));
    }
}
