package com.smart_habit_tracker.user_service.service.impl;

import com.smart_habit_tracker.user_service.dto.request.LoginRequest;
import com.smart_habit_tracker.user_service.dto.request.RegisterRequest;
import com.smart_habit_tracker.user_service.dto.response.LoginResponse;
import com.smart_habit_tracker.user_service.dto.response.RegisterResponse;
import com.smart_habit_tracker.user_service.entity.User;
import com.smart_habit_tracker.user_service.exception.UserAlreadyExistsException;
import com.smart_habit_tracker.user_service.repository.UserRepository;
import com.smart_habit_tracker.user_service.service.JwtService;
import com.smart_habit_tracker.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public RegisterResponse registerUser(RegisterRequest request) {

        if(userRepository.existsByEmail(request.getEmail())){
            throw new UserAlreadyExistsException("Email already registered.");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        User savedUser = userRepository.save(user);

        return RegisterResponse.builder()
                .id(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .message("User Registered Successfully")
                .build();
    }
    @Override
    public LoginResponse loginUser(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return LoginResponse.builder()
                .token(token)
                .message("Login successful")
                .build();
    }
}