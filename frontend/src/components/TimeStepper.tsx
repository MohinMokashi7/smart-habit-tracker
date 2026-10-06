import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../theme';
import { formatTime } from '../utils/format';
import { AppText } from './AppText';

interface TimeStepperProps {
  /** "HH:mm" (24h) */
  value: string;
  onChange: (value: string) => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

function parse(value: string): { h: number; m: number } {
  const [h, m] = value.split(':').map(Number);
  return { h: Number.isFinite(h) ? h : 8, m: Number.isFinite(m) ? m : 0 };
}

/** Hour / minute steppers — no native picker dependency needed. */
export function TimeStepper({ value, onChange }: TimeStepperProps) {
  const { h, m } = parse(value);

  const setHour = (delta: number) => onChange(`${pad((h + delta + 24) % 24)}:${pad(m)}`);
  const setMinute = (delta: number) => onChange(`${pad(h)}:${pad((m + delta + 60) % 60)}`);

  return (
    <View style={styles.wrap}>
      <Unit label="Hour" display={pad(h)} onMinus={() => setHour(-1)} onPlus={() => setHour(1)} />
      <AppText variant="h1" color={colors.textFaint} style={styles.colon}>
        :
      </AppText>
      <Unit label="Minute" display={pad(m)} onMinus={() => setMinute(-5)} onPlus={() => setMinute(5)} />
      <View style={styles.preview}>
        <Ionicons name="time-outline" size={16} color={colors.primary} />
        <AppText variant="bodyStrong" color={colors.primary} style={styles.previewText}>
          {formatTime(value)}
        </AppText>
      </View>
    </View>
  );
}

function Unit({
  label,
  display,
  onMinus,
  onPlus,
}: {
  label: string;
  display: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <View style={styles.unit}>
      <AppText variant="tiny" color={colors.textFaint}>
        {label}
      </AppText>
      <View style={styles.unitRow}>
        <StepButton icon="remove" onPress={onMinus} label={`Decrease ${label.toLowerCase()}`} />
        <AppText variant="h2" style={styles.digits}>
          {display}
        </AppText>
        <StepButton icon="add" onPress={onPlus} label={`Increase ${label.toLowerCase()}`} />
      </View>
    </View>
  );
}

function StepButton({ icon, onPress, label }: { icon: 'add' | 'remove'; onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.step, pressed && { opacity: 0.6 }]}
    >
      <Ionicons name={icon} size={18} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  unit: { alignItems: 'center' },
  unitRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  digits: { width: 40, textAlign: 'center' },
  colon: { marginHorizontal: spacing.sm, marginTop: 14 },
  step: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', paddingLeft: spacing.md },
  previewText: { marginLeft: 6 },
});
