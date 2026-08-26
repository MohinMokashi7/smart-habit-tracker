package com.smart_habit_tracker.user_service.service;

import com.smart_habit_tracker.user_service.dto.request.LoginRequest;
import com.smart_habit_tracker.user_service.dto.request.RegisterRequest;
import com.smart_habit_tracker.user_service.dto.response.LoginResponse;
import com.smart_habit_tracker.user_service.dto.response.RegisterResponse;

public interface UserService {

    RegisterResponse registerUser(RegisterRequest request);
    LoginResponse loginUser(LoginRequest request);

}