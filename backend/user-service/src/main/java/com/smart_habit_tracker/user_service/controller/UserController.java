package com.smart_habit_tracker.user_service.controller;

import com.smart_habit_tracker.user_service.dto.request.LoginRequest;
import com.smart_habit_tracker.user_service.dto.request.RegisterRequest;
import com.smart_habit_tracker.user_service.dto.response.LoginResponse;
import com.smart_habit_tracker.user_service.dto.response.RegisterResponse;
import com.smart_habit_tracker.user_service.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse registerUser(@Valid @RequestBody RegisterRequest request){

        return userService.registerUser(request);

    }
    @PostMapping("/login")
    public LoginResponse loginUser(
            @Valid @RequestBody LoginRequest request) {

        return userService.loginUser(request);
    }
    @GetMapping("/profile")
    public String getProfile() {

        return "Authenticated user";
    }

}