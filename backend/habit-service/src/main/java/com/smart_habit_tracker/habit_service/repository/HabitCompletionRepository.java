package com.smart_habit_tracker.habit_service.repository;

import com.smart_habit_tracker.habit_service.entity.HabitCompletion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HabitCompletionRepository
        extends JpaRepository<HabitCompletion, Long> {
    void deleteAllByHabitId(Long habitId);
    Optional<HabitCompletion> findByUserIdAndHabitIdAndCompletionDate(
            Long userId,
            Long habitId,
            LocalDate completionDate
    );
    List<HabitCompletion> findAllByUserIdAndHabitIdOrderByCompletionDateDesc(
            Long userId,
            Long habitId
    );
}