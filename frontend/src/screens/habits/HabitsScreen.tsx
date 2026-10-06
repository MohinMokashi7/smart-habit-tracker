import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { getHabits } from '../../api/habitApi';
import { AppText } from '../../components/AppText';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { FadeIn } from '../../components/FadeIn';
import { Screen } from '../../components/Screen';
import { EmptyState, ErrorState, InlineBanner, LoadingIndicator } from '../../components/StateViews';
import { useDeleteHabit } from '../../hooks/useDeleteHabit';
import { useFocusData } from '../../hooks/useFocusData';
import { useAppNavigation } from '../../navigation/types';
import { colors, radius, spacing } from '../../theme';
import { Habit } from '../../types/api';
import { earliestTime, formatMinutes, formatSchedule, formatTime, pluralize } from '../../utils/format';
import { habitAccent, habitIcon, IconName } from '../../utils/habitVisuals';

const loadHabits = async (): Promise<Habit[]> => {
  const habits = await getHabits();
  return [...habits].sort((a, b) => a.name.localeCompare(b.name));
};

export function HabitsScreen() {
  const navigation = useAppNavigation();
  const { data, setData, loading, refreshing, error, reload, refresh } = useFocusData(loadHabits);

  const onDeleted = useCallback((id: number) => setData((prev) => (prev ? prev.filter((h) => h.id !== id) : prev)), [setData]);
  const del = useDeleteHabit(onDeleted);

  const title = (
    <View style={styles.header}>
      <View>
        <AppText variant="h1">My Habits</AppText>
        {data && (
          <AppText variant="caption" color={colors.textMuted}>
            {pluralize(data.length, 'habit')}
          </AppText>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <Screen scroll={false}>
        {title}
        <LoadingIndicator label="Loading habits…" />
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen scroll={false}>
        {title}
        <ErrorState message={error?.message ?? 'We could not load your habits.'} onRetry={() => reload('blocking')} />
      </Screen>
    );
  }

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      {title}

      {error && <InlineBanner message={`Couldn't refresh: ${error.message}`} />}
      {del.error && <InlineBanner message={del.error} onDismiss={del.clearError} />}

      {data.length === 0 ? (
        <EmptyState
          icon="add-circle-outline"
          title="No habits yet"
          message="Create your first habit and pick the days you want to do it."
          actionLabel="Create a habit"
          onAction={() => navigation.navigate('HabitForm')}
        />
      ) : (
        data.map((habit, index) => {
          const accent = habitAccent(habit.id);
          const time = earliestTime(habit.schedules);
          return (
            <FadeIn key={habit.id} delay={index * 40}>
              <Pressable
                onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
                style={({ pressed }) => [styles.card, { borderLeftColor: accent, opacity: pressed ? 0.9 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel={`${habit.name}. Open details`}
              >
                <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
                  <Ionicons name={habitIcon(habit.name)} size={22} color={accent} />
                </View>
                <View style={styles.texts}>
                  <AppText variant="bodyStrong" numberOfLines={1}>
                    {habit.name}
                  </AppText>
                  <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
                    {formatMinutes(habit.targetMinutes)} · {formatSchedule(habit.schedules)}
                    {time ? ` · ${formatTime(time)}` : ''}
                  </AppText>
                </View>
                <IconAction
                  icon="create-outline"
                  label={`Edit ${habit.name}`}
                  onPress={() => navigation.navigate('HabitForm', { habitId: habit.id })}
                />
                <IconAction
                  icon="trash-outline"
                  label={`Delete ${habit.name}`}
                  color={colors.danger}
                  onPress={() => del.request(habit.id, habit.name)}
                />
              </Pressable>
            </FadeIn>
          );
        })
      )}

      <ConfirmationModal
        visible={del.target !== null}
        title="Delete this habit?"
        message={`"${del.target?.name ?? ''}" and its history will be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={del.deleting}
        onConfirm={del.confirm}
        onCancel={del.cancel}
      />
    </Screen>
  );
}

function IconAction({
  icon,
  label,
  onPress,
  color = colors.textMuted,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={6} accessibilityRole="button" accessibilityLabel={label} style={styles.action}>
      <Ionicons name={icon} size={20} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  texts: { flex: 1, marginRight: spacing.sm },
  action: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
