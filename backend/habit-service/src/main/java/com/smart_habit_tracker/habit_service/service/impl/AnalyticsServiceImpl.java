package com.smart_habit_tracker.habit_service.service.impl;

import com.smart_habit_tracker.habit_service.dto.response.*;
import com.smart_habit_tracker.habit_service.entity.Habit;
import com.smart_habit_tracker.habit_service.entity.HabitCompletion;
import com.smart_habit_tracker.habit_service.repository.HabitCompletionRepository;
import com.smart_habit_tracker.habit_service.repository.HabitRepository;
import com.smart_habit_tracker.habit_service.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final HabitRepository habitRepository;
    private final HabitCompletionRepository habitCompletionRepository;

    private Long getAuthenticatedUserId() {

        return (Long) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }

    @Override
    public TodayDashboardResponse getTodayDashboard() {

        Long userId = getAuthenticatedUserId();

        LocalDate today = LocalDate.now();

        DayOfWeek todayDay = today.getDayOfWeek();

        List<Habit> habits =
                habitRepository
                        .findDistinctByUserIdAndActiveTrueAndSchedulesDayOfWeek(
                                userId,
                                todayDay
                        );

        int total = habits.size();

        int completed = 0;

        int productiveMinutes = 0;

        for (Habit habit : habits) {

            HabitCompletion completion =
                    habitCompletionRepository
                            .findByUserIdAndHabitIdAndCompletionDate(
                                    userId,
                                    habit.getId(),
                                    today
                            )
                            .orElse(null);

            if (completion != null && completion.isCompleted()) {

                completed++;

                productiveMinutes += habit.getTargetMinutes();
            }
        }

        double completionRate = total == 0
                ? 0
                : ((double) completed / total) * 100;

        return TodayDashboardResponse.builder()
                .date(today)
                .completed(completed)
                .total(total)
                .completionRate(completionRate)
                .productiveMinutes(productiveMinutes)
                .build();
    }

    @Override
    public WeeklyAnalyticsResponse getWeeklyAnalytics() {

        Long userId = getAuthenticatedUserId();

        LocalDate today = LocalDate.now();

        LocalDate weekStart =
                today.with(DayOfWeek.MONDAY);

        LocalDate weekEnd =
                weekStart.plusDays(6);

        List<DailyAnalyticsResponse> dailyStats =
                new java.util.ArrayList<>();

        int totalScheduled = 0;
        int totalCompleted = 0;
        int productiveMinutes = 0;

        for (int i = 0; i < 7; i++) {

            LocalDate date = weekStart.plusDays(i);

            DayOfWeek dayOfWeek = date.getDayOfWeek();

            List<Habit> habits =
                    habitRepository
                            .findDistinctByUserIdAndActiveTrueAndSchedulesDayOfWeek(
                                    userId,
                                    dayOfWeek
                            );

            int scheduled = habits.size();

            int completed = 0;

            int dailyProductiveMinutes = 0;

            for (Habit habit : habits) {

                HabitCompletion completion =
                        habitCompletionRepository
                                .findByUserIdAndHabitIdAndCompletionDate(
                                        userId,
                                        habit.getId(),
                                        date
                                )
                                .orElse(null);

                if (completion != null &&
                        completion.isCompleted()) {

                    completed++;

                    dailyProductiveMinutes +=
                            habit.getTargetMinutes();
                }
            }

            double dailyCompletionRate =
                    scheduled == 0
                            ? 0
                            : ((double) completed / scheduled) * 100;

            dailyStats.add(
                    DailyAnalyticsResponse.builder()
                            .date(date)
                            .dayOfWeek(dayOfWeek)
                            .scheduled(scheduled)
                            .completed(completed)
                            .completionRate(dailyCompletionRate)
                            .productiveMinutes(
                                    dailyProductiveMinutes)
                            .build()
            );

            totalScheduled += scheduled;

            totalCompleted += completed;

            productiveMinutes += dailyProductiveMinutes;
        }

        double completionRate =
                totalScheduled == 0
                        ? 0
                        : ((double) totalCompleted /
                        totalScheduled) * 100;

        return WeeklyAnalyticsResponse.builder()
                .weekStart(weekStart)
                .weekEnd(weekEnd)
                .totalScheduled(totalScheduled)
                .totalCompleted(totalCompleted)
                .completionRate(completionRate)
                .productiveMinutes(productiveMinutes)
                .dailyStats(dailyStats)
                .build();
    }
}