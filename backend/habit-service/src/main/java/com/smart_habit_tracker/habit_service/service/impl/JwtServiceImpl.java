package com.smart_habit_tracker.habit_service.service.impl;

import com.smart_habit_tracker.habit_service.service.JwtService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Service
public class JwtServiceImpl implements JwtService {

    private final SecretKey secretKey;

    public JwtServiceImpl(
            @Value("${jwt.secret}") String secret) {

        this.secretKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    @Override
    public Long extractUserId(String token) {

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("userId", Long.class);
    }

    @Override
    public boolean isTokenValid(String token) {

        try {
            extractUserId(token);
            return true;

        } catch (Exception e) {
            return false;
        }
    }
}