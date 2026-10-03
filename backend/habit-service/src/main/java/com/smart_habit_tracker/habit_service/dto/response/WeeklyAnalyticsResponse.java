package com.smart_habit_tracker.habit_service.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyAnalyticsResponse {

    private LocalDate weekStart;

    private LocalDate weekEnd;

    private int totalScheduled;

    private int totalCompleted;

    private double completionRate;

    private int productiveMinutes;

    private List<DailyAnalyticsResponse> dailyStats;
}