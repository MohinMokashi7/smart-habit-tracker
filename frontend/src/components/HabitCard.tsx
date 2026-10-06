import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../theme';
import { habitAccent, habitIcon } from '../utils/habitVisuals';
import { AppText } from './AppText';

interface HabitCardProps {
  habitId: number;
  name: string;
  subtitle: string;
  /** e.g. "8:30 AM" */
  meta?: string;
  completed: boolean;
  streak?: number;
  pending?: boolean;
  onToggle: () => void;
  onPress?: () => void;
}

export function HabitCard({ habitId, name, subtitle, meta, completed, streak = 0, pending, onToggle, onPress }: HabitCardProps) {
  const accent = habitAccent(habitId);
  const scale = useRef(new Animated.Value(1)).current;
  const wasCompleted = useRef(completed);

  useEffect(() => {
    if (wasCompleted.current !== completed) {
      wasCompleted.current = completed;
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.22, duration: 110, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }
  }, [completed, scale]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { borderLeftColor: accent, opacity: pressed ? 0.9 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${subtitle}, ${completed ? 'completed' : 'not completed'}`}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
        <Ionicons name={habitIcon(name)} size={22} color={accent} />
      </View>

      <View style={styles.texts}>
        <AppText variant="bodyStrong" numberOfLines={1} style={completed && styles.doneText}>
          {name}
        </AppText>
        <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
          {subtitle}
          {meta ? `  ·  ${meta}` : ''}
        </AppText>
      </View>

      {streak > 0 && (
        <View style={styles.streak}>
          <Ionicons name="flame" size={14} color={colors.streak} />
          <AppText variant="tiny" color={colors.streak} style={styles.streakText}>
            {streak}
          </AppText>
        </View>
      )}

      <Pressable
        onPress={onToggle}
        hitSlop={10}
        disabled={pending}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed, busy: pending }}
        accessibilityLabel={`Mark ${name} as ${completed ? 'not done' : 'done'}`}
      >
        <Animated.View
          style={[
            styles.check,
            completed ? { backgroundColor: colors.primary, borderColor: colors.primary } : null,
            { transform: [{ scale }] },
          ]}
        >
          {pending ? (
            <ActivityIndicator size="small" color={completed ? colors.onPrimary : colors.primary} />
          ) : completed ? (
            <Ionicons name="checkmark" size={20} color={colors.onPrimary} />
          ) : null}
        </Animated.View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
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
  doneText: { color: colors.textMuted, textDecorationLine: 'line-through' },
  streak: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.md },
  streakText: { marginLeft: 2 },
  check: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
