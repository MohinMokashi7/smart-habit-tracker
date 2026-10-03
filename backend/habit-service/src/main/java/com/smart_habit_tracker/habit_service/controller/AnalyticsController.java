package com.smart_habit_tracker.habit_service.controller;

import com.smart_habit_tracker.habit_service.dto.response.TodayDashboardResponse;
import com.smart_habit_tracker.habit_service.dto.response.WeeklyAnalyticsResponse;
import com.smart_habit_tracker.habit_service.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/today")
    public ResponseEntity<TodayDashboardResponse> getTodayDashboard() {

        return ResponseEntity.ok(
                analyticsService.getTodayDashboard()
        );
    }

    @GetMapping("/weekly")
    public ResponseEntity<WeeklyAnalyticsResponse> getWeeklyAnalytics() {

        return ResponseEntity.ok(
                analyticsService.getWeeklyAnalytics()
        );
    }
}