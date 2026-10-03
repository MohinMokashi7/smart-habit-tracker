package com.smart_habit_tracker.habit_service.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitResponse {

    private Long id;

    private Long userId;

    private String name;

    private String description;

    private Integer targetMinutes;

    private boolean active;

    private LocalDateTime createdAt;

    private List<HabitScheduleResponse> schedules;
}