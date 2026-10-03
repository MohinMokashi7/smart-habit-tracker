package com.smart_habit_tracker.habit_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompletionRequest {

    @NotNull
    private Boolean completed;
}