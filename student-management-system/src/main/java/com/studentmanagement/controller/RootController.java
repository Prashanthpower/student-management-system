package com.studentmanagement.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
public class RootController {

    @Value("${spring.application.name:student-management-system}")
    private String applicationName;

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getRootHtml() {
        String html = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>StudentHub REST API | Online</title>
              <style>
                :root {
                  --bg: #0f172a;
                  --card-bg: #1e293b;
                  --text-main: #f8fafc;
                  --text-sub: #94a3b8;
                  --primary: #6366f1;
                  --primary-gradient: linear-gradient(135deg, #4f46e5, #6366f1);
                  --green: #10b981;
                  --border: #334155;
                }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                  background-color: var(--bg);
                  color: var(--text-main);
                  min-height: 100vh;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  padding: 24px;
                }
                .container {
                  max-width: 780px;
                  width: 100%;
                }
                .header-card {
                  background: var(--card-bg);
                  border: 1px solid var(--border);
                  border-radius: 16px;
                  padding: 32px;
                  margin-bottom: 24px;
                  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5);
                }
                .badge-row {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  margin-bottom: 16px;
                }
                .status-pill {
                  background: rgba(16, 185, 129, 0.15);
                  color: #34d399;
                  border: 1px solid rgba(16, 185, 129, 0.3);
                  padding: 6px 14px;
                  border-radius: 999px;
                  font-size: 13px;
                  font-weight: 700;
                  display: inline-flex;
                  align-items: center;
                  gap: 8px;
                }
                .status-dot {
                  width: 8px;
                  height: 8px;
                  background: #10b981;
                  border-radius: 50%;
                  box-shadow: 0 0 10px #10b981;
                }
                h1 {
                  font-size: 28px;
                  font-weight: 800;
                  margin-bottom: 8px;
                  background: linear-gradient(135deg, #ffffff, #cbd5e1);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                }
                p.lead {
                  color: var(--text-sub);
                  font-size: 15px;
                  line-height: 1.6;
                  margin-bottom: 24px;
                }
                .specs-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                  gap: 12px;
                  margin-bottom: 24px;
                }
                .spec-box {
                  background: #0f172a;
                  border: 1px solid var(--border);
                  border-radius: 10px;
                  padding: 14px;
                }
                .spec-label {
                  font-size: 12px;
                  color: var(--text-sub);
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  margin-bottom: 4px;
                }
                .spec-val {
                  font-size: 14px;
                  font-weight: 700;
                  color: #ffffff;
                }
                .button-row {
                  display: flex;
                  gap: 12px;
                  flex-wrap: wrap;
                }
                .btn {
                  text-decoration: none;
                  padding: 12px 22px;
                  border-radius: 10px;
                  font-size: 14px;
                  font-weight: 600;
                  display: inline-flex;
                  align-items: center;
                  gap: 8px;
                  transition: all 0.2s ease;
                }
                .btn-primary {
                  background: var(--primary-gradient);
                  color: #fff;
                  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
                }
                .btn-primary:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
                }
                .btn-secondary {
                  background: #0f172a;
                  color: #cbd5e1;
                  border: 1px solid var(--border);
                }
                .btn-secondary:hover {
                  background: #1e293b;
                  color: #fff;
                }
                .endpoints-card {
                  background: var(--card-bg);
                  border: 1px solid var(--border);
                  border-radius: 16px;
                  padding: 24px;
                }
                .endpoints-card h3 {
                  font-size: 16px;
                  margin-bottom: 14px;
                  color: #e2e8f0;
                }
                .endpoint-item {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  padding: 10px 14px;
                  border-radius: 8px;
                  background: #0f172a;
                  border: 1px solid rgba(255,255,255,0.05);
                  margin-bottom: 8px;
                  font-family: monospace;
                  font-size: 13px;
                }
                .method {
                  padding: 3px 8px;
                  border-radius: 4px;
                  font-weight: bold;
                  font-size: 11px;
                }
                .method.get { background: #064e3b; color: #34d399; }
                .method.post { background: #1e3a8a; color: #60a5fa; }
                .endpoint-path { color: #f1f5f9; }
                .endpoint-desc { color: var(--text-sub); font-family: sans-serif; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header-card">
                  <div class="badge-row">
                    <div class="status-pill">
                      <span class="status-dot"></span>
                      SYSTEM OPERATIONAL (200 OK)
                    </div>
                    <span style="font-size: 12px; color: var(--text-sub);">Port 8080</span>
                  </div>
                  <h1>StudentHub Backend REST API</h1>
                  <p class="lead">
                    Enterprise Student &amp; Academic Management System engine.
                    Secured with Spring Security 7 and JJWT stateless authentication.
                  </p>

                  <div class="specs-grid">
                    <div class="spec-box">
                      <div class="spec-label">Environment</div>
                      <div class="spec-val">Java 21 LTS</div>
                    </div>
                    <div class="spec-box">
                      <div class="spec-label">Framework</div>
                      <div class="spec-val">Spring Boot 4.1.2</div>
                    </div>
                    <div class="spec-box">
                      <div class="spec-label">Security</div>
                      <div class="spec-val">JWT &amp; RBAC</div>
                    </div>
                    <div class="spec-box">
                      <div class="spec-label">Database</div>
                      <div class="spec-val">PostgreSQL / JPA</div>
                    </div>
                  </div>

                  <div class="button-row">
                    <a href="http://localhost:5173" class="btn btn-primary" target="_blank">
                      Launch Frontend Web App (Port 5173) &rarr;
                    </a>
                    <a href="/api/health" class="btn btn-secondary">
                      Check JSON Health API &rarr;
                    </a>
                  </div>
                </div>

                <div class="endpoints-card">
                  <h3>Available API Routes</h3>
                  <div class="endpoint-item">
                    <div>
                      <span class="method post">POST</span>
                      <span class="endpoint-path">/api/auth/login</span>
                    </div>
                    <span class="endpoint-desc">User Authentication &amp; JWT Issuance</span>
                  </div>
                  <div class="endpoint-item">
                    <div>
                      <span class="method get">GET</span>
                      <span class="endpoint-path">/api/student-portal/profile</span>
                    </div>
                    <span class="endpoint-desc">Student Own Records Only</span>
                  </div>
                  <div class="endpoint-item">
                    <div>
                      <span class="method get">GET</span>
                      <span class="endpoint-path">/api/students</span>
                    </div>
                    <span class="endpoint-desc">Admin Student Management</span>
                  </div>
                  <div class="endpoint-item">
                    <div>
                      <span class="method get">GET</span>
                      <span class="endpoint-path">/api/departments</span>
                    </div>
                    <span class="endpoint-desc">Academic Faculties &amp; Courses</span>
                  </div>
                </div>
              </div>
            </body>
            </html>
            """;
        return ResponseEntity.ok(html);
    }

    @GetMapping(value = {"/", "/api/health"}, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getHealthJson() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "StudentHub Student Management System REST API");
        health.put("version", "2.0.0");
        health.put("javaVersion", System.getProperty("java.version"));
        health.put("framework", "Spring Boot 4.1.2");
        health.put("security", "Spring Security 7 + JJWT");
        health.put("timestamp", Instant.now().toString());

        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("auth", "/api/auth/login");
        endpoints.put("students", "/api/students");
        endpoints.put("departments", "/api/departments");
        endpoints.put("subjects", "/api/subjects");
        endpoints.put("attendance", "/api/attendance");
        endpoints.put("marks", "/api/marks");
        endpoints.put("studentPortal", "/api/student-portal");
        endpoints.put("reports", "/api/reports");
        health.put("endpoints", endpoints);

        return ResponseEntity.ok(health);
    }
}
