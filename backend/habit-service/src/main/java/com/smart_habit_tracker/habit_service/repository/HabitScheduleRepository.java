package com.smart_habit_tracker.habit_service.repository;

import com.smart_habit_tracker.habit_service.entity.HabitSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HabitScheduleRepository
        extends JpaRepository<HabitSchedule, Long> {
}