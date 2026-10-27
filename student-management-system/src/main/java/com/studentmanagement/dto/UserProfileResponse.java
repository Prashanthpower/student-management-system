package com.studentmanagement.dto;

public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private Long studentId;
    private String studentName;
    private String department;
    private Integer year;

    public UserProfileResponse() {
    }

    public UserProfileResponse(Long id, String username, String email, String role, Long studentId, String studentName, String department, Integer year) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.studentId = studentId;
        this.studentName = studentName;
        this.department = department;
        this.year = year;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }
}
