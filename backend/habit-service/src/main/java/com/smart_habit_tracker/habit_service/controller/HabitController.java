package com.smart_habit_tracker.habit_service.controller;

import com.smart_habit_tracker.habit_service.dto.request.CreateHabitRequest;
import com.smart_habit_tracker.habit_service.dto.response.HabitResponse;
import com.smart_habit_tracker.habit_service.service.HabitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/habits")
@RequiredArgsConstructor
public class HabitController {

    private final HabitService habitService;

    @PostMapping
    public ResponseEntity<HabitResponse> createHabit(
            @Valid @RequestBody CreateHabitRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(habitService.createHabit(request));
    }

    @GetMapping
    public ResponseEntity<List<HabitResponse>> getAllHabits() {

        return ResponseEntity.ok(
                habitService.getAllHabits()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<HabitResponse> getHabitById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                habitService.getHabitById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<HabitResponse> updateHabit(
            @PathVariable Long id,
            @Valid @RequestBody CreateHabitRequest request) {

        return ResponseEntity.ok(
                habitService.updateHabit(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(
            @PathVariable Long id) {

        habitService.deleteHabit(id);

        return ResponseEntity.noContent().build();
    }
}