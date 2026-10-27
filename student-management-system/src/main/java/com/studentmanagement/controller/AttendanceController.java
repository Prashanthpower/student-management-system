package com.studentmanagement.controller;

import com.studentmanagement.dto.AttendanceRecordRequest;
import com.studentmanagement.dto.AttendanceSummaryResponse;
import com.studentmanagement.entity.Attendance;
import com.studentmanagement.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Attendance>> getAllAttendance(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (studentId != null) {
            return ResponseEntity.ok(attendanceService.getAttendanceByStudent(studentId));
        }
        if (subjectId != null) {
            return ResponseEntity.ok(attendanceService.getAttendanceBySubject(subjectId));
        }
        if (date != null) {
            return ResponseEntity.ok(attendanceService.getAttendanceByDate(date));
        }
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    @GetMapping("/summary/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and principal.studentId == #studentId)")
    public ResponseEntity<AttendanceSummaryResponse> getStudentSummary(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceSummary(studentId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Attendance> recordAttendance(@Valid @RequestBody AttendanceRecordRequest request) {
        Attendance saved = attendanceService.recordAttendance(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }
}
