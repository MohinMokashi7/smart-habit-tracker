package com.smart_habit_tracker.habit_service.dto.response;

import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TodayHabitResponse {

    private Long habitId;

    private String name;

    private String description;

    private Integer targetMinutes;

    private LocalTime startTime;

    private boolean completed;
}