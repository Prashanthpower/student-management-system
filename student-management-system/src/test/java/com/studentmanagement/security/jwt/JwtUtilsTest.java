package com.studentmanagement.security.jwt;

import com.studentmanagement.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", "ThisIsAVeryLongSecretKeyUsedOnlyForTestingPurposeAndMustBe256BitsLong!");
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 3600000L);
    }

    @Test
    void generateAndValidateJwtToken_success() {
        UserDetailsImpl userDetails = new UserDetailsImpl(
                1L,
                "testuser",
                "testuser@example.com",
                "hashedpassword",
                true,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        String token = jwtUtils.generateJwtToken(auth);

        assertNotNull(token);
        assertTrue(jwtUtils.validateJwtToken(token));
        assertEquals("testuser", jwtUtils.getUserNameFromJwtToken(token));
    }

    @Test
    void validateJwtToken_invalidToken() {
        assertFalse(jwtUtils.validateJwtToken("invalid.jwt.token"));
    }

    @Test
    void validateJwtConfiguration_shortSecret_throwsException() {
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", "too-short");
        assertThrows(IllegalStateException.class, () -> jwtUtils.validateJwtConfiguration());
    }

    @Test
    void validateJwtConfiguration_prodProfile_defaultSecret_throwsException() {
        org.springframework.core.env.Environment env = org.mockito.Mockito.mock(org.springframework.core.env.Environment.class);
        org.mockito.Mockito.when(env.getActiveProfiles()).thenReturn(new String[]{"prod"});
        ReflectionTestUtils.setField(jwtUtils, "environment", env);
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", JwtUtils.DEFAULT_DEV_SECRET);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> jwtUtils.validateJwtConfiguration());
        assertTrue(ex.getMessage().contains("Default development JWT secret cannot be used in production"));
    }

    @Test
    void validateJwtConfiguration_prodProfile_secureCustomSecret_success() {
        org.springframework.core.env.Environment env = org.mockito.Mockito.mock(org.springframework.core.env.Environment.class);
        org.mockito.Mockito.when(env.getActiveProfiles()).thenReturn(new String[]{"prod"});
        ReflectionTestUtils.setField(jwtUtils, "environment", env);
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", "ProductionSuperSecureSecretKeyLongerThan32Bytes2026!!");

        assertDoesNotThrow(() -> jwtUtils.validateJwtConfiguration());
    }
}
