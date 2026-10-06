import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { createHabit, getHabit, updateHabit } from '../../api/habitApi';
import { AppText } from '../../components/AppText';
import { Header } from '../../components/Header';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { ErrorState, InlineBanner, LoadingIndicator } from '../../components/StateViews';
import { TimeStepper } from '../../components/TimeStepper';
import { WeekdayPicker } from '../../components/WeekdayPicker';
import { AppStackParamList } from '../../navigation/types';
import { colors, radius, spacing } from '../../theme';
import { CreateHabitRequest, DayOfWeek } from '../../types/api';
import { ApiError, toApiError } from '../../utils/errors';
import { DAYS, earliestTime, toApiTime, trimTime } from '../../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'HabitForm'>;

const DEFAULT_TIME = '08:00';
const MINUTE_PRESETS = [15, 30, 45, 60, 90, 120];
const MAX_MINUTES = 1440;

type DayTimes = Partial<Record<DayOfWeek, string>>;
type FieldErrors = { name?: string; minutes?: string; days?: string };

export function HabitFormScreen({ navigation, route }: Props) {
  const habitId = route.params?.habitId;
  const isEdit = habitId !== undefined;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minutes, setMinutes] = useState('30');
  const [days, setDays] = useState<DayOfWeek[]>([]);
  const [time, setTime] = useState(DEFAULT_TIME);
  const [dayTimes, setDayTimes] = useState<DayTimes>({});

  const [loadingExisting, setLoadingExisting] = useState(isEdit);
  const [loadError, setLoadError] = useState<ApiError | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit mode: load the habit from the backend and pre-fill the form.
  const loadExisting = async () => {
    if (habitId === undefined) return;
    setLoadingExisting(true);
    setLoadError(null);
    try {
      const habit = await getHabit(habitId);
      setName(habit.name);
      setDescription(habit.description ?? '');
      setMinutes(String(habit.targetMinutes));
      setDays(habit.schedules.map((s) => s.dayOfWeek));
      const perDay: DayTimes = {};
      habit.schedules.forEach((s) => {
        perDay[s.dayOfWeek] = trimTime(s.startTime);
      });
      setDayTimes(perDay);
      const earliest = earliestTime(habit.schedules);
      setTime(earliest ? trimTime(earliest) : DEFAULT_TIME);
    } catch (e) {
      const err = toApiError(e);
      if (err.kind !== 'unauthorized') setLoadError(err);
    } finally {
      setLoadingExisting(false);
    }
  };

  useEffect(() => {
    void loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitId]);

  const toggleDay = (day: DayOfWeek) => {
    setErrors((e) => ({ ...e, days: undefined }));
    if (days.includes(day)) {
      setDays(days.filter((d) => d !== day));
    } else {
      setDays([...days, day]);
      setDayTimes((prev) => ({ ...prev, [day]: time }));
    }
  };

  // Changing the time applies it to every selected day.
  const changeTime = (value: string) => {
    setTime(value);
    setDayTimes((prev) => {
      const next: DayTimes = { ...prev };
      days.forEach((d) => {
        next[d] = value;
      });
      return next;
    });
  };

  const differentTimes = new Set(days.map((d) => dayTimes[d] ?? time)).size > 1;

  const submit = async () => {
    const next: FieldErrors = {};
    const trimmedName = name.trim();
    const minuteValue = Number(minutes);

    if (!trimmedName) next.name = 'Give your habit a name';
    if (!/^\d+$/.test(minutes.trim()) || minuteValue < 1) next.minutes = 'Enter a number of minutes greater than 0';
    else if (minuteValue > MAX_MINUTES) next.minutes = `Maximum is ${MAX_MINUTES} minutes (24 hours)`;
    if (days.length === 0) next.days = 'Pick at least one day';

    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    const request: CreateHabitRequest = {
      name: trimmedName,
      description: description.trim() || undefined,
      targetMinutes: minuteValue,
      schedules: DAYS.filter((d) => days.includes(d)).map((d) => ({
        dayOfWeek: d,
        startTime: toApiTime(dayTimes[d] ?? time),
      })),
    };

    setSaving(true);
    try {
      if (isEdit && habitId !== undefined) await updateHabit(habitId, request);
      else await createHabit(request);
      navigation.goBack();
    } catch (e) {
      const err = toApiError(e);
      if (err.kind !== 'unauthorized') setFormError(err.message);
      setSaving(false);
    }
  };

  const title = isEdit ? 'Edit Habit' : 'New Habit';

  if (loadingExisting) {
    return (
      <Screen scroll={false} edges={['top', 'bottom']}>
        <Header title={title} onBack={() => navigation.goBack()} />
        <LoadingIndicator label="Loading habit…" />
      </Screen>
    );
  }

  if (loadError) {
    return (
      <Screen scroll={false} edges={['top', 'bottom']}>
        <Header title={title} onBack={() => navigation.goBack()} />
        <ErrorState message={loadError.message} onRetry={loadExisting} />
      </Screen>
    );
  }

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={
        <View style={styles.footer}>
          <PrimaryButton
            label={isEdit ? 'Save changes' : 'Create habit'}
            icon={isEdit ? 'checkmark' : 'add'}
            onPress={submit}
            loading={saving}
          />
        </View>
      }
    >
      <Header title={title} onBack={() => navigation.goBack()} />

      {formError && <InlineBanner message={formError} />}

      <InputField
        label="Habit name"
        icon="flag-outline"
        value={name}
        onChangeText={(v) => {
          setName(v);
          setErrors((e) => ({ ...e, name: undefined }));
        }}
        error={errors.name}
        placeholder="e.g. Read a book"
        maxLength={80}
        returnKeyType="next"
      />

      <InputField
        label="Description (optional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Why do you want to build this habit?"
        multiline
        maxLength={200}
      />

      <AppText variant="label" color={colors.textMuted} style={styles.sectionLabel}>
        Daily target (minutes)
      </AppText>
      <View style={styles.presets}>
        {MINUTE_PRESETS.map((m) => {
          const active = minutes.trim() === String(m);
          return (
            <Pressable
              key={m}
              onPress={() => {
                setMinutes(String(m));
                setErrors((e) => ({ ...e, minutes: undefined }));
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.preset, active && styles.presetActive]}
            >
              <AppText variant="label" color={active ? colors.onPrimary : colors.textMuted}>
                {m}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      <InputField
        label="Or enter minutes"
        icon="timer-outline"
        value={minutes}
        onChangeText={(v) => {
          setMinutes(v.replace(/[^0-9]/g, ''));
          setErrors((e) => ({ ...e, minutes: undefined }));
        }}
        error={errors.minutes}
        keyboardType="number-pad"
        maxLength={4}
        placeholder="30"
      />

      <AppText variant="label" color={colors.textMuted} style={styles.sectionLabel}>
        Repeat days
      </AppText>
      <WeekdayPicker selected={days} onToggle={toggleDay} />
      {errors.days && (
        <AppText variant="caption" color={colors.danger} style={styles.error}>
          {errors.days}
        </AppText>
      )}

      <AppText variant="label" color={colors.textMuted} style={[styles.sectionLabel, styles.timeLabel]}>
        Start time
      </AppText>
      <TimeStepper value={time} onChange={changeTime} />
      {differentTimes && (
        <AppText variant="caption" color={colors.textFaint} style={styles.error}>
          Some days have different start times. Changing the time above applies it to all selected days.
        </AppText>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { marginBottom: spacing.sm },
  timeLabel: { marginTop: spacing.xl },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  preset: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  error: { marginTop: spacing.sm },
  footer: { paddingHorizontal: spacing.screen, paddingVertical: spacing.md },
});
