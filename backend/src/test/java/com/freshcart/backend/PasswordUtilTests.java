package com.freshcart.backend;

import com.freshcart.backend.util.PasswordUtil;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PasswordUtilTests {

    @Test
    void testPasswordHashAndVerify() {
        String rawPassword = "SecretPassword123!";
        String hash = PasswordUtil.hashPassword(rawPassword);

        assertNotNull(hash);
        assertNotEquals(rawPassword, hash);
        assertTrue(PasswordUtil.verifyPassword(rawPassword, hash));
        assertFalse(PasswordUtil.verifyPassword("WrongPassword", hash));
    }

    @Test
    void testSaltIsUniquePerHash() {
        String rawPassword = "SamePassword";
        String hash1 = PasswordUtil.hashPassword(rawPassword);
        String hash2 = PasswordUtil.hashPassword(rawPassword);

        assertNotEquals(hash1, hash2);
        assertTrue(PasswordUtil.verifyPassword(rawPassword, hash1));
        assertTrue(PasswordUtil.verifyPassword(rawPassword, hash2));
    }
}
