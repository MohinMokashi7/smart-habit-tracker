package com.smart_habit_tracker.habit_service.service;

public interface JwtService {

    Long extractUserId(String token);

    boolean isTokenValid(String token);
}