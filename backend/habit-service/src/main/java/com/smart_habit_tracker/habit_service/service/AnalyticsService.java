package com.smart_habit_tracker.habit_service.service;

import com.smart_habit_tracker.habit_service.dto.response.TodayDashboardResponse;
import com.smart_habit_tracker.habit_service.dto.response.WeeklyAnalyticsResponse;

public interface AnalyticsService {

    TodayDashboardResponse getTodayDashboard();

    WeeklyAnalyticsResponse getWeeklyAnalytics();
}