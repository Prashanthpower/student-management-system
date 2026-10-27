package com.studentmanagement.service;

import com.studentmanagement.dto.AttendanceRecordRequest;
import com.studentmanagement.dto.AttendanceSummaryResponse;
import com.studentmanagement.entity.Attendance;
import com.studentmanagement.entity.AttendanceStatus;
import com.studentmanagement.entity.Student;
import com.studentmanagement.entity.Subject;
import com.studentmanagement.repository.AttendanceRepository;
import com.studentmanagement.repository.StudentRepository;
import com.studentmanagement.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             StudentRepository studentRepository,
                             SubjectRepository subjectRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public List<Attendance> getAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<Attendance> getAttendanceBySubject(Long subjectId) {
        return attendanceRepository.findBySubjectId(subjectId);
    }

    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }

    @Transactional
    public Attendance recordAttendance(AttendanceRecordRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + request.getStudentId()));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + request.getSubjectId()));

        // Check for existing record on that date to prevent duplicates and allow updates
        Attendance attendance = attendanceRepository
                .findByStudentIdAndSubjectIdAndDate(student.getId(), subject.getId(), request.getDate())
                .orElse(new Attendance(student, subject, request.getDate(), request.getStatus(), request.getRemarks()));

        attendance.setStatus(request.getStatus());
        attendance.setRemarks(request.getRemarks());

        return attendanceRepository.save(attendance);
    }

    @Transactional(readOnly = true)
    public AttendanceSummaryResponse getStudentAttendanceSummary(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));

        List<Attendance> records = attendanceRepository.findByStudentId(studentId);
        long total = records.size();
        long present = records.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        long absent = records.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
        long late = records.stream().filter(a -> a.getStatus() == AttendanceStatus.LATE).count();

        double percentage = total > 0 ? ((double) present / total) * 100.0 : 100.0;

        return new AttendanceSummaryResponse(
                student.getId(),
                student.getName(),
                total,
                present,
                absent,
                late,
                percentage
        );
    }

    @Transactional
    public void deleteAttendance(Long id) {
        attendanceRepository.deleteById(id);
    }
}
