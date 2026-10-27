package com.studentmanagement;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import javax.sql.DataSource;

@SpringBootTest(properties = {
        "app.jwt.secret=TestSecretKeyForJwtSigningMustBeAtLeast256BitsLong2026!",
        "app.jwt.expiration-ms=3600000",
        "app.cors.allowed-origins=http://localhost:5173",
        "app.data-initializer.enabled=false",
        "spring.datasource.url=jdbc:postgresql://localhost:5432/dummy",
        "spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect",
        "spring.jpa.hibernate.ddl-auto=none"
})
class StudentManagementSystemApplicationTests {

    @MockitoBean
    private DataSource dataSource;

    @Test
    void contextLoads() {
    }

}
