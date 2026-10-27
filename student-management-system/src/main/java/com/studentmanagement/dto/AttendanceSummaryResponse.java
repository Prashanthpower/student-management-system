package com.studentmanagement.dto;

public class AttendanceSummaryResponse {
    private Long studentId;
    private String studentName;
    private long totalClasses;
    private long presentCount;
    private long absentCount;
    private long lateCount;
    private double attendancePercentage;

    public AttendanceSummaryResponse() {
    }

    public AttendanceSummaryResponse(Long studentId, String studentName, long totalClasses, long presentCount, long absentCount, long lateCount, double attendancePercentage) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.totalClasses = totalClasses;
        this.presentCount = presentCount;
        this.absentCount = absentCount;
        this.lateCount = lateCount;
        this.attendancePercentage = Math.round(attendancePercentage * 10.0) / 10.0;
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

    public long getTotalClasses() {
        return totalClasses;
    }

    public void setTotalClasses(long totalClasses) {
        this.totalClasses = totalClasses;
    }

    public long getPresentCount() {
        return presentCount;
    }

    public void setPresentCount(long presentCount) {
        this.presentCount = presentCount;
    }

    public long getAbsentCount() {
        return absentCount;
    }

    public void setAbsentCount(long absentCount) {
        this.absentCount = absentCount;
    }

    public long getLateCount() {
        return lateCount;
    }

    public void setLateCount(long lateCount) {
        this.lateCount = lateCount;
    }

    public double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(double attendancePercentage) {
        this.attendancePercentage = Math.round(attendancePercentage * 10.0) / 10.0;
    }
}
