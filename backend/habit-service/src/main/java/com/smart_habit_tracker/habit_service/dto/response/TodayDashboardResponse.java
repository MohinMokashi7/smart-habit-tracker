package com.smart_habit_tracker.habit_service.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TodayDashboardResponse {

    private LocalDate date;

    private int completed;

    private int total;

    private double completionRate;

    private int productiveMinutes;

    private List<TodayHabitResponse> habits;
}