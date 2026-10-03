package com.smart_habit_tracker.habit_service.exception;

import com.smart_habit_tracker.habit_service.dto.response.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HabitAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleHabitAlreadyExists(
            HabitAlreadyExistsException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        ErrorResponse.builder()
                                .message(ex.getMessage())
                                .build()
                );
    }
}