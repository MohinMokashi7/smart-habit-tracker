package com.smart_habit_tracker.habit_service.repository;

import com.smart_habit_tracker.habit_service.entity.Habit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HabitRepository extends JpaRepository<Habit, Long> {

    List<Habit> findAllByUserIdAndNameAndActiveTrue(
            Long userId,
            String name
    );

    List<Habit> findAllByUserId(Long userId);

    Optional<Habit> findByIdAndUserId(
            Long id,
            Long userId
    );
}