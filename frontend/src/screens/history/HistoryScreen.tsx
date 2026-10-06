import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { getHabits } from '../../api/habitApi';
import { getHabitHistory, getWeeklyAnalytics } from '../../api/historyApi';
import { AppText } from '../../components/AppText';
import { BarChart, BarDatum } from '../../components/BarChart';
import { FadeIn } from '../../components/FadeIn';
import { ProgressBar } from '../../components/ProgressBar';
import { Screen } from '../../components/Screen';
import { StatCard } from '../../components/StatCard';
import { EmptyState, ErrorState, InlineBanner, LoadingIndicator } from '../../components/StateViews';
import { useFocusData } from '../../hooks/useFocusData';
import { useAppNavigation } from '../../navigation/types';
import { colors, radius, spacing } from '../../theme';
import { HabitHistory, WeeklyAnalytics } from '../../types/api';
import { toDateKey } from '../../utils/dates';
import { DAY_SHORT, formatMinutes, percent } from '../../utils/format';
import { habitAccent, habitIcon } from '../../utils/habitVisuals';
import { combineStats, RANGE_OPTIONS, RangeKey, referenceDate, statsForDays } from '../../utils/stats';

interface HistoryData {
  weekly: WeeklyAnalytics;
  histories: HabitHistory[];
}

async function loadHistory(): Promise<HistoryData> {
  const [weekly, habits] = await Promise.all([getWeeklyAnalytics(), getHabits()]);
  const histories = await Promise.all(habits.filter((h) => h.active).map((h) => getHabitHistory(h.id)));
  return { weekly, histories };
}

export function HistoryScreen() {
  const navigation = useAppNavigation();
  const { data, loading, refreshing, error, reload, refresh } = useFocusData(loadHistory);
  const [range, setRange] = useState<RangeKey>('7d');

  const rangeDays = RANGE_OPTIONS.find((r) => r.key === range)?.days ?? null;

  const computed = useMemo(() => {
    if (!data) return null;
    const { histories, weekly } = data;
    const reference = referenceDate(histories);
    const overall = combineStats(histories, rangeDays);
    const perHabit = histories.map((h) => ({ history: h, stats: statsForDays(h.history, rangeDays, reference) }));
    const currentStreak = histories.reduce((max, h) => Math.max(max, h.currentStreak), 0);
    const bestStreak = histories.reduce((max, h) => Math.max(max, h.longestStreak), 0);
    const todayKey = toDateKey(new Date());
    const bars: BarDatum[] = weekly.dailyStats.map((d) => ({
      label: DAY_SHORT[d.dayOfWeek],
      value: d.completionRate,
      hasData: d.scheduled > 0,
      highlight: d.date === todayKey,
    }));
    return { overall, perHabit, currentStreak, bestStreak, bars };
  }, [data, rangeDays]);

  const title = (
    <View style={styles.titleRow}>
      <AppText variant="h1">Your Progress</AppText>
    </View>
  );

  if (loading) {
    return (
      <Screen scroll={false}>
        {title}
        <LoadingIndicator label="Crunching your history…" />
      </Screen>
    );
  }

  if (!data || !computed) {
    return (
      <Screen scroll={false}>
        {title}
        <ErrorState message={error?.message ?? 'We could not load your history.'} onRetry={() => reload('blocking')} />
      </Screen>
    );
  }

  if (data.histories.length === 0) {
    return (
      <Screen refreshing={refreshing} onRefresh={refresh}>
        {title}
        <EmptyState
          icon="stats-chart-outline"
          title="No history yet"
          message="Create a habit and complete it to start seeing your progress here."
          actionLabel="Create a habit"
          onAction={() => navigation.navigate('HabitForm')}
        />
      </Screen>
    );
  }

  const { weekly } = data;
  const { overall, perHabit, currentStreak, bestStreak, bars } = computed;

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      {title}

      {error && <InlineBanner message={`Couldn't refresh: ${error.message}`} />}

      <View style={styles.chips}>
        {RANGE_OPTIONS.map((option) => {
          const active = option.key === range;
          return (
            <Pressable
              key={option.key}
              onPress={() => setRange(option.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.chip, active && styles.chipActive]}
            >
              <AppText variant="label" color={active ? colors.onPrimary : colors.textMuted}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <FadeIn>
        <View style={styles.card}>
          <AppText variant="label" color={colors.textMuted}>
            Completion rate
          </AppText>
          <View style={styles.rateRow}>
            <AppText variant="display">{overall.rate === null ? '—' : percent(overall.rate)}</AppText>
            <AppText variant="caption" color={colors.textMuted} style={styles.rateSub}>
              {overall.scheduled === 0 ? 'Nothing scheduled in this range' : `${overall.completed} / ${overall.scheduled} habits done`}
            </AppText>
          </View>
          <ProgressBar value={overall.rate === null ? 0 : overall.rate / 100} height={10} />
        </View>
      </FadeIn>

      <FadeIn delay={80} style={styles.stats}>
        <StatCard icon="flame" iconColor={colors.streak} value={String(currentStreak)} label="Current streak" />
        <View style={styles.gap} />
        <StatCard icon="trophy" iconColor={colors.gold} value={String(bestStreak)} label="Best streak" />
      </FadeIn>

      <FadeIn delay={140}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AppText variant="h3">Weekly Overview</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {percent(weekly.completionRate)} this week
            </AppText>
          </View>
          <BarChart data={bars} />
          <AppText variant="caption" color={colors.textMuted} style={styles.weekSummary}>
            {weekly.totalCompleted} / {weekly.totalScheduled} completed · {formatMinutes(weekly.productiveMinutes)} productive
          </AppText>
        </View>
      </FadeIn>

      <View style={styles.sectionHeader}>
        <AppText variant="h3">Habit Performance</AppText>
      </View>

      {perHabit.map(({ history, stats }, index) => {
        const accent = habitAccent(history.habitId);
        return (
          <FadeIn key={history.habitId} delay={200 + index * 40}>
            <Pressable
              onPress={() => navigation.navigate('HabitDetail', { habitId: history.habitId })}
              style={({ pressed }) => [styles.perfRow, { opacity: pressed ? 0.85 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel={`${history.habitName}, ${stats.rate === null ? 'no data' : percent(stats.rate)}`}
            >
              <View style={[styles.perfIcon, { backgroundColor: `${accent}22` }]}>
                <Ionicons name={habitIcon(history.habitName)} size={18} color={accent} />
              </View>
              <View style={styles.perfBody}>
                <View style={styles.perfTop}>
                  <AppText variant="bodyStrong" numberOfLines={1} style={styles.perfName}>
                    {history.habitName}
                  </AppText>
                  <AppText variant="label" color={colors.textMuted}>
                    {stats.rate === null ? '—' : percent(stats.rate)}
                  </AppText>
                </View>
                <ProgressBar value={stats.rate === null ? 0 : stats.rate / 100} color={accent} height={6} />
              </View>
            </Pressable>
          </FadeIn>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { marginBottom: spacing.lg },
  chips: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  rateRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginVertical: spacing.sm },
  rateSub: { flex: 1, textAlign: 'right', marginLeft: spacing.md, paddingBottom: 6 },
  stats: { flexDirection: 'row', marginBottom: spacing.lg },
  gap: { width: spacing.md },
  weekSummary: { marginTop: spacing.lg, textAlign: 'center' },
  sectionHeader: { marginBottom: spacing.md },
  perfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  perfIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  perfBody: { flex: 1 },
  perfTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  perfName: { flex: 1, marginRight: spacing.sm },
});
