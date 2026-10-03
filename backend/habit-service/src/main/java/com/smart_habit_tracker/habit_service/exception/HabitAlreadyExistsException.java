package com.smart_habit_tracker.habit_service.exception;

public class HabitAlreadyExistsException extends RuntimeException {

    public HabitAlreadyExistsException(String message) {
        super(message);
    }
}