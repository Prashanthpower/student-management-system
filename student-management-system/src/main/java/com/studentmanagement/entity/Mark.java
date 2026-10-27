package com.studentmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "marks")
public class Mark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Student is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @NotNull(message = "Subject is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @NotBlank(message = "Exam type is required")
    @Column(name = "exam_type", nullable = false, length = 50)
    private String examType;

    @DecimalMin(value = "0.0", message = "Marks obtained must be 0 or higher")
    @Column(name = "marks_obtained", nullable = false)
    private double marksObtained;

    @DecimalMin(value = "1.0", message = "Maximum marks must be at least 1")
    @Column(name = "max_marks", nullable = false)
    private double maxMarks = 100.0;

    @Column(length = 5)
    private String grade;

    @Column(length = 255)
    private String remarks;

    public Mark() {
    }

    public Mark(Student student, Subject subject, String examType, double marksObtained, double maxMarks, String remarks) {
        this.student = student;
        this.subject = subject;
        this.examType = examType != null ? examType.trim() : null;
        this.marksObtained = marksObtained;
        this.maxMarks = maxMarks;
        this.remarks = remarks != null ? remarks.trim() : null;
        this.grade = calculateGrade(marksObtained, maxMarks);
    }

    public static String calculateGrade(double obtained, double max) {
        if (max <= 0) return "F";
        double percentage = (obtained / max) * 100.0;
        if (percentage >= 90.0) return "A+";
        if (percentage >= 80.0) return "A";
        if (percentage >= 70.0) return "B+";
        if (percentage >= 60.0) return "B";
        if (percentage >= 50.0) return "C";
        return "F";
    }

    public Long getId() {
        return id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public String getExamType() {
        return examType;
    }

    public void setExamType(String examType) {
        this.examType = examType != null ? examType.trim() : null;
    }

    public double getMarksObtained() {
        return marksObtained;
    }

    public void setMarksObtained(double marksObtained) {
        this.marksObtained = marksObtained;
        this.grade = calculateGrade(this.marksObtained, this.maxMarks);
    }

    public double getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(double maxMarks) {
        this.maxMarks = maxMarks;
        this.grade = calculateGrade(this.marksObtained, this.maxMarks);
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks != null ? remarks.trim() : null;
    }
}
