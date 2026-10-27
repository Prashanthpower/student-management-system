package com.studentmanagement.service;

import com.studentmanagement.dto.AttendanceRecordRequest;
import com.studentmanagement.dto.AttendanceSummaryResponse;
import com.studentmanagement.entity.*;
import com.studentmanagement.repository.AttendanceRepository;
import com.studentmanagement.repository.StudentRepository;
import com.studentmanagement.repository.SubjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private SubjectRepository subjectRepository;

    private AttendanceService attendanceService;

    @BeforeEach
    void setUp() {
        attendanceService = new AttendanceService(attendanceRepository, studentRepository, subjectRepository);
    }

    @Test
    void recordAttendance_newRecord_success() {
        Student student = new Student("Alice", "alice@example.com", "CSE", 2);
        Subject subject = new Subject("CS101", "Data Structures", 4, 2, "CSE", null);
        LocalDate date = LocalDate.of(2026, 10, 26);

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(subjectRepository.findById(10L)).thenReturn(Optional.of(subject));
        when(attendanceRepository.findByStudentIdAndSubjectIdAndDate(student.getId(), subject.getId(), date))
                .thenReturn(Optional.empty());

        Attendance saved = new Attendance(student, subject, date, AttendanceStatus.PRESENT, "Good");
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(saved);

        AttendanceRecordRequest req = new AttendanceRecordRequest(1L, 10L, date, AttendanceStatus.PRESENT, "Good");
        Attendance result = attendanceService.recordAttendance(req);

        assertNotNull(result);
        assertEquals(AttendanceStatus.PRESENT, result.getStatus());
        verify(attendanceRepository).save(any(Attendance.class));
    }

    @Test
    void recordAttendance_existingRecord_updatesWithoutDuplicate() {
        Student student = new Student("Alice", "alice@example.com", "CSE", 2);
        Subject subject = new Subject("CS101", "Data Structures", 4, 2, "CSE", null);
        LocalDate date = LocalDate.of(2026, 10, 26);

        Attendance existing = new Attendance(student, subject, date, AttendanceStatus.ABSENT, "Initial");

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(subjectRepository.findById(10L)).thenReturn(Optional.of(subject));
        when(attendanceRepository.findByStudentIdAndSubjectIdAndDate(student.getId(), subject.getId(), date))
                .thenReturn(Optional.of(existing));
        when(attendanceRepository.save(existing)).thenReturn(existing);

        AttendanceRecordRequest req = new AttendanceRecordRequest(1L, 10L, date, AttendanceStatus.PRESENT, "Corrected");
        Attendance result = attendanceService.recordAttendance(req);

        assertEquals(AttendanceStatus.PRESENT, result.getStatus());
        assertEquals("Corrected", result.getRemarks());
    }

    @Test
    void getStudentAttendanceSummary_calculatesPercentage() {
        Student student = new Student("Alice", "alice@example.com", "CSE", 2);
        Subject subject = new Subject("CS101", "Data Structures", 4, 2, "CSE", null);
        LocalDate d1 = LocalDate.of(2026, 10, 1);
        LocalDate d2 = LocalDate.of(2026, 10, 2);
        LocalDate d3 = LocalDate.of(2026, 10, 3);
        LocalDate d4 = LocalDate.of(2026, 10, 4);

        List<Attendance> records = List.of(
                new Attendance(student, subject, d1, AttendanceStatus.PRESENT, null),
                new Attendance(student, subject, d2, AttendanceStatus.PRESENT, null),
                new Attendance(student, subject, d3, AttendanceStatus.PRESENT, null),
                new Attendance(student, subject, d4, AttendanceStatus.ABSENT, null)
        );

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(attendanceRepository.findByStudentId(1L)).thenReturn(records);

        AttendanceSummaryResponse summary = attendanceService.getStudentAttendanceSummary(1L);

        assertEquals(4, summary.getTotalClasses());
        assertEquals(3, summary.getPresentCount());
        assertEquals(1, summary.getAbsentCount());
        assertEquals(75.0, summary.getAttendancePercentage());
    }
}
