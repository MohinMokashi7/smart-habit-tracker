package com.smart_habit_tracker.habit_service.dto.response;

import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitScheduleResponse {

    private Long id;

    private DayOfWeek dayOfWeek;

    private LocalTime startTime;
}