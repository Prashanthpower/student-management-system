package com.studentmanagement.controller;

import com.studentmanagement.dto.AttendanceSummaryResponse;
import com.studentmanagement.entity.Attendance;
import com.studentmanagement.entity.Mark;
import com.studentmanagement.entity.Student;
import com.studentmanagement.entity.Subject;
import com.studentmanagement.repository.AttendanceRepository;
import com.studentmanagement.repository.MarkRepository;
import com.studentmanagement.repository.StudentRepository;
import com.studentmanagement.repository.SubjectRepository;
import com.studentmanagement.security.services.UserDetailsImpl;
import com.studentmanagement.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student-portal")
@PreAuthorize("hasRole('STUDENT')")
public class StudentPortalController {

    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final AttendanceRepository attendanceRepository;
    private final AttendanceService attendanceService;
    private final MarkRepository markRepository;

    public StudentPortalController(StudentRepository studentRepository,
                                   SubjectRepository subjectRepository,
                                   AttendanceRepository attendanceRepository,
                                   AttendanceService attendanceService,
                                   MarkRepository markRepository) {
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.attendanceRepository = attendanceRepository;
        this.attendanceService = attendanceService;
        this.markRepository = markRepository;
    }

    private Student getAuthenticatedStudent(UserDetailsImpl userDetails) {
        if (userDetails == null) {
            throw new org.springframework.security.access.AccessDeniedException("User is not authenticated");
        }
        return studentRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException(
                        "No student record is associated with your account."));
    }

    @GetMapping("/profile")
    public ResponseEntity<Student> getMyProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Student student = getAuthenticatedStudent(userDetails);
        return ResponseEntity.ok(student);
    }

    @PutMapping("/profile")
    public ResponseEntity<Student> updateMyProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> payload) {
        Student student = getAuthenticatedStudent(userDetails);

        // Only allow updating permitted non-academic fields (e.g. display name)
        String newName = payload.get("name");
        if (newName != null && !newName.trim().isEmpty()) {
            student.setName(newName.trim());
            studentRepository.save(student);
        }

        return ResponseEntity.ok(student);
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getMySubjects(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Student student = getAuthenticatedStudent(userDetails);
        List<Subject> subjects = subjectRepository.findByDepartmentCode(student.getDepartment().toUpperCase());
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/attendance")
    public ResponseEntity<Map<String, Object>> getMyAttendance(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Student student = getAuthenticatedStudent(userDetails);
        List<Attendance> records = attendanceRepository.findByStudentId(student.getId());
        AttendanceSummaryResponse summary = attendanceService.getStudentAttendanceSummary(student.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("records", records);
        result.put("summary", summary);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/marks")
    public ResponseEntity<Map<String, Object>> getMyMarks(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Student student = getAuthenticatedStudent(userDetails);
        List<Mark> marks = markRepository.findByStudentId(student.getId());

        double totalObtained = marks.stream().mapToDouble(Mark::getMarksObtained).sum();
        double totalMax = marks.stream().mapToDouble(Mark::getMaxMarks).sum();
        double averagePercentage = totalMax > 0 ? (totalObtained / totalMax) * 100.0 : 0.0;
        String overallGrade = Mark.calculateGrade(totalObtained, totalMax);

        Map<String, Object> result = new HashMap<>();
        result.put("marks", marks);
        result.put("totalObtained", totalObtained);
        result.put("totalMax", totalMax);
        result.put("averagePercentage", Math.round(averagePercentage * 10.0) / 10.0);
        result.put("overallGrade", overallGrade);

        return ResponseEntity.ok(result);
    }
}
