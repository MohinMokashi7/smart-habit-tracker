package com.smart_habit_tracker.habit_service.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitHistoryResponse {

    private Long habitId;

    private String habitName;

    private Integer targetMinutes;

    private int currentStreak;

    private int longestStreak;

    private List<HabitHistoryDayResponse> history;
}