package com.smart_habit_tracker.habit_service.service;

import com.smart_habit_tracker.habit_service.dto.request.CreateHabitRequest;
import com.smart_habit_tracker.habit_service.dto.response.HabitResponse;

import java.util.List;

public interface HabitService {

    HabitResponse createHabit(CreateHabitRequest request);

    List<HabitResponse> getAllHabits();

    HabitResponse getHabitById(Long id);

    HabitResponse updateHabit(
            Long id,
            CreateHabitRequest request
    );

    void deleteHabit(Long id);
}