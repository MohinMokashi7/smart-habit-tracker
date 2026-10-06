import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { getHabit } from '../../api/habitApi';
import { getHabitHistory } from '../../api/historyApi';
import { AppText } from '../../components/AppText';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { FadeIn } from '../../components/FadeIn';
import { Header, HeaderIconButton } from '../../components/Header';
import { Heatmap } from '../../components/Heatmap';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { StatCard } from '../../components/StatCard';
import { ErrorState, InlineBanner, LoadingIndicator } from '../../components/StateViews';
import { useDeleteHabit } from '../../hooks/useDeleteHabit';
import { useFocusData } from '../../hooks/useFocusData';
import { AppStackParamList } from '../../navigation/types';
import { colors, radius, spacing } from '../../theme';
import { formatShortDate } from '../../utils/dates';
import { earliestTime, formatMinutes, formatSchedule, formatTime } from '../../utils/format';
import { habitAccent, habitIcon } from '../../utils/habitVisuals';
import { statsForDays } from '../../utils/stats';

type Props = NativeStackScreenProps<AppStackParamList, 'HabitDetail'>;

export function HabitDetailScreen({ navigation, route }: Props) {
  const { habitId } = route.params;

  const { data, loading, refreshing, error, reload, refresh } = useFocusData(async () => {
    const [habit, history] = await Promise.all([getHabit(habitId), getHabitHistory(habitId)]);
    return { habit, history };
  });

  const del = useDeleteHabit(() => navigation.goBack());

  const summary = useMemo(() => {
    if (!data) return null;
    const days = data.history.history;
    const reference = days.length > 0 ? days[days.length - 1].date : null;
    const all = statsForDays(days, null, reference);
    const recent = days
      .filter((d) => d.scheduled)
      .slice(-7)
      .reverse();
    return { all, recent, reference };
  }, [data]);

  if (loading) {
    return (
      <Screen scroll={false} edges={['top', 'bottom']}>
        <Header title="Habit" onBack={() => navigation.goBack()} />
        <LoadingIndicator label="Loading history…" />
      </Screen>
    );
  }

  if (!data || !summary) {
    return (
      <Screen scroll={false} edges={['top', 'bottom']}>
        <Header title="Habit" onBack={() => navigation.goBack()} />
        <ErrorState message={error?.message ?? 'We could not load this habit.'} onRetry={() => reload('blocking')} />
      </Screen>
    );
  }

  const { habit, history } = data;
  const accent = habitAccent(habit.id);
  const time = earliestTime(habit.schedules);

  return (
    <Screen
      edges={['top', 'bottom']}
      refreshing={refreshing}
      onRefresh={refresh}
    >
      <Header
        title="Habit"
        onBack={() => navigation.goBack()}
        right={
          <HeaderIconButton
            icon="create-outline"
            label="Edit habit"
            onPress={() => navigation.navigate('HabitForm', { habitId: habit.id })}
          />
        }
      />

      {error && <InlineBanner message={`Couldn't refresh: ${error.message}`} />}
      {del.error && <InlineBanner message={del.error} onDismiss={del.clearError} />}

      <FadeIn>
        <View style={[styles.hero, { borderLeftColor: accent }]}>
          <View style={[styles.heroIcon, { backgroundColor: `${accent}22` }]}>
            <Ionicons name={habitIcon(habit.name)} size={26} color={accent} />
          </View>
          <View style={styles.heroText}>
            <AppText variant="h2">{habit.name}</AppText>
            {habit.description?.trim() ? (
              <AppText variant="body" color={colors.textMuted}>
                {habit.description}
              </AppText>
            ) : null}
            <AppText variant="caption" color={colors.textMuted} style={styles.meta}>
              {formatMinutes(habit.targetMinutes)} · {formatSchedule(habit.schedules)}
              {time ? ` · ${formatTime(time)}` : ''}
            </AppText>
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={80} style={styles.stats}>
        <StatCard icon="flame" iconColor={colors.streak} value={String(history.currentStreak)} label="Current streak" />
        <View style={styles.gap} />
        <StatCard icon="trophy" iconColor={colors.gold} value={String(history.longestStreak)} label="Best streak" />
        <View style={styles.gap} />
        <StatCard
          icon="pie-chart-outline"
          value={summary.all.rate === null ? '—' : `${Math.round(summary.all.rate)}%`}
          label="Completion"
        />
      </FadeIn>

      <AppText variant="caption" color={colors.textFaint} style={styles.totals}>
        {summary.all.completed} of {summary.all.scheduled} scheduled days completed since{' '}
        {formatShortDate(habit.createdAt.slice(0, 10))}
      </AppText>

      <FadeIn delay={140}>
        <View style={styles.card}>
          <AppText variant="h3" style={styles.cardTitle}>
            Last 12 weeks
          </AppText>
          <Heatmap history={history.history} weeks={12} />
        </View>
      </FadeIn>

      <FadeIn delay={200}>
        <View style={styles.card}>
          <AppText variant="h3" style={styles.cardTitle}>
            Recent activity
          </AppText>
          {summary.recent.length === 0 ? (
            <AppText variant="body" color={colors.textMuted}>
              No scheduled days yet.
            </AppText>
          ) : (
            summary.recent.map((day, i) => {
              const isToday = day.date === summary.reference;
              const status = day.completed ? 'done' : isToday ? 'pending' : 'missed';
              return (
                <View key={day.date} style={[styles.activityRow, i > 0 && styles.activityBorder]}>
                  <Ionicons
                    name={status === 'done' ? 'checkmark-circle' : status === 'pending' ? 'ellipse-outline' : 'close-circle'}
                    size={20}
                    color={status === 'done' ? colors.primary : status === 'pending' ? colors.textFaint : colors.danger}
                  />
                  <AppText variant="body" style={styles.activityDate}>
                    {isToday ? 'Today' : formatShortDate(day.date)}
                  </AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    {status === 'done'
                      ? day.completedAt
                        ? `Done at ${formatTime(day.completedAt.split('T')[1] ?? '')}`
                        : 'Done'
                      : status === 'pending'
                        ? 'Not done yet'
                        : 'Missed'}
                  </AppText>
                </View>
              );
            })
          )}
        </View>
      </FadeIn>

      <PrimaryButton
        label="Delete habit"
        variant="secondary"
        icon="trash-outline"
        onPress={() => del.request(habit.id, habit.name)}
        style={styles.delete}
      />

      <ConfirmationModal
        visible={del.target !== null}
        title="Delete this habit?"
        message={`"${habit.name}" and its history will be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={del.deleting}
        onConfirm={del.confirm}
        onCancel={del.cancel}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    padding: spacing.lg,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  heroText: { flex: 1 },
  meta: { marginTop: 6 },
  stats: { flexDirection: 'row', marginTop: spacing.lg },
  gap: { width: spacing.md },
  totals: { marginTop: spacing.sm, marginBottom: spacing.lg, textAlign: 'center' },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: { marginBottom: spacing.md },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  activityBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  activityDate: { flex: 1, marginLeft: spacing.md },
  delete: { marginTop: spacing.sm },
});
