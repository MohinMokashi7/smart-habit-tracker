package com.smart_habit_tracker.user_service.service;

public interface JwtService {

    String generateToken(String email);

    String extractEmail(String token);

    boolean isTokenValid(String token);
}