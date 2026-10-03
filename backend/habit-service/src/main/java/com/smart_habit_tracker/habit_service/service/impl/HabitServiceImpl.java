package com.smart_habit_tracker.habit_service.service.impl;

import com.smart_habit_tracker.habit_service.dto.request.CreateHabitRequest;
import com.smart_habit_tracker.habit_service.dto.request.HabitScheduleRequest;
import com.smart_habit_tracker.habit_service.dto.response.HabitResponse;
import com.smart_habit_tracker.habit_service.dto.response.HabitScheduleResponse;
import com.smart_habit_tracker.habit_service.entity.Habit;
import com.smart_habit_tracker.habit_service.entity.HabitSchedule;
import com.smart_habit_tracker.habit_service.exception.HabitAlreadyExistsException;
import com.smart_habit_tracker.habit_service.repository.HabitRepository;
import com.smart_habit_tracker.habit_service.service.HabitService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class HabitServiceImpl implements HabitService {

    private final HabitRepository habitRepository;

    private Long getAuthenticatedUserId() {

        return (Long) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }

    @Override
    @Transactional
    public HabitResponse createHabit(CreateHabitRequest request) {

        Long userId = getAuthenticatedUserId();

        // Find active habits with the same name
        List<Habit> existingHabits =
                habitRepository.findAllByUserIdAndNameAndActiveTrue(
                        userId,
                        request.getName()
                );

        // Check whether an identical schedule already exists
        boolean duplicate = existingHabits.stream()
                .anyMatch(habit ->
                        habit.getSchedules()
                                .stream()
                                .map(HabitSchedule::getDayOfWeek)
                                .collect(java.util.stream.Collectors.toSet())
                                .equals(
                                        request.getSchedules()
                                                .stream()
                                                .map(HabitScheduleRequest::getDayOfWeek)
                                                .collect(java.util.stream.Collectors.toSet())
                                )
                );

        if (duplicate) {
            throw new HabitAlreadyExistsException(
                    "You already have an active habit with the same name and schedule"
            );
        }

        // Create Habit
        Habit habit = Habit.builder()
                .name(request.getName())
                .userId(userId)
                .description(request.getDescription())
                .targetMinutes(request.getTargetMinutes())
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        List<HabitSchedule> schedules = request.getSchedules()
                .stream()
                .map(scheduleRequest -> HabitSchedule.builder()
                        .habit(habit)
                        .dayOfWeek(scheduleRequest.getDayOfWeek())
                        .startTime(scheduleRequest.getStartTime())
                        .build())
                .toList();

        habit.setSchedules(schedules);

        Habit savedHabit = habitRepository.save(habit);

        return mapToResponse(savedHabit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HabitResponse> getAllHabits() {

        Long userId = getAuthenticatedUserId();

        return habitRepository.findAllByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public HabitResponse getHabitById(Long id) {

        Long userId = getAuthenticatedUserId();

        Habit habit = habitRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() ->
                        new RuntimeException("Habit not found"));

        return mapToResponse(habit);
    }

    @Override
    @Transactional
    public HabitResponse updateHabit(
            Long id,
            CreateHabitRequest request) {

        Long userId = getAuthenticatedUserId();

        Habit existingHabit = habitRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() ->
                        new RuntimeException("Habit not found"));

        existingHabit.setName(request.getName());
        existingHabit.setDescription(request.getDescription());
        existingHabit.setTargetMinutes(request.getTargetMinutes());

        // Remove old schedules
        existingHabit.getSchedules().clear();

        // Add updated schedules
        for (HabitScheduleRequest scheduleRequest :
                request.getSchedules()) {

            HabitSchedule schedule = HabitSchedule.builder()
                    .habit(existingHabit)
                    .dayOfWeek(scheduleRequest.getDayOfWeek())
                    .startTime(scheduleRequest.getStartTime())
                    .build();

            existingHabit.getSchedules().add(schedule);
        }

        Habit updatedHabit = habitRepository.save(existingHabit);

        return mapToResponse(updatedHabit);
    }

    @Override
    @Transactional
    public void deleteHabit(Long id) {

        Long userId = getAuthenticatedUserId();

        Habit existingHabit = habitRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() ->
                        new RuntimeException("Habit not found"));

        habitRepository.delete(existingHabit);
    }

    private HabitResponse mapToResponse(Habit habit) {

        List<HabitScheduleResponse> schedules =
                habit.getSchedules()
                        .stream()
                        .map(schedule ->
                                HabitScheduleResponse.builder()
                                        .id(schedule.getId())
                                        .dayOfWeek(schedule.getDayOfWeek())
                                        .startTime(schedule.getStartTime())

                                        .build()
                        )
                        .toList();

        return HabitResponse.builder()
                .id(habit.getId())
                .userId(habit.getUserId())
                .name(habit.getName())
                .description(habit.getDescription())
                .targetMinutes(habit.getTargetMinutes())
                .active(habit.isActive())
                .createdAt(habit.getCreatedAt())
                .schedules(schedules)
                .build();
    }
}