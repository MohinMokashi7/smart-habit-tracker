import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../components/AppText';
import { FadeIn } from '../../components/FadeIn';
import { HabitCard } from '../../components/HabitCard';
import { ProgressCard } from '../../components/ProgressCard';
import { Screen } from '../../components/Screen';
import { StatCard } from '../../components/StatCard';
import { EmptyState, ErrorState, InlineBanner, LoadingIndicator } from '../../components/StateViews';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import { useAppNavigation } from '../../navigation/types';
import { colors, spacing } from '../../theme';
import { formatLongDate, greeting } from '../../utils/dates';
import { firstName, formatMinutes, formatTime } from '../../utils/format';

export function HomeScreen() {
  const navigation = useAppNavigation();
  const { displayName } = useAuth();
  const { data, loading, refreshing, error, reload, refresh, toggle, pendingIds, actionError, dismissActionError } =
    useDashboard();

  const header = (
    <FadeIn style={styles.header}>
      <View style={styles.headerText}>
        <AppText variant="body" color={colors.textMuted}>
          {greeting()},
        </AppText>
        <AppText variant="h1" numberOfLines={1}>
          {firstName(displayName)} <AppText variant="h1">👋</AppText>
        </AppText>
        <AppText variant="caption" color={colors.textMuted} style={styles.date}>
          {formatLongDate()}
        </AppText>
      </View>
      <View style={styles.avatar}>
        <AppText variant="h3" color={colors.onPrimary}>
          {firstName(displayName).charAt(0).toUpperCase()}
        </AppText>
      </View>
    </FadeIn>
  );

  if (loading) {
    return (
      <Screen scroll={false}>
        {header}
        <LoadingIndicator label="Loading your day…" />
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen scroll={false}>
        {header}
        <ErrorState message={error?.message ?? 'We could not load your habits.'} onRetry={() => reload('blocking')} />
      </Screen>
    );
  }

  const { habits, summary, streaks } = data;
  const bestStreak = habits.reduce((max, h) => Math.max(max, streaks[h.habitId] ?? 0), 0);
  const remaining = Math.max(0, habits.length - summary.completed);
  const allDone = habits.length > 0 && remaining === 0;

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      {header}

      {error && <InlineBanner message={`Couldn't refresh: ${error.message}`} />}
      {actionError && <InlineBanner message={actionError} onDismiss={dismissActionError} />}

      <FadeIn delay={60}>
        <ProgressCard title="Today's Progress" completed={summary.completed} total={habits.length} />
      </FadeIn>

      <FadeIn delay={120} style={styles.stats}>
        <StatCard icon="flame" iconColor={colors.streak} value={String(bestStreak)} label="Best active streak" />
        <View style={styles.statGap} />
        <StatCard icon="timer-outline" value={formatMinutes(summary.productiveMinutes)} label="Done today" />
        <View style={styles.statGap} />
        <StatCard icon="hourglass-outline" iconColor={colors.gold} value={String(remaining)} label="Left today" />
      </FadeIn>

      <View style={styles.sectionHeader}>
        <AppText variant="h3">Today's Habits</AppText>
        <Pressable
          onPress={() => navigation.navigate('Tabs', { screen: 'Habits' })}
          hitSlop={8}
          accessibilityRole="button"
          style={styles.viewAll}
        >
          <AppText variant="label" color={colors.primary}>
            View All
          </AppText>
          <Ionicons name="arrow-forward" size={14} color={colors.primary} style={styles.arrow} />
        </Pressable>
      </View>

      {habits.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="Nothing scheduled today"
          message="You have no habits for today. Add one or enjoy the rest day."
          actionLabel="Add a habit"
          onAction={() => navigation.navigate('HabitForm')}
        />
      ) : (
        <>
          {allDone && (
            <InlineBanner tone="info" message="All done for today — great work! 🎉" />
          )}
          {habits.map((habit, index) => (
            <FadeIn key={habit.habitId} delay={180 + index * 50}>
              <HabitCard
                habitId={habit.habitId}
                name={habit.name}
                subtitle={habit.description?.trim() ? habit.description : formatMinutes(habit.targetMinutes)}
                meta={formatTime(habit.startTime)}
                completed={habit.completed}
                streak={streaks[habit.habitId] ?? 0}
                pending={pendingIds.includes(habit.habitId)}
                onToggle={() => toggle(habit.habitId)}
                onPress={() => navigation.navigate('HabitDetail', { habitId: habit.habitId })}
              />
            </FadeIn>
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  headerText: { flex: 1, marginRight: spacing.md },
  date: { marginTop: 2 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: { flexDirection: 'row', marginTop: spacing.md },
  statGap: { width: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  viewAll: { flexDirection: 'row', alignItems: 'center' },
  arrow: { marginLeft: 4 },
});
