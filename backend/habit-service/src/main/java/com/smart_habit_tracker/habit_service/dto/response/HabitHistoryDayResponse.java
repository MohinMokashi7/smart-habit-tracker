package com.smart_habit_tracker.habit_service.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitHistoryDayResponse {

    private LocalDate date;

    private boolean scheduled;

    private boolean completed;

    private LocalDateTime completedAt;
}