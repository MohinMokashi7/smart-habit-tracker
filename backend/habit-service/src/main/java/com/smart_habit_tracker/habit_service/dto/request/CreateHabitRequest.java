package com.smart_habit_tracker.habit_service.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateHabitRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    @Positive
    private Integer targetMinutes;

    @NotEmpty
    @Valid
    private List<HabitScheduleRequest> schedules;
}