package com.smart_habit_tracker.habit_service.dto.response;

import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyAnalyticsResponse {

    private LocalDate date;

    private DayOfWeek dayOfWeek;

    private int scheduled;

    private int completed;

    private double completionRate;

    private int productiveMinutes;
}