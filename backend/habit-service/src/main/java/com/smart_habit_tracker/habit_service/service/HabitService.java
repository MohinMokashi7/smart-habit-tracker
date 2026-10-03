package com.smart_habit_tracker.habit_service.service;

import com.smart_habit_tracker.habit_service.dto.request.CompletionRequest;
import com.smart_habit_tracker.habit_service.dto.request.CreateHabitRequest;
import com.smart_habit_tracker.habit_service.dto.response.HabitHistoryResponse;
import com.smart_habit_tracker.habit_service.dto.response.HabitResponse;
import com.smart_habit_tracker.habit_service.dto.response.TodayHabitResponse;

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

    List<TodayHabitResponse> getTodayHabits();

    void updateCompletion(Long habitId, CompletionRequest request);

    HabitHistoryResponse getHabitHistory(Long habitId);

    HabitHistoryResponse getHabitStreak(Long habitId);
}