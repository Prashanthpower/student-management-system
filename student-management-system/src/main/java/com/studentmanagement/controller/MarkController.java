package com.studentmanagement.controller;

import com.studentmanagement.dto.MarkEntryRequest;
import com.studentmanagement.entity.Mark;
import com.studentmanagement.service.MarkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marks")
public class MarkController {

    private final MarkService markService;

    public MarkController(MarkService markService) {
        this.markService = markService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Mark>> getAllMarks(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long subjectId) {
        if (studentId != null) {
            return ResponseEntity.ok(markService.getMarksByStudent(studentId));
        }
        if (subjectId != null) {
            return ResponseEntity.ok(markService.getMarksBySubject(subjectId));
        }
        return ResponseEntity.ok(markService.getAllMarks());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Mark> enterMark(@Valid @RequestBody MarkEntryRequest request) {
        Mark saved = markService.enterMark(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Mark> updateMark(@PathVariable Long id, @Valid @RequestBody MarkEntryRequest request) {
        return ResponseEntity.ok(markService.updateMark(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMark(@PathVariable Long id) {
        markService.deleteMark(id);
        return ResponseEntity.noContent().build();
    }
}
