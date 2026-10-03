package com.smart_habit_tracker.user_service.service;

public interface JwtService {

    String generateToken(Long userId,String email);

    String extractEmail(String token);

    Long extractUserId(String token);

    boolean isTokenValid(String token);
}