package com.studentmanagement.controller;

import com.studentmanagement.entity.Attendance;
import com.studentmanagement.entity.AttendanceStatus;
import com.studentmanagement.entity.Department;
import com.studentmanagement.entity.Student;
import com.studentmanagement.repository.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarkRepository markRepository;

    public ReportController(StudentRepository studentRepository,
                            DepartmentRepository departmentRepository,
                            SubjectRepository subjectRepository,
                            AttendanceRepository attendanceRepository,
                            MarkRepository markRepository) {
        this.studentRepository = studentRepository;
        this.departmentRepository = departmentRepository;
        this.subjectRepository = subjectRepository;
        this.attendanceRepository = attendanceRepository;
        this.markRepository = markRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSystemSummary() {
        long totalStudents = studentRepository.count();
        long totalDepartments = departmentRepository.count();
        long totalSubjects = subjectRepository.count();
        List<Attendance> allAttendance = attendanceRepository.findAll();
        long totalAttendance = allAttendance.size();
        long presentCount = allAttendance.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        double attendanceRate = totalAttendance > 0 ? ((double) presentCount / totalAttendance) * 100.0 : 100.0;
        long totalMarks = markRepository.count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalStudents", totalStudents);
        summary.put("totalDepartments", totalDepartments);
        summary.put("totalSubjects", totalSubjects);
        summary.put("totalAttendanceRecords", totalAttendance);
        summary.put("overallAttendanceRate", Math.round(attendanceRate * 10.0) / 10.0);
        summary.put("totalMarksRecords", totalMarks);

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/department-stats")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentStats() {
        List<Department> departments = departmentRepository.findAll();
        List<Student> students = studentRepository.findAll();
        List<Map<String, Object>> stats = new ArrayList<>();

        for (Department dept : departments) {
            long studentCount = students.stream()
                    .filter(s -> dept.getCode().equalsIgnoreCase(s.getDepartment()))
                    .count();
            long subjectCount = subjectRepository.findByDepartmentCode(dept.getCode()).size();

            Map<String, Object> item = new HashMap<>();
            item.put("id", dept.getId());
            item.put("code", dept.getCode());
            item.put("name", dept.getName());
            item.put("studentCount", studentCount);
            item.put("subjectCount", subjectCount);
            stats.add(item);
        }

        return ResponseEntity.ok(stats);
    }

    @GetMapping(value = "/students/csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportStudentsCsv() {
        List<Student> students = studentRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Name,Email,Department,Academic Year,Has Account\n");

        for (Student s : students) {
            csv.append(s.getId()).append(",")
                    .append("\"").append(s.getName().replace("\"", "\"\"")).append("\",")
                    .append("\"").append(s.getEmail()).append("\",")
                    .append("\"").append(s.getDepartment()).append("\",")
                    .append(s.getYear()).append(",")
                    .append(s.getUser() != null ? "Yes" : "No")
                    .append("\n");
        }

        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"students_report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }
}
