package com.smart_habit_tracker.habit_service.service.impl;

import com.smart_habit_tracker.habit_service.dto.request.CompletionRequest;
import com.smart_habit_tracker.habit_service.dto.request.CreateHabitRequest;
import com.smart_habit_tracker.habit_service.dto.request.HabitScheduleRequest;
import com.smart_habit_tracker.habit_service.dto.response.*;
import com.smart_habit_tracker.habit_service.entity.Habit;
import com.smart_habit_tracker.habit_service.entity.HabitCompletion;
import com.smart_habit_tracker.habit_service.entity.HabitSchedule;
import com.smart_habit_tracker.habit_service.exception.HabitAlreadyExistsException;
import com.smart_habit_tracker.habit_service.repository.HabitCompletionRepository;
import com.smart_habit_tracker.habit_service.repository.HabitRepository;
import com.smart_habit_tracker.habit_service.service.HabitService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.smart_habit_tracker.habit_service.dto.response.TodayHabitResponse;
import com.smart_habit_tracker.habit_service.entity.HabitSchedule;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Comparator;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class HabitServiceImpl implements HabitService {

    private final HabitRepository habitRepository;
    private final HabitCompletionRepository habitCompletionRepository;
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

    @Override
    public List<TodayHabitResponse> getTodayHabits() {

        Long userId = getAuthenticatedUserId();

        LocalDate today = LocalDate.now();
        DayOfWeek todayDay = today.getDayOfWeek();

        List<Habit> habits =
                habitRepository
                        .findDistinctByUserIdAndActiveTrueAndSchedulesDayOfWeek(
                                userId,
                                todayDay
                        );

        return habits.stream()
                .map(habit -> {

                    HabitSchedule todaySchedule = habit.getSchedules()
                            .stream()
                            .filter(schedule ->
                                    schedule.getDayOfWeek() == todayDay)
                            .min(Comparator.comparing(
                                    HabitSchedule::getStartTime))
                            .orElseThrow();

                    HabitCompletion completion =
                            habitCompletionRepository
                                    .findByUserIdAndHabitIdAndCompletionDate(
                                            userId,
                                            habit.getId(),
                                            today
                                    )
                                    .orElseGet(() -> {

                                        HabitCompletion newCompletion =
                                                HabitCompletion.builder()
                                                        .userId(userId)
                                                        .habit(habit)
                                                        .completionDate(today)
                                                        .completed(false)
                                                        .build();

                                        return habitCompletionRepository
                                                .save(newCompletion);
                                    });

                    return TodayHabitResponse.builder()
                            .habitId(habit.getId())
                            .name(habit.getName())
                            .description(habit.getDescription())
                            .targetMinutes(habit.getTargetMinutes())
                            .startTime(todaySchedule.getStartTime())
                            .completed(completion.isCompleted())
                            .build();
                })
                .toList();
    }
    @Override
    public void updateCompletion(
            Long habitId,
            CompletionRequest request) {

        Long userId = getAuthenticatedUserId();

        LocalDate today = LocalDate.now();

        Habit habit = habitRepository
                .findByIdAndUserId(habitId, userId)
                .orElseThrow(() ->
                        new RuntimeException("Habit not found"));

        DayOfWeek todayDay = today.getDayOfWeek();

        boolean scheduledToday = habit.getSchedules()
                .stream()
                .anyMatch(schedule ->
                        schedule.getDayOfWeek() == todayDay);

        if (!scheduledToday) {
            throw new RuntimeException(
                    "This habit is not scheduled for today"
            );
        }

        HabitCompletion completion =
                habitCompletionRepository
                        .findByUserIdAndHabitIdAndCompletionDate(
                                userId,
                                habitId,
                                today
                        )
                        .orElseGet(() ->
                                HabitCompletion.builder()
                                        .userId(userId)
                                        .habit(habit)
                                        .completionDate(today)
                                        .completed(false)
                                        .build()
                        );

        completion.setCompleted(request.getCompleted());

        if (request.getCompleted()) {
            completion.setCompletedAt(LocalDateTime.now());
        } else {
            completion.setCompletedAt(null);
        }

        habitCompletionRepository.save(completion);
    }
    private boolean isScheduledOnDate(
            Habit habit,
            LocalDate date) {

        return habit.getSchedules()
                .stream()
                .anyMatch(schedule ->
                        schedule.getDayOfWeek()
                                .equals(date.getDayOfWeek())
                );
    }

    @Override
    public HabitHistoryResponse getHabitHistory(Long habitId) {

        Long userId = getAuthenticatedUserId();

        Habit habit = habitRepository
                .findByIdAndUserId(habitId, userId)
                .orElseThrow(() ->
                        new RuntimeException("Habit not found"));

        List<HabitCompletion> completions =
                habitCompletionRepository
                        .findAllByUserIdAndHabitIdOrderByCompletionDateDesc(
                                userId,
                                habitId
                        );

        java.util.Map<java.time.LocalDate, HabitCompletion> completionMap =
                completions.stream()
                        .collect(java.util.stream.Collectors.toMap(
                                HabitCompletion::getCompletionDate,
                                completion -> completion
                        ));

        LocalDate startDate = habit.getCreatedAt().toLocalDate();
        LocalDate endDate = LocalDate.now();

        List<HabitHistoryDayResponse> history =
                new java.util.ArrayList<>();

        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {

            boolean scheduled = isScheduledOnDate(habit, currentDate);

            HabitCompletion completion =
                    completionMap.get(currentDate);

            boolean completed =
                    completion != null &&
                            completion.isCompleted();

            history.add(
                    HabitHistoryDayResponse.builder()
                            .date(currentDate)
                            .scheduled(scheduled)
                            .completed(completed)
                            .completedAt(
                                    completion != null
                                            ? completion.getCompletedAt()
                                            : null
                            )
                            .build()
            );

            currentDate = currentDate.plusDays(1);
        }

        return HabitHistoryResponse.builder()
                .habitId(habit.getId())
                .habitName(habit.getName())
                .targetMinutes(habit.getTargetMinutes())
                .currentStreak(calculateCurrentStreak(habit, completionMap))
                .longestStreak(calculateLongestStreak(habit, completionMap))
                .history(history)
                .build();
    }


    private int calculateCurrentStreak(
            Habit habit,
            java.util.Map<LocalDate, HabitCompletion> completionMap) {

        LocalDate date = LocalDate.now();

        int streak = 0;

        while (!date.isBefore(habit.getCreatedAt().toLocalDate())) {

            boolean scheduled = isScheduledOnDate(habit, date);
            // Non-scheduled days don't affect the streak
            if (!scheduled) {
                date = date.minusDays(1);
                continue;
            }

            HabitCompletion completion =
                    completionMap.get(date);

            if (completion != null &&
                    completion.isCompleted()) {

                streak++;

                date = date.minusDays(1);

            } else {

                break;
            }
        }

        return streak;
    }

    private int calculateLongestStreak(
            Habit habit,
            java.util.Map<LocalDate, HabitCompletion> completionMap) {

        LocalDate startDate =
                habit.getCreatedAt().toLocalDate();

        LocalDate endDate =
                LocalDate.now();

        int longestStreak = 0;

        int currentStreak = 0;

        LocalDate date = startDate;

        while (!date.isAfter(endDate)) {

            boolean scheduled = isScheduledOnDate(habit, date);

            if (!scheduled) {

                date = date.plusDays(1);

                continue;
            }

            HabitCompletion completion =
                    completionMap.get(date);

            if (completion != null &&
                    completion.isCompleted()) {

                currentStreak++;

                longestStreak =
                        Math.max(longestStreak, currentStreak);

            } else {

                currentStreak = 0;
            }

            date = date.plusDays(1);
        }

        return longestStreak;
    }

    @Override
    public HabitHistoryResponse getHabitStreak(Long habitId) {

        Long userId = getAuthenticatedUserId();

        Habit habit = habitRepository
                .findByIdAndUserId(habitId, userId)
                .orElseThrow(() ->
                        new RuntimeException("Habit not found"));

        List<HabitCompletion> completions =
                habitCompletionRepository
                        .findAllByUserIdAndHabitIdOrderByCompletionDateDesc(
                                userId,
                                habitId
                        );

        java.util.Map<LocalDate, HabitCompletion> completionMap =
                completions.stream()
                        .collect(java.util.stream.Collectors.toMap(
                                HabitCompletion::getCompletionDate,
                                completion -> completion
                        ));

        return HabitHistoryResponse.builder()
                .habitId(habit.getId())
                .habitName(habit.getName())
                .targetMinutes(habit.getTargetMinutes())
                .currentStreak(
                        calculateCurrentStreak(
                                habit,
                                completionMap
                        )
                )
                .longestStreak(
                        calculateLongestStreak(
                                habit,
                                completionMap
                        )
                )
                .history(List.of())
                .build();
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