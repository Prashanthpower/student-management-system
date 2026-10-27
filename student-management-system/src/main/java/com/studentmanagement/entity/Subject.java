package com.studentmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Subject code is required")
    @Size(min = 2, max = 20, message = "Code must be between 2 and 20 characters")
    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @NotBlank(message = "Subject name is required")
    @Size(min = 2, max = 150, message = "Name must be between 2 and 150 characters")
    @Column(nullable = false, length = 150)
    private String name;

    @Min(value = 1, message = "Credits must be at least 1")
    @Max(value = 6, message = "Credits cannot exceed 6")
    @Column(nullable = false)
    private int credits = 3;

    @Min(value = 1, message = "Semester must be between 1 and 8")
    @Max(value = 8, message = "Semester must be between 1 and 8")
    @Column(nullable = false)
    private int semester = 1;

    @NotBlank(message = "Department code is required")
    @Column(name = "department_code", nullable = false, length = 50)
    private String departmentCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;

    public Subject() {
    }

    public Subject(String code, String name, int credits, int semester, String departmentCode, Department department) {
        this.code = code != null ? code.toUpperCase().trim() : null;
        this.name = name != null ? name.trim() : null;
        this.credits = credits;
        this.semester = semester;
        this.departmentCode = departmentCode != null ? departmentCode.toUpperCase().trim() : null;
        this.department = department;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code != null ? code.toUpperCase().trim() : null;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name != null ? name.trim() : null;
    }

    public int getCredits() {
        return credits;
    }

    public void setCredits(int credits) {
        this.credits = credits;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode != null ? departmentCode.toUpperCase().trim() : null;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
        if (department != null && department.getCode() != null) {
            this.departmentCode = department.getCode();
        }
    }
}
